"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { ArrowLeft, Download } from 'lucide-react'
import { Progress } from "@/components/ui/progress"

export default function ArticleAnalyzer() {
    const [inputUrl, setInputUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [articleTitle, setArticleTitle] = useState('Article Content');
    const [articleContent, setArticleContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [tone, setTone] = useState<string>('');
    const [toneExplanation, setToneExplanation] = useState<string>('');
    const [bias, setBias] = useState<string>('');
    const [biasExplanation, setBiasExplanation] = useState<string>('');
    const [supportedClaims, setSupportedClaims] = useState<string>('');

    const [authorTrustability, setAuthorTrustability] = useState<string>('');
    const [publisherTrustability, setPublisherTrustability] = useState<string>('');
    const [authorPublisherExplanation, setAuthorPublisherExplanation] = useState<string>('');


    const [socialSentiment, setSocialSentiment] = useState<string>('');
    const [socialSentimentExplanation, setSocialSentimentExplanation] = useState<string>('');

    const [socialScore, setSocialScore] = useState<number>(0);

    const [recommendation, setRecommendation] = useState<string>('');
    const [recommendationScore, setRecommendationScore] = useState<number>(0);

    const handleAnalyze = async () => {
        try {
            setIsAnalyzing(true);
            setError(null);

            const response = await fetch('http://localhost:5000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: inputUrl
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setArticleContent(result.article || 'No article content available');
            setArticleTitle(result.title || 'Article Content');

            // Update tone and bias from response
            setTone(result.tone || 'Unknown');
            setToneExplanation(result.tone_explanation || '');
            setBias(result.bias || 'Unknown');
            setBiasExplanation(result.bias_explanation || '');
            setSupportedClaims(result.supported_claims || '');

            setAuthorTrustability(result.author_trustability || '');
            setPublisherTrustability(result.publisher_trustability || '');
            setAuthorPublisherExplanation(result.author_publisher_explanation || '');

            setSocialSentiment(result.reddit_comments_sentiment || '');
            setSocialScore(result.reddit_sentiment_value || 0);
            setSocialSentimentExplanation(result.reddit_sentiment_summary || '');

            setRecommendation(result.recommendation || '');
            setRecommendationScore(result.recommendation_score || 0);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Analysis error:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Add new function to format article text with paragraphs
    const formatArticleText = (text: string) => {
        if (!text) return '';
        // Split text by double newlines or single newlines
        const paragraphs = text.split(/\n\n|\n/).filter(p => p.trim());
        return paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0">
                {paragraph.trim()}
            </p>
        ));
    };

    // Helper function to get color based on analysis type
    const getAnalysisColor = (type: string, value: string): string => {
        const colorMap: Record<string, string> = {
            // Tone colors
            'Satirical': 'text-red-600',
            'Sensational': 'text-orange-600',
            'Persuasive': 'text-yellow-600',
            'Optimisitic': 'text-purple-600',
            'Critical': 'text-blue-600',
            'Informative': 'text-green-600',
            // Bias colors
            'None': 'text-green-600',
            'Minimal': 'text-blue-600',
            'Moderate': 'text-yellow-600',
            'Strong': 'text-red-600',
            // Support Claims colors
            'Well-Supported': 'text-green-600',
            'Reasonably-Supported': 'text-blue-600',
            'Speculative/ Anecdotal': 'text-yellow-600',
            'Misleading': 'text-red-600',

            // Trustability colors
            'Trusted': 'text-green-600',
            'Somewhat-Reliable': 'text-blue-600',
            'Questionable': 'text-yellow-600',
            'Untrustable': 'text-red-600',

            // Social Sentiment colors
            'Positive': 'text-green-600',
            'Mixed': 'text-blue-600',
            'Negative': 'text-red-600',
        };
        return colorMap[value] || 'text-gray-600';
    };

    // Add function to calculate content score
    const calculateContentScore = (): number => {
        let score = 0;
        let total = 0;

        // Score based on tone (0-100)
        const toneScores: Record<string, number> = {
            'Informative': 100,
            'Optimistic': 80,
            'Persuasive': 60,
            'Critical': 40,
            'Sensational': 20,
            'Satirical': 0
        };
        if (tone && tone in toneScores) {
            score += toneScores[tone];
            total += 100;
        }

        // Score based on bias (0-100)
        const biasScores: Record<string, number> = {
            'None': 100,
            'Minimal': 75,
            'Moderate': 50,
            'Strong': 0
        };
        if (bias && bias in biasScores) {
            score += biasScores[bias];
            total += 100;
        }

        // Score based on supported claims (0-100)
        const claimScores: Record<string, number> = {
            'Well-Supported': 100,
            'Reasonably-Supported': 75,
            'Speculative/ Anecdotal': 25,
            'Misleading': 0
        };
        if (supportedClaims && supportedClaims in claimScores) {
            score += claimScores[supportedClaims];
            total += 100;
        }

        // Calculate percentage (if no categories are available, return 0)
        return total > 0 ? Math.round((score / total) * 100) : 0;
    };

    // Add function to calculate content score
    const calculateSourceScore = (): number => {
        let score = 0;
        let total = 0;

        // Score based on author (0-100)
        const authorScores: Record<string, number> = {
            'Trusted': 100,
            'Somewhat-Reliable': 75,
            'Questionable': 50,
            'Untrustable': 25
        };
        if (authorTrustability && authorTrustability in authorScores) {
            score += authorScores[authorTrustability];
            total += 100;
        }

        // Score based on publisher (0-100)
        const publisherScores: Record<string, number> = {
            'Trusted': 100,
            'Somewhat-Reliable': 75,
            'Questionable': 50,
            'Untrustable': 25
        };
        if (publisherTrustability && publisherTrustability in publisherScores) {
            score += publisherScores[publisherTrustability];
            total += 100;
        }

        // Calculate percentage (if no categories are available, return 0)
        return total > 0 ? Math.round((score / total) * 100) : 0;
    };

    // Get color for the score badge
    const getScoreColor = (score: number): string => {
        if (score >= 80) return 'bg-green-100 text-green-600';
        if (score >= 60) return 'bg-blue-100 text-blue-600';
        if (score >= 40) return 'bg-yellow-100 text-yellow-600';
        return 'bg-red-100 text-red-600';
    };

    const getProgressBarColor = (score: number): string => {
        if (score >= 80) return 'bg-green-600';
        if (score >= 60) return 'bg-blue-600';
        if (score >= 40) return 'bg-yellow-500';
        return 'bg-red-600';
    };

    return (
        <main className="container mx-auto py-6 pb-32">
            <div className="min-h-screen bg-gray-50">
                <header className="border-b bg-white px-4 py-3">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <h1 className="text-lg font-semibold">Article Credibility Analysis</h1>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost">
                                <Download className="mr-2 h-4 w-4" />
                                Download Report
                            </Button>
                            <Button>Analyze New Article</Button>
                        </div>
                    </div>
                </header>

                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <Card className="w-[400px] shadow-lg">
                        <CardContent className="p-3">
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={inputUrl}
                                    onChange={(e) => setInputUrl(e.target.value)}
                                    disabled={isAnalyzing}
                                    placeholder="Enter article URL to analyze..."
                                    className="flex-1 px-3 py-2 rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    aria-label="Article URL input"
                                />
                                <Button
                                    size="sm"
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || !inputUrl}
                                >
                                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <main className="mx-auto grid max-w-7xl gap-6 p-6 md:grid-cols-[300px_1fr_300px]">
                    {/* Left Sidebar - Score */}
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

                    {/* Main Content - Article Text */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>{articleTitle}</CardTitle>
                        </CardHeader>
                        <CardContent className="prose max-w-none dark:prose-invert">
                            {error && (
                                <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
                                    {error}
                                </div>
                            )}
                            {isAnalyzing ? (
                                <div className="text-center py-4">
                                    <p>Analyzing article...</p>
                                </div>
                            ) : (
                                <div>
                                    {formatArticleText(articleContent || '')}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Sidebar - Analysis Categories */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Analysis Categories</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="content">
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-2">
                                                Content Analysis
                                                {articleContent && ( // Only show score if article content exists
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
                                                Source Credibility
                                                {articleContent && ( // Only show score if article content exists
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
                                                Social Analysis
                                                {articleContent && ( // Only show score if article content exists
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
                                                {/* <div className="flex justify-between">
                                                <span>Share Pattern</span>
                                                <span className="font-medium text-green-600">Organic</span>
                                            </div> */}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card >

                        <Card>
                            <CardHeader>
                                <CardTitle>Analysis Report</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                <p>
                                    {recommendation}
                                </p>
                            </CardContent>
                        </Card>
                    </div >
                </main >
            </div >
        </main >

    )
}

