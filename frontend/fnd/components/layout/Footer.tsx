import { Shield } from 'lucide-react'

export function Footer() {
    return (
        <footer className="border-t py-12 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Shield className="h-6 w-6" />
                            <span className="text-xl font-bold">de(fnd)</span>
                        </div>
                        <p className="text-gray-600">
                            Making truth accessible through technology.
                        </p>
                    </div>
                    <FooterSection
                        title="Product"
                        items={["Features", "Pricing", "API", "Documentation"]}
                    />
                    <FooterSection
                        title="Company"
                        items={["About", "Blog", "Careers", "Contact"]}
                    />
                    <FooterSection
                        title="Legal"
                        items={["Privacy Policy", "Terms of Service", "Cookie Policy"]}
                    />
                </div>
                <div className="border-t mt-12 pt-8 text-center text-gray-600">
                    <p>© {new Date().getFullYear()} de(fnd). All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

interface FooterSectionProps {
    title: string
    items: string[]
}

function FooterSection({ title, items }: FooterSectionProps) {
    return (
        <div>
            <h3 className="font-semibold mb-4">{title}</h3>
            <ul className="space-y-2 text-gray-600">
                {items.map((item, index) => (
                    <li
                        key={index}
                        className="hover:text-black transition-colors duration-200 cursor-pointer"
                    >
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
}