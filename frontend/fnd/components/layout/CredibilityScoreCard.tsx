import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface CredibilityScoreCardProps {
    articleContent: string | null
    recommendationScore: number
    getScoreColor: (score: number) => string
    getProgressBarColor: (score: number) => string
}

export function CredibilityScoreCard({
    articleContent,
    recommendationScore,
    getScoreColor,
    getProgressBarColor
}: CredibilityScoreCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Credibility Score</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="text-center">
                    {articleContent ? (
                        <>
                            <span className={`text-6xl font-bold ${getScoreColor(recommendationScore).replace('bg-', 'text-')}`}>
                                {recommendationScore}%
                            </span>
                            <Progress
                                value={recommendationScore}
                                className={`mt-2 [&>div]:${getProgressBarColor(recommendationScore)}`}
                            />
                        </>
                    ) : (
                        <>
                            <span className="text-6xl font-bold text-gray-400">?</span>
                            <Progress
                                value={0}
                                className="mt-2 [&>div]:bg-gray-400"
                            />
                        </>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    Tip: Scores above 80% typically indicate reliable content with verifiable sources and balanced
                    reporting.
                </p>
            </CardContent>
        </Card>
    )
} 