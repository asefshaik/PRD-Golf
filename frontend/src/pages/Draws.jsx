import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { Gift, Calendar, DollarSign, UploadCloud } from 'lucide-react'

export default function Draws() {
  const [draws, setDraws] = useState([])
  const [winnings, setWinnings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [drawsRes, winningsRes] = await Promise.all([
          api.get('/draws'),
          api.get('/winners/me')
        ])
        setDraws(drawsRes.data.data || [])
        setWinnings(winningsRes.data.data || [])
      } catch (err) {
        console.error('Failed to load draw data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleProofUpload = async (winnerId) => {
    const url = prompt("Enter the URL of your proof image:")
    if (!url) return
    
    try {
      await api.post(`/winners/${winnerId}/proof`, { proofImageUrl: url })
      alert("Proof uploaded successfully! Waiting for admin verification.")
      // Refresh
      const { data } = await api.get('/winners/me')
      setWinnings(data.data || [])
    } catch (err) {
      alert("Failed to upload proof.")
    }
  }

  if (loading) return <div className="container flex-center" style={{ minHeight: '60vh' }}>Loading...</div>

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Gift size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0 }}>Draw Results & Winnings</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Check past draw results and claim your prizes.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Winnings Section */}
        <div>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Your Winnings</h3>
          
          {winnings.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>You haven't won any draws yet. Keep playing!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {winnings.map(win => (
                <div key={win.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: win.status === 'paid' ? '4px solid var(--accent)' : '4px solid var(--secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {win.matchType.toUpperCase()}
                        <span className={`badge badge-${win.status === 'pending' ? 'pending' : 'active'}`}>{win.status}</span>
                      </h4>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Prize Amount</div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--secondary)' }}>
                      ${win.prizeAmount.toFixed(2)}
                    </div>
                  </div>
                  
                  {win.status === 'pending' && !win.proofImageUrl && (
                    <button onClick={() => handleProofUpload(win.id)} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}>
                      <UploadCloud size={16} /> Upload Proof
                    </button>
                  )}
                  {win.proofImageUrl && win.status === 'pending' && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--warning)', textAlign: 'center', background: 'rgba(245,158,11,0.1)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                      Proof uploaded. Pending admin verification.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global Draws History */}
        <div>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Past Draws</h3>
          
          {draws.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No draws have been executed yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {draws.map(draw => (
                <div key={draw.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={18} color="var(--text-muted)" />
                      <span style={{ fontWeight: '500' }}>{new Date(draw.drawDate).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: '600' }}>
                      <DollarSign size={16} /> Pool: ${draw.prizePool.toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Winning Numbers</div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {draw.drawNumbers.split(',').map((num, i) => (
                        <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem', border: '1px solid var(--border)' }}>
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
