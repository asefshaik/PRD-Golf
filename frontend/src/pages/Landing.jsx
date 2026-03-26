import { Link, useNavigate } from 'react-router-dom'
import { Trophy, Target, Gift, Heart, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'

export default function Landing() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // If user is already logged in and auth is done loading, redirect to dashboard
    if (!loading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  const getStartButtonLink = () => {
    return user ? '/dashboard' : '/signup'
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{ padding: '6rem 0', textAlign: 'center', position: 'relative' }}>
        <div className="container">
          <h1 style={{ marginBottom: '1.5rem' }}>
            Elevate Your <span className="text-gradient-primary">Golf Game.</span>
            <br />
            Win Monthly <span style={{ color: 'var(--accent)' }}>Prizes.</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            Join the premier subscription-based golf platform. Track your scores, 
            support charities, and participate in our exclusive monthly draws.
          </p>
          <div className="flex-center" style={{ gap: '1rem' }}>
            <Link to={getStartButtonLink()} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              {user ? 'Go to Dashboard' : 'Start Your Journey'} <ArrowRight size={20} />
            </Link>
            <Link to="/charities" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              View Charities
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 0', background: 'rgba(0,0,0,0.2)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>How It Works</h2>
          
          <div className="grid-cards">
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="flex-center" style={{ width: '60px', height: '60px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', margin: '0 auto 1.5rem auto', color: 'var(--primary)' }}>
                <Target size={30} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Track Scores</h3>
              <p style={{ color: 'var(--text-muted)' }}>Log up to 5 of your latest golf scores (1-45). Your performance dictates your odds in weighted draws.</p>
            </div>
            
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="flex-center" style={{ width: '60px', height: '60px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', margin: '0 auto 1.5rem auto', color: 'var(--accent)' }}>
                <Gift size={30} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Monthly Draws</h3>
              <p style={{ color: 'var(--text-muted)' }}>Match 3, 4, or 5 numbers to win from the collective prize pool. Verified payouts to real winners.</p>
            </div>
            
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="flex-center" style={{ width: '60px', height: '60px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '50%', margin: '0 auto 1.5rem auto', color: '#f43f5e' }}>
                <Heart size={30} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Give Back</h3>
              <p style={{ color: 'var(--text-muted)' }}>Select a charity to support. A portion of your subscription automatically goes to a good cause.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Teaser) */}
      <section style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem' }}>Simple Pricing</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Everything you need to compete and give back.</p>
          
          <div className="glass-panel" style={{ maxWidth: '400px', margin: '0 auto', padding: '3rem 2rem', borderTop: '4px solid var(--primary)' }}>
            <Trophy size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Pro Membership</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem' }}>
              Rs299<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '400' }}>/month</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '2rem' }}>
              <li style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>✓ <span>Unlimited score tracking</span></li>
              <li style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>✓ <span>Entry to all monthly draws</span></li>
              <li style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>✓ <span>Min 10% charity contribution</span></li>
            </ul>
            <Link to="/signup" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Subscribe Now</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
