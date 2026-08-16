import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about BoostFlow - the free social media growth platform.",
}

const faqs = [
  {
    category: "General",
    questions: [
      {
        question: "What is BoostFlow?",
        answer: "BoostFlow is a free social media growth platform that helps you increase your followers, likes, views, and other engagement metrics across major social media platforms like Instagram, TikTok, YouTube, Twitter/X, and Facebook.",
      },
      {
        question: "Is BoostFlow really free?",
        answer: "Yes! BoostFlow is completely free to use. We support the platform through optional ad views. You never need to pay anything or provide credit card information.",
      },
      {
        question: "How does BoostFlow make money?",
        answer: "We generate revenue through advertising. When you watch a short ad before placing an order, that supports our platform and keeps the service free for everyone.",
      },
    ],
  },
  {
    category: "Safety & Privacy",
    questions: [
      {
        question: "Is it safe to use BoostFlow?",
        answer: "Yes, BoostFlow is safe to use. We never ask for your social media passwords or login credentials. We only need your public profile or post URL to deliver engagement.",
      },
      {
        question: "Will my account get banned?",
        answer: "We use delivery methods designed to be safe and comply with platform guidelines. However, we recommend using our service responsibly and not exceeding daily limits.",
      },
      {
        question: "Do you store my password?",
        answer: "We never ask for or store your social media passwords. Your BoostFlow account password is securely hashed using industry-standard encryption.",
      },
      {
        question: "What data do you collect?",
        answer: "We only collect the minimum data necessary to provide our service: your email, username, and order history. We never collect or store your social media credentials.",
      },
    ],
  },
  {
    category: "Services & Orders",
    questions: [
      {
        question: "What platforms do you support?",
        answer: "We currently support Instagram, TikTok, YouTube, Twitter/X, and Facebook. We're constantly working to add more platforms.",
      },
      {
        question: "What services are available?",
        answer: "We offer followers, likes, views, comments, and other engagement metrics depending on the platform. Check our Services page for the complete list.",
      },
      {
        question: "How fast will I see results?",
        answer: "Most orders start processing within minutes. Depending on the service and quantity, you'll typically see results within 1-24 hours. Larger orders may take longer to complete.",
      },
      {
        question: "Are there daily limits?",
        answer: "Yes, free accounts have daily usage limits to ensure fair access for everyone. These limits vary by service and reset every 24 hours at midnight UTC.",
      },
      {
        question: "What if my order fails?",
        answer: "If an order fails, it will be automatically retried with our backup providers. If all attempts fail, you can simply place a new order. Failed orders don't count against your daily limit.",
      },
    ],
  },
  {
    category: "Account & Support",
    questions: [
      {
        question: "Do I need to create an account?",
        answer: "Yes, a free account is required to track your orders and manage your usage. Registration takes just a minute and only requires an email address.",
      },
      {
        question: "How do I reset my password?",
        answer: "You can reset your password from the login page by clicking 'Forgot Password'. We'll send a reset link to your registered email address.",
      },
      {
        question: "How do I contact support?",
        answer: "You can reach our support team through the contact form on our website or by emailing support@boostflow.com. We typically respond within 24 hours.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/10">
          <div className="container px-4 md:px-6 text-center">
            <Badge variant="outline" className="mb-4">
              Help Center
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about BoostFlow. Can&apos;t find what you&apos;re looking for? Contact our support team.
            </p>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-20">
          <div className="container px-4 md:px-6 max-w-4xl">
            <div className="space-y-12">
              {faqs.map((category) => (
                <div key={category.category}>
                  <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
                  <div className="space-y-4">
                    {category.questions.map((faq, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-lg">{faq.question}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-base">{faq.answer}</CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
