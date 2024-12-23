import { PricingCard } from '@/components/ui/PricingCard'

export function Pricing() {
    const pricingPlans = [
        {
            title: "Basic",
            description: "For individual users",
            price: "$0",
            period: "Forever free",
            features: [
                "10 articles/month",
                "Basic analysis",
                "Community support"
            ],
            buttonText: "Get Started",
            buttonVariant: "outline" as const
        },
        {
            title: "Pro",
            description: "For power users",
            price: "$29",
            period: "per month",
            features: [
                "Unlimited articles",
                "Advanced analysis",
                "Priority support"
            ],
            buttonText: "Get Started",
            buttonVariant: "default" as const,
            isPopular: true
        },
        {
            title: "Enterprise",
            description: "For organizations",
            price: "Custom",
            period: "Contact sales",
            features: [
                "Custom integration",
                "API access",
                "24/7 support"
            ],
            buttonText: "Contact Sales",
            buttonVariant: "outline" as const
        }
    ]

    return (
        <section id="pricing" className="py-24">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-gray-600">
                        Choose the plan that best fits your needs. All plans include our core features.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {pricingPlans.map((plan, index) => (
                        <PricingCard key={index} {...plan} />
                    ))}
                </div>
            </div>
        </section>
    )
}