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

      // Update other UI elements based on the response
      // You can add more state variables and update them here

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
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
              <span className="text-6xl font-bold text-green-600">85%</span>
              <Progress value={85} className="mt-2 [&>div]:bg-green-600" />
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
              <p>
                {articleContent || `Original content...`}
              </p>
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
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
                        90%
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tone</span>
                        <span className="font-medium text-green-600">Neutral</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bias</span>
                        <span className="font-medium text-yellow-600">Minimal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Claims</span>
                        <span className="font-medium text-green-600">Well-supported</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="source">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      Source Credibility
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
                        85%
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Author Expertise</span>
                        <span className="font-medium text-green-600">High</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Publisher Reputation</span>
                        <span className="font-medium text-green-600">Trusted</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="social">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      Social Analysis
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-600">
                        75%
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Social Sentiment</span>
                        <span className="font-medium text-yellow-600">Mixed</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Share Pattern</span>
                        <span className="font-medium text-green-600">Organic</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                This article demonstrates strong journalistic practices with well-supported claims and minimal
                bias. The author's expertise in climate science and the publisher's track record contribute to
                its high credibility score. While social media sentiment is mixed, this appears to be due to
                the controversial nature of the topic rather than issues with the reporting.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

