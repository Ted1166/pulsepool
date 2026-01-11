import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  Target,
  Eye,
  Heart,
  Calendar,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatEther } from "viem";
import { memo, useState, useEffect } from "react";

interface ProjectCardProps {
  id: number;
  name: string;
  description: string;
  category: string;
  fundingGoal: bigint;
  fundingRaised: bigint;
  totalPredictions: bigint;
  milestonesCount: number;
  createdAt: bigint;
  status?: number;
}

export const ProjectCard = memo(({
  id,
  name,
  description,
  category,
  fundingGoal,
  fundingRaised,
  totalPredictions,
  milestonesCount,
  createdAt,
}: ProjectCardProps) => {
  const [views, setViews] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    try {
      const viewsKey = `project_views_${id}`;
      const storedViews = localStorage.getItem(viewsKey);
      setViews(storedViews ? parseInt(storedViews) : 0);

      const followingKey = `following_${id}`;
      const isFollowingStored = localStorage.getItem(followingKey) === 'true';
      setIsFollowing(isFollowingStored);

      const followersKey = `followers_${id}`;
      const storedFollowers = localStorage.getItem(followersKey);
      setFollowerCount(storedFollowers ? parseInt(storedFollowers) : 0);
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  }, [id]);

  const fundingPercentage = fundingGoal > 0n 
    ? Math.min(100, Number((fundingRaised * 100n) / fundingGoal))
    : 0;

  const predictionCount = Number(totalPredictions);
  const confidenceLevel = predictionCount === 0 ? 50 : Math.min(95, 50 + predictionCount * 2);
  
  const confidenceLabel = 
    confidenceLevel >= 70 ? { text: "High Confidence", color: "text-success", icon: "🔥" } :
    confidenceLevel >= 50 ? { text: "Moderate", color: "text-warning", icon: "⚡" } :
    { text: "Low Confidence", color: "text-destructive", icon: "⚠️" };

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);
    setFollowerCount(prev => newFollowingState ? prev + 1 : Math.max(0, prev - 1));

    try {
      localStorage.setItem(`following_${id}`, String(newFollowingState));
      localStorage.setItem(`followers_${id}`, String(followerCount + (newFollowingState ? 1 : -1)));
      
    } catch (error) {
      console.error("Follow/Unfollow error:", error);
      setIsFollowing(!newFollowingState);
      setFollowerCount(prev => newFollowingState ? prev - 1 : prev + 1);
    }
  };

  const timeAgo = (timestamp: bigint) => {
    const seconds = Math.floor(Date.now() / 1000 - Number(timestamp));
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Link to={`/project/${id}`}>
      <Card className="bg-gradient-card hover:border-primary/50 transition-all h-full group">
        <CardHeader className="space-y-4">
          {/* Top Bar - Category & Follow */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${isFollowing ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={handleFollow}
            >
              <Heart 
                className={`w-4 h-4 ${isFollowing ? 'fill-primary' : ''}`} 
              />
              <span className="ml-1 text-xs">{followerCount}</span>
            </Button>
          </div>

          {/* Project Title */}
          <div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>

          {/* Confidence Indicator */}
          <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
            <TrendingUp className={`w-4 h-4 ${confidenceLevel >= 50 ? 'text-success' : 'text-destructive'}`} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Community Confidence</span>
                <span className={`text-sm font-bold ${confidenceLabel.color}`}>
                  {confidenceLevel}%
                </span>
              </div>
              <Progress value={confidenceLevel} className="h-1.5" />
            </div>
            <span className="text-lg">{confidenceLabel.icon}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Funding Progress */}
          <div>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-muted-foreground">Funding Progress</span>
              <span className="font-semibold">
                {formatEther(fundingRaised)} / {formatEther(fundingGoal)} MNT
              </span>
            </div>
            <Progress value={fundingPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {fundingPercentage.toFixed(1)}% funded
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Eye className="w-3 h-3" />
                <span className="text-xs">Views</span>
              </div>
              <div className="text-sm font-bold">{views}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Target className="w-3 h-3" />
                <span className="text-xs">Predictions</span>
              </div>
              <div className="text-sm font-bold">{predictionCount}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Users className="w-3 h-3" />
                <span className="text-xs">Milestones</span>
              </div>
              <div className="text-sm font-bold">{milestonesCount}</div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{timeAgo(createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span className="font-medium">{formatEther(fundingGoal)} MNT Goal</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.fundingRaised === nextProps.fundingRaised &&
    prevProps.totalPredictions === nextProps.totalPredictions &&
    prevProps.status === nextProps.status
  );
});