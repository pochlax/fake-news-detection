import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle } from 'lucide-react'

interface PricingCardProps {
    title: string
    description: string
    price: string
    period: string
    features: string[]
    buttonText: string
    buttonVariant?: "default" | "outline"
    isPopular?: boolean
}

export function PricingCard({
    title,
    description,
    price,
    period,
    features,
    buttonText,
    buttonVariant = "outline",
    isPopular = false
}: PricingCardProps) {
    return (
        <Card className={`relative overflow-hidden ${isPopular ? 'border-black' : ''} hover:shadow-xl transition-shadow duration-300`}>
            {isPopular && (
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-black to-gray-800" />
            )}
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
                <div className="text-3xl font-bold mt-4">{price}</div>
                <div className="text-sm text-gray-600">{period}</div>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            {feature}
                        </li>
                    ))}
                </ul>
                <Button
                    className={`w-full mt-6 ${buttonVariant === "default" ? "bg-black hover:bg-black/90" : ""}`}
                    variant={buttonVariant}
                >
                    {buttonText}
                </Button>
            </CardContent>
        </Card>
    )
}