"use client"

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

    useEffect(() => {
        // Check for user authentication
        const userId = localStorage.getItem('userId')

        if (!userId) {
            router.replace('/login')
        } else {
            setIsAuthenticated(true)
        }
    }, [router])

    // Show nothing while checking authentication
    if (isAuthenticated === null) {
        return null
    }

    // If authenticated, render the protected content
    return isAuthenticated ? <>{children}</> : null
} 