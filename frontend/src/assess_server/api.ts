// API utility functions for connecting to FastAPI backend

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Helper function to get auth token
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken()
}

// Helper function to logout
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('pathway') // Also clear saved pathway
  }
}

// Helper function to create headers with auth
const getHeaders = () => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Auth endpoints
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) throw new Error('Login failed')
    return response.json()
  },

  signup: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) throw new Error('Signup failed')
    return response.json()
  },
}

// Assessment/Routing endpoint
export const assessmentAPI = {
  submitAssessment: async (data: {
    primary_concern: string
    answer_distress: string
    answer_functioning: string
    answer_urgency: string
    answer_safety: string
    answer_constraints: string
    latitude: number | null
    longitude: number | null
  }) => {
    const response = await fetch(`${API_URL}/api/generate-plan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Assessment submission failed')
    return response.json()
  },
}

// Resources endpoint
export const resourcesAPI = {
  getResources: async (params: { lat?: number; lon?: number; filters?: string[] }) => {
    const queryParams = new URLSearchParams()
    if (params.lat) queryParams.append('lat', params.lat.toString())
    if (params.lon) queryParams.append('lon', params.lon.toString())
    if (params.filters) queryParams.append('filters', params.filters.join(','))

    const response = await fetch(`${API_URL}/api/resources?${queryParams}`, {
      headers: getHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch resources')
    return response.json()
  },
}

// Booking endpoints
export const bookingAPI = {
  createBooking: async (bookingData: {
    resourceId: string
    date: string
    time: string
    notes?: string
  }) => {
    const response = await fetch(`${API_URL}/api/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingData),
    })
    if (!response.ok) throw new Error('Booking failed')
    return response.json()
  },

  getBookings: async () => {
    const response = await fetch(`${API_URL}/api/bookings`, {
      headers: getHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch bookings')
    return response.json()
  },
}
