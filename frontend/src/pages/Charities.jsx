import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Heart, Check } from 'lucide-react'

export default function Charities() {
  const { user } = useAuth()
  const [charities, setCharities] = useState([])
  const [userCharity, setUserCharity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState(false)

  const fetchData = async () => {
    try {
      const [charitiesRes, userCharityRes] = await Promise.all([
        api.get('/charities'),
        user ? api.get('/user-charities').catch(() => ({ data: { data: null } })) : Promise.resolve({ data: { data: null } })
      ])
      
      setCharities(charitiesRes.data.data || [])
      setUserCharity(userCharityRes.data.data)
    } catch (err) {
      console.error('Failed to load charities', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const handleSelect = async (charityId) => {
    if (!user) {
      alert('Please log in to select a charity.')
      return
    }
    
    setSelecting(true)
    try {
      await api.post('/user-charities', { charityId, contributionPct: 10 })
      await fetchData() // Refresh to update UI
    } catch (err) {
      alert('Failed to select charity')
    } finally {
      setSelecting(false)
    }
  }

  if (loading) return <div className="container flex-center" style={{ minHeight: '60vh' }}>Loading...</div>

  return (
    <div className="container animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div className="flex-center" style={{ width: '64px', height: '64px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '50%', margin: '0 auto 1.5rem auto', color: '#f43f5e' }}>
          <Heart size={32} />
        </div>
        <h2>Support a Cause</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          A minimum of 10% of your subscription goes directly to the charity of your choice. 
          Make an impact while you play.
        </p>
      </div>

      <div className="grid-cards">
        {charities.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No active charities currently available.</p>
          </div>
        ) : (
          charities.map(charity => {
            const isSelected = userCharity?.charityId === charity.id
            
            return (
              <div key={charity.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative', border: isSelected ? '2px solid #f43f5e' : '' }}>
                {isSelected && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#f43f5e', color: 'white', borderRadius: '50%', padding: '0.25rem' }}>
                    <Check size={16} />
                  </div>
                )}
                
                <div style={{ width: '100%', height: '150px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {charity.logoUrl ? (
                    <img src={charity.logoUrl} alt={charity.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Heart size={48} color="var(--text-muted)" style={{ opacity: 0.3 }} />
                  )}
                </div>
                
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{charity.name}</h3>
                <p style={{ color: 'var(--text-muted)', flex: 1, fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  {charity.description || 'No description provided.'}
                </p>
                
                <button 
                  onClick={() => handleSelect(charity.id)} 
                  disabled={isSelected || selecting}
                  className={isSelected ? 'btn btn-secondary' : 'btn btn-primary'} 
                  style={{ width: '100%', background: isSelected ? 'rgba(244, 63, 94, 0.1)' : '', color: isSelected ? '#f43f5e' : '', borderColor: isSelected ? '#f43f5e' : '' }}
                >
                  {isSelected ? 'Currently Supporting' : 'Support this Charity'}
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
