import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Progress } from '../components/ui/Progress'
import { 
  Rocket, 
  TrendingUp, 
  Award, 
  Users, 
  DollarSign, 
  Target,
  Zap,
  Shield,
  BarChart3,
  ArrowRight
} from 'lucide-react'

export function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in space-y-8">
            {/* Badge */}
            <div className="flex justify-center">
              <Badge variant="cyber" className="text-base px-4 py-2">
                🚀 Powered by BNB Chain
              </Badge>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-8xl font-bold leading-tight">
              <span className="gradient-text">Predict.</span>
              <br />
              <span className="gradient-text">Fund.</span>
              <br />
              <span className="text-white">Earn.</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Where prediction markets meet crowdfunding. 
              <br className="hidden md:block" />
              Bet on project milestones, and winners fund the future.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button variant="cyber" size="xl" className="group">
                Explore Projects
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="glass" size="xl">
                Submit Your Project
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto">
              {[
                { label: 'Total Projects', value: '1,234', icon: Rocket },
                { label: 'Active Markets', value: '456', icon: TrendingUp },
                { label: 'Total Funded', value: '890 BNB', icon: DollarSign },
                { label: 'Predictors', value: '12.5K', icon: Users },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-6 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <stat.icon className="w-8 h-8 text-primary mb-2 mx-auto" />
                  <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to revolutionize project funding
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Submit Project',
                description: 'Entrepreneurs submit projects with clear milestones and funding goals.',
                icon: Rocket,
                color: 'from-cyan-500 to-blue-500'
              },
              {
                step: '02',
                title: 'Predict Outcomes',
                description: 'Community bets on milestone achievement. Odds determine potential returns.',
                icon: Target,
                color: 'from-purple-500 to-pink-500'
              },
              {
                step: '03',
                title: 'Winners Fund',
                description: 'Accurate predictors claim rewards AND get token allocation rights.',
                icon: Award,
                color: 'from-green-500 to-emerald-500'
              },
            ].map((item, i) => (
              <Card key={i} className="relative overflow-hidden group hover:scale-105 transition-transform">
                <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${item.color}`} />
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl font-bold text-white`}>
                      {item.step}
                    </div>
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="text-base">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section id="projects" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Featured <span className="gradient-text">Projects</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Top-rated projects with active prediction markets
              </p>
            </div>
            <Button variant="outline">View All Projects</Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'DeFi Lending Protocol',
                category: 'DeFi',
                description: 'Revolutionary peer-to-peer lending platform with AI risk assessment',
                raised: 75,
                goal: '100 BNB',
                predictors: 234,
                odds: { yes: 68, no: 32 }
              },
              {
                name: 'NFT Marketplace 3.0',
                category: 'NFT',
                description: 'Next-gen NFT platform with zero gas fees and AI-powered discovery',
                raised: 45,
                goal: '80 BNB',
                predictors: 156,
                odds: { yes: 55, no: 45 }
              },
              {
                name: 'GameFi RPG Universe',
                category: 'Gaming',
                description: 'Immersive blockchain RPG with play-to-earn mechanics',
                raised: 90,
                goal: '150 BNB',
                predictors: 412,
                odds: { yes: 72, no: 28 }
              },
            ].map((project, i) => (
              <Card key={i} className="group hover:scale-105 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="cyber">{project.category}</Badge>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Funding Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Funding Progress</span>
                      <span className="font-bold text-primary">{project.raised}%</span>
                    </div>
                    <Progress value={project.raised} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{(project.raised * parseFloat(project.goal) / 100).toFixed(1)} BNB raised</span>
                      <span>{project.goal} goal</span>
                    </div>
                  </div>

                  {/* Market Odds */}
                  <div className="glass-card p-4 space-y-2">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      Market Odds
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-accent/20 rounded p-2 text-center">
                        <div className="text-xs text-muted-foreground">YES</div>
                        <div className="text-lg font-bold text-accent">{project.odds.yes}%</div>
                      </div>
                      <div className="bg-destructive/20 rounded p-2 text-center">
                        <div className="text-xs text-muted-foreground">NO</div>
                        <div className="text-lg font-bold text-destructive">{project.odds.no}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {project.predictors} predictors
                    </span>
                  </div>

                  {/* Action Button */}
                  <Button variant="cyber" className="w-full group">
                    Place Bet
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why <span className="gradient-text">PREDICT & FUND</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Built for the future of decentralized funding
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Instant Settlement',
                description: 'Smart contracts ensure instant, transparent payouts to winners'
              },
              {
                icon: Shield,
                title: 'Trustless & Secure',
                description: 'No intermediaries. All transactions on-chain and verifiable'
              },
              {
                icon: Award,
                title: 'Token Allocation Rights',
                description: 'Top predictors earn rights to allocate project tokens'
              },
              {
                icon: BarChart3,
                title: 'Real-Time Odds',
                description: 'Dynamic odds based on market sentiment and betting patterns'
              },
              {
                icon: Users,
                title: 'Community Driven',
                description: 'Wisdom of crowds determines project quality and outcomes'
              },
              {
                icon: DollarSign,
                title: 'Dual Rewards',
                description: 'Earn from winning bets AND token allocations'
              },
            ].map((feature, i) => (
              <Card key={i} className="text-center group hover:scale-105 transition-all">
                <CardHeader>
                  <div className="w-16 h-16 rounded-lg bg-gradient-cyber mx-auto mb-4 flex items-center justify-center group-hover:animate-glow">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-cyber opacity-10" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start <span className="gradient-text">Predicting?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of predictors and project builders shaping the future
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="cyber" size="xl">
              Connect Wallet & Start
            </Button>
            <Button variant="glass" size="xl">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
