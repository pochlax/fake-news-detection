"use client"

import { useState, useEffect, useRef } from "react"
import { CollapsibleSidebar } from "@/components/layout/CollapsibleSidebar"
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { toast } from "@/hooks/use-toast"
import { AnalyzerNavbar } from "@/components/layout/AnalyzerNavbar"
import { LoaderOverlay } from "@/components/layout/LoaderOverlay"
import { URLInput } from "@/components/layout/URLInput"
import { TrendingArticles } from "@/components/layout/TrendingArticles"
import { ArticleContent } from "@/components/layout/ArticleContent"
import { AnalysisSidebar } from "@/components/layout/AnalysisSidebar"
import { EmptyReport, AnalysisReport } from "@/utils/pdf"
import { AnalysisData } from "@/types/analysis"
import {
    getAnalysisColor,
    getScoreColor,
    getProgressBarColor,
    calculateContentScore,
    calculateSourceScore
} from "@/utils/analysis"


export default function ArticleAnalyzer() {
    const router = useRouter()

    const [articleId, setArticleId] = useState<string | null>(null);
    const [inputUrl, setInputUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [articleTitle, setArticleTitle] = useState('Article Content');
    const [articleContent, setArticleContent] = useState<string | null>(null);
    const [articleAuthor, setArticleAuthor] = useState<string>('')
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
    const [isOpen, setIsOpen] = useState(false)
    const [articleImageUrl, setArticleImageUrl] = useState<string | null>(null);

    enum PDFStatus {
        NOT_STARTED = 'not started',
        IN_PROGRESS = 'in progress',
        COMPLETE = 'complete',
    }

    const [pdfLoading, setPdfLoading] = useState<PDFStatus>(PDFStatus.NOT_STARTED)

    const [currentAnalysis, setCurrentAnalysis] = useState<{ url: string; title: string; } | null>(null);
    const shouldContinueRef = useRef<boolean>(true);

    // Create a state to store the PDF document
    const [pdfDocument, setPdfDocument] = useState<React.ReactElement>(<EmptyReport />);

    // Reset on unmount
    useEffect(() => {
        return () => {
            shouldContinueRef.current = false;
        };
    }, []);

    const handleLandingPage = () => {
        router.push('/')
    }

    const handleAnalyze = async () => {
        shouldContinueRef.current = true;

        try {
            setIsAnalyzing(true);
            setError(null);
            setArticleId(null)
            setPdfLoading(PDFStatus.NOT_STARTED)
            setArticleImageUrl(null)

            // Set current analysis
            setCurrentAnalysis({
                url: inputUrl,
                title: new URL(inputUrl).hostname // Or any placeholder title
            });

            // setArticleContent(null);

            // Get userId from localStorage
            const userId = localStorage.getItem('userId');
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await fetch('http://localhost:5000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                    'user-id': userId  // Add userId to headers
                },
                body: inputUrl
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (shouldContinueRef.current) {
                setArticleId(result.article_id || null)
                setArticleContent(result.article || 'No article content available');
                setArticleTitle(result.title || 'Article Content');
                setArticleAuthor(result.author || 'Unknown Author')
                setArticleImageUrl(result.topImage || null)

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
            } else {
                toast({
                    title: "Analysis Complete",
                    description: "Your article analysis is ready to view!",
                    duration: 3000
                });
            }

            // Clear current analysis
            setCurrentAnalysis(null);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Analysis error:', err);
            setCurrentAnalysis(null);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleHistoryArticleSelect = (analysisResult: AnalysisData) => {
        shouldContinueRef.current = false;

        // Update all the states with the analysis result
        setArticleContent(analysisResult.article || 'No article content available')
        setArticleId(analysisResult.article_id || null)
        setArticleTitle(analysisResult.title || 'Article Content')
        setArticleAuthor(analysisResult.author || 'Unknown Author')
        setArticleImageUrl(analysisResult.topImage || null)
        setTone(analysisResult.tone || 'Unknown')
        setToneExplanation(analysisResult.tone_explanation || '')
        setBias(analysisResult.bias || 'Unknown')
        setBiasExplanation(analysisResult.bias_explanation || '')
        setSupportedClaims(analysisResult.supported_claims || '')
        setAuthorTrustability(analysisResult.author_trustability || '')
        setPublisherTrustability(analysisResult.publisher_trustability || '')
        setAuthorPublisherExplanation(analysisResult.author_publisher_explanation || '')
        setSocialSentiment(analysisResult.reddit_comments_sentiment || '')
        setSocialScore(analysisResult.reddit_sentiment_value || 0)
        setSocialSentimentExplanation(analysisResult.reddit_sentiment_summary || '')
        setRecommendation(analysisResult.recommendation || '')
        setRecommendationScore(analysisResult.recommendation_score || 0)
        setPdfLoading(PDFStatus.NOT_STARTED)
    }

    // Add new function to format article text with paragraphs
    const formatArticleText = (text: string) => {
        if (!text) return [<p key="empty"></p>]; // Return empty paragraph instead of empty string
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

    const resetAnalysis = () => {
        setArticleId(null)
        setInputUrl('')
        setArticleContent(null)
        setArticleTitle('Article Content')
        setArticleAuthor('')
        setTone('')
        setToneExplanation('')
        setBias('')
        setBiasExplanation('')
        setSupportedClaims('')
        setAuthorTrustability('')
        setPublisherTrustability('')
        setAuthorPublisherExplanation('')
        setError(null)
        setIsAnalyzing(false)
        setPdfDocument(<EmptyReport />)
        setPdfLoading(PDFStatus.NOT_STARTED)
    }

    const fetchArticleData = async (articleId: string) => {
        const userId = localStorage.getItem('userId');
        if (!userId) throw new Error('User not authenticated');

        const response = await fetch(`http://localhost:5000/fetchArticle/${articleId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    };

    // Modify handleDownloadReport to use the imported components
    const handleDownloadReport = async () => {
        try {
            setPdfLoading(PDFStatus.IN_PROGRESS)
            if (!articleId) throw new Error('Article ID is required');
            const articleData = await fetchArticleData(articleId);
            setPdfDocument(<AnalysisReport data={articleData} />);
            setPdfLoading(PDFStatus.COMPLETE)
        } catch (error) {
            console.error('Error generating report:', error);
            toast({
                title: "Error",
                description: "Failed to generate report",
                variant: "destructive"
            });
        }
    };

    return (
        <ProtectedRoute>
            <main className="pb-1">
                <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
                    <CollapsibleSidebar
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        onArticleSelect={handleHistoryArticleSelect}
                        currentAnalysis={currentAnalysis}
                        isAnalyzing={isAnalyzing}
                    />

                    <div className={`flex flex-col flex-grow transition-all duration-300 relative ${isOpen ? 'ml-60' : 'ml-0'}`}>
                        <AnalyzerNavbar
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                            handleLandingPage={handleLandingPage}
                            pdfLoading={pdfLoading}
                            pdfDocument={pdfDocument}
                            articleTitle={articleTitle}
                            handleDownloadReport={handleDownloadReport}
                            articleContent={articleContent}
                            resetAnalysis={resetAnalysis}
                        />

                        <div className="flex-1 relative">
                            {isAnalyzing && !articleContent && <LoaderOverlay />}

                            {!articleContent ? (
                                <div className="flex-grow flex flex-col items-center justify-center p-6 min-h-screen">
                                    <h1 className="text-4xl font-semibold mb-8">What can I help you analyze? 🔍</h1>
                                    <URLInput
                                        inputUrl={inputUrl}
                                        setInputUrl={setInputUrl}
                                        isAnalyzing={isAnalyzing}
                                        handleAnalyze={handleAnalyze}
                                    />
                                    <TrendingArticles />
                                </div>
                            ) : (
                                <div className="flex-grow grid md:grid-cols-[1fr_300px]">
                                    <ArticleContent
                                        articleTitle={articleTitle}
                                        articleAuthor={articleAuthor}
                                        articleImageUrl={articleImageUrl}
                                        articleContent={articleContent}
                                        error={error}
                                        formatArticleText={formatArticleText}
                                    />

                                    <AnalysisSidebar
                                        articleContent={articleContent}
                                        recommendationScore={recommendationScore}
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
                                        recommendation={recommendation}
                                        calculateContentScore={() => calculateContentScore(tone, bias, supportedClaims)}
                                        calculateSourceScore={() => calculateSourceScore(authorTrustability, publisherTrustability)}
                                        getAnalysisColor={getAnalysisColor}
                                        getScoreColor={getScoreColor}
                                        getProgressBarColor={getProgressBarColor}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    )
}

