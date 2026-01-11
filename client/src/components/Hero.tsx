import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useProjectStats } from "@/hooks/useProjects";
import { formatEther } from "viem";
import heroImage from "@/assets/hero-bg.jpg";

// Inline SVG Logo Component
const Logo = ({ className = "w-24 h-24" }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heroLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#00d9ff', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#0066ff', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="heroGlow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect x="20" y="20" width="160" height="160" rx="35" ry="35" fill="url(#heroLogoGradient)"/>
    <rect x="25" y="25" width="150" height="150" rx="32" ry="32" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
    <text x="100" y="130" fontFamily="Arial, sans-serif" fontSize="90" fontWeight="bold" fill="white" textAnchor="middle" filter="url(#heroGlow)">PP</text>
    <ellipse cx="80" cy="60" rx="40" ry="20" fill="white" opacity="0.15"/>
  </svg>
);

export const Hero = () => {
  const { data: stats, isLoading } = useProjectStats();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with Grid Pattern */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Predict & Fund Hero"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,217,255,0.1),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo Badge */}
          <div className="flex justify-center mb-6 animate-pulse">
            <Logo className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by Mantle</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Predict the Future,
            <br />
            Fund the Winners
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            The wisdom of the crowd doesn't just forecast success—it creates it. 
            Make predictions, earn rewards, and help fund the next breakthrough projects.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/projects">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6">
                Explore Projects
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="/#how-it-works">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Learn More
              </Button>
            </a>
          </div>

          {/* Real-Time Stats from Blockchain */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-2">
                {isLoading ? (
                  <div className="h-9 w-24 mx-auto bg-muted animate-pulse rounded" />
                ) : stats ? (
                  `${formatEther(stats.totalStaked)} MNT`
                ) : (
                  '0 MNT'
                )}
              </div>
              <div className="text-muted-foreground">Total Predicted</div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <Shield className="w-8 h-8 text-accent mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-2">
                {isLoading ? (
                  <div className="h-9 w-16 mx-auto bg-muted animate-pulse rounded" />
                ) : stats ? (
                  stats.projectCount.toString()
                ) : (
                  '0'
                )}
              </div>
              <div className="text-muted-foreground">Active Projects</div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <Zap className="w-8 h-8 text-success mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-2">
                {isLoading ? (
                  <div className="h-9 w-20 mx-auto bg-muted animate-pulse rounded" />
                ) : stats ? (
                  stats.totalPredictors.toString()
                ) : (
                  '0'
                )}
              </div>
              <div className="text-muted-foreground">Predictors</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};