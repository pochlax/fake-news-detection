import { Loader2 } from "lucide-react"

export function LoadingOverlay() {
    return (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
} 