"use client"

import { useRouter } from 'next/navigation'
import { useGoogleLogin } from '@react-oauth/google'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Get user info from Google
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: {
                        'Authorization': `Bearer ${tokenResponse.access_token}`
                    }
                });
                const userInfo = await userInfoResponse.json();

                // Check/create user profile in Supabase
                const response = await fetch('http://localhost:5000/auth/login/google', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        google_id: userInfo.sub,
                        email: userInfo.email,
                        name: userInfo.name,
                        picture: userInfo.picture
                    }),
                });

                if (response.ok) {

                    const data = await response.json(); // Parse the JSON response

                    // Store user details in localStorage
                    localStorage.setItem('userId', data.user.user_id);
                    localStorage.setItem('userEmail', userInfo.email);
                    localStorage.setItem('userName', userInfo.name);
                    localStorage.setItem('userPicture', userInfo.picture || '');

                    // Redirect to analyzer page
                    router.push('/analyzer');
                }
            } catch (error) {
                console.error('Login error:', error);
            }
        },
        onError: () => {
            console.error('Login Failed');
        }
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Card className="w-[400px]">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Shield className="h-6 w-6" />
                        <h2 className="text-2xl font-bold">de(fnd)</h2>
                    </div>
                    <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    <Button
                        onClick={() => login()}
                        className="w-full"
                    >
                        Sign in with Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}