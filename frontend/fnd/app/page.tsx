"use client"

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

      <main className="mx-auto grid max-w-7xl gap-6 p-6 md:grid-cols-[300px_1fr_300px]">
        {/* Left Sidebar - Score */}
        <Card>
          <CardHeader>
            <CardTitle>Credibility Score</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="text-center">
              <span className="text-6xl font-bold text-green-600">85%</span>
              <Progress value={85} className="mt-2" />
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
            <CardTitle>Article Content</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none dark:prose-invert">
            <p>
              Climate scientists announced today that global temperatures have risen dramatically in the past
              decade, according to a comprehensive study published in the Journal of Climate Research...
            </p>
            {/* More article content would go here */}
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




// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//       <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="https://nextjs.org/icons/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
//           <li className="mb-2">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
//               app/page.tsx
//             </code>
//             .
//           </li>
//           <li>Save and see your changes instantly.</li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="https://nextjs.org/icons/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="https://nextjs.org/icons/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="https://nextjs.org/icons/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="https://nextjs.org/icons/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }
