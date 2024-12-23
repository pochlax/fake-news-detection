import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from 'lucide-react'

interface HeroProps {
    onStartTrial: () => void
}

export function Hero({ onStartTrial }: HeroProps) {
    return (
        <section className="pt-32 pb-16 px-4 overflow-hidden">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center space-y-8">
                    <Badge variant="outline" className="text-sm border-black/20 shadow-sm">
                        AI-Powered Fact Checking
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        Detect Fake News with
                        <span className="block bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600">
                            Precision and Confidence
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        Our advanced AI analyzes content credibility through publisher verification,
                        content analysis, and social sentiment tracking.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-black text-white hover:bg-black/90"
                            onClick={onStartTrial}
                        >
                            Start Free Trial
                        </Button>
                        <Button size="lg" variant="outline" className="group">
                            Watch Demo
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}