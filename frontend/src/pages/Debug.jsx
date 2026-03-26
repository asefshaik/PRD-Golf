import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import api from '../lib/api'

export default function Debug() {
  const [status, setStatus] = useState({
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKeySet: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    supabaseConnected: false,
    backendConnected: false,
    session: null,
    errors: [],
    detailedLogs: []
  })

  useEffect(() => {
    const runChecks = async () => {
      const errors = []
      const logs = []
      let supabaseConnected = false
      let backendConnected = false
      let session = null

      // Test Supabase
      try {
        logs.push('Testing Supabase connection...')
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          errors.push(`Supabase Error: ${error.message}`)
          logs.push(`❌ Supabase Error: ${error.message}`)
        } else {
          logs.push(`✓ Supabase connected`)
          session = data.session
          supabaseConnected = true
        }
      } catch (err) {
        errors.push(`Supabase Exception: ${err.message}`)
        logs.push(`❌ Supabase Exception: ${err.message}`)
      }

      // Test Backend Health
      try {
        logs.push('Testing backend health endpoint...')
        const response = await api.get('/health')
        if (response.status === 200) {
          logs.push(`✓ Backend health: ${response.data.message}`)
          backendConnected = true
        }
      } catch (err) {
        logs.push(`❌ Backend health error: ${err.message}`)
        if (err.response) {
          logs.push(`   Status: ${err.response.status}`)
          logs.push(`   Data: ${JSON.stringify(err.response.data)}`)
        }
      }

      setStatus(prev => ({
        ...prev,
        supabaseConnected,
        backendConnected,
        session,
        errors,
        detailedLogs: logs
      }))
    }

    runChecks()
  }, [])

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem' }}>
      <h1>Debug Information</h1>
      
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>Environment Configuration</h3>
        <pre style={{ background: '#1a1a2e', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`Supabase URL: ${status.supabaseUrl}
Supabase Key Set: ${status.supabaseKeySet}
API Base URL: ${status.apiBaseUrl}
`}
        </pre>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>Connection Status</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ 
              width: '16px', 
              height: '16px', 
              borderRadius: '50%', 
              background: status.supabaseConnected ? '#10b981' : '#ef4444' 
            }}></span>
            <span>Supabase: {status.supabaseConnected ? '✓ Connected' : '✗ Failed'}</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ 
              width: '16px', 
              height: '16px', 
              borderRadius: '50%', 
              background: status.backendConnected ? '#10b981' : '#ef4444' 
            }}></span>
            <span>Backend: {status.backendConnected ? '✓ Connected' : '✗ Failed'}</span>
          </div>
        </div>
      </div>

      {status.session && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3>Current Session</h3>
          <pre style={{ background: '#1a1a2e', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{JSON.stringify(status.session, null, 2)}
          </pre>
        </div>
      )}

      {status.errors.length > 0 && (
        <div className="glass-panel" style={{ 
          padding: '2rem', 
          marginBottom: '2rem',
          borderLeft: '4px solid #ef4444'
        }}>
          <h3 style={{ color: '#ef4444' }}>Errors</h3>
          <ul>
            {status.errors.map((err, idx) => (
              <li key={idx} style={{ color: '#fca5a5', marginBottom: '0.5rem' }}>
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>Detailed Logs</h3>
        <pre style={{ background: '#1a1a2e', padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '0.875rem' }}>
{status.detailedLogs.map((log, idx) => (
  <div key={idx} style={{ marginBottom: '0.5rem' }}>
    {log}
  </div>
))}
        </pre>
      </div>
    </div>
  )
}
