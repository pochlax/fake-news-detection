import { Button } from "@/components/ui/button"

interface URLInputProps {
    inputUrl: string
    setInputUrl: (url: string) => void
    isAnalyzing: boolean
    handleAnalyze: () => void
}

export function URLInput({ inputUrl, setInputUrl, isAnalyzing, handleAnalyze }: URLInputProps) {
    return (
        <div className="w-full max-w-xl">
            <div className="flex gap-4">
                <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    disabled={isAnalyzing}
                    placeholder="Enter article URL to analyze..."
                    className="flex-1 h-12 px-4 rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Article URL input"
                />
                <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !inputUrl}
                    className="h-12 px-6"
                >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </Button>
            </div>
        </div>
    )
} 