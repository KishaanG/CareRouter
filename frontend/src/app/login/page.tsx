'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Person 2 - Connect to backend API endpoint
    // POST /auth/login or /auth/signup
    
    try {
      // Simulated auth for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Store auth token (Person 2 will implement)
      localStorage.setItem('auth_token', 'demo-token')
      
      // Redirect to assessment
      router.push('/assessment')
    } catch (error) {
      console.error('Auth error:', error)
      alert('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Heart className="w-12 h-12 text-primary-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">CareRouter</h1>
        <p className="text-gray-600 max-w-md">
          Find the right mental health support in your area
        </p>
      </div>

      {/* Login Card */}
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : isLogin ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            This tool helps you find support. It does not diagnose or replace professional care.
            Your data is private and secure.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Need immediate help? Call 988 (Suicide & Crisis Lifeline)</p>
      </div>
    </div>
  )
}
