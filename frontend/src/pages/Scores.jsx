import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Activity, Plus, Trash2 } from 'lucide-react'

export default function Scores() {
  const [scores, setScores] = useState([])
  const [newScore, setNewScore] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const fetchScores = async () => {
    try {
      const { data } = await api.get('/scores')
      setScores(data.data || [])
    } catch (err) {
      setError('Failed to load scores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScores()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    
    const val = parseInt(newScore)
    if (isNaN(val) || val < 1 || val > 45) {
      setError('Score must be between 1 and 45')
      setSubmitting(false)
      return
    }

    try {
      await api.post('/scores', { scoreValue: val })
      setNewScore('')
      fetchScores()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add score')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0 }}>Score Management</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Log your game scores. Only the last 5 are kept.</p>
        </div>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 2fr)' }}>
        {/* Submission Form */}
        <div className="glass-panel" style={{ padding: '2rem', alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Log New Score</h3>
          
          {error && <div className="alert alert-error" style={{ padding: '0.75rem' }}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="score">Score Value (1-45)</label>
              <input 
                id="score"
                type="number" 
                min="1" max="45"
                className="input-field" 
                value={newScore}
                onChange={e => setNewScore(e.target.value)}
                placeholder="e.g. 18"
                required 
              />
            </div>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%' }}>
              <Plus size={18} /> {submitting ? 'Saving...' : 'Add Score'}
            </button>
          </form>
          
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1.5rem', textAlign: 'center' }}>
            Your entered scores will increase your odds of those specific numbers appearing in weighted draws.
          </p>
        </div>

        {/* Score History */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Recent Scores (Max 5)</h3>
          
          {loading ? (
            <p>Loading scores...</p>
          ) : scores.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
              <Activity size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-muted)' }}>You haven't logged any scores yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {scores.map((score, idx) => (
                <div key={score.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}>
                      {score.scoreValue}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500' }}>Game Score</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {new Date(score.createdAt).toLocaleDateString()} at {new Date(score.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  {idx === 0 && <span className="badge badge-active">Latest</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
