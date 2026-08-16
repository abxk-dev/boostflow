import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "BoostFlow Privacy Policy - Learn how we collect, use, and protect your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/10">
          <div className="container px-4 md:px-6 text-center">
            <Badge variant="outline" className="mb-4">Legal</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4 md:px-6 max-w-3xl prose prose-gray dark:prose-invert">
            <h2>1. Information We Collect</h2>
            <p>We collect the following information when you use BoostFlow:</p>
            <ul>
              <li><strong>Account Information:</strong> Email address and username</li>
              <li><strong>Order Data:</strong> URLs you submit for engagement services</li>
              <li><strong>Usage Data:</strong> How you interact with our platform</li>
              <li><strong>Device Information:</strong> IP address and browser type for security</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and maintain the Service</li>
              <li>Process your orders</li>
              <li>Prevent fraud and abuse</li>
              <li>Communicate with you about your account</li>
              <li>Improve our platform</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We do not sell or rent your personal information to third parties. We may share information with:
            </p>
            <ul>
              <li>Service providers who help us operate the platform</li>
              <li>Law enforcement when required by law</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including encryption of sensitive information and secure password hashing.
            </p>

            <h2>5. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide the Service. You can request deletion of your account and data at any time.
            </p>

            <h2>6. Cookies</h2>
            <p>
              We use essential cookies to maintain your session and provide the Service. We do not use tracking cookies for advertising purposes.
            </p>

            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
            </ul>

            <h2>8. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for users under 13 years of age. We do not knowingly collect information from children.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through the Service.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at privacy@boostflow.com.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
