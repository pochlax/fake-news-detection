"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardArticleTitle, CardSubtitle } from "@/components/ui/card"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Shield, Download, Menu, Loader2, FileText, Users, NewspaperIcon } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { UserIcon } from "@/components/layout/UserIcon"
import { CollapsibleSidebar } from "@/components/layout/CollapsibleSidebar"
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { toast } from "@/hooks/use-toast"
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image as PDFImage } from '@react-pdf/renderer';
import Image from "next/image"


export default function ArticleAnalyzer() {
    const router = useRouter()

    // useEffect(() => {
    //     // Check if user is authenticated
    //     const userId = localStorage.getItem('userId')
    //     if (!userId) {
    //         router.push('/')
    //     }
    // }, [router])

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

    // PDF Document component
    const EmptyReport = () => (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.title}>{"This PDF is empty"}</Text>
                </View>
            </Page>
        </Document>
    );

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
            // console.log("Fetching Complete, this is the value of articleContent", articleContent)

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

    const handleHistoryArticleSelect = (analysisResult: any) => {
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

    // PDF styles
    const styles = StyleSheet.create({
        page: { padding: 40 },
        title: { fontSize: 24, marginBottom: 10 },
        subtitle: { fontSize: 16, marginBottom: 20, color: '#666' },
        section: { marginBottom: 20 },
        heading: { fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
        subheading: { fontSize: 14, marginBottom: 5, fontWeight: 'bold' },
        text: { fontSize: 12, marginBottom: 10, lineHeight: 1.5 },
        score: { fontSize: 16, marginBottom: 10 },
        link: { fontSize: 10, color: '#0066cc', marginBottom: 5 },
        articleImage: {
            width: '100%',
            maxHeight: '200px',
            objectFit: 'contain',
            marginVertical: 10,
        },
        categoryIcon: {
            width: 20,
            height: 20,
            marginRight: 5,
        },
        iconRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 5,
        },
        blueText: { color: '#2563eb' },
        greenText: { color: '#16a34a' },
        orangeText: { color: '#f97316' },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
            padding: 10,
            borderBottom: 1,
            borderBottomColor: '#e5e7eb',
        },
        headerLogo: {
            width: 24,
            height: 24,
            marginRight: 8,
        },
        headerText: {
            fontSize: 16,
            fontWeight: 'bold',
        },
    });

    const file_textBase64 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAsJJREFUaEPtmc1qE1EUx/8npGsXZtLgqouZQfQBRNypi7oQanEZwWRisb6AILgSF76AlrZJBe2u+AGiiC5d+AJ+kImCCynkjuAD6BwZMCUZ5+PeO5NJB5Nt/vfc/+/MveckZwgl/1DJ/UMKwHS8KwCvEnAawGJO0J+YcXfQM3azxEsEWLo6bFQrtEuEs1k2SVrLRDcG27UHuvETAUxHvCPgjG5w2XXEWOv3jC1Z/bguFsB2RIcBraA6RsBYd3vGhuraJIBXDCwfBGTaoypu9zdrn1U3CfSWIzh1nQZELIDliJ8Ajow2Zb9ycrBz9GOqiRhBGCA4NkzYDMtVj1MSwETG3K4hVbHiAMMAQTy7La5lhZgpQACbFWLmAFkhDgVAFojCAGxH7DPQSCoKZsdbJ+b74XvEjGZcxy4MwHTESwIujJfl375/6+vDujtu2GqL6yBMdGYCvvW7xlJUgSgMwHa8FQY/1S3DcVWwMIC/zewtgHM6ELkDWK1hCxW6B8AIGRLw+aa7U98JGw1+HC5U6REY51Uh8gdwxDDC/MiXcLtGPc6k2fGaBH8VTKcAHJOBOVQAMoajOneul1jnCMkYH2mmDqBiRkc7B5DNgE52ZdbI7l9oH5AxXtgdSLjEKj4DbWTfmPoTsJL7gDJEuG/MAdIyUPojpHpGVPVpCRzF+3+rkGpGVfXzJ5CWgdJf4nkfmLwU//wBSjsBmatQ6Y+QalVR1U/9CagaUtXPAWQzoJpZWb3s/klvaFJnmbJmVHVm68cJqvgfxtbtu10jcvwSCyA7y1Q1l6a317zj/At3QHz5QMt44faMi0pjFbvtXWLiJ2kbFvE9V/zlwdbiayWAQGw5QnuWmRcYAc/7XWMlLl7qi27dWWY+APzGX/CbXzYawRgz8iP14k5nlqkNQPgOpvdMeDbYrj1OiyMFkBZklt+XHuAPPV0FTzN7JvcAAAAASUVORK5CYII=+3iV5As1k7lUSwsNRCWCxEK/vFTox4BA8heAEx1nsFwcrCQsFKsHj+KSWbHCGbJ1EjSTDJZteAgqlCMvO+mfnNmxE0/Ij0+fN7g860Jo4VbANmJVtwp7fYeTg1XotsMwDL8fsCepUHZw2edI1uESQDsJ1BAGIG1IZ021dFINvx1ee/R8ACZCii7suZ6eV9coAPR+kame95pwQQiqijq9Y1sAg8hyJaz0MmAsSBLBx4ZhlkXIAPzCalXD7058IhcUktUPfSba8kWY8FqGqGdIlLAfa+f4Ng9T0axa08N9bi17idpzRxAmwBRl6jiQFV3TUyoOZ9IOmu3wPIaFCUTkqb2hk0DvjXIK7A6BetCZH/pAaZKVkngyUn2FSoSyCQrvE1n35iZebj6EvX2P12XFdNyYqMPCXUxRB1lN5qpauxTomKbN8Ajbn4GdX54b4AAAAASUVORK5CYII='
    const file_textBase64Uri = `data:image/png;base64,${file_textBase64}`
    const newspaper_Base64 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAyRJREFUaEPtWk1rE1EUPXdS1wqSl6JLRaX9A4orRcG+2lKl3dSZQtH/4EaloiD+BoVKZ+xCq6JtJ2DRlQvRtUVxbbUziG5cCMlcmdZpkubjvcnMJE1pVgnv3nvOmXvfx7wbQo9/qMf5oy0BYk5aMDAG5pMAHcr2IfAaiN4D9MIzl53tWLEE5GdlP/XhMYCz2ZJuGn0FuT7Lm3y1HlnEEiBs+Q7A6S6R/w9Lbzxr+VxsAQVbXmPgQXfJb6IzY9qfch+F37UzIGxZBHChIoAWyjnj5s/Jxc9Zijo4P3IiVw7uADwe4TCw6FvuaFwBvwHsj4IYxIM/zOJqluSj2P3O0EDA9KmCxWueVTwcVwBXk/UsVzt7aYgUtmyIr02iWYA0yOnEyFxA3hkaJ6a7AI7rEGph84WJb/hmcaHaJnMBwpZhjQ4kJB+5r3qWO9hpATU1mlTI9jnWiQzsLgFxVynVItHxDHRVwMZpk3AZwCkAhUb1rFujunMhlQyI+dECyiUbwHkV8I4UkJ+Tb4lwRkU+HFcJ0InRykYVPxrf2okLc8NXmfihLrAKQDdOMztV/DoBwpYugKFmp02NGu3uRiZs2fK0qRKweZQw7gF8NOHTb+8ooSKoGk9IWumu3AdUBFXjSgYJDfYE7PoM5G05TcB9APmE1eIzcN233Fn94zSDhCODKgf2LNfQCRDZCFt6KZCPwvme5Qod/M2NbE8A0PMllLDule6tl9GZGUMc+VCuihJ4lpvTqUElckoGewJ29j6QQgm1MYkbrvfNKi7zEmpzH6hb79sT8GQiJ/7+KVU5lz3L7YsziXteQHdLKIUMpLRaNg3Teg70vAAAwpa/AByIHgEbxjH/ytLX8Hd9gwHfPcvNuDtZSUYr/K1bie0tJCI8LRm5W/uCkhGwcbumxcNY8qfckazLpvLwmuNXBDgXL4GD550glRSDiaVvFsOeXW2Tr/5qJSlUBv6El57pjkWRa1pMG1eLQckBY6sPmwGFJCFXiEvm+tTr8OVp49OwRyacYRMcTAAUXu4mfUVMQjj0/QbgI4ieJf6rQVImWfhrdymzAE8j5j9g7X5P76H8oQAAAABJRU5ErkJggg==/ruBL9Nyz4DMITQ/Vo4ctSsHisb6I3ag3D6LNSCrFNNk23dKCuWZ3ft98M7NDmPNHpvjetVilBVyCsQegaKmhC8IDf6ESXqgXM6AmGkQ4tAw8dJwZN+G5OjICioF4Z2CJHZTCU/VkA1qplUsOURvAq5bKMwL8QHAcVEtl/J8HTN6fCOAF5UcCbY0LzOB2KJvb8RlrwOBCnvJBxlMDRlmWtjQDGNWWJkWmLPIB5raMtFRu0tOpLUq3ZVrRJEUGoaXP1K6xyONSzFOdZ1m/TecLYJBfFxEA1lI5JqAXiA4B6+PnAM+hVBtZi+YOqFYdf63TA5Dpmtk8Ff8BMKoGjD/fk/UZnuTbA9f//PgG0NNSFWyKPDOA7Sxk3iK/Jt5AWOYo2nRcLDI7rcHCsA1erO/vJO/3B82bwYpMC2FwI5TN419AvORdXIEQvyWererU+S6Ae7iFij656061Em0E/AAyYTYoaW+vJwAAAABJRU5ErkJggg=='
    const newspaper_Base64Uri = `data:image/png;base64,${newspaper_Base64}`
    const users_Base64 = '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'
    const users_Base64Uri = `data:image/png;base64,${users_Base64}`
    const shield_Base64 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAA8RJREFUaEPtmVnITVEUx38fkimzzFMoUSRTyIN4MSeRjxfFgxQpmcoUQjIU4UGEzFMyJ/LEgykZH8wzmfJgSInzr320Xefcs8+959x8dVZ9fd2z915r/fdee+29/6uMCi5lKfvfCagC3EzLTloA+gIHgObG8ZfAWOBS0kCSBiB9C4BFQKUcZ3+athVJgkgSQH1gPzAowsHTQDnwOQkgSQCQjknAcqCRo1NvgLnATm+1fjmOCexWLIABwBqgW4D2V8AY4+AhoFlAn2vALOBCoSDiAKgFNAaaAoOB8UCbEMPngXHAe9PeENgHDAzp/wjYA5wBtDoPXQFFARgJzAY6A3UclS4Elob01QZf4qhHe+SOCc2TYWPyARgGHHc0pm7HgHleurwbMUZnw0pgeAzdQ4FTQf3zAbgIKJ/nE4XICW/zbgSuxnBIXXt74TLFAGkQMVbnR7+4AD4Bda1B+n3f/GlpzwFXYjod1r2XSb8K1Q5Ae6Ce1fkjEAgy3wrkpreo/ZIQlj9qnOxnAJKedktftgJOM5CtQPgMOE1gtomzEMpCqMgZyEKoyAnMstD/HEJfgeqWgzWAbyk6bKuWrS/WB/lSM+574DnQwhrUymMf9K0U0hp4Yhl6BujbP5JvD9wAulojxDzoWymkR85j6br3vO0eF4BIKtGBvkwEdpTCe2CyR0tusWyJsZgQF8A0YL01SNyOeJ5SyFFAjIgvUz1KZ3NcAAoZLZ0vP4AmgN7GaYrYvRcenVLVMtIFuBUXgPaHHvHtrIHie8T7pCkif0U7+iLSy/bhL9tRD/UZHqG1zhqh1Cbm4GlKCOTobY83qmbpn+4xEhvC7EUBqA28BpSXfRFf1L9YUjbAIdHxl3OyjfK/Qkr/AyUKgAbNMUyarWAmsDbhVQiyI+J3dT47LgAqm8qKyCdfVKwQx38wIRBKkUrRsuWLmOueUSvtAkAKOwL3ApwVWbusSBDzQ8hgMXQPonS7ApCeEcBhU7Sz9Yrb12q8jTKW0y6qfi+gGoMtStc6A0S1R0ocAFIWxliL5F1sSN5Io4Ayi1ZPdYNcCWWigxTHBSAdfUwtrGWAwsfGsd0hKBTrOkvaBrTrojg6LmFcCADZVkFvl6nUBPn6wbRvNY2628j5MBr9rLl3xS78FQrAd1qxvyrn2u0SQn4fXRlUAdJeKEiKBSCjOuR09Ctn2ydoPoe+m/yua0PoIeWCKAkAvh09eHRr1LVbGSZI3gHbgE2AHilFS5IAbGeGmDv9KPPxiFfR3B6z5uYELi0ATsaT6FThAfwGfE+sMW/pOPYAAAAASUVORK5CYII='
    const shield_Base64Uri = `data:image/png;base64,${shield_Base64}`


    const AnalysisReport = ({ data }: { data: any }) => (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <PDFImage src={shield_Base64Uri} style={styles.headerLogo} />
                    <Text style={styles.headerText}>de(fnd)</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.title}>{data.title}</Text>
                    <Text style={styles.subtitle}>Written By: {data.author}</Text>
                    {/* {data.input_topImage && (
                        <PDFImage
                            source={{
                                uri: data.input_topImage,
                                method: 'GET',
                                body: null,
                                headers: {}
                            }}
                            style={styles.articleImage}
                        />
                    )} */}
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>Introduction</Text>
                    <Text style={styles.text}>{data.article_summary}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>Analysis Categories</Text>

                    <View style={styles.iconRow}>
                        <PDFImage src={file_textBase64Uri} style={[styles.categoryIcon]} />
                        <Text style={styles.subheading}>Content Analysis</Text>
                    </View>
                    <Text style={styles.text}>{data.content_analysis}</Text>

                    <Text style={styles.text}>Tone: {data.tone}</Text>
                    <Text style={styles.text}>{data.tone_explanation}</Text>

                    <Text style={styles.text}>Bias: {data.bias}</Text>
                    <Text style={styles.text}>{data.bias_explanation}</Text>

                    <View style={styles.iconRow}>
                        <PDFImage src={newspaper_Base64Uri} style={[styles.categoryIcon]} />
                        <Text style={styles.subheading}>Source Credibility</Text>
                    </View>
                    <Text style={styles.text}>{data.author_publisher_explanation}</Text>
                    <Text style={styles.text}>Author: {data.author}</Text>
                    <Text style={styles.text}>Publisher: {data.publisher}</Text>

                    <View style={styles.iconRow}>
                        <PDFImage src={users_Base64Uri} style={[styles.categoryIcon]} />
                        <Text style={styles.subheading}>Social Analysis</Text>
                    </View>
                    <Text style={styles.text}>{data.reddit_sentiment_summary}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>Conclusion</Text>
                    <Text style={styles.text}>{data.recommendation}</Text>
                    <Text style={styles.score}>Credibility Score: {data.recommendation_score}%</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>Appendix - References</Text>
                    {/* Content Analysis URLs */}
                    {data.content_analysis_biblio?.map((link: string, index: number) => (
                        <Text key={`content-${index}`} style={[styles.link, styles.blueText]}>{link}</Text>
                    ))}
                    {/* Source Analysis URLs */}
                    {data.source_analysis_biblio?.map((link: string, index: number) => (
                        <Text key={`source-${index}`} style={[styles.link, styles.greenText]}>{link}</Text>
                    ))}
                    {/* Reddit URLs */}
                    {data.reddit_posts?.map((post: any, index: number) => (
                        <Text key={`reddit-${index}`} style={[styles.link, styles.orangeText]}>{post.url}</Text>
                    ))}
                </View>
            </Page>
        </Document>
    );

    // Modify handleDownloadReport to update the state
    const handleDownloadReport = async () => {
        try {
            console.log("Pressed! ArticleID:", articleId)
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
                        <header className="border-b bg-white dark:bg-gray-800 px-4 py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {!isOpen && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hover:bg-accent"
                                            onClick={() => setIsOpen(!isOpen)}
                                        >
                                            <Menu className="h-5 w-5" />
                                        </Button>
                                    )}
                                    <div className="flex items-center gap-2" onClick={handleLandingPage}>
                                        <Shield className="h-5 w-5" />
                                        <h1 className="text-lg font-semibold">de(fnd)</h1>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {pdfLoading != PDFStatus.NOT_STARTED ? (
                                        <PDFDownloadLink
                                            document={pdfDocument}
                                            fileName={`analysis-report-${articleTitle}.pdf`}
                                        >
                                            <Button variant="ghost" disabled={pdfLoading == PDFStatus.IN_PROGRESS}>
                                                <Download className="mr-2 h-4 w-4" />
                                                {pdfLoading == PDFStatus.IN_PROGRESS ? 'Generating...' : 'Download Report'}
                                            </Button>

                                        </PDFDownloadLink>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            onClick={handleDownloadReport}
                                            disabled={!articleContent}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Prepare PDF Report
                                        </Button>
                                    )}


                                    <Button onClick={resetAnalysis}>Analyze New Article</Button>
                                    <UserIcon />
                                </div>
                            </div>
                        </header>

                        {/* Content area with loading overlay */}
                        <div className="flex-1 relative">
                            {isAnalyzing && !articleContent && (
                                <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-50">
                                    <p className="text-lg font-medium mb-4">Analyzing</p>
                                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                                    <p className="text-sm text-gray-600 text-center max-w-md px-4">
                                        We are generating your analysis, feel free to explore other reports and we will alert you when the analysis is complete!
                                    </p>
                                </div>
                            )}

                            {!articleContent ? (
                                <div className="flex-grow flex flex-col items-center justify-center p-6 min-h-screen">
                                    <h1 className="text-4xl font-semibold mb-8">What can I help you analyze? 🔍</h1>
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

                                    <div className="w-full max-w-5xl mt-16">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-2xl font-semibold">Trending Articles 📈</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <Card className="group cursor-pointer hover:shadow-lg transition-shadow">
                                                <CardContent className="p-0">
                                                    <div className="aspect-[2/1] bg-muted relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0 z-10" />
                                                        <Image
                                                            src="https://picsum.photos/800/400?random=14"
                                                            alt="Article thumbnail"
                                                            width={800}
                                                            height={400}
                                                            className="object-cover w-full h-full"
                                                        />
                                                        <div className="absolute bottom-4 left-4 right-4 z-20">
                                                            <p className="text-white font-medium line-clamp-2">
                                                                Breaking News: Major Tech Company Announces Revolutionary AI Development
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="p-4">
                                                        <p className="text-sm text-muted-foreground">TechNews • 2 hours ago</p>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="group cursor-pointer hover:shadow-lg transition-shadow">
                                                <CardContent className="p-0">
                                                    <div className="aspect-[2/1] bg-muted relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0 z-10" />
                                                        <Image
                                                            src="https://picsum.photos/800/400?random=20"
                                                            alt="Article thumbnail"
                                                            width={800}
                                                            height={400}
                                                            className="object-cover w-full h-full"
                                                        />
                                                        <div className="absolute bottom-4 left-4 right-4 z-20">
                                                            <p className="text-white font-medium line-clamp-2">
                                                                Global Climate Summit Reaches Historic Agreement
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="p-4">
                                                        <p className="text-sm text-muted-foreground">WorldNews • 5 hours ago</p>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="group cursor-pointer hover:shadow-lg transition-shadow">
                                                <CardContent className="p-0">
                                                    <div className="aspect-[2/1] bg-muted relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0 z-10" />
                                                        <Image
                                                            src="https://picsum.photos/800/400?random=5"
                                                            alt="Article thumbnail"
                                                            width={800}
                                                            height={400}
                                                            className="object-cover w-full h-full"
                                                        />
                                                        <div className="absolute bottom-4 left-4 right-4 z-20">
                                                            <p className="text-white font-medium line-clamp-2">
                                                                New Study Reveals Breakthrough in Medical Research
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="p-4">
                                                        <p className="text-sm text-muted-foreground">HealthNews • 8 hours ago</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Analysis content
                                <div className="flex-grow grid md:grid-cols-[1fr_300px]">
                                    {/* Main Content - Article Text */}
                                    <main className="p-6">
                                        <Card className="col-span-1">
                                            <CardHeader>
                                                <CardArticleTitle>{articleTitle}</CardArticleTitle>
                                                <CardSubtitle>Written By: {articleAuthor}</CardSubtitle>
                                                <div className="mt-4 flex justify-center">
                                                    {articleContent && (
                                                        <div className="max-w-2xl w-[600px] h-[300px] relative rounded-lg overflow-hidden">
                                                            <Image
                                                                src={articleImageUrl || "https://picsum.photos/800/400?random=389"}
                                                                // src="https://i.cbc.ca/1.2564638.1394235533!/fileImage/httpImage/image.jpg_gen/derivatives/16x9_1180/tea-testing-852-jpg.jpg?im=Resize%3D780"
                                                                alt="Article featured image"
                                                                width={600}
                                                                height={300}
                                                                className="object-cover"
                                                                priority
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="prose max-w-none dark:prose-invert">
                                                {error && (
                                                    <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
                                                        {error}
                                                    </div>
                                                )}
                                                {!articleContent ? (
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

                                        {/* <iframe
                                        src="http://localhost:5000/proxy"
                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                        title="Embedded Website"
                                    ></iframe> */}
                                    </main>

                                    {/* Right Sidebar - Analysis */}
                                    <aside className="border-l bg-background p-6">
                                        <div className="space-y-6">
                                            {/* Credibility Score Card */}
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

                                            {/* Analysis Categories Card */}
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
                                                                    {/* <div className="flex justify-between">
                                                                <span>Share Pattern</span>
                                                                <span className="font-medium text-green-600">Organic</span>
                                                            </div> */}
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                </CardContent>
                                            </Card>

                                            {/* Analysis Notes Card */}
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
                                        </div>
                                    </aside>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main >
        </ProtectedRoute >
    )
}

