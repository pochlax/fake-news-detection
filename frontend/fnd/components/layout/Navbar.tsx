import { Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface NavbarProps {
    onStartTrial: () => void
}

export function Navbar({ onStartTrial }: NavbarProps) {
    return (
        <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-lg border-b border-gray-100">
            <div className="container mx-auto h-20 flex items-center justify-between px-6 md:px-8">
                <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-black" />
                    <span className="text-xl font-bold">de(fnd)</span>
                </div>
                <div className="hidden md:flex items-center space-x-10">
                    <a href="#features" className="text-gray-600 hover:text-black transition-colors duration-200">Features</a>
                    <a href="#how-it-works" className="text-gray-600 hover:text-black transition-colors duration-200">How it works</a>
                    <a href="#pricing" className="text-gray-600 hover:text-black transition-colors duration-200">Pricing</a>
                    <a href="#testimonials" className="text-gray-600 hover:text-black transition-colors duration-200">Testimonials</a>
                </div>
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" className="hover:bg-gray-100">Log in</Button>
                    <Button
                        className="bg-black text-white hover:bg-black/90"
                        onClick={onStartTrial}
                    >
                        Get Started
                    </Button>
                </div>
            </div>
        </nav>
    )
}