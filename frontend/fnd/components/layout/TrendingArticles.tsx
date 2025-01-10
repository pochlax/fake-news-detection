import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface TrendingArticle {
    imageUrl: string
    title: string
    source: string
    timeAgo: string
}

const trendingArticles: TrendingArticle[] = [
    {
        imageUrl: "https://picsum.photos/800/400?random=14",
        title: "Breaking News: Major Tech Company Announces Revolutionary AI Development",
        source: "TechNews",
        timeAgo: "2 hours ago"
    },
    {
        imageUrl: "https://picsum.photos/800/400?random=20",
        title: "Global Climate Summit Reaches Historic Agreement",
        source: "WorldNews",
        timeAgo: "5 hours ago"
    },
    {
        imageUrl: "https://picsum.photos/800/400?random=5",
        title: "New Study Reveals Breakthrough in Medical Research",
        source: "HealthNews",
        timeAgo: "8 hours ago"
    }
]

export function TrendingArticles() {
    return (
        <div className="w-full max-w-5xl mt-16">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Trending Articles 📈</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trendingArticles.map((article, index) => (
                    <Card key={index} className="group cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-0">
                            <div className="aspect-[2/1] bg-muted relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0 z-10" />
                                <Image
                                    src={article.imageUrl}
                                    alt="Article thumbnail"
                                    width={800}
                                    height={400}
                                    className="object-cover w-full h-full"
                                />
                                <div className="absolute bottom-4 left-4 right-4 z-20">
                                    <p className="text-white font-medium line-clamp-2">
                                        {article.title}
                                    </p>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-muted-foreground">{article.source} • {article.timeAgo}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
} 