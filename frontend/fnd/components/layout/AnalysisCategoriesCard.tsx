import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { FileText, Users, NewspaperIcon } from 'lucide-react'

interface AnalysisCategoriesCardProps {
    articleContent: string | null
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
    calculateContentScore: () => number
    calculateSourceScore: () => number
    getAnalysisColor: (type: string, value: string) => string
    getScoreColor: (score: number) => string
}

export function AnalysisCategoriesCard({
    articleContent,
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
    calculateContentScore,
    calculateSourceScore,
    getAnalysisColor,
    getScoreColor
}: AnalysisCategoriesCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Analysis Categories</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="content">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-600" />
                                Content Analysis
                                {articleContent && (
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getScoreColor(calculateContentScore())}`}>
                                        {calculateContentScore()}%
                                    </span>
                                )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="grid gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Tone</span>
                                    <span className={`font-medium ${getAnalysisColor('tone', tone)}`}>
                                        {tone || 'Analyzing...'}
                                    </span>
                                </div>
                                {toneExplanation && (
                                    <div className="mt-1 text-xs text-gray-600">
                                        {toneExplanation}
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Bias</span>
                                    <span className={`font-medium ${getAnalysisColor('bias', bias)}`}>
                                        {bias || 'Analyzing...'}
                                    </span>
                                </div>
                                {biasExplanation && (
                                    <div className="mt-1 text-xs text-gray-600">
                                        {biasExplanation}
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Claims</span>
                                    <span className={`font-medium ${getAnalysisColor('supportedClaims', supportedClaims)}`}>
                                        {supportedClaims || 'Analyzing...'}
                                    </span>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="source">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2">
                                <NewspaperIcon className="h-4 w-4 text-gray-600" />
                                Source Credibility
                                {articleContent && (
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getScoreColor(calculateSourceScore())}`}>
                                        {calculateSourceScore()}%
                                    </span>
                                )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="grid gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Author Trustability</span>
                                    <span className={`font-medium ${getAnalysisColor('authorTrustability', authorTrustability)}`}>
                                        {authorTrustability || 'Analyzing...'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Publisher Reputation</span>
                                    <span className={`font-medium ${getAnalysisColor('publisherTrustability', publisherTrustability)}`}>
                                        {publisherTrustability || 'Analyzing...'}
                                    </span>
                                </div>
                                {authorPublisherExplanation && (
                                    <div className="mt-1 text-xs text-gray-600">
                                        {authorPublisherExplanation}
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="social">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-600" />
                                Social Analysis
                                {articleContent && (
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getScoreColor(socialScore)}`}>
                                        {socialScore}%
                                    </span>
                                )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="grid gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Social Sentiment (Reddit)</span>
                                    <span className={`font-medium ${getAnalysisColor('socialSentiment', socialSentiment)}`}>
                                        {socialSentiment || 'Analyzing...'}
                                    </span>
                                </div>
                                {socialSentimentExplanation && (
                                    <div className="mt-1 text-xs text-gray-600">
                                        {socialSentimentExplanation}
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    )
} 