import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User as UserIcon, Trophy, Heart, Settings } from 'lucide-react'

export default function Layout() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <>
      <header style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '1rem 0'
      }}>
        <div className="container flex-center" style={{ justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
            <Trophy color="var(--primary)" size={24} />
            <span className="text-gradient">Golf</span> Platform
          </Link>
          
          <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/charities" style={{ fontWeight: '500' }}>Charities</Link>
            
            {user ? (
              <>
                <Link to="/dashboard" style={{ fontWeight: '500' }}>Dashboard</Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {profile?.fullName || user.email}
                  </span>
                  <button onClick={handleLogout} className="btn-icon" title="Logout">
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
                <Link to="/login" style={{ fontWeight: '500' }}>Log In</Link>
                <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Sign Up</Link>
              </div>
            )}
          </nav>
          
          {profile?.role === 'admin' && (
            <Link to="/admin" style={{
              background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.3s ease',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(139, 92, 246, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(139, 92, 246, 0.3)'
            }}>
              <Settings size={20} /> Admin Panel
            </Link>
          )}
        </div>
      </header>
      
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <Outlet />
      </main>
      
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border)',
        padding: '2rem 0',
        background: 'rgba(15, 23, 42, 0.8)'
      }}>
        <div className="container flex-center" style={{ justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <p>&copy; {new Date().getFullYear()} Golf Platform. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
