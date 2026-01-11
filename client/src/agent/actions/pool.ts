import { ethers } from 'ethers';
import type { Action, ActionResult } from '../types/actions';

// ========================================
// ABIs
// ========================================

const PROJECT_REGISTRY_ABI = [
  'function getProject(uint256 _projectId) external view returns (tuple(uint256 id, address owner, string name, string description, string category, string logoUrl, uint256 fundingGoal, uint256 submissionDate, uint8 status, uint256[] milestoneIds, uint256 totalFundsRaised, uint256 totalPredictions))',
  'function getProjectMilestones(uint256 _projectId) external view returns (tuple(uint256 id, string description, uint256 targetDate, bool isResolved, bool outcomeAchieved, uint256 resolutionDate)[])',
  'function getTotalProjects() external view returns (uint256)',
  'function getTotalMilestones() external view returns (uint256)',
  'function getOwnerProjects(address _owner) external view returns (uint256[])'
];

const FUNDING_POOL_ABI = [
  'function getPoolStats() external view returns (tuple(uint256 balance, uint256 allocated, uint256 distributed, uint256 available))',
  'function getProjectAllocation(uint256 projectId) external view returns (tuple(uint256 projectId, uint256 totalAllocated, uint256 totalReleased, uint256 pendingRelease, uint256[] milestoneReleases, bool exists))',
  'function getUserTokenAllocations(address user) external view returns (uint256[])',
  'function getTokenAllocation(uint256 allocationId) external view returns (tuple(uint256 allocationId, address recipient, uint256 projectId, uint256 allocationBps, bool granted, bool claimed, uint256 grantedTimestamp))',
  'function getAvailablePool() external view returns (uint256)'
];

const PREDICTION_MARKET_ABI = [
  'function getMarket(uint256 marketId) external view returns (tuple(uint256 marketId, uint256 milestoneId, uint256 projectId, uint256 closeTime, uint8 status, bool outcomeSet, uint8 finalOutcome, uint256 totalYesStake, uint256 totalNoStake, uint256 totalYesBettors, uint256 totalNoBettors, uint256 resolutionTime, bool rewardsCalculated))',
  'function getBet(uint256 betId) external view returns (tuple(uint256 betId, uint256 marketId, address bettor, uint8 prediction, uint256 amount, uint256 timestamp, bool claimed, uint256 rewardAmount))',
  'function getMarketBets(uint256 marketId) external view returns (uint256[])',
  'function getUserBets(address user) external view returns (uint256[])',
  'function getMarketOdds(uint256 marketId) external view returns (uint256 yesOdds, uint256 noOdds)',
  'function getClaimableAmount(uint256 betId) external view returns (uint256)',
  'function hasUserBetOnMarket(uint256 marketId, address user) external view returns (bool)',
  'function getCurrentMarketId() external view returns (uint256)',
  'function getCurrentBetId() external view returns (uint256)',
  'function minBetAmount() external view returns (uint256)',
  'function protocolFeesCollected() external view returns (uint256)',
  'function fundingPoolBalance() external view returns (uint256)'
];

// ========================================
// CONSTANTS
// ========================================

const PROJECT_STATUS = ['Pending', 'Active', 'Completed', 'Cancelled'];
const MARKET_STATUS = ['Open', 'Closed', 'Resolved', 'Cancelled'];
const OUTCOME = ['Yes', 'No'];

// ========================================
// INTERFACES
// ========================================

export interface ProjectInfo {
  id: number;
  owner: string;
  name: string;
  description: string;
  category: string;
  fundingGoalBNB: string;
  status: string;
  totalFundsRaisedBNB: string;
  totalPredictions: number;
  fundingProgress: number;
  submissionDate: string;
  milestones: MilestoneInfo[];
  allocation: AllocationInfo | null;
}

export interface MilestoneInfo {
  id: number;
  description: string;
  targetDate: string;
  isResolved: boolean;
  outcomeAchieved: boolean;
}

export interface AllocationInfo {
  totalAllocatedBNB: string;
  totalReleasedBNB: string;
  pendingReleaseBNB: string;
}

export interface MarketInfo {
  marketId: number;
  milestoneId: number;
  projectId: number;
  status: string;
  closeTime: string;
  totalYesStakeBNB: string;
  totalNoStakeBNB: string;
  totalYesBettors: number;
  totalNoBettors: number;
  yesOdds: string;
  noOdds: string;
  isResolved: boolean;
  finalOutcome: string | null;
  resolutionTime: string | null;
}

export interface BetInfo {
  betId: number;
  marketId: number;
  bettor: string;
  prediction: string;
  amountBNB: string;
  timestamp: string;
  claimed: boolean;
  rewardAmountBNB: string;
  claimableAmountBNB: string;
}

export interface UserBetsInfo {
  user: string;
  totalBets: number;
  bets: BetInfo[];
}

export interface PlatformStats {
  totalProjects: number;
  totalMilestones: number;
  totalMarkets: number;
  totalBets: number;
  minBetAmountBNB: string;
  pool: {
    balanceBNB: string;
    allocatedBNB: string;
    distributedBNB: string;
    availableBNB: string;
  };
  market: {
    protocolFeesCollectedBNB: string;
    fundingPoolBalanceBNB: string;
  };
}

// ========================================
// ACTION CLASS
// ========================================

export class PulsePoolAction implements Action {
  name = 'pulsepool_get_info';
  description = `Fetches information from PulsePool prediction market platform on BNB Chain. 
Available actions:
- "get_project": Get project details, milestones, and funding (requires project_id)
- "get_market": Get prediction market details and odds (requires market_id)
- "get_user_bets": Get all bets placed by a user (requires user_address)
- "get_platform_stats": Get overall platform statistics
Use this when users ask about PulsePool projects, milestones, predictions, markets, bets, or funding.`;

  parameters = [
    {
      name: 'action',
      type: 'string' as const,
      description: 'Action to perform: "get_project", "get_market", "get_user_bets", "get_platform_stats"',
      required: true
    },
    {
      name: 'project_id',
      type: 'number' as const,
      description: 'Project ID (for get_project)',
      required: false
    },
    {
      name: 'market_id',
      type: 'number' as const,
      description: 'Market ID (for get_market)',
      required: false
    },
    {
      name: 'user_address',
      type: 'string' as const,
      description: 'Wallet address (for get_user_bets)',
      required: false
    }
  ];

  private provider: ethers.JsonRpcProvider;
  private registry: ethers.Contract;
  private pool: ethers.Contract;
  private market: ethers.Contract;

  constructor(
    registryAddress: string,
    poolAddress: string,
    marketAddress: string,
    rpcUrl: string = 'https://bsc-dataseed.binance.org/'
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.registry = new ethers.Contract(registryAddress, PROJECT_REGISTRY_ABI, this.provider);
    this.pool = new ethers.Contract(poolAddress, FUNDING_POOL_ABI, this.provider);
    this.market = new ethers.Contract(marketAddress, PREDICTION_MARKET_ABI, this.provider);
  }

  async execute(params: Record<string, unknown>): Promise<ActionResult> {
    const { action, project_id, market_id, user_address } = params;

    try {
      switch (action) {
        case 'get_project':
          if (!project_id) return { success: false, error: 'project_id required' };
          return await this.getProject(Number(project_id));

        case 'get_market':
          if (!market_id) return { success: false, error: 'market_id required' };
          return await this.getMarket(Number(market_id));

        case 'get_user_bets':
          if (!user_address) return { success: false, error: 'user_address required' };
          return await this.getUserBets(String(user_address));

        case 'get_platform_stats':
          return await this.getPlatformStats();

        default:
          return {
            success: false,
            error: `Unknown action: ${action}. Use "get_project", "get_market", "get_user_bets", or "get_platform_stats"`
          };
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // ========================================
  // GET PROJECT
  // ========================================

  private async getProject(projectId: number): Promise<ActionResult> {
    try {
      const [project, milestones] = await Promise.all([
        this.registry.getProject(projectId),
        this.registry.getProjectMilestones(projectId)
      ]);

      let allocation: AllocationInfo | null = null;
      try {
        const alloc = await this.pool.getProjectAllocation(projectId);
        if (alloc.exists) {
          allocation = {
            totalAllocatedBNB: ethers.formatEther(alloc.totalAllocated),
            totalReleasedBNB: ethers.formatEther(alloc.totalReleased),
            pendingReleaseBNB: ethers.formatEther(alloc.pendingRelease)
          };
        }
      } catch {
        // No allocation
      }

      const fundingGoal = BigInt(project.fundingGoal);
      const fundsRaised = BigInt(project.totalFundsRaised);
      const fundingProgress = fundingGoal > 0n
        ? Number((fundsRaised * 100n) / fundingGoal)
        : 0;

      const data: ProjectInfo = {
        id: Number(project.id),
        owner: project.owner,
        name: project.name,
        description: project.description,
        category: project.category,
        fundingGoalBNB: ethers.formatEther(project.fundingGoal),
        status: PROJECT_STATUS[Number(project.status)] || 'Unknown',
        totalFundsRaisedBNB: ethers.formatEther(project.totalFundsRaised),
        totalPredictions: Number(project.totalPredictions),
        fundingProgress,
        submissionDate: new Date(Number(project.submissionDate) * 1000).toISOString(),
        milestones: milestones.map((m: any) => ({
          id: Number(m.id),
          description: m.description,
          targetDate: new Date(Number(m.targetDate) * 1000).toISOString(),
          isResolved: m.isResolved,
          outcomeAchieved: m.outcomeAchieved
        })),
        allocation
      };

      return { success: true, data };
    } catch (error: any) {
      if (error.message?.includes('Invalid project ID')) {
        return { success: false, error: `Project #${projectId} not found` };
      }
      throw error;
    }
  }

  // ========================================
  // GET MARKET
  // ========================================

  private async getMarket(marketId: number): Promise<ActionResult> {
    try {
      const [marketData, odds] = await Promise.all([
        this.market.getMarket(marketId),
        this.market.getMarketOdds(marketId)
      ]);

      const data: MarketInfo = {
        marketId: Number(marketData.marketId),
        milestoneId: Number(marketData.milestoneId),
        projectId: Number(marketData.projectId),
        status: MARKET_STATUS[Number(marketData.status)] || 'Unknown',
        closeTime: new Date(Number(marketData.closeTime) * 1000).toISOString(),
        totalYesStakeBNB: ethers.formatEther(marketData.totalYesStake),
        totalNoStakeBNB: ethers.formatEther(marketData.totalNoStake),
        totalYesBettors: Number(marketData.totalYesBettors),
        totalNoBettors: Number(marketData.totalNoBettors),
        yesOdds: (Number(odds.yesOdds) / 100).toFixed(2) + '%',
        noOdds: (Number(odds.noOdds) / 100).toFixed(2) + '%',
        isResolved: marketData.outcomeSet,
        finalOutcome: marketData.outcomeSet ? OUTCOME[Number(marketData.finalOutcome)] : null,
        resolutionTime: marketData.resolutionTime > 0
          ? new Date(Number(marketData.resolutionTime) * 1000).toISOString()
          : null
      };

      return { success: true, data };
    } catch (error: any) {
      if (error.message?.includes('Market does not exist')) {
        return { success: false, error: `Market #${marketId} not found` };
      }
      throw error;
    }
  }

  // ========================================
  // GET USER BETS
  // ========================================

  private async getUserBets(userAddress: string): Promise<ActionResult> {
    if (!ethers.isAddress(userAddress)) {
      return { success: false, error: 'Invalid wallet address' };
    }

    const betIds = await this.market.getUserBets(userAddress);

    if (betIds.length === 0) {
      return {
        success: true,
        data: { user: userAddress, totalBets: 0, bets: [] }
      };
    }

    const bets: BetInfo[] = await Promise.all(
      betIds.map(async (id: bigint) => {
        const bet = await this.market.getBet(Number(id));
        const claimable = await this.market.getClaimableAmount(Number(id));

        return {
          betId: Number(bet.betId),
          marketId: Number(bet.marketId),
          bettor: bet.bettor,
          prediction: OUTCOME[Number(bet.prediction)],
          amountBNB: ethers.formatEther(bet.amount),
          timestamp: new Date(Number(bet.timestamp) * 1000).toISOString(),
          claimed: bet.claimed,
          rewardAmountBNB: ethers.formatEther(bet.rewardAmount),
          claimableAmountBNB: ethers.formatEther(claimable)
        };
      })
    );

    const data: UserBetsInfo = {
      user: userAddress,
      totalBets: bets.length,
      bets
    };

    return { success: true, data };
  }

  // ========================================
  // GET PLATFORM STATS
  // ========================================

  private async getPlatformStats(): Promise<ActionResult> {
    const [
      totalProjects,
      totalMilestones,
      poolStats,
      totalMarkets,
      totalBets,
      minBet,
      protocolFees,
      fundingBalance
    ] = await Promise.all([
      this.registry.getTotalProjects(),
      this.registry.getTotalMilestones(),
      this.pool.getPoolStats(),
      this.market.getCurrentMarketId(),
      this.market.getCurrentBetId(),
      this.market.minBetAmount(),
      this.market.protocolFeesCollected(),
      this.market.fundingPoolBalance()
    ]);

    const data: PlatformStats = {
      totalProjects: Number(totalProjects),
      totalMilestones: Number(totalMilestones),
      totalMarkets: Number(totalMarkets),
      totalBets: Number(totalBets),
      minBetAmountBNB: ethers.formatEther(minBet),
      pool: {
        balanceBNB: ethers.formatEther(poolStats.balance),
        allocatedBNB: ethers.formatEther(poolStats.allocated),
        distributedBNB: ethers.formatEther(poolStats.distributed),
        availableBNB: ethers.formatEther(poolStats.available)
      },
      market: {
        protocolFeesCollectedBNB: ethers.formatEther(protocolFees),
        fundingPoolBalanceBNB: ethers.formatEther(fundingBalance)
      }
    };

    return { success: true, data };
  }
}