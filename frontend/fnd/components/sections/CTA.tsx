import { Button } from "@/components/ui/button"

interface CTAProps {
    onStartTrial: () => void
}

export function CTA({ onStartTrial }: CTAProps) {
    return (
        <section className="py-24">
            <div className="container mx-auto px-4">
                <div className="bg-black rounded-2xl p-12 max-w-4xl mx-auto text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                            Start Fighting Misinformation Today
                        </h2>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Join thousands of users who are already making informed decisions with de(fnd).
                        </p>
                        <Button
                            size="lg"
                            className="bg-white text-black hover:bg-gray-100"
                            onClick={onStartTrial}
                        >
                            Get Started Free
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}