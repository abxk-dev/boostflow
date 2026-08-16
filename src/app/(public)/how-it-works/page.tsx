import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  Shield,
  Lock,
  Eye,
} from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "How It Works",
  description: "Learn how BoostFlow works and how you can grow your social media presence for free.",
}

const steps = [
  {
    step: "1",
    title: "Create a Free Account",
    description: "Sign up with your email address. No credit card required. Your account gives you access to all our free services.",
    icon: Users,
    details: [
      "Quick registration with email",
      "No payment information needed",
      "Instant access to all services",
    ],
  },
  {
    step: "2",
    title: "Choose Your Service",
    description: "Browse our catalog of services across Instagram, TikTok, YouTube, Twitter/X, and Facebook. Select the type of engagement you want.",
    icon: Eye,
    details: [
      "Multiple platforms supported",
      "Followers, likes, views, and more",
      "Flexible quantity options",
    ],
  },
  {
    step: "3",
    title: "Watch a Quick Ad",
    description: "Support our platform by watching a short advertisement. This is how we keep the service completely free for everyone.",
    icon: Clock,
    details: [
      "Short ad experience",
      "Keeps service free for all",
      "Secure reward verification",
    ],
  },
  {
    step: "4",
    title: "Submit Your Order",
    description: "Provide the URL of your profile or post. Our system will automatically dispatch your order to our network of providers.",
    icon: TrendingUp,
    details: [
      "Just need your public URL",
      "No password required",
      "Automatic order dispatch",
    ],
  },
  {
    step: "5",
    title: "Track Your Growth",
    description: "Monitor your order status in real-time through your dashboard. See exactly when your engagement starts and completes.",
    icon: CheckCircle,
    details: [
      "Real-time status updates",
      "Detailed order history",
      "Delivery confirmation",
    ],
  },
]

const faqs = [
  {
    question: "Is it really free?",
    answer: "Yes! BoostFlow is completely free. We support ourselves through advertising. You watch a short ad, and in return, you get free social media engagement.",
  },
  {
    question: "Is it safe for my account?",
    answer: "Absolutely. We never ask for your password or login credentials. We only need your public profile URL. Our delivery methods are designed to be safe and comply with platform guidelines.",
  },
  {
    question: "How fast will I see results?",
    answer: "Most orders start processing within minutes. Depending on the service and quantity, you'll typically see results within 1-24 hours. Larger orders may take longer.",
  },
  {
    question: "Are there any limits?",
    answer: "Free accounts have daily usage limits to ensure fair access for everyone. These limits vary by service and reset every 24 hours.",
  },
  {
    question: "What if my order fails?",
    answer: "If an order fails, it will be automatically retried with our backup providers. If all attempts fail, you can simply place a new order.",
  },
  {
    question: "Do you store my password?",
    answer: "We never ask for or store your social media passwords. We only need your public URL to deliver engagement. Your BoostFlow account password is securely hashed.",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/10">
          <div className="container px-4 md:px-6 text-center">
            <Badge variant="outline" className="mb-4">
              Simple Process
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              How <span className="gradient-text">BoostFlow</span> Works
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Grow your social media presence in just a few simple steps.
              No payment required - just watch a quick ad to support the platform.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-20">
          <div className="container px-4 md:px-6 max-w-4xl">
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={step.step} className="flex gap-8">
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full gradient-bg text-white flex items-center justify-center text-xl font-bold">
                      {step.step}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gradient-to-b from-violet-600 to-transparent mt-4" />
                    )}
                  </div>
                  <Card className="flex-1">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center">
                          <step.icon className="h-5 w-5 text-violet-600" />
                        </div>
                        <CardTitle>{step.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base">{step.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="py-20 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Security & Privacy</h2>
              <p className="text-muted-foreground">
                Your security and privacy are our top priorities
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>No Passwords</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    We never ask for your social media passwords. We only need your public URL.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Encrypted Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    All sensitive data is encrypted. Your information is always protected.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Secure Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    One-time use tokens prevent abuse and ensure fair usage for everyone.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="container px-4 md:px-6 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Common questions about how BoostFlow works
              </p>
            </div>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{faq.answer}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
