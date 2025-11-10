import { Navbar } from './components/layout/Navbar'
import { Home } from './pages/Home'
import './index.css'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Home />
    </div>
  )
}

export default App