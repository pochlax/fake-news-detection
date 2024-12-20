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

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Card className="w-[400px] shadow-lg">
          <CardContent className="p-3">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Enter article URL to analyze..."
                className="flex-1 px-3 py-2 rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Article URL input"
              />
              <Button size="sm">
                Analyze
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
            <CardTitle>Article Content</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none dark:prose-invert">
            <p>
              Canadians drink almost 10 billion cups of tea a year, but what else is steeping in those cups? Testing by CBC Marketplace and CBC’s French investigative consumer show L’Epicerie reveals that some teas on the market contain levels of pesticides that exceed Canadian standards.

              Tea is the world’s most popular beverage, often touted for its healthful properties. Canadians 16 and older drink 83 litres per person every year, a number that has been increasing.

              CBC tested black and green teas including Canada’s most popular brands: Lipton, Red Rose, Tetley and Twinings. Other popular brands tested included No Name, Uncle Lee’s Legends of China, King Cole and Signal. Full test results can be found here.

              Using an accredited lab, CBC used the testing method employed by the Canadian Food Inspection Agency (CFIA) to test pesticide residues in dry tea leaves.

              Marketplace investigation
              Watch Marketplace's episode, Strange Brew, at cbc.ca/marketplace.

              Half of the teas tested contained pesticide residues above the allowable limits in Canada. And eight of the 10 brands tested contained multiple chemicals, with one brand containing residues of 22 different pesticides.

              Some of the pesticides found — including endosulfan and monocrotophos — are in the process of being banned from use in some countries because of dangers to the environment and to workers.

              Of the 10 brands tested, only Red Rose came back free of pesticide residues.

              "This is very worrisome from a number of perspectives," environmental lawyer David Boyd, told Marketplace in an interview.

              "The presence of so many pesticides on a single product and so many products that exceed the maximum residue limits for pesticides, suggests that we're seeing very poor agricultural practices in countries, which poses risk to the environment where these products are being grown; which pose risk to the farm workers who are growing these crops, and ultimately pose risk to the Canadians who are consuming these products."

              Health effects questioned
              The CFIA is responsible for monitoring pesticide levels in the food we buy. CFIA tests of tea from 2009 and 2011 found that many of the brands the agency tested had levels of pesticide residue that exceed allowed levels.


              Canadians drink almost 10 billion cups of tea every year. CBC tested popular brands for pesticides; half of the teas tested contained pesticide residues above the allowable limits. (CBC)
              A CFIA study published in the Journal of Agricultural and Food Chemistry this past January found that pesticide residues in dry tea leaves do make their way into brewed tea. "The pesticide residues were likely transferred from tea leaves to brewed tea during the brewing process, and may therefore pose a risk to consumers," the paper concludes.

              CBC retested some brands that had failed past CFIA testing, and found that the problem continues.

              CFIA declined to speak with the CBC in an interview. However, in a statement, the agency says that while many teas failed to meet levels set by the government, the agency sees no cause for alarm, even for teas that exceed the limits.

              "Health Canada reviewed the information provided by Marketplace and for the pesticides bifenthrin, imidacloprid, acetamiprid, chlorfenapyr, pyridaben, acephate, dicofol and monocrotophos determined that consumption of tea containing the residues listed does not pose a health risk based on the level of residues reported, expected frequency of exposure and contribution to overall diet. Moreover, a person would have to consume approximately 75 cups of tea per day over their entire lifetime to elicit an adverse health effect," a spokesperson wrote to the CBC in a statement.

              But Boyd says the government should be alarmed by the results. "I think that’s a complete abdication of CFIA's responsibility to protect Canadian people. The reality is that there is emerging science about the impacts of pesticides at very low concentrations," he says.

              "The whole point of pesticides is that they’re chemically and biologically active in parts per million or parts per billion,” Boyd says. “Pesticides can have adverse effects at what are seemingly very small concentrations.”

              According to Boyd, these results "should raise a red flag for the regulators whose job is to protect the health and safety of Canadians in our environment."

              Tea industry responds
              Despite the tests, the Tea Association of Canada says that tea is safe for Canadians to drink.

              In an interview with Marketplace, James O’Young, vice president of Uncle Lee’s Legends of China — whose green tea had the highest number of pesticides in the brands tested — said that pesticides are a reality of the tea industry. "If you drink tea, regular tea, I don't care it's what brand is that, the fact of life, this agricultural product does have pesticides," he says.

              TATA Global Beverages, which owns Tetley, and Unilever, which owns Red Rose and Lipton, both stand behind the safety of their products.

              "Consumer safety is very important to us. Upon receiving your communication, we proactively retrieved the test results from the independent laboratory that tested the raw tea used in this batch code which confirmed that our tea complies with all Canadian food safety regulations and is of high quality," TATA Global Beverages wrote in a statement.

              "Unilever is fully confident in the safety of our teas," the company wrote in a statement.

              Boyd says that the best way to avoid pesticides is to support organic producers. "If you like drinking tea, you can drink organic tea, which is less likely to be contaminated by pesticides," he says.

              But even then, CFIA testing has found the presence of pesticide residues on organic tea leaves.
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

