import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AnalysisNotesCardProps {
    recommendation: string
}

export function AnalysisNotesCard({ recommendation }: AnalysisNotesCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Analysis Report</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                <p>{recommendation}</p>
            </CardContent>
        </Card>
    )
} 