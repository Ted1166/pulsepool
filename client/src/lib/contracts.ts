import { defineChain } from "viem";

// ========================================
// MANTLE SEPOLIA CHAIN DEFINITION
// ========================================
export const mantleSepolia = defineChain({
  id: 5003,
  name: "Mantle Sepolia Testnet",
  network: "mantle-sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "MNT",
    symbol: "MNT",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia.mantle.xyz"],
    },
    public: {
      http: ["https://rpc.sepolia.mantle.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Mantle Sepolia Explorer",
      url: "https://explorer.sepolia.mantle.xyz",
    },
  },
  testnet: true,
});

// ========================================
// CONTRACT ADDRESSES
// ========================================
export const CONTRACTS = {
  mantleSepolia: {
    ProjectRegistry: "0xf033A7Ff995a2A87C2ba4748bfF7626D6482Da64",
    PredictionMarket: "0x9B05c7A71a02F39B18e979E4F84b784aFed3c284",
    FundingPool: "0x87bd5D00E3c7AB3643Ed6662f12090369a6c8E76",
    ReputationNFT: "0x88AFEEcEf3f8bd68D6D32290DED44bFd64091a60",
  },
};

// ========================================
// ACTIVE CONFIGURATION
// ========================================
export const ACTIVE_CHAIN = mantleSepolia;
export const ACTIVE_CONTRACTS = CONTRACTS.mantleSepolia;

// ========================================
// PROJECT REGISTRY ABI (From deployed contract)
// ========================================
export const PROJECT_REGISTRY_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error"
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error"
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "projectId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "totalRaised", type: "uint256" }
    ],
    name: "FundsRaised",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "projectId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "milestoneId", type: "uint256" },
      { indexed: false, internalType: "string", name: "description", type: "string" },
      { indexed: false, internalType: "uint256", name: "targetDate", type: "uint256" }
    ],
    name: "MilestoneAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "projectId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "milestoneId", type: "uint256" },
      { indexed: false, internalType: "bool", name: "outcomeAchieved", type: "bool" }
    ],
    name: "MilestoneResolved",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
      { indexed: true, internalType: "address", name: "newOwner", type: "address" }
    ],
    name: "OwnershipTransferred",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "projectId", type: "uint256" },
      { indexed: false, internalType: "enum ProjectRegistry.ProjectStatus", name: "oldStatus", type: "uint8" },
      { indexed: false, internalType: "enum ProjectRegistry.ProjectStatus", name: "newStatus", type: "uint8" }
    ],
    name: "ProjectStatusUpdated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "projectId", type: "uint256" },
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "uint256", name: "fundingGoal", type: "uint256" }
    ],
    name: "ProjectSubmitted",
    type: "event"
  },
  {
    inputs: [],
    name: "LISTING_FEE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getAllProjects",
    outputs: [{
      components: [
        { internalType: "uint256", name: "id", type: "uint256" },
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "string", name: "name", type: "string" },
        { internalType: "string", name: "description", type: "string" },
        { internalType: "string", name: "category", type: "string" },
        { internalType: "string", name: "logoUrl", type: "string" },
        { internalType: "uint256", name: "fundingGoal", type: "uint256" },
        { internalType: "uint256", name: "submissionDate", type: "uint256" },
        { internalType: "enum ProjectRegistry.ProjectStatus", name: "status", type: "uint8" },
        { internalType: "uint256[]", name: "milestoneIds", type: "uint256[]" },
        { internalType: "uint256", name: "totalFundsRaised", type: "uint256" },
        { internalType: "uint256", name: "totalPredictions", type: "uint256" }
      ],
      internalType: "struct ProjectRegistry.Project[]",
      name: "",
      type: "tuple[]"
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "_milestoneId", type: "uint256" }],
    name: "getMilestone",
    outputs: [{
      components: [
        { internalType: "uint256", name: "id", type: "uint256" },
        { internalType: "string", name: "description", type: "string" },
        { internalType: "uint256", name: "targetDate", type: "uint256" },
        { internalType: "bool", name: "isResolved", type: "bool" },
        { internalType: "bool", name: "outcomeAchieved", type: "bool" },
        { internalType: "uint256", name: "resolutionDate", type: "uint256" }
      ],
      internalType: "struct ProjectRegistry.Milestone",
      name: "",
      type: "tuple"
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "_owner", type: "address" }],
    name: "getOwnerProjects",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "_projectId", type: "uint256" }],
    name: "getProject",
    outputs: [{
      components: [
        { internalType: "uint256", name: "id", type: "uint256" },
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "string", name: "name", type: "string" },
        { internalType: "string", name: "description", type: "string" },
        { internalType: "string", name: "category", type: "string" },
        { internalType: "string", name: "logoUrl", type: "string" },
        { internalType: "uint256", name: "fundingGoal", type: "uint256" },
        { internalType: "uint256", name: "submissionDate", type: "uint256" },
        { internalType: "enum ProjectRegistry.ProjectStatus", name: "status", type: "uint8" },
        { internalType: "uint256[]", name: "milestoneIds", type: "uint256[]" },
        { internalType: "uint256", name: "totalFundsRaised", type: "uint256" },
        { internalType: "uint256", name: "totalPredictions", type: "uint256" }
      ],
      internalType: "struct ProjectRegistry.Project",
      name: "",
      type: "tuple"
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "_projectId", type: "uint256" }],
    name: "getProjectMilestones",
    outputs: [{
      components: [
        { internalType: "uint256", name: "id", type: "uint256" },
        { internalType: "string", name: "description", type: "string" },
        { internalType: "uint256", name: "targetDate", type: "uint256" },
        { internalType: "bool", name: "isResolved", type: "bool" },
        { internalType: "bool", name: "outcomeAchieved", type: "bool" },
        { internalType: "uint256", name: "resolutionDate", type: "uint256" }
      ],
      internalType: "struct ProjectRegistry.Milestone[]",
      name: "",
      type: "tuple[]"
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getTotalMilestones",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getTotalProjects",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "_projectId", type: "uint256" }],
    name: "incrementPredictions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "_projectId", type: "uint256" },
      { internalType: "uint256", name: "_amount", type: "uint256" }
    ],
    name: "recordFundsRaised",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "_projectId", type: "uint256" },
      { internalType: "uint256", name: "_milestoneId", type: "uint256" },
      { internalType: "bool", name: "_outcomeAchieved", type: "bool" }
    ],
    name: "resolveMilestone",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "string", name: "_category", type: "string" },
      { internalType: "string", name: "_logoUrl", type: "string" },
      { internalType: "uint256", name: "_fundingGoal", type: "uint256" },
      { internalType: "string[]", name: "_milestoneDescriptions", type: "string[]" },
      { internalType: "uint256[]", name: "_milestoneDates", type: "uint256[]" }
    ],
    name: "submitProject",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "_projectId", type: "uint256" },
      { internalType: "enum ProjectRegistry.ProjectStatus", name: "_newStatus", type: "uint8" }
    ],
    name: "updateProjectStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "withdrawFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

// ========================================
// PREDICTION MARKET ABI (From deployed contract)
// ========================================
export const PREDICTION_MARKET_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error"
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error"
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "betId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "marketId", type: "uint256" },
      { indexed: true, internalType: "address", name: "bettor", type: "address" },
      { indexed: false, internalType: "bool", name: "predictedYes", type: "bool" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "BetPlaced",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "marketId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "projectId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "milestoneIndex", type: "uint256" },
      { indexed: false, internalType: "address", name: "projectOwner", type: "address" },
      { indexed: false, internalType: "uint256", name: "deadline", type: "uint256" }
    ],
    name: "MarketCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "marketId", type: "uint256" },
      { indexed: false, internalType: "bool", name: "outcome", type: "bool" }
    ],
    name: "MarketResolved",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "marketId", type: "uint256" },
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "OwnerBonusAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
      { indexed: true, internalType: "address", name: "newOwner", type: "address" }
    ],
    name: "OwnershipTransferred",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "projectId", type: "uint256" },
      { indexed: true, internalType: "address", name: "follower", type: "address" }
    ],
    name: "ProjectFollowed",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "projectId", type: "uint256" },
      { indexed: true, internalType: "address", name: "follower", type: "address" }
    ],
    name: "ProjectUnfollowed",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "betId", type: "uint256" },
      { indexed: true, internalType: "address", name: "bettor", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "RewardClaimed",
    type: "event"
  },
  {
    inputs: [{ internalType: "uint256", name: "marketId", type: "uint256" }],
    name: "addOwnerBonus",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "betCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "betId", type: "uint256" }],
    name: "claimReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "marketId", type: "uint256" }],
    name: "closeMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "projectId", type: "uint256" },
      { internalType: "uint256", name: "milestoneIndex", type: "uint256" },
      { internalType: "address", name: "projectOwner", type: "address" },
      { internalType: "uint256", name: "daysUntilDeadline", type: "uint256" }
    ],
    name: "createMarket",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "betId", type: "uint256" }],
    name: "estimateReward",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "projectId", type: "uint256" }],
    name: "followProject",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "betId", type: "uint256" }],
    name: "getBet",
    outputs: [{
      components: [
        { internalType: "uint256", name: "id", type: "uint256" },
        { internalType: "uint256", name: "marketId", type: "uint256" },
        { internalType: "address", name: "bettor", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
        { internalType: "bool", name: "predictedYes", type: "bool" },
        { internalType: "bool", name: "claimed", type: "bool" },
        { internalType: "uint256", name: "reward", type: "uint256" }
      ],
      internalType: "struct PredictionMarket.Bet",
      name: "",
      type: "tuple"
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "marketId", type: "uint256" }],
    name: "getMarket",
    outputs: [{
      components: [
        { internalType: "uint256", name: "id", type: "uint256" },
        { internalType: "uint256", name: "projectId", type: "uint256" },
        { internalType: "uint256", name: "milestoneIndex", type: "uint256" },
        { internalType: "address", name: "projectOwner", type: "address" },
        { internalType: "uint256", name: "deadline", type: "uint256" },
        { internalType: "uint256", name: "ownerBonusPool", type: "uint256" },
        { internalType: "bool", name: "isOpen", type: "bool" },
        { internalType: "bool", name: "isResolved", type: "bool" },
        { internalType: "bool", name: "outcome", type: "bool" },
        { internalType: "uint256", name: "totalYesAmount", type: "uint256" },
        { internalType: "uint256", name: "totalNoAmount", type: "uint256" },
        { internalType: "uint256", name: "yesCount", type: "uint256" },
        { internalType: "uint256", name: "noCount", type: "uint256" }
      ],
      internalType: "struct PredictionMarket.Market",
      name: "",
      type: "tuple"
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "marketId", type: "uint256" }],
    name: "getMarketBets",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "projectId", type: "uint256" },
      { internalType: "uint256", name: "milestoneIndex", type: "uint256" }
    ],
    name: "getMarketByProject",
    outputs: [{
      components: [
        { internalType: "uint256", name: "id", type: "uint256" },
        { internalType: "uint256", name: "projectId", type: "uint256" },
        { internalType: "uint256", name: "milestoneIndex", type: "uint256" },
        { internalType: "address", name: "projectOwner", type: "address" },
        { internalType: "uint256", name: "deadline", type: "uint256" },
        { internalType: "uint256", name: "ownerBonusPool", type: "uint256" },
        { internalType: "bool", name: "isOpen", type: "bool" },
        { internalType: "bool", name: "isResolved", type: "bool" },
        { internalType: "bool", name: "outcome", type: "bool" },
        { internalType: "uint256", name: "totalYesAmount", type: "uint256" },
        { internalType: "uint256", name: "totalNoAmount", type: "uint256" },
        { internalType: "uint256", name: "yesCount", type: "uint256" },
        { internalType: "uint256", name: "noCount", type: "uint256" }
      ],
      internalType: "struct PredictionMarket.Market",
      name: "",
      type: "tuple"
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "marketId", type: "uint256" }],
    name: "getMarketOdds",
    outputs: [
      { internalType: "uint256", name: "yesPercent", type: "uint256" },
      { internalType: "uint256", name: "noPercent", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "projectId", type: "uint256" }],
    name: "getProjectFollowers",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserBets",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "marketId", type: "uint256" },
      { internalType: "address", name: "user", type: "address" }
    ],
    name: "hasUserBet",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "projectId", type: "uint256" },
      { internalType: "address", name: "user", type: "address" }
    ],
    name: "isUserFollowing",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "marketCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "minBetAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "projectId", type: "uint256" },
      { internalType: "uint256", name: "milestoneIndex", type: "uint256" },
      { internalType: "bool", name: "predictYes", type: "bool" }
    ],
    name: "placeBet",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "platformBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "platformFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "marketId", type: "uint256" },
      { internalType: "bool", name: "milestoneAchieved", type: "bool" }
    ],
    name: "resolveMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "newMin", type: "uint256" }],
    name: "setMinBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "newFee", type: "uint256" }],
    name: "setPlatformFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "projectId", type: "uint256" }],
    name: "unfollowProject",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address payable", name: "to", type: "address" }],
    name: "withdrawPlatformFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;