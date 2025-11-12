import { useState, useEffect } from 'react'

export function useAuth() {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    try {
      const userString = localStorage.getItem('user')
      if (userString) {
        setUser(JSON.parse(userString))
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }, [])
  
  return {
    user,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    role: user?.role
  }
}