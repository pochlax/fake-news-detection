import { Loader2 } from 'lucide-react'

export function LoaderOverlay() {
    return (
        <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-50">
            <p className="text-lg font-medium mb-4">Analyzing</p>
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-sm text-gray-600 text-center max-w-md px-4">
                We are generating your analysis, feel free to explore other reports and we will alert you when the analysis is complete!
            </p>
        </div>
    )
} 