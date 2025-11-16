import { Header } from "@/components/Header";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2, RefreshCw, Plus } from "lucide-react";
import { useAllProjects } from "@/hooks/useProjects";
import { formatEther } from "viem";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const Projects = () => {
  const queryClient = useQueryClient();
  const { data: projects, isLoading, isError, refetch } = useAllProjects();

  // console.log("projects ", projects);

  const handleRefresh = () => {
    queryClient.invalidateQueries(); // Clear all cached queries
    refetch(); // Refetch projects
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Explore Projects
              </h1>
              <p className="text-xl text-muted-foreground">
                Browse projects, make predictions, and fund the future
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Link to="/create">
                <Button variant="hero" size="lg">
                  <Plus className="w-5 h-5" />
                  Create Project
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-10 bg-muted/50 border-border/50"
              />
            </div>
            <Button variant="outline" size="lg">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">
                Error loading projects. Please check your wallet connection.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Make sure you're connected to BSC Testnet.
              </p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && (!projects || projects.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No projects yet. Be the first to create one!
              </p>
              <Link to="/create">
                <Button variant="hero">Create Project</Button>
              </Link>
            </div>
          )}

          {/* Projects Grid */}
          {!isLoading && !isError && projects && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => {
                const data = project as any;
                console.log("data", data);

                // Skip if project name is empty
                // if (!data[0]) return null;
                // console.log("data", data[0]);

                return (
                  <ProjectCard
                    key={index}
                    id={String(data.id)}
                    name={data?.name}
                    description={data?.description || "No description"}
                    category={data?.category || "General"}
                    fundingGoal={data?.fundingGoal || 0n}
                    fundingRaised={data?.totalFundsRaised || 0n}
                    totalPredictions={data?.totalPredictions.toString()}
                    confidence={50}
                  />
                );

                return null;
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Projects;
