import Image from 'next/image'
import { LucideIcon } from 'lucide-react'

interface FeatureSectionProps {
  icon: LucideIcon
  title: string
  description: string
  imageAlt: string
  imageSrc: string
  reverse: boolean
}

export function FeatureSection({ icon: Icon, title, description, imageAlt, imageSrc, reverse }: FeatureSectionProps) {
  return (
    <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-16`}>
      <div className="md:w-1/2 space-y-4">
        <Icon className="h-12 w-12 text-black mb-4" />
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="md:w-1/2 w-full">
        <div className={`w-full ${reverse ? 'md:pr-0' : 'md:pl-0'}`}>
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={600}
            height={400}
            className="rounded-lg shadow-lg w-full h-auto object-cover"
            style={{ maxHeight: '500px' }}
          />
        </div>
      </div>
    </div>
  )
}