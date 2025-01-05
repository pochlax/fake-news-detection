"use client"

import { useEffect, useState } from "react"
// import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

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
    const [activeArticleId, setActiveArticleId] = useState<string | null>(null)
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
    const [itemToDelete, setItemToDelete] = useState<{ id: string, title: string } | null>(null)

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
        setActiveArticleId(articleId)
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

    const handleDeleteClick = (e: React.MouseEvent, articleId: string, articleTitle: string) => {
        e.stopPropagation()
        setItemToDelete({ id: articleId, title: articleTitle })
    }

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return

        try {
            const userId = localStorage.getItem('userId')
            const response = await fetch(`http://localhost:5000/deleteHistory/${itemToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'user-id': userId || ''
                }
            })

            if (response.ok) {
                fetchUserHistory()
                if (activeArticleId === itemToDelete.id) {
                    setActiveArticleId(null)
                }
            }
        } catch (err) {
            console.error('Delete error:', err)
        } finally {
            setItemToDelete(null)
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
        <>
            <div className="flex h-full flex-col gap-2 p-4">
                <div>
                    <h2 className="text-lg font-semibold mb-4">Search History</h2>
                </div>
                <div className="flex-1">
                    <div className="grid gap-1">
                        {history.map((item) => (
                            <Button
                                key={item.article_id}
                                variant="ghost"
                                className={`w-full justify-start text-left p-3 group relative
                                    ${activeArticleId === item.article_id ? 'bg-accent' : 'hover:bg-accent/50'}`}
                                onClick={() => handleArticleClick(item.article_id)}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-sm font-medium truncate max-w-[120px]">
                                        {item.article_title}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-medium">
                                            {Math.round(item.recommendation)}%
                                        </span>
                                        <button
                                            onClick={(e) => handleDeleteClick(e, item.article_id, item.article_title)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                            aria-label="Delete item"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <Dialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Search History</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this search from your history?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {itemToDelete && (
                        <div className="py-4">
                            <p className="text-sm font-medium text-muted-foreground">
                                "{itemToDelete.title}"
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setItemToDelete(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}