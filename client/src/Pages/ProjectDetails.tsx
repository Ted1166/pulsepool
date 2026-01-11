import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Users, 
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { useProject, useProjectMilestones } from "@/hooks/useProjects";
import { useMarket, usePlaceBet, useCreateMarket, useHasUserBet } from "@/hooks/usePredictions";
import { formatEther } from "viem";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import ChatAgent from "@/agent/ChatAgent";
import { trackProjectView, getProjectViews } from "@/utils/viewTracking";
import { MilestoneManager } from "@/components/MilestoneManger";

const ProjectDetail = () => {
  const { id } = useParams();
  const { address, isConnected } = useAccount();
  const [betAmount, setBetAmount] = useState("");
  const [selectedMilestone, setSelectedMilestone] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  
  const { data: project, isLoading: projectLoading, isError: projectError } = useProject(Number(id));
  const { data: milestones, isLoading: milestonesLoading } = useProjectMilestones(Number(id));
  const { data: market } = useMarket(Number(id), selectedMilestone);
  const { placeBet, isPending, isConfirming, isSuccess, isError: betError } = usePlaceBet();
  const { createMarket, isPending: isCreatingMarket, isConfirming: isConfirmingMarket, isSuccess: isMarketCreated } = useCreateMarket();

  const marketData = market as any;
  const { data: hasUserBet } = useHasUserBet(marketData?.id ? Number(marketData.id) : undefined);


  useEffect(() => {
  if (id) {
    const projectId = Number(id);
    const isNewView = trackProjectView(projectId, address);
    
    if (isNewView) {
      console.log(`✅ New view tracked for project ${projectId}`);
    } else {
      console.log(`👁️ Duplicate view prevented for project ${projectId}`);
    }
    
    // Update view count display
    setViewCount(getProjectViews(projectId));
    }
  }, [id, address]);

  const handlePlaceBet = async (predictYes: boolean) => {
    if (!betAmount || !id || Number(betAmount) < 0.01) {
      alert("Minimum bet amount is 0.01 MNT");
      return;
    }
    
    try {
      await placeBet(Number(id), selectedMilestone, predictYes, betAmount);
      setBetAmount("");
    } catch (error) {
      console.error('Failed to place bet:', error);
    }
  };

  const handleCreateMarket = async () => {
    if (!id || !project) {
      alert("Project data not loaded");
      return;
    }

    try {
      const projectData = project as any;
      const creator = projectData.owner ?? projectData[1] ?? "0x0";
      
      const milestonesArray = (milestones as any[]) || [];
      if (selectedMilestone >= milestonesArray.length) {
        alert("Invalid milestone selected");
        return;
      }
      
      const milestone = milestonesArray[selectedMilestone];
      const targetDate = milestone.targetDate ?? milestone[2] ?? 0n;
      const daysUntilDeadline = Math.max(
        1,
        Math.floor((Number(targetDate) - Date.now() / 1000) / 86400)
      );

      await createMarket(Number(id), selectedMilestone, creator, daysUntilDeadline);
      
      alert("Market created successfully! The page will refresh.");
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      console.error('Failed to create market:', error);
      alert(`Failed to create market: ${error.message || 'Unknown error'}`);
    }
  };

  if (projectLoading || milestonesLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading project details...</p>
        </main>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
            <p className="text-muted-foreground mb-8">
              The project you're looking for doesn't exist or hasn't been created yet.
            </p>
            <Link to="/projects">
              <Button variant="hero">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const projectData = project as any;
  const projectId = projectData.id ?? projectData[0] ?? 0n;
  const creator = projectData.owner ?? projectData[1] ?? "0x0";
  const projectName = projectData.name ?? projectData[2] ?? "Unnamed Project";
  const description = projectData.description ?? projectData[3] ?? "No description available";
  const category = projectData.category ?? projectData[4] ?? "Uncategorized";
  const fundingGoal = projectData.fundingGoal ?? projectData[6] ?? 0n;
  const createdAt = projectData.submissionDate ?? projectData[7] ?? 0n;
  const status = projectData.status ?? projectData[8] ?? 0;
  const fundingRaised = projectData.totalFundsRaised ?? projectData[10] ?? 0n;
  const totalPredictions = projectData.totalPredictions ?? projectData[11] ?? 0n;

  const fundingPercentage = fundingGoal > 0n 
    ? Number((fundingRaised * 100n) / fundingGoal)
    : 0;

  const milestonesArray = (milestones as any[]) || [];

  // Calculate market stats
  let yesPercentage = 50;
  let noPercentage = 50;
  let marketExists = false;

  // const marketData = market as any;
  if (marketData && marketData.id && marketData.id > 0n) {
    marketExists = true;
    const totalYes = marketData.totalYesAmount || 0n;
    const totalNo = marketData.totalNoAmount || 0n;
    const total = totalYes + totalNo;
    
    if (total > 0n) {
      yesPercentage = Number((totalYes * 100n) / total);
      noPercentage = 100 - yesPercentage;
    }
  }

  const isProjectOwner = address && creator && address.toLowerCase() === creator.toLowerCase();

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/projects">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>

          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge variant="secondary" className="mb-2">{category}</Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{projectName}</h1>
                <p className="text-xl text-muted-foreground max-w-3xl">{description}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Creator: {creator?.slice(0, 6)}...{creator?.slice(-4)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {createdAt > 0n ? new Date(Number(createdAt) * 1000).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Project Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {milestonesArray.length > 0 ? (
                    milestonesArray.map((milestone, idx) => {
                      const milestoneDescription = milestone.description ?? milestone[1] ?? `Milestone ${idx + 1}`;
                      const targetDate = milestone.targetDate ?? milestone[2] ?? 0n;
                      const outcomeAchieved = milestone.outcomeAchieved ?? milestone[4] ?? false;
                      
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            selectedMilestone === idx
                              ? "border-primary/50 bg-primary/5"
                              : "border-border/50 hover:border-border"
                          }`}
                          onClick={() => setSelectedMilestone(idx)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 flex-1">
                              {outcomeAchieved ? (
                                <CheckCircle2 className="w-5 h-5 text-success mt-1" />
                              ) : (
                                <Clock className="w-5 h-5 text-warning mt-1" />
                              )}
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1">{milestoneDescription}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {targetDate > 0n ? new Date(Number(targetDate) * 1000).toLocaleDateString() : 'TBD'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {!outcomeAchieved && selectedMilestone === idx && marketExists && (
                              <div className="text-right">
                                <div className="text-2xl font-bold text-success">{yesPercentage}%</div>
                                <div className="text-xs text-muted-foreground">Confidence</div>
                              </div>
                            )}
                          </div>

                          {!outcomeAchieved && selectedMilestone === idx && (
                            <div className="mt-4 pt-4 border-t border-border/50">
                              {!marketExists ? (
                                <div className="text-center py-4 space-y-3">
                                  <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto" />
                                  <p className="text-sm text-muted-foreground">
                                    No prediction market exists for this milestone yet.
                                  </p>
                                  {isProjectOwner ? (
                                    <Button
                                      variant="hero"
                                      size="sm"
                                      onClick={handleCreateMarket}
                                      disabled={isCreatingMarket || isConfirmingMarket}
                                    >
                                      {isCreatingMarket || isConfirmingMarket ? (
                                        <>
                                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                          {isCreatingMarket ? 'Creating...' : 'Confirming...'}
                                        </>
                                      ) : (
                                        '🏗️ Create Market'
                                      )}
                                    </Button>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">
                                      Ask the project owner to create a market for this milestone
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <div className="flex gap-2 mb-3">
                                    <div className="flex-1 bg-success/20 text-success px-3 py-2 rounded-lg text-sm font-medium text-center">
                                      YES: {yesPercentage}%
                                    </div>
                                    <div className="flex-1 bg-destructive/20 text-destructive px-3 py-2 rounded-lg text-sm font-medium text-center">
                                      NO: {noPercentage}%
                                    </div>
                                  </div>
                                  
                                  {!isConnected ? (
                                  <p className="text-center text-sm text-muted-foreground py-4">
                                    Connect your wallet to place predictions
                                  </p>
                                ) : isProjectOwner ? (
                                  <div className="text-center py-4 space-y-2">
                                    <AlertCircle className="w-8 h-8 text-warning mx-auto" />
                                    <p className="text-sm text-warning font-medium">
                                      ⚠️ Project owners cannot bet on their own milestones
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      This prevents conflicts of interest
                                    </p>
                                  </div>
                                ) : hasUserBet ? (
                                  <div className="text-center py-4 space-y-2">
                                    <CheckCircle2 className="w-8 h-8 text-success mx-auto" />
                                    <p className="text-sm text-success font-medium">
                                      ✅ You've already placed your prediction
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Only one prediction per milestone allowed
                                    </p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button 
                                      variant="default"
                                      size="sm" 
                                      className="w-full bg-success hover:bg-success/80"
                                      onClick={() => handlePlaceBet(true)}
                                      disabled={isPending || isConfirming || !betAmount}
                                    >
                                      {isPending || isConfirming ? (
                                        <>
                                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                          {isPending ? 'Approving...' : 'Processing...'}
                                        </>
                                      ) : (
                                        'Bet YES'
                                      )}
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      size="sm" 
                                      className="w-full"
                                      onClick={() => handlePlaceBet(false)}
                                      disabled={isPending || isConfirming || !betAmount}
                                    >
                                      {isPending || isConfirming ? (
                                        <>
                                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                          {isPending ? 'Approving...' : 'Processing...'}
                                        </>
                                      ) : (
                                        'Bet NO'
                                      )}
                                    </Button>
                                  </div>
                                )}

                                  {isSuccess && (
                                    <p className="text-center text-sm text-success mt-2">
                                      ✅ Prediction placed successfully!
                                    </p>
                                  )}
                                  {betError && (
                                    <p className="text-center text-sm text-destructive mt-2">
                                      ❌ Failed to place prediction. Try again.
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No milestones defined for this project yet.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-card">
                <CardContent className="pt-6">
                  <Tabs defaultValue="about">
                    <TabsList className="w-full justify-start">
                      <TabsTrigger value="about">About</TabsTrigger>
                      <TabsTrigger value="team">Team</TabsTrigger>
                    </TabsList>
                    <TabsContent value="about" className="mt-4 space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Project Vision</h3>
                        <p className="text-muted-foreground">{description}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Status</h3>
                        <Badge variant={status === 0 ? "default" : status === 1 ? "secondary" : "outline"}>
                          {status === 0 ? 'Active' : status === 1 ? 'Completed' : 'Cancelled'}
                        </Badge>
                      </div>
                    </TabsContent>
                    <TabsContent value="team" className="mt-4">
                      {isProjectOwner && (
                      <div className="mt-6">
                        <MilestoneManager
                          projectId={Number(id)}
                          milestones={milestonesArray}
                          isOwner={isProjectOwner}
                        />
                      </div>
                    )}
                      <div>
                        <h3 className="font-semibold mb-2">Project Creator</h3>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-background font-bold">
                            {creator?.slice(2, 4).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-mono text-sm">{creator}</p>
                            <p className="text-xs text-muted-foreground">Project Owner</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-gradient-primary text-background border-0 shadow-glow">
                <CardHeader>
                  <CardTitle className="text-background">Place Your Prediction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Amount (MNT)</label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="bg-background/20 border-background/30 text-background placeholder:text-background/60"
                      min="0.01"
                      step="0.01"
                      disabled={!isConnected || !marketExists}
                    />
                    <div className="text-xs mt-1 text-background/80">Min: 0.01 MNT</div>
                  </div>
                  {!isConnected && (
                    <p className="text-xs text-background/80">Connect your wallet to place predictions</p>
                  )}
                  {isConnected && !marketExists && (
                    <p className="text-xs text-background/80">
                      {isProjectOwner ? 'Create a market for this milestone to enable predictions' : 'Waiting for project owner to create a market'}
                    </p>
                  )}
                  {isConnected && marketExists && (
                    <p className="text-xs text-background/80">Select a milestone above and click YES or NO to predict</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-card">
                <CardHeader>
                  <CardTitle className="text-lg">Funding Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Raised</span>
                      <span className="font-semibold">
                        {fundingRaised ? formatEther(fundingRaised) : '0'} / {fundingGoal ? formatEther(fundingGoal) : '0'} MNT
                      </span>
                    </div>
                    <Progress value={fundingPercentage} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">{fundingPercentage.toFixed(1)}% funded</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-1">
                        <Target className="w-3 h-3" />
                        Milestones
                      </div>
                      <div className="text-2xl font-bold">{milestonesArray.length}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </div>
                      <div className="text-2xl font-bold">
                        {milestonesArray.filter((m: any) => (m.outcomeAchieved ?? m[4])).length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Market Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Views</span>
                      <span className="font-semibold">{viewCount}</span>
                      <span className="text-muted-foreground">Category</span>
                      <Badge variant="secondary">{category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={status === 0 ? "default" : "secondary"}>
                        {status === 0 ? 'Active' : 'Completed'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-semibold">
                        {createdAt > 0n ? new Date(Number(createdAt) * 1000).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Predictions</span>
                      <span className="font-semibold">{totalPredictions.toString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <ChatAgent/>
    </div>
  );
};

export default ProjectDetail;