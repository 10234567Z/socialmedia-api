'use client'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Page() {
  const supabase = createClient()

  const [signedIn, setSignedIn] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    async function checkSession() {
      const {data: {user: session}} = await supabase.auth.getUser()
      if (session) {
        setSignedIn(true)
      } else {
        router.push('/login')
      }
    }
    checkSession()
  }, [])

  return (
    signedIn ?
      <div>
        <h1>Page</h1>
      </div>
      :
      <div>
        <h1>Redirecting...</h1>
      </div>
  )
}
