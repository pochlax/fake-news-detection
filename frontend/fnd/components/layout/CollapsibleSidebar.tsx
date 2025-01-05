"use client"

// import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Menu, Search } from 'lucide-react'
import { HistorySidebar } from "@/components/layout/HistorySidebar"

interface CollapsibleSidebarProps {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    onArticleSelect: (analysisResult: any) => void
    currentAnalysis?: { url: string; title: string; } | null
    isAnalyzing: boolean
}

export function CollapsibleSidebar({ isOpen, setIsOpen, onArticleSelect, currentAnalysis, isAnalyzing }: CollapsibleSidebarProps) {
    return (
        <aside
            className={`fixed top-0 left-0 h-full transition-all duration-300 ease-in-out bg-background border-r ${isOpen ? 'w-60' : 'w-0'
                } overflow-hidden`}
        >
            <div className="w-60">
                <div className="flex items-center justify-between p-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-accent"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-accent"
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                </div>
                <HistorySidebar onArticleSelect={onArticleSelect} currentAnalysis={currentAnalysis} isAnalyzing={isAnalyzing} />
            </div>
        </aside>
    )
}

