import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Users, Activity, Gift, Heart, CheckSquare, Search, Plus, Trash2, DollarSign, TrendingUp, Edit2, X } from 'lucide-react'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview')
  const [analytics, setAnalytics] = useState(null)
  const [showCharityModal, setShowCharityModal] = useState(false)
  const [charityForm, setCharityForm] = useState({ name: '', description: '', isActive: true })
  const [editingCharity, setEditingCharity] = useState(null)
  const [drawSimulation, setDrawSimulation] = useState(null)
  const [showSimulation, setShowSimulation] = useState(false)
  
  // Data states
  const [users, setUsers] = useState([])
  const [charities, setCharities] = useState([])
  const [pendingWinners, setPendingWinners] = useState([])
  const [allWinners, setAllWinners] = useState([])
  const [testDataLoading, setTestDataLoading] = useState(false)
  const [drawConfig, setDrawConfig] = useState(null)
  const [selectedDrawType, setSelectedDrawType] = useState('random')
  const [executedDraw, setExecutedDraw] = useState(null)
  
  // Loading state
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/analytics')
      setAnalytics(data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadTabData = async (tab) => {
    setActiveTab(tab)
    setLoading(true)
    try {
      if (tab === 'users') {
        const { data } = await api.get('/admin/users')
        setUsers(data.data || [])
      } else if (tab === 'charities') {
        const { data } = await api.get('/admin/charities')
        setCharities(data.data || [])
      } else if (tab === 'winners') {
        const { data } = await api.get('/admin/winners/pending')
        setPendingWinners(data.data || [])
        const { data: allWinnersData } = await api.get('/admin/winners')
        setAllWinners(allWinnersData.data || [])
      } else if (tab === 'draws') {
        await fetchDrawConfig()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyWinner = async (id, approved) => {
    try {
      await api.put(`/admin/winners/${id}/verify`, { approved })
      loadTabData('winners')
      fetchDashboardData()
      alert(`Winner ${approved ? 'approved' : 'rejected'} successfully`)
    } catch (e) {
      alert("Failed to verify winner: " + e.response?.data?.message)
    }
  }

  const handleMarkPayoutComplete = async (id) => {
    try {
      await api.put(`/admin/winners/${id}/payout`)
      loadTabData('winners')
      fetchDashboardData()
      alert("Payout marked as completed")
    } catch (e) {
      alert("Failed to mark payout: " + e.response?.data?.message)
    }
  }

  const handleExecuteDraw = async (drawType) => {
    try {
      setSubmitting(true)
      const res = await api.post('/admin/draws', { 
        drawType, 
        drawDate: new Date().toISOString(),
        prizePool: 10000 
      })
      alert("Draw executed successfully!")
      fetchDashboardData()
    } catch (e) {
      alert("Failed to execute draw: " + (e.response?.data?.message || e.message))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSimulateDraw = async (drawType) => {
    try {
      setSubmitting(true)
      const res = await api.post(`/admin/draws/simulate?drawType=${drawType}`)
      setDrawSimulation(res.data.data)
      setShowSimulation(true)
    } catch (e) {
      alert("Failed to simulate draw: " + (e.response?.data?.message || e.message))
    } finally {
      setSubmitting(false)
    }
  }

  const fetchDrawConfig = async () => {
    try {
      const res = await api.get('/admin/draws/config')
      setDrawConfig(res.data.data)
    } catch (e) {
      console.error("Failed to fetch draw config", e)
    }
  }

  const handleExecuteDrawV2 = async (drawType) => {
    if (!window.confirm(`Execute ${drawType} draw? This will create actual winners.`)) return
    
    try {
      setSubmitting(true)
      const res = await api.post(`/admin/draws/execute?drawType=${drawType}`)
      setExecutedDraw(res.data.data)
      alert("Draw executed successfully! Results below.")
      fetchDrawConfig()
    } catch (e) {
      alert("Failed to execute draw: " + (e.response?.data?.message || e.message))
    } finally {
      setSubmitting(false)
    }
  }

  const handleGenerateTestData = async () => {
    if (!window.confirm('This will create 15 test users with scores. Continue?')) return
    
    try {
      setTestDataLoading(true)
      const res = await api.post('/admin/test-data/generate')
      alert("Test data generated: " + res.data.data.usersCreated + " users created with scores")
      fetchDashboardData()
    } catch (e) {
      alert("Failed to generate test data: " + (e.response?.data?.message || e.message))
    } finally {
      setTestDataLoading(false)
    }
  }

  const handleClearTestData = async () => {
    if (!window.confirm('This will delete all users, subscriptions, and scores. Are you sure?')) return
    
    try {
      setTestDataLoading(true)
      const res = await api.delete('/admin/test-data/clear')
      alert("Test data cleared")
      fetchDashboardData()
    } catch (e) {
      alert("Failed to clear test data: " + (e.response?.data?.message || e.message))
    } finally {
      setTestDataLoading(false)
    }
  }

  const handleCreateCharity = async () => {
    if (!charityForm.name.trim()) {
      alert("Charity name is required")
      return
    }
    
    try {
      setSubmitting(true)
      if (editingCharity) {
        await api.put(`/admin/charities/${editingCharity.id}`, charityForm)
        alert("Charity updated successfully")
      } else {
        await api.post('/admin/charities', charityForm)
        alert("Charity created successfully")
      }
      setCharityForm({ name: '', description: '', isActive: true })
      setEditingCharity(null)
      setShowCharityModal(false)
      loadTabData('charities')
    } catch (e) {
      alert("Failed to save charity: " + (e.response?.data?.message || e.message))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCharity = async (id) => {
    if (!confirm("Are you sure?")) return
    try {
      await api.delete(`/admin/charities/${id}`)
      alert("Charity deleted")
      loadTabData('charities')
    } catch (e) {
      alert("Failed to delete charity")
    }
  }

  const handleEditCharity = (charity) => {
    setEditingCharity(charity)
    setCharityForm({ name: charity.name, description: charity.description, isActive: charity.isActive })
    setShowCharityModal(true)
  }

  const closeCharityModal = () => {
    setShowCharityModal(false)
    setEditingCharity(null)
    setCharityForm({ name: '', description: '', isActive: true })
  }

  if (!analytics) return <div className="container flex-center" style={{ minHeight: '60vh' }}>Loading Admin Panel...</div>

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Admin Dashboard</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage users, draws, charities, and verify winners.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '3rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <button className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => loadTabData('overview')}>Overview</button>
        <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => loadTabData('users')}>Users</button>
        <button className={`btn ${activeTab === 'draws' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => loadTabData('draws')}>Draw Control</button>
        <button className={`btn ${activeTab === 'charities' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => loadTabData('charities')}>Charities</button>
        <button className={`btn ${activeTab === 'winners' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => loadTabData('winners')}>
          Winners {pendingWinners.length > 0 && <span className="badge" style={{ marginLeft: '0.5rem', background: '#ef4444' }}>{pendingWinners.length}</span>}
        </button>
        <button className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', minHeight: '400px' }}>
        {loading && activeTab !== 'analytics' ? (
          <div className="flex-center" style={{ height: '300px' }}>Loading data...</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ marginBottom: '2rem' }}>Dashboard Overview</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <Users color="var(--primary)" size={32} style={{ marginBottom: '1rem' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics?.totalUsers || 0}</div>
                    <div style={{ color: 'var(--text-muted)' }}>Total Users</div>
                  </div>
                  <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <Activity color="var(--accent)" size={32} style={{ marginBottom: '1rem' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics?.activeSubscriptions || 0}</div>
                    <div style={{ color: 'var(--text-muted)' }}>Active Subscriptions</div>
                  </div>
                  <div style={{ padding: '1.5rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <Gift color="var(--secondary)" size={32} style={{ marginBottom: '1rem' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics?.totalDraws || 0}</div>
                    <div style={{ color: 'var(--text-muted)' }}>Draws Executed</div>
                  </div>
                  <div style={{ padding: '1.5rem', background: 'rgba(ec4899, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                    <Heart color="#ec4899" size={32} style={{ marginBottom: '1rem' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics?.totalCharities || 0}</div>
                    <div style={{ color: 'var(--text-muted)' }}>Active Charities</div>
                  </div>
                  <div style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <DollarSign color="#f59e0b" size={32} style={{ marginBottom: '1rem' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{(analytics?.totalPrizePool || 0).toFixed(0)}</div>
                    <div style={{ color: 'var(--text-muted)' }}>Total Prize Pool</div>
                  </div>
                  <div style={{ padding: '1.5rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                    <TrendingUp color="#06b6d4" size={32} style={{ marginBottom: '1rem' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{(analytics?.charityContributions || 0).toFixed(0)}</div>
                    <div style={{ color: 'var(--text-muted)' }}>Charity Contributions</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h3>User Management</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>View and manage user profiles and subscriptions.</p>
                <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
                        <th style={{ padding: '1rem' }}>Email</th>
                        <th style={{ padding: '1rem' }}>Full Name</th>
                        <th style={{ padding: '1rem' }}>Role</th>
                        <th style={{ padding: '1rem' }}>Subscription</th>
                        <th style={{ padding: '1rem' }}>Joined</th>
                        <th style={{ padding: '1rem' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '1rem' }}>{u.email}</td>
                          <td style={{ padding: '1rem' }}>{u.fullName || '-'}</td>
                          <td style={{ padding: '1rem' }}>
                            <span className={`badge ${u.role === 'admin' ? 'badge-active' : 'badge-inactive'}`}>{u.role}</span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span className="badge badge-active">Active</span>
                          </td>
                          <td style={{ padding: '1rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '1rem' }}>
                            <button className="btn-icon" style={{ fontSize: '0.75rem' }}>
                              <Edit2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'draws' && (
              <div>
                <h3 style={{ marginBottom: '2rem' }}>Draw Management & Testing</h3>

                {/* Draw Configuration */}
                {drawConfig && (
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                    padding: '2rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '2rem',
                    borderLeft: '4px solid #3b82f6'
                  }}>
                    <h4 style={{ margin: '0 0 1.5rem 0' }}>📈 Current Prize Pool</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Pool</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>₹{drawConfig.currentPrizePool?.toFixed(0) || 0}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>5-Match (40%)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>₹{(drawConfig.poolDistribution?.['5-match'] || 0).toFixed(0)}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>4-Match (35%)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>₹{(drawConfig.poolDistribution?.['4-match'] || 0).toFixed(0)}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>3-Match (25%)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>₹{(drawConfig.poolDistribution?.['3-match'] || 0).toFixed(0)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Draw Type Selection & Execution */}
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                  padding: '2rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '2rem',
                  borderLeft: '4px solid #10b981'
                }}>
                  <h4 style={{ margin: '0 0 1.5rem 0' }}>🎯 Execute Draw</h4>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500' }}>Select Draw Type:</label>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: selectedDrawType === 'random' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', border: '2px solid ' + (selectedDrawType === 'random' ? '#10b981' : 'transparent') }}>
                        <input 
                          type="radio" 
                          value="random" 
                          checked={selectedDrawType === 'random'}
                          onChange={(e) => setSelectedDrawType(e.target.value)}
                        />
                        <span>Random (Standard Lottery)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: selectedDrawType === 'algorithmic' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', border: '2px solid ' + (selectedDrawType === 'algorithmic' ? '#10b981' : 'transparent') }}>
                        <input 
                          type="radio" 
                          value="algorithmic" 
                          checked={selectedDrawType === 'algorithmic'}
                          onChange={(e) => setSelectedDrawType(e.target.value)}
                        />
                        <span>Algorithmic (Weighted by Scores)</span>
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => handleExecuteDrawV2(selectedDrawType)} 
                      disabled={submitting}
                      className="btn"
                      style={{ 
                        background: 'linear-gradient(135deg, #10b981, #059669)', 
                        color: 'white',
                        fontSize: '1rem',
                        padding: '0.75rem 1.5rem'
                      }}
                    >
                      {submitting ? '⏳ Executing Draw...' : '🎰 Execute Draw NOW'}
                    </button>
                    <button 
                      onClick={() => handleSimulateDraw(selectedDrawType)} 
                      disabled={submitting}
                      className="btn"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                    >
                      {submitting ? 'Simulating...' : '👁️ Simulate First'}
                    </button>
                  </div>
                </div>

                {/* Simulation Results */}
                {showSimulation && drawSimulation && (
                  <div style={{ 
                    padding: '1.5rem', 
                    background: 'rgba(16, 185, 129, 0.15)', 
                    borderRadius: 'var(--radius-md)', 
                    border: '2px solid rgba(16, 185, 129, 0.3)',
                    marginBottom: '2rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4>🔍 Simulation Results (NOT SAVED)</h4>
                      <button onClick={() => setShowSimulation(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Drawn Numbers</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{drawSimulation.drawnNumbers?.join(', ') || 'N/A'}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Draw Type</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'capitalize' }}>{drawSimulation.drawType}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Executed Draw Results */}
                {executedDraw && (
                  <div style={{ 
                    padding: '2rem', 
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(74, 222, 128, 0.1) 100%)', 
                    borderRadius: 'var(--radius-md)', 
                    border: '2px solid rgba(34, 197, 94, 0.3)'
                  }}>
                    <h4 style={{ margin: '0 0 1.5rem 0' }}>✅ Draw Executed Successfully!</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Drawn Numbers</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{executedDraw.drawResults?.drawnNumbers?.join(', ')}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Winners</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e' }}>{executedDraw.drawResults?.totalWinners || 0}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Prize Pool</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>₹{executedDraw.drawResults?.prizePool?.toFixed(0)}</div>
                      </div>
                    </div>

                    {/* Winners Breakdown */}
                    {executedDraw.drawResults?.results && (
                      <div>
                        <h5 style={{ margin: '1rem 0 0.75rem 0' }}>Winners by Match Type</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                          {Object.entries(executedDraw.drawResults.results).map(([type, winners]) => (
                            <div key={type} style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{type}</div>
                              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: type === '5-match' ? '#22c55e' : type === '4-match' ? '#f59e0b' : '#3b82f6' }}>
                                {winners.length} winners
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'charities' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3>Charity Management</h3>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      setEditingCharity(null)
                      setCharityForm({ name: '', description: '', isActive: true })
                      setShowCharityModal(true)
                    }}
                  >
                    <Plus size={16} /> Add Charity
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {charities.map(c => (
                    <div key={c.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0 }}>{c.name}</h4>
                        <span className={`badge ${c.isActive ? 'badge-active' : 'badge-inactive'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', flex: 1 }}>
                        {c.description || 'No description'}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleEditCharity(c)}
                          style={{ color: 'var(--primary)' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleDeleteCharity(c.id)}
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {charities.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No charities yet. Create one to get started!
                  </div>
                )}
              </div>
            )}

            {activeTab === 'winners' && (
              <div>
                <div style={{ marginBottom: '2rem' }}>
                  <h3>Winners Management</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Verify submissions and mark payouts as completed.</p>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Pending Verifications ({pendingWinners.length})</h4>
                  {pendingWinners.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No pending proofs to verify.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {pendingWinners.map(w => (
                        <div key={w.id} style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--warning)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div>
                              <strong>{w.matchType} Match Winner</strong>
                              <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginTop: '0.25rem' }}>Prize: ₹{w.prizeAmount}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => handleVerifyWinner(w.id, true)} 
                                className="btn btn-primary" 
                                style={{ background: '#10b981', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleVerifyWinner(w.id, false)} 
                                className="btn" 
                                style={{ background: '#ef4444', color: 'white', padding: '0.5rem 1rem', fontSize: '0.875rem', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                          {w.proofImageUrl ? (
                            <a href={w.proofImageUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.875rem' }}>
                              <Search size={14} /> View Proof
                            </a>
                          ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No proof uploaded yet</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>All Winners ({allWinners.length})</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
                          <th style={{ padding: '0.75rem' }}>Match Type</th>
                          <th style={{ padding: '0.75rem' }}>Prize</th>
                          <th style={{ padding: '0.75rem' }}>Status</th>
                          <th style={{ padding: '0.75rem' }}>Verified</th>
                          <th style={{ padding: '0.75rem' }}>Paid</th>
                          <th style={{ padding: '0.75rem' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allWinners.map(w => (
                          <tr key={w.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.75rem' }}>{w.matchType}</td>
                            <td style={{ padding: '0.75rem' }}>₹{w.prizeAmount}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <span className={`badge ${w.status === 'approved' ? 'badge-active' : 'badge-pending'}`}>
                                {w.status || 'Pending'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <CheckSquare size={16} color={w.status === 'approved' ? '#10b981' : '#9ca3af'} />
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              {w.payoutCompleted ? (
                                <CheckSquare size={16} color="#10b981" />
                              ) : (
                                <button 
                                  className="btn" 
                                  onClick={() => handleMarkPayoutComplete(w.id)}
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: 'var(--primary)', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                  Mark Paid
                                </button>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <button className="btn-icon"><Edit2 size={14} /></button>
                            </td>
                          </tr>
                        ))}
                        {allWinners.length === 0 && (
                          <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No winners yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3>Reports & Analytics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)' }}>
                    <h4 style={{ marginTop: 0 }}>Total Users</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{analytics?.totalUsers || 0}</div>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>Active platform users</p>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)' }}>
                    <h4 style={{ marginTop: 0 }}>Active Subscriptions</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>{analytics?.activeSubscriptions || 0}</div>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>Monthly/Yearly plans</p>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)' }}>
                    <h4 style={{ marginTop: 0 }}>Total Prize Pool</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>₹{(analytics?.totalPrizePool || 0).toFixed(0)}</div>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>Across all draws</p>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(236, 72, 153, 0.05)' }}>
                    <h4 style={{ marginTop: 0 }}>Charity Contributions</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ec4899' }}>₹{(analytics?.charityContributions || 0).toFixed(0)}</div>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>Distributed to charities</p>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(139, 92, 246, 0.05)' }}>
                    <h4 style={{ marginTop: 0 }}>Total Draws Executed</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{analytics?.totalDraws || 0}</div>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>Monthly draws completed</p>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(6, 182, 212, 0.05)' }}>
                    <h4 style={{ marginTop: 0 }}>Active Charities</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#06b6d4' }}>{analytics?.totalCharities || 0}</div>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>Registered organizations</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Charity Modal */}
      {showCharityModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{editingCharity ? 'Edit Charity' : 'Create Charity'}</h3>
              <button 
                onClick={closeCharityModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.5rem' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Charity Name *</label>
                <input 
                  type="text"
                  value={charityForm.name}
                  onChange={(e) => setCharityForm({ ...charityForm, name: e.target.value })}
                  placeholder="e.g., Save The Children"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'rgba(0,0,0,0.1)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                <textarea 
                  value={charityForm.description}
                  onChange={(e) => setCharityForm({ ...charityForm, description: e.target.value })}
                  placeholder="Describe the charity's mission..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'rgba(0,0,0,0.1)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    minHeight: '100px',
                    boxSizing: 'border-box'
                  }}
                  rows="4"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input 
                  type="checkbox"
                  id="isActive"
                  checked={charityForm.isActive}
                  onChange={(e) => setCharityForm({ ...charityForm, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" style={{ margin: 0 }}>Active</label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button 
                  onClick={closeCharityModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateCharity}
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Saving...' : editingCharity ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
