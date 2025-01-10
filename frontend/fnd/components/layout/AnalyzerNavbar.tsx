import { Menu, Shield, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { UserIcon } from "@/components/layout/UserIcon"
import { PDFDownloadLink } from '@react-pdf/renderer'

interface AnalyzerNavbarProps {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    handleLandingPage: () => void
    pdfLoading: 'not started' | 'in progress' | 'complete'
    pdfDocument: React.ReactElement
    articleTitle: string
    handleDownloadReport: () => void
    articleContent: string | null
    resetAnalysis: () => void
}

export function AnalyzerNavbar({
    isOpen,
    setIsOpen,
    handleLandingPage,
    pdfLoading,
    pdfDocument,
    articleTitle,
    handleDownloadReport,
    articleContent,
    resetAnalysis
}: AnalyzerNavbarProps) {
    return (
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
                    <div className="flex items-center gap-2 cursor-pointer" onClick={handleLandingPage}>
                        <Shield className="h-5 w-5" />
                        <h1 className="text-lg font-semibold">de(fnd)</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {pdfLoading != 'not started' ? (
                        <PDFDownloadLink
                            document={pdfDocument}
                            fileName={`analysis-report-${articleTitle}.pdf`}
                        >
                            <Button variant="ghost" disabled={pdfLoading == 'in progress'}>
                                <Download className="mr-2 h-4 w-4" />
                                {pdfLoading == 'in progress' ? 'Generating...' : 'Download Report'}
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
    )
} 