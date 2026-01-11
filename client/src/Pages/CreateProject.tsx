import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useBalance } from "wagmi";
import { ACTIVE_CONTRACTS, PROJECT_REGISTRY_ABI } from "@/lib/contracts";
import { parseEther, formatEther } from "viem";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import ChatAgent from "@/agent/ChatAgent";

const CreateProject = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    fundingGoal: "",
    imageUrl: "",
  });

  const [milestones, setMilestones] = useState([
    { description: "", targetDate: "" }
  ]);

  const [estimatedGas, setEstimatedGas] = useState<string>("~0.01");

  const { writeContractAsync, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const estimatedGasCost = () => {
    const baseCost = 0.003;
    const perMilestone = 0.002;
    const listingFee = 0.001;
    const total = baseCost + (milestones.length * perMilestone) + listingFee;
    return total.toFixed(4);
  };

  useEffect(() => {
    setEstimatedGas(estimatedGasCost());
  }, [milestones.length]);

  const addMilestone = () => {
    if (milestones.length >= 3) {
      alert("Maximum 3 milestones allowed");
      return;
    }
    setMilestones([...milestones, { description: "", targetDate: "" }]);
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length === 1) {
      alert("At least 1 milestone is required");
      return;
    }
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    const totalCost = parseEther(estimatedGas);
    if (balance && balance.value < totalCost) {
      alert(`Insufficient balance. You need at least ${estimatedGas} MNT. Get more from: https://faucet.sepolia.mantle.xyz`);
      return;
    }

    const fundingGoalNum = parseFloat(formData.fundingGoal);
    if (!formData.fundingGoal || fundingGoalNum <= 0) {
      alert("Please enter a valid funding goal greater than 0");
      return;
    }

    if (fundingGoalNum < 0.01) {
      alert("Funding goal must be at least 0.01 MNT");
      return;
    }

    if (milestones.length === 0) {
      alert("Please add at least 1 milestone");
      return;
    }

    for (let i = 0; i < milestones.length; i++) {
      if (!milestones[i].description.trim()) {
        alert(`Please enter a description for Milestone ${i + 1}`);
        return;
      }
      if (!milestones[i].targetDate) {
        alert(`Please select a target date for Milestone ${i + 1}`);
        return;
      }
      
      const targetDate = new Date(milestones[i].targetDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (targetDate <= tomorrow) {
        alert(`Milestone ${i + 1} target date must be at least 1 day in the future`);
        return;
      }
    }

    try {
      const milestoneDescriptions = milestones.map(m => m.description.trim());
      const milestoneDates = milestones.map(m => 
        Math.floor(new Date(m.targetDate).getTime() / 1000)
      );

      console.log("=== Submitting Project ===");
      console.log("Contract Address:", ACTIVE_CONTRACTS.ProjectRegistry);
      console.log("From Address:", address);
      console.log("Balance:", balance ? formatEther(balance.value) : "0", "MNT");
      console.log("Project Data:", {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        logoUrl: formData.imageUrl || "",
        fundingGoal: formData.fundingGoal + " MNT",
        fundingGoalWei: parseEther(formData.fundingGoal).toString(),
        milestones: milestones.map((m, i) => ({
          index: i,
          description: m.description,
          targetDate: m.targetDate,
          timestamp: milestoneDates[i],
        })),
      });

      const tx = await writeContractAsync({
        address: ACTIVE_CONTRACTS.ProjectRegistry as `0x${string}`,
        abi: PROJECT_REGISTRY_ABI,
        functionName: 'submitProject',
        args: [
          formData.name,                      
          formData.description,               
          formData.category,                  
          formData.imageUrl || "",            
          parseEther(formData.fundingGoal),   
          milestoneDescriptions,              
          milestoneDates,                    
        ],
        value: parseEther("0.001"), 
      }as any);

      console.log("Transaction hash:", tx);
      
    } catch (error: any) {
      console.error("=== Transaction Failed ===");
      console.error("Error:", error);
      
      let errorMessage = "Failed to create project";
      
      if (error.message) {
        if (error.message.includes('insufficient funds')) {
          errorMessage = `Insufficient funds for gas + listing fee. You need ~${estimatedGas} MNT.\n\nGet testnet MNT from: https://faucet.sepolia.mantle.xyz`;
        } else if (error.message.includes('user rejected') || error.message.includes('User rejected')) {
          errorMessage = "Transaction was cancelled";
        } else if (error.message.includes('reverted')) {
          const revertMatch = error.message.match(/reverted with the following reason:\n(.+)/);
          if (revertMatch) {
            errorMessage = `Contract reverted: ${revertMatch[1]}`;
          } else {
            errorMessage = "Transaction reverted. Possible reasons:\n" +
              "• Insufficient MNT balance\n" +
              "• Funding goal too low (minimum 0.01 MNT)\n" +
              "• Invalid milestone dates\n" +
              "• Contract paused or not accessible";
          }
        } else if (error.message.includes('gas required exceeds')) {
          errorMessage = "Transaction requires too much gas. Try reducing the number of milestones.";
        } else if (error.message.includes('network')) {
          errorMessage = "Network error. Please check:\n" +
            "• You're connected to Mantle Sepolia Testnet\n" +
            "• Your internet connection is stable\n" +
            "• Try refreshing the page";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Project Created Successfully! 🎉</h2>
            <p className="text-muted-foreground mb-4">
              Your project has been submitted to the blockchain.
            </p>
            {hash && (
              <p className="text-sm text-muted-foreground mb-8 font-mono break-all">
                Transaction: {hash}
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <Button variant="hero" onClick={() => navigate('/projects')}>
                View Projects
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Create Another
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to create a project.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Create New Project</h1>
            <p className="text-xl text-muted-foreground">
              Submit your project for community predictions and funding
            </p>
            {balance && (
              <p className="text-sm text-muted-foreground mt-2">
                Your balance: {parseFloat(formatEther(balance.value)).toFixed(4)} MNT
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="bg-gradient-card mb-6">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    required
                    maxLength={100}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="DeFi Yield Optimizer"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    required
                    maxLength={500}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your project..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.description.length}/500 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      required
                      maxLength={50}
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="DeFi, NFT, Gaming..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="fundingGoal">Funding Goal (MNT) *</Label>
                    <Input
                      id="fundingGoal"
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={formData.fundingGoal}
                      onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
                      placeholder="10.0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum: 0.01 MNT
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="imageUrl">Logo/Image URL (optional)</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.png"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Provide a direct link to your project logo
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Milestones (1-3)</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addMilestone}
                    disabled={milestones.length >= 3}
                  >
                    Add Milestone
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div key={index} className="p-4 border border-border/50 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Milestone {index + 1}</h3>
                      {milestones.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMilestone(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div>
                      <Label>Description *</Label>
                      <Input
                        required
                        maxLength={200}
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        placeholder="Launch Beta on Testnet"
                      />
                    </div>

                    <div>
                      <Label>Target Date *</Label>
                      <Input
                        type="date"
                        required
                        value={milestone.targetDate}
                        onChange={(e) => updateMilestone(index, 'targetDate', e.target.value)}
                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Must be at least 1 day in the future
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Gas Estimate Card */}
            <Card className="bg-yellow-500/10 border-yellow-500/50 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="text-yellow-500">⚠️</div>
                  <div className="flex-1">
                    <p className="font-semibold">Transaction Cost</p>
                    <p className="text-sm text-muted-foreground">
                      Estimated: ~{estimatedGas} MNT (including 0.001 MNT listing fee)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {milestones.length} milestone{milestones.length !== 1 ? 's' : ''} • Limit to 1-3 to save gas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Check */}
            <Card className="bg-blue-500/10 border-blue-500/50 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="text-blue-500">ℹ️</div>
                  <div className="flex-1">
                    <p className="font-semibold">Network Check</p>
                    <p className="text-sm text-muted-foreground">
                      Make sure you're connected to <strong>Mantle Sepolia Testnet</strong>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Need testnet MNT? Get it from: <a href="https://faucet.sepolia.mantle.xyz" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">faucet.sepolia.mantle.xyz</a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="flex-1"
                disabled={isPending || isConfirming}
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {isPending ? 'Awaiting Confirmation...' : 'Processing Transaction...'}
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate('/projects')}
                disabled={isPending || isConfirming}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
      <ChatAgent/>
    </div>
  );
};

export default CreateProject;