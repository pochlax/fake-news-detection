import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HistorySidebar() {
    const today = [
        {
            title: "CNN Article on Climate Change",
            url: "#",
            score: 85,
        },
        {
            title: "BBC News Brexit Analysis",
            url: "#",
            score: 92,
        },
    ]

    const yesterday = [
        {
            title: "Fox News Economic Report",
            url: "#",
            score: 78,
        },
        {
            title: "Reuters Technology Coverage",
            url: "#",
            score: 95,
        },
        {
            title: "New York Times Opinion Piece",
            url: "#",
            score: 88,
        },
    ]

    const previousWeek = [
        {
            title: "Washington Post Investigation",
            url: "#",
            score: 91,
        },
        {
            title: "The Guardian Environmental Report",
            url: "#",
            score: 89,
        },
    ]

    return (
        <div className="flex h-full flex-col gap-2 p-4">
            <div className="flex-1 overflow-auto">
                <div className="grid gap-1">
                    <div className="px-2 text-xs font-medium text-muted-foreground">Today</div>
                    {today.map((item) => (
                        <Link
                            key={item.title}
                            href={item.url}
                            className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                            <span className="line-clamp-1">{item.title}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{item.score}%</span>
                        </Link>
                    ))}
                </div>
                <div className="mt-4 grid gap-1">
                    <div className="px-2 text-xs font-medium text-muted-foreground">Yesterday</div>
                    {yesterday.map((item) => (
                        <Link
                            key={item.title}
                            href={item.url}
                            className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                            <span className="line-clamp-1">{item.title}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{item.score}%</span>
                        </Link>
                    ))}
                </div>
                <div className="mt-4 grid gap-1">
                    <div className="px-2 text-xs font-medium text-muted-foreground">Previous Week</div>
                    {previousWeek.map((item) => (
                        <Link
                            key={item.title}
                            href={item.url}
                            className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                            <span className="line-clamp-1">{item.title}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{item.score}%</span>
                        </Link>
                    ))}
                </div>
            </div>
            <Button variant="outline" className="w-full justify-start gap-2">
                <span className="text-xs font-medium">Clear History</span>
            </Button>
        </div>
    )
}