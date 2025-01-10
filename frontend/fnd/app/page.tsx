"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/sections/Hero"
import { Features } from "@/components/sections/Features"
import { HowItWorks } from "@/components/sections/HowItWorks"
import { Pricing } from "@/components/sections/Pricing"
import { Testimonials } from "@/components/sections/Testimonials"
import { CTA } from "@/components/sections/CTA"
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  const handleStartTrial = () => {
    router.push('/analyzer')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar onStartTrial={handleStartTrial} />
      <Hero onStartTrial={handleStartTrial} />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CTA onStartTrial={handleStartTrial} />
      <Footer />
    </div>
  )
}