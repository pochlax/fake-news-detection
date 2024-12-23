import { TestimonialCard } from '@/components/ui/TestimonialCard'

export function Testimonials() {
    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Investigative Journalist",
            content: "An invaluable tool for modern journalism. It helps me verify information quickly and accurately."
        },
        {
            name: "Michael Chen",
            role: "Digital Content Manager",
            content: "The social sentiment analysis feature has transformed how we evaluate trending news stories."
        },
        {
            name: "Emma Williams",
            role: "Fact-Checking Specialist",
            content: "The most comprehensive fake news detection tool I've used. The multi-layer verification is brilliant."
        }
    ]

    return (
        <section id="testimonials" className="py-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />
            <div className="container mx-auto px-4 relative">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold mb-4">Trusted by Professionals</h2>
                    <p className="text-gray-600">
                        See what journalists and fact-checkers are saying about our platform.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard key={index} {...testimonial} />
                    ))}
                </div>
            </div>
        </section>
    )
}