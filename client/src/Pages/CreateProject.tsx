import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { ACTIVE_CONTRACTS, PROJECT_REGISTRY_ABI } from "@/lib/contracts";
import { parseEther } from "viem";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";

const LISTING_FEE = "0.001"; // 0.1 BNB listing fee

const CreateProject = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    fundingGoal: "",
    logoUrl: "",
  });

  const [milestones, setMilestones] = useState([
    { description: "", targetDate: "" },
  ]);

  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isTxError,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Log transaction errors
  useEffect(() => {
    if (isTxError && txError) {
      console.error("❌ Transaction receipt error:", txError);
      alert(
        `Transaction failed on-chain. Check console for details.\n\nView on BSCScan: https://testnet.bscscan.com/tx/${hash}`
      );
    }
  }, [isTxError, txError, hash]);

  const addMilestone = () => {
    if (milestones.length >= 3) {
      alert("Maximum 3 milestones to reduce gas costs");
      return;
    }
    setMilestones([...milestones, { description: "", targetDate: "" }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length === 1) {
      alert("At least 1 milestone is required");
      return;
    }
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // Limit milestones to 3
      if (milestones.length > 3) {
        alert("Maximum 3 milestones allowed to reduce gas costs");
        return;
      }

      // Validate all fields
      if (
        !formData.name ||
        !formData.description ||
        !formData.category ||
        !formData.fundingGoal
      ) {
        alert("Please fill in all required fields");
        return;
      }

      // Validate milestones
      for (const milestone of milestones) {
        if (!milestone.description || !milestone.targetDate) {
          alert("Please fill in all milestone fields");
          return;
        }
      }

      // Prepare milestone data
      const milestoneDescriptions = milestones.map((m) => m.description);
      const milestoneDates = milestones.map((m) =>
        BigInt(Math.floor(new Date(m.targetDate).getTime() / 1000))
      );

      // Validate future dates
      const now = Math.floor(Date.now() / 1000);
      for (const date of milestoneDates) {
        if (date <= now) {
          alert("All milestone dates must be in the future");
          return;
        }
      }

      // Calculate funding goal
      const fundingGoal = parseEther(formData.fundingGoal);

      console.log("📝 Submitting project:", {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        logoUrl: formData.logoUrl || "",
        fundingGoal: formData.fundingGoal,
        milestones: milestoneDescriptions.length,
        listingFee: LISTING_FEE,
      });

      console.log("📊 Transaction parameters:", {
        contract: ACTIVE_CONTRACTS.ProjectRegistry,
        args: {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          logoUrl: formData.logoUrl || "",
          fundingGoal: fundingGoal.toString(),
          milestoneDescriptions,
          milestoneDates: milestoneDates.map((d) => d.toString()),
        },
        value: parseEther(LISTING_FEE).toString(),
      });

      // 💰 Verify payment details
      console.log("💰 Payment details:", {
        listingFee: LISTING_FEE,
        parsedValue: parseEther(LISTING_FEE).toString(),
        inWei: parseEther(LISTING_FEE).toString(),
        inBNB: LISTING_FEE + " BNB",
      });

      // ✅ Call submitProject with 7 parameters (matches deployed contract)
      const tx = await writeContractAsync({
        address: ACTIVE_CONTRACTS.ProjectRegistry as `0x${string}`,
        abi: PROJECT_REGISTRY_ABI,
        functionName: "submitProject",
        args: [
          formData.name, // 1. string _name
          formData.description, // 2. string _description
          formData.category, // 3. string _category
          formData.logoUrl || "", // 4. string _logoUrl
          fundingGoal, // 5. uint256 _fundingGoal
          milestoneDescriptions, // 6. string[] _milestoneDescriptions
          milestoneDates, // 7. uint256[] _milestoneDates
        ],
        value: parseEther(LISTING_FEE),
        gas: 1000000n,
      } as any);

      console.log("✅ Transaction submitted:", tx);
      console.log(`🔍 View on BSCScan: https://testnet.bscscan.com/tx/${tx}`);
    } catch (error: any) {
      console.error("❌ Transaction failed:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));

      // Detailed error messages
      const errorMsg = error.message || error.toString();

      if (
        errorMsg.includes("insufficient funds") ||
        errorMsg.includes("exceeds balance")
      ) {
        alert(
          `❌ Insufficient Balance\n\nYou need at least 0.15 tBNB:\n• 0.1 tBNB listing fee\n• ~0.05 tBNB for gas\n\nGet more from: https://testnet.bnbchain.org/faucet-smart`
        );
      } else if (
        errorMsg.includes("user rejected") ||
        errorMsg.includes("User denied")
      ) {
        alert("Transaction cancelled by user");
      } else if (errorMsg.includes("Insufficient listing fee")) {
        alert(`❌ Listing fee required: ${LISTING_FEE} tBNB`);
      } else if (errorMsg.includes("Milestone date must be in future")) {
        alert("❌ All milestone dates must be in the future");
      } else if (errorMsg.includes("Name cannot be empty")) {
        alert("❌ Project name is required");
      } else if (errorMsg.includes("Maximum 10 milestones")) {
        alert(
          "❌ Maximum 10 milestones allowed (recommend 1-3 for gas savings)"
        );
      } else if (errorMsg.includes("ABI encoding")) {
        alert(
          `❌ Parameter Mismatch\n\nThe contract parameters don't match. This is a development error.\n\n${errorMsg.substring(
            0,
            200
          )}`
        );
      } else {
        alert(
          `❌ Transaction Failed\n\n${errorMsg.substring(
            0,
            200
          )}\n\nCheck browser console for details.`
        );
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              Project Created Successfully! 🎉
            </h2>
            <p className="text-muted-foreground mb-8">
              Your project has been submitted to the blockchain.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="hero" onClick={() => navigate("/projects")}>
                View Projects
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
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
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="DeFi Yield Optimizer"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe your project..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="DeFi, NFT, Gaming..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="fundingGoal">Funding Goal (BNB) *</Label>
                    <Input
                      id="fundingGoal"
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={formData.fundingGoal}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fundingGoal: e.target.value,
                        })
                      }
                      placeholder="10.0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="logoUrl">Logo URL (optional)</Label>
                  <Input
                    id="logoUrl"
                    value={formData.logoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, logoUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Milestones (Max 3)</CardTitle>
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
                  <div
                    key={index}
                    className="p-4 border border-border/50 rounded-lg space-y-4"
                  >
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
                        value={milestone.description}
                        onChange={(e) =>
                          updateMilestone(index, "description", e.target.value)
                        }
                        placeholder="Launch Beta on Testnet"
                      />
                    </div>

                    <div>
                      <Label>Target Date *</Label>
                      <Input
                        type="date"
                        required
                        value={milestone.targetDate}
                        onChange={(e) =>
                          updateMilestone(index, "targetDate", e.target.value)
                        }
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-primary/10 border-primary/50 mb-6">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Listing Fee:</span>
                    <span>{LISTING_FEE} tBNB</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Estimated Gas:</span>
                    <span>~0.002 tBNB</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total Cost:</span>
                    <span>
                      ~{(parseFloat(LISTING_FEE) + 0.002).toFixed(3)} tBNB
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ⚠️ Make sure you have at least 0.15 tBNB in your wallet
                  </p>
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
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isPending ? "Confirming..." : "Creating..."}
                  </>
                ) : (
                  `Create Project (${LISTING_FEE} tBNB)`
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate("/projects")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateProject;
