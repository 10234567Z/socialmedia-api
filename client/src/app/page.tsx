'use client'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Page() {
  const supabase = createClient()

  const [signedIn, setSignedIn] = useState<boolean>(false)
  const [loading , setLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    async function checkSession() {
      const {data: {user: session}} = await supabase.auth.getUser()
      if (session) {
        setSignedIn(true)
        setLoading(false)
      } else {
        setSignedIn(false)
        router.push('/login')
      }
    }
    checkSession()
  }, [])

  return (
    loading ?
      <div>
        <h1>Loading...</h1>
      </div>
      :
    (signedIn ?
      <div>
        <h1>Page</h1>
      </div>
      :
      <div>
        <h1>Redirecting...</h1>
      </div>)
  )
}
