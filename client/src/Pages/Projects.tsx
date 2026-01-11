import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, TrendingUp, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAllProjects } from "@/hooks/useProjects";
import { useState, useMemo } from "react";
import ChatAgent from "@/agent/ChatAgent";
import { ProjectCard } from "@/components/ProjectCard";

const Projects = () => {
  const { data: projects, isLoading, error } = useAllProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const projectsArray = useMemo(() => (projects as any[]) || [], [projects]);

  const filteredProjects = useMemo(() => {
    return projectsArray.filter((project) => {
      const name = project.name || project[2] || "";
      const description = project.description || project[3] || "";
      const category = project.category || project[4] || "";

      const matchesSearch = 
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = 
        selectedCategory === "all" || 
        category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [projectsArray, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    return ["all", ...new Set(projectsArray.map(p => 
      (p.category || p[4] || "Other").toLowerCase()
    ))];
  }, [projectsArray]);

  const trendingProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      const aPredictions = Number(a.totalPredictions || a[11] || 0n);
      const bPredictions = Number(b.totalPredictions || b[11] || 0n);
      return bPredictions - aPredictions;
    });
  }, [filteredProjects]);

  const newestProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      const aDate = Number(a.submissionDate || a[7] || 0n);
      const bDate = Number(b.submissionDate || b[7] || 0n);
      return bDate - aDate;
    });
  }, [filteredProjects]);

  const fundingProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      const aGoal = a.fundingGoal || a[6] || 0n;
      const aRaised = a.totalFundsRaised || a[10] || 0n;
      const bGoal = b.fundingGoal || b[6] || 0n;
      const bRaised = b.totalFundsRaised || b[10] || 0n;
      
      const aPercent = aGoal > 0n ? Number((aRaised * 100n) / aGoal) : 0;
      const bPercent = bGoal > 0n ? Number((bRaised * 100n) / bGoal) : 0;
      
      return bPercent - aPercent;
    });
  }, [filteredProjects]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading projects...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4">Unable to Load Projects</h2>
            <p className="text-muted-foreground mb-4">
              We're experiencing connectivity issues with the Mantle network.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              This usually happens due to RPC rate limiting. Please try again in a moment.
            </p>
            <Button variant="hero" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const ProjectGrid = ({ projects }: { projects: any[] }) => {
    if (projects.length === 0) {
      return (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? "Try adjusting your search" : "Be the first to create a project!"}
          </p>
          {!searchQuery && (
            <Link to="/create-project">
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => {
          const id = Number(project.id || project[0] || index);
          const name = project.name || project[2] || "Unnamed Project";
          const description = project.description || project[3] || "No description";
          const category = project.category || project[4] || "Other";
          const fundingGoal = project.fundingGoal || project[6] || 0n;
          const createdAt = project.submissionDate || project[7] || 0n;
          const status = project.status ?? project[8] ?? 0;
          const milestoneIds = project.milestoneIds || project[9] || [];
          const fundingRaised = project.totalFundsRaised || project[10] || 0n;
          const totalPredictions = project.totalPredictions || project[11] || 0n;

          return (
            <ProjectCard
              key={id}
              id={id}
              name={name}
              description={description}
              category={category}
              fundingGoal={fundingGoal}
              fundingRaised={fundingRaised}
              totalPredictions={totalPredictions}
              milestonesCount={milestoneIds.length}
              createdAt={createdAt}
              status={status}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Discover Projects
                </h1>
                <p className="text-xl text-muted-foreground">
                  Predict milestones. Fund the future. Earn rewards.
                </p>
              </div>
              <Link to="/create-project">
                <Button variant="hero" size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Project
                </Button>
              </Link>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="whitespace-nowrap capitalize"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">{projectsArray.length}</span> Total Projects
              </div>
              <div>
                <span className="font-semibold text-foreground">{filteredProjects.length}</span> Showing
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="font-semibold text-foreground">
                  {trendingProjects.slice(0, 3).length}
                </span> Trending
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="space-y-8">
            <TabsList>
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="trending">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="newest">Newest</TabsTrigger>
              <TabsTrigger value="funding">Most Funded</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ProjectGrid projects={filteredProjects} />
            </TabsContent>

            <TabsContent value="trending">
              <ProjectGrid projects={trendingProjects} />
            </TabsContent>

            <TabsContent value="newest">
              <ProjectGrid projects={newestProjects} />
            </TabsContent>

            <TabsContent value="funding">
              <ProjectGrid projects={fundingProjects} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <ChatAgent />
    </div>
  );
};

export default Projects;