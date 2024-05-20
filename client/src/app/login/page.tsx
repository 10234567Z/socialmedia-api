'use client'
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Login() {

    const [guestLogin, setGuestLogin] = useState<boolean>(false)
    const supabase = createClient()
    const router = useRouter()
    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        if (guestLogin) {
            e.preventDefault()
            const { data, error } = await supabase.auth.signInWithPassword({
                email: process.env.NEXT_PUBLIC_GUEST_EMAIL!,
                password: process.env.NEXT_PUBLIC_GUEST_PASSWORD!
            })
            if (error) {
                console.error(error)
            }
            router.push('/')
        }
        else {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const email = formData.get('email') as string
            const password = formData.get('password') as string
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })
            if (error) {
                console.error(error)
            }
            router.push('/')
        }
    }
    return (
        <div className="p-4 px-auto">
            <form onSubmit={handleLogin} className="flex flex-col gap-4 max-w-[420px] m-0 mx-auto text-center">
                <label className="text-2xl">Email</label>
                <input type="email" name="email" className="border border-black p-2" />
                <label className="text-2xl">Password</label>
                <input type="password" name="password" className="border border-black p-2" />
                <hr className="w-full border-1 border-black" />
                <button type="submit" className="bg-blue-900 rounded-md transition-all hover:bg-blue-800 text-white p-2">Login</button>
                <button onClick={() => setGuestLogin(true)} type="submit" className="bg-blue-900 rounded-md transition-all hover:bg-blue-800 text-white p-2">Guest Login</button>
                <Link href="/register">
                    <p className="text-blue-900 transition-all hover:text-blue-600 text-center">Don't have an account? Register here</p>
                </Link>
            </form>
        </div>
    )
}