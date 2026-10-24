import { useEffect, useState } from 'react'
import LandingPage from './components/LandingPage'
import Studio from './components/Studio'

function currentPath() {
  return window.location.pathname.startsWith('/app') ? '/app' : '/'
}

export default function App() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onPopState = () => setPath(currentPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    document.title = path === '/app'
      ? 'Puter AI Studio'
      : 'AI Gateway: One API for 500+ AI Models'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [path])

  const navigate = (next: string) => {
    window.history.pushState({}, '', next)
    setPath(next)
  }

  return path === '/app'
    ? <Studio onNavigateHome={() => navigate('/')} />
    : <LandingPage onOpenStudio={() => navigate('/app')} />
}
