'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { getToken } from '../../lib/auth'

export default function AppLayout({ children }) {
  const router = useRouter()

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login')
    }
  }, [router])

  return <>{children}</>
}
