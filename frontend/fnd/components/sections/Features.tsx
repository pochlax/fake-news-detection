import { Search, Brain, Users } from 'lucide-react'
import { FeatureCard } from '@/components/ui/FeatureCard'

export function Features() {
    const features = [
        {
            icon: Search,
            title: "Publisher Analysis",
            description: "Verify the credibility of content sources and authors",
            features: [
                "Historical accuracy tracking",
                "Domain verification",
                "Author credential check"
            ]
        },
        {
            icon: Brain,
            title: "Content Analysis",
            description: "Deep dive into the article content and claims",
            features: [
                "Fact verification",
                "Bias detection",
                "Tone analysis"
            ]
        },
        {
            icon: Users,
            title: "Social Sentiment",
            description: "Analyze public response and engagement",
            features: [
                "Social media tracking",
                "Expert opinions",
                "Community feedback"
            ]
        }
    ]

    return (
        <section id="features" className="py-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
            <div className="container mx-auto px-4 relative">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold mb-4">Three-Layer Verification System</h2>
                    <p className="text-gray-600">
                        Our comprehensive approach combines multiple analysis methods to ensure the highest accuracy in fake news detection.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    )
}