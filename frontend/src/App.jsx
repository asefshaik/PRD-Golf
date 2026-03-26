import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/register'
import Charities from './pages/Charities'
import Dashboard from './pages/Dashboard'
import Scores from './pages/Scores'
import Draws from './pages/Draws'
import AdminPanel from './pages/AdminPanel'
import Debug from './pages/Debug'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'

// Auth guard component
const RequireAuth = ({ children, adminOnly = false }) => {
  const { user, profile, loading } = useAuth()
  
  if (loading) return (
    <div className="container flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div className="loading-spinner"></div>
      <p style={{ color: 'var(--text-muted)' }}>Verifying your session...</p>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/dashboard" replace />
  
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/charities" element={<Charities />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/debug" element={<Debug />} />
        
        {/* Protected User Routes */}
        <Route 
          path="/dashboard" 
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          } 
        />
        <Route 
          path="/dashboard/scores" 
          element={
            <RequireAuth>
              <Scores />
            </RequireAuth>
          } 
        />
        <Route 
          path="/dashboard/draws" 
          element={
            <RequireAuth>
              <Draws />
            </RequireAuth>
          } 
        />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            <RequireAuth adminOnly={true}>
              <AdminPanel />
            </RequireAuth>
          } 
        />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
