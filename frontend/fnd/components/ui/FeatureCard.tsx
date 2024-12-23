import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle } from 'lucide-react'

interface FeatureCardProps {
    icon: LucideIcon
    title: string
    description: string
    features: string[]
}

export function FeatureCard({ icon: Icon, title, description, features }: FeatureCardProps) {
    return (
        <Card className="bg-white/50 backdrop-blur-sm border-black/5 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-shadow duration-300">
            <CardHeader>
                <Icon className="h-12 w-12 text-black mb-4" />
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2 text-gray-600">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            {feature}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}