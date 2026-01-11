// Create: src/components/MilestoneManager.tsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Save, X, Calendar, FileText } from "lucide-react";
import { useState } from "react";

interface Milestone {
  id?: bigint;
  description: string;
  targetDate: bigint;
  isResolved?: boolean;
  outcomeAchieved?: boolean;
}

interface MilestoneManagerProps {
  projectId: number;
  milestones: any[]; // Raw milestone data from contract
  isOwner: boolean;
}

export const MilestoneManager = ({
  projectId,
  milestones,
  isOwner,
}: MilestoneManagerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    targetDate: "",
  });

  if (!isOwner) return null;

  // Parse milestones from contract format
  const parsedMilestones = milestones.map((m, idx) => ({
    index: idx,
    id: m.id ?? m[0],
    description: m.description ?? m[1] ?? "",
    targetDate: m.targetDate ?? m[2] ?? 0n,
    isResolved: m.isResolved ?? m[3] ?? false,
    outcomeAchieved: m.outcomeAchieved ?? m[4] ?? false,
  }));

  const handleAddMilestone = () => {
    if (!formData.description || !formData.targetDate) {
      alert("Please fill in all fields");
      return;
    }

    const targetDate = new Date(formData.targetDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (targetDate <= tomorrow) {
      alert("Target date must be at least 1 day in the future");
      return;
    }

    // For now, just show a message. Backend integration needed
    alert(
      `📝 Milestone Ready to Add:\n\n` +
      `Description: ${formData.description}\n` +
      `Target Date: ${formData.targetDate}\n\n` +
      `⚠️ Smart contract integration needed to save this milestone on-chain.`
    );
    
    setFormData({ description: "", targetDate: "" });
    setIsAddDialogOpen(false);
  };

  const handleStartEdit = (index: number) => {
    const milestone = parsedMilestones[index];
    const dateStr = new Date(Number(milestone.targetDate) * 1000).toISOString().split('T')[0];
    
    setFormData({
      description: milestone.description,
      targetDate: dateStr,
    });
    setEditingIndex(index);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    
    const milestone = parsedMilestones[editingIndex];
    
    alert(
      `💾 Milestone Update Ready:\n\n` +
      `Milestone ID: ${milestone.id?.toString()}\n` +
      `New Description: ${formData.description}\n` +
      `New Date: ${formData.targetDate}\n\n` +
      `⚠️ Smart contract integration needed to update this milestone on-chain.`
    );
    
    setEditingIndex(null);
    setFormData({ description: "", targetDate: "" });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setFormData({ description: "", targetDate: "" });
  };

  const handleDelete = (index: number) => {
    const milestone = parsedMilestones[index];
    
    if (!confirm(`Delete milestone: "${milestone.description}"?`)) return;
    
    alert(
      `🗑️ Milestone Delete Request:\n\n` +
      `Milestone ID: ${milestone.id?.toString()}\n` +
      `Description: ${milestone.description}\n\n` +
      `⚠️ Smart contract integration needed to delete this milestone on-chain.`
    );
  };

  return (
    <Card className="bg-gradient-card border-primary/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Manage Milestones
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Milestone</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Launch Testnet Beta"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="targetDate">Target Date *</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 1 day in the future
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="hero" onClick={handleAddMilestone}>
                  Add Milestone
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {parsedMilestones.map((milestone, index) => {
            const isEditing = editingIndex === index;
            const isResolved = milestone.isResolved;
            
            return (
              <div 
                key={index} 
                className={`p-3 rounded-lg border transition-all ${
                  isResolved 
                    ? 'bg-success/5 border-success/30' 
                    : 'bg-background/50 border-border/50'
                }`}
              >
                {isEditing ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Milestone description"
                    />
                    <Input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSaveEdit}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{milestone.description}</span>
                        {isResolved && (
                          <Badge className="bg-success/20 text-success text-xs">
                            {milestone.outcomeAchieved ? 'Achieved ✓' : 'Not Achieved'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {milestone.targetDate > 0n 
                          ? new Date(Number(milestone.targetDate) * 1000).toLocaleDateString()
                          : 'No date set'}
                      </div>
                    </div>
                    
                    {!isResolved && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(index)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {parsedMilestones.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                No milestones yet
              </p>
              <p className="text-xs text-muted-foreground">
                Add your first milestone to get started
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-4 p-3 bg-warning/10 border border-warning/50 rounded-lg">
          <p className="text-xs text-warning">
            ⚠️ <strong>Note:</strong> Milestone changes require smart contract integration. 
            Currently showing mock confirmations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};