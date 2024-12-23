import { Card, CardContent } from "@/components/ui/card"
import { Star } from 'lucide-react'

interface TestimonialCardProps {
    content: string
    name: string
    role: string
}

export function TestimonialCard({ content, name, role }: TestimonialCardProps) {
    return (
        <Card className="bg-white/50 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
            <CardContent className="pt-6">
                <div className="mb-4">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className="inline-block h-5 w-5 text-yellow-400" fill="currentColor" />
                    ))}
                </div>
                <p className="text-gray-600 mb-4">{content}</p>
                <div>
                    <div className="font-semibold">{name}</div>
                    <div className="text-sm text-gray-600">{role}</div>
                </div>
            </CardContent>
        </Card>
    )
}