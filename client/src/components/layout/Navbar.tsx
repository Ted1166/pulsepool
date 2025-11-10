import { Button } from '../ui/Button'
import { Wallet, Menu } from 'lucide-react'

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-primary/10 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-cyber flex items-center justify-center font-bold text-white">
              P&F
            </div>
            <span className="text-xl font-bold gradient-text">
              PREDICT & FUND
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-foreground/80 hover:text-primary transition-colors">
              Home
            </a>
            <a href="#projects" className="text-foreground/80 hover:text-primary transition-colors">
              Projects
            </a>
            <a href="#markets" className="text-foreground/80 hover:text-primary transition-colors">
              Markets
            </a>
            <a href="#how-it-works" className="text-foreground/80 hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#dashboard" className="text-foreground/80 hover:text-primary transition-colors">
              Dashboard
            </a>
          </div>

          {/* Wallet Connect Button */}
          <div className="flex items-center space-x-4">
            <Button variant="cyber" size="default">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
            
            {/* Mobile menu button */}
            <button className="md:hidden">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
