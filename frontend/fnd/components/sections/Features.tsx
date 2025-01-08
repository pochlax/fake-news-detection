import { FileText, History, Download } from 'lucide-react'
import { FeatureSection } from '../ui/FeatureSection'

export function Features() {
    const features = [
        {
            icon: FileText,
            title: 'Comprehensive Analysis & Breakdown',
            description: 'Get a detailed report on every aspect of the content, from source credibility to content accuracy and social impact.',
            imageAlt: 'Comprehensive Analysis',
            imageSrc: 'https://picsum.photos/800/400?random=69'
        },
        {
            icon: History,
            title: 'Search History',
            description: 'Keep track of all your past searches and analyses, allowing you to revisit and compare results over time.',
            imageAlt: 'Search History',
            imageSrc: 'https://picsum.photos/800/400?random=210'
        },
        {
            icon: Download,
            title: 'Download Reports as PDF',
            description: 'Export your analysis results as professional PDF reports, perfect for sharing or archiving.',
            imageAlt: 'PDF Download',
            imageSrc: 'https://picsum.photos/800/400?random=96'
        }
    ]

    return (
        < section id="features" className="py-24 relative" >
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
            <div className="container mx-auto px-4 relative">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold mb-4">Key Features</h2>
                    <p className="text-gray-600">
                        Discover how de(fnd) empowers you to navigate the complex landscape of online information.
                    </p>
                </div>
                <div className="space-y-24">
                    {features.map((feature, index) => (
                        <FeatureSection
                            key={feature.title}
                            {...feature}
                            reverse={index % 2 !== 0}
                        />
                    ))}
                </div>
            </div>
        </section >
    )
}