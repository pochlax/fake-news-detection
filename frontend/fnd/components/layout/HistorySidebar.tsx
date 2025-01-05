"use client"

import { useEffect, useState } from "react"
// import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"

interface HistoryItem {
    article_id: string
    article_title: string
    recommendation: number
    created_at: string
}

interface HistorySidebarProps {
    onArticleSelect: (analysisResult: any) => void
}

export function HistorySidebar({ onArticleSelect }: HistorySidebarProps) {
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchUserHistory()
    }, [])

    const fetchUserHistory = async () => {
        try {
            const userId = localStorage.getItem('userId')
            if (!userId) {
                throw new Error('User not authenticated')
            }

            const response = await fetch(`http://localhost:5000/fetchHistory/${userId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch history')
            }

            const data = await response.json()
            setHistory(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load history')
            console.error('History fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleArticleClick = async (articleId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/fetchArticle/${articleId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch article analysis')
            }

            const analysisResult = await response.json()
            onArticleSelect(analysisResult)
        } catch (err) {
            console.error('Article fetch error:', err)
        }
    }

    // // Helper function to get badge color based on score
    // const getScoreColor = (score: number): string => {
    //     if (score >= 80) return 'bg-green-100 text-green-800'
    //     if (score >= 60) return 'bg-blue-100 text-blue-800'
    //     if (score >= 40) return 'bg-yellow-100 text-yellow-800'
    //     return 'bg-red-100 text-red-800'
    // }

    // // Helper function to format date
    // const formatDate = (dateString: string): string => {
    //     return new Date(dateString).toLocaleDateString('en-US', {
    //         month: 'short',
    //         day: 'numeric',
    //         year: 'numeric'
    //     })
    // }

    if (loading) {
        return <div className="p-4">Loading history...</div>
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>
    }

    // return (
    //     <ScrollArea className="flex-1">
    //         <div className="p-4 space-y-4">
    //             <h2 className="text-lg font-semibold mb-4">Analysis History</h2>
    //             {history.length === 0 ? (
    //                 <p className="text-sm text-muted-foreground">No analysis history yet</p>
    //             ) : (
    //                 history.map((item) => (
    //                     <Button
    //                         key={item.article_id}
    //                         variant="ghost"
    //                         className="w-full justify-start text-left p-3 hover:bg-accent"
    //                         onClick={() => handleArticleClick(item.article_id)}
    //                     >
    //                         <div className="space-y-2">
    //                             <div className="flex items-center justify-between">
    //                                 <span className="text-sm font-medium truncate max-w-[180px]">
    //                                     {item.article_title}
    //                                 </span>
    //                                 <Badge className={getScoreColor(item.recommendation)}>
    //                                     {item.recommendation}%
    //                                 </Badge>
    //                             </div>
    //                             <span className="text-xs text-muted-foreground">
    //                                 {formatDate(item.created_at)}
    //                             </span>
    //                         </div>
    //                     </Button>
    //                 ))
    //             )}
    //         </div>
    //     </ScrollArea>
    // )

    return (
        <div className="flex h-full flex-col gap-2 p-4">
            <div className="flex-1">
                <div className="grid gap-1">
                    {history.map((item) => (
                        <Button
                            key={item.article_id}
                            variant="ghost"
                            className="w-full justify-start text-left p-3 hover:bg-accent"
                            onClick={() => handleArticleClick(item.article_id)}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className="text-sm font-medium truncate max-w-[160px]">
                                    {item.article_title}
                                </span>
                                <span className="text-xs font-medium shrink-0 ml-2">
                                    {Math.round(item.recommendation)}%
                                </span>
                            </div>
                        </Button>
                    ))}
                </div>
            </div>
            <Button variant="outline" className="w-full justify-start gap-2">
                <span className="text-xs font-medium">Clear History</span>
            </Button>
        </div>
    )
}