'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // TODO: Implement actual authentication
    setTimeout(() => {
      setLoading(false)
      router.push('/assessment')
    }, 1000)
  }

  return (
    <>
      <div className="app-background" />
      <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="action-card p-8">
            <div className="text-center mb-8">
              <img src="/CareRouterLogo.png" alt="CareRouter Logo" className="h-20 w-auto mx-auto mb-4" />
              <h1 className="text-4xl font-heading font-bold text-queens-navy mb-3">
                Welcome to CareRouter
              </h1>
              <p className="text-text-secondary text-lg">
                Your personalized pathway to mental health support.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-queens-gold focus:border-queens-gold outline-none transition-all duration-200"
                  placeholder="your.email@queensu.ca"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-queens-gold focus:border-queens-gold outline-none transition-all duration-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-queens-navy hover:bg-opacity-90 text-white font-medium py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
              </button>
            </form>

            <div className="text-center text-sm text-text-secondary mt-6">
              {isLogin ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-queens-navy hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-queens-gold focus:ring-offset-2 rounded"
                  >
                    Sign Up
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-queens-navy hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-queens-gold focus:ring-offset-2 rounded"
                  >
                    Log In
                  </button>
                </span>
              )}
            </div>

            {error && (
              <p className="text-error text-sm text-center mt-4">{error}</p>
            )}

            <p className="text-xs text-text-secondary text-center mt-8">
              By continuing, you agree to our <a href="#" className="underline hover:text-queens-navy">Privacy Policy</a> and <a href="#" className="underline hover:text-queens-navy">Terms of Service</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
