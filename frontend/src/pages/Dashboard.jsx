import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Trophy, Gift, CreditCard, Activity, ArrowRight, CheckCircle2, Heart, AlertCircle, IndianRupee } from 'lucide-react'

export default function Dashboard() {
  const { profile } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [userContribution, setUserContribution] = useState({
    percentage: 10,
    selectedCharity: null,
    monthlyContributionINR: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    const fetchSubscription = async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      try {
        setError(null)
        const { data } = await api.get('/subscriptions/status', { signal: controller.signal })
        clearTimeout(timeoutId)
        setSubscription(data.data)

        // Calculate charity contribution in INR
        if (data.data && data.data.amountInr) {
          const monthlyINR = data.data.planType === 'yearly' 
            ? parseFloat(data.data.amountInr) / 12
            : parseFloat(data.data.amountInr);
          const charityAmount = monthlyINR * (profile?.charityContributionPct || 10) / 100;
          
          setUserContribution({
            percentage: profile?.charityContributionPct || 10,
            monthlyContributionINR: charityAmount.toFixed(2),
            selectedCharity: profile?.preferredCharity || 'Not selected'
          });
        }
      } catch (err) {
        clearTimeout(timeoutId)
        console.error('Error fetching subscription', err)
        setError(err.response?.data?.message || err.message || 'Failed to load subscription status')
        setSubscription(null)
      } finally {
        setLoading(false)
      }
    }
    fetchSubscription()
  }, [profile])

  const handleSubscribe = async (planType) => {
    setSubscribing(true)
    try {
      const { data } = await api.post('/subscriptions/checkout', {
        planType,
        successUrl: window.location.origin + '/dashboard?checkout=success',
        cancelUrl: window.location.origin + '/dashboard?checkout=canceled',
      })
      window.location.href = data.data.checkoutUrl
    } catch (err) {
      console.error('Checkout error:', err)
      alert(err.response?.data?.message || 'Error creating checkout session')
    } finally {
      setSubscribing(false)
    }
  }

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    if (query.get('checkout') === 'success') {
      api.post('/subscriptions/confirm', { planType: 'monthly' })
        .then(() => setSubscription({ status: 'active', planType: 'monthly' }))
        .catch(console.error)
    }
  }, [])

  if (loading) return (
    <div className="container flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div className="loading-spinner"></div>
      <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
    </div>
  )

  if (error) {
    return (
      <div className="container animate-fade-in">
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', marginBottom: '3rem', borderLeft: '4px solid var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
          <div className="flex-center" style={{ width: '64px', height: '64px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '50%', margin: '0 auto 1.5rem auto', color: '#ef4444' }}>
            <AlertCircle size={32} />
          </div>
          <h3>Unable to Load Dashboard</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const isSubscribed = subscription?.status === 'active'

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Welcome back, {profile?.fullName || 'Golfer'}!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your membership, scores, and charitable impact.</p>
      </div>

      {!isSubscribed ? (
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', marginBottom: '3rem', borderLeft: '4px solid var(--warning)' }}>
          <div className="flex-center" style={{ width: '64px', height: '64px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', margin: '0 auto 1.5rem auto', color: 'var(--warning)' }}>
            <CreditCard size={32} />
          </div>
          <h3>Activate Your Membership</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
            Subscribe to participate in monthly draws, log scores, and automatically support your chosen charity with every payment.
          </p>
          <div className="flex-center" style={{ gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => handleSubscribe('monthly')} disabled={subscribing} className="btn btn-primary">
                Monthly: ₹299
              </button>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>~₹30/month to charity</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => handleSubscribe('yearly')} disabled={subscribing} className="btn btn-secondary">
                Yearly: ₹3,299
              </button>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>~₹275/month to charity</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid var(--accent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0 }}>Pro Membership Active</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>{subscription.planType} plan</p>
              </div>
            </div>
            <span className="badge badge-active">Active</span>
          </div>

          {/* Charity Contribution Card */}
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem', background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', borderLeft: '4px solid #f43f5e' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
              <Heart size={32} color="#f43f5e" fill="#f43f5e" />
              <h3 style={{ margin: 0 }}>Your Charitable Impact</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Contribution %</p>
                <h4 style={{ margin: 0, fontSize: '1.875rem', color: '#f43f5e' }}>{userContribution.percentage}%</h4>
                <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>of every payment</p>
              </div>
              
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Monthly Contribution</p>
                <h4 style={{ margin: 0, fontSize: '1.875rem', color: 'var(--accent)' }}>₹{userContribution.monthlyContributionINR}</h4>
                <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>to your charity</p>
              </div>
            </div>

            <Link to="/charities" className="btn btn-secondary" style={{ marginTop: '1.5rem', display: 'block', textAlign: 'center' }}>
              Change Charity <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
            </Link>
          </div>
        </>
      )}

      <div className="grid-cards">
        <Link to="/dashboard/scores" className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <Activity size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3>My Scores</h3>
          <p style={{ color: 'var(--text-muted)', flex: 1 }}>Track your performance and improve your odds in monthly draws.</p>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: '500', marginTop: '1rem' }}>
            Manage Scores <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
          </div>
        </Link>
        
        <Link to="/dashboard/draws" className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <Gift size={32} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
          <h3>Draws & Winnings</h3>
          <p style={{ color: 'var(--text-muted)', flex: 1 }}>View past draws, verify your winnings, and check results.</p>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--secondary)', fontWeight: '500', marginTop: '1rem' }}>
            View Results <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
          </div>
        </Link>

        <Link to="/charities" className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <Heart size={32} color="#f43f5e" style={{ marginBottom: '1rem' }} />
          <h3>My Charity</h3>
          <p style={{ color: 'var(--text-muted)', flex: 1 }}>Choose which charity receives your contribution every month.</p>
          <div style={{ display: 'flex', alignItems: 'center', color: '#f43f5e', fontWeight: '500', marginTop: '1rem' }}>
            Select Charity <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
          </div>
        </Link>
      </div>
    </div>
  )
}
