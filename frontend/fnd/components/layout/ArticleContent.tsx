import { Card, CardContent, CardHeader, CardArticleTitle, CardSubtitle } from "@/components/ui/card"
import Image from "next/image"

interface ArticleContentProps {
    articleTitle: string
    articleAuthor: string
    articleImageUrl: string | null
    articleContent: string | null
    error: string | null
    formatArticleText: (text: string) => JSX.Element[] | JSX.Element
}

export function ArticleContent({
    articleTitle,
    articleAuthor,
    articleImageUrl,
    articleContent,
    error,
    formatArticleText
}: ArticleContentProps) {
    return (
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
        </main>
    )
} 