import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import api from '../lib/api'
import { UserPlus } from 'lucide-react'

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Create user in Supabase
      const { data: { user, session }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (signUpError) throw signUpError

      // 2. Handle response based on whether session is available
      if (!user) {
        throw new Error('Signup failed - user not created')
      }

      // Try to sync with the backend
      try {
        await api.post('/auth/sync', {
          id: user.id,
          email: formData.email,
          fullName: formData.fullName
        })
      } catch (syncErr) {
        console.error('First sync attempt failed:', syncErr)
        // Fallback: try register endpoint
        try {
          await api.post('/auth/register', {
            id: user.id,
            email: formData.email,
            fullName: formData.fullName
          })
        } catch (regErr) {
          console.error('Register fallback also failed:', regErr)
        }
      }

      // 3. Check if session is available
      if (session) {
        // User is already logged in, redirect to dashboard
        navigate('/dashboard')
      } else {
        // Email verification is pending
        setError('Signup successful! Please check your email to verify your account. Then you can log in.')
      }
      
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container animate-fade-in flex-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="flex-center" style={{ width: '50px', height: '50px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', margin: '0 auto 1rem auto', color: 'var(--primary)' }}>
            <UserPlus size={24} />
          </div>
          <h2>Create Account</h2>
          <p style={{ color: 'var(--text-muted)' }}>Join the Golf Platform community</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label className="input-label" htmlFor="fullName">Full Name</label>
            <input 
              id="fullName"
              type="text" 
              className="input-field" 
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              className="input-field" 
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required 
            />
          </div>
          
          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              className="input-field" 
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              minLength={6}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '500' }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}
