import { CredibilityScoreCard } from "./CredibilityScoreCard"
import { AnalysisCategoriesCard } from "./AnalysisCategoriesCard"
import { AnalysisNotesCard } from "./AnalysisNotesCard"

interface AnalysisSidebarProps {
    articleContent: string | null
    recommendationScore: number
    tone: string
    toneExplanation: string
    bias: string
    biasExplanation: string
    supportedClaims: string
    authorTrustability: string
    publisherTrustability: string
    authorPublisherExplanation: string
    socialSentiment: string
    socialScore: number
    socialSentimentExplanation: string
    recommendation: string
    calculateContentScore: () => number
    calculateSourceScore: () => number
    getAnalysisColor: (type: string, value: string) => string
    getScoreColor: (score: number) => string
    getProgressBarColor: (score: number) => string
}

export function AnalysisSidebar({
    articleContent,
    recommendationScore,
    tone,
    toneExplanation,
    bias,
    biasExplanation,
    supportedClaims,
    authorTrustability,
    publisherTrustability,
    authorPublisherExplanation,
    socialSentiment,
    socialScore,
    socialSentimentExplanation,
    recommendation,
    calculateContentScore,
    calculateSourceScore,
    getAnalysisColor,
    getScoreColor,
    getProgressBarColor
}: AnalysisSidebarProps) {
    return (
        <aside className="border-l bg-background p-6">
            <div className="space-y-6">
                <CredibilityScoreCard
                    articleContent={articleContent}
                    recommendationScore={recommendationScore}
                    getScoreColor={getScoreColor}
                    getProgressBarColor={getProgressBarColor}
                />

                <AnalysisCategoriesCard
                    articleContent={articleContent}
                    tone={tone}
                    toneExplanation={toneExplanation}
                    bias={bias}
                    biasExplanation={biasExplanation}
                    supportedClaims={supportedClaims}
                    authorTrustability={authorTrustability}
                    publisherTrustability={publisherTrustability}
                    authorPublisherExplanation={authorPublisherExplanation}
                    socialSentiment={socialSentiment}
                    socialScore={socialScore}
                    socialSentimentExplanation={socialSentimentExplanation}
                    calculateContentScore={calculateContentScore}
                    calculateSourceScore={calculateSourceScore}
                    getAnalysisColor={getAnalysisColor}
                    getScoreColor={getScoreColor}
                />

                <AnalysisNotesCard recommendation={recommendation} />
            </div>
        </aside>
    )
} 