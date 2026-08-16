import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "BoostFlow Terms of Service - Please read these terms carefully before using our platform.",
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/10">
          <div className="container px-4 md:px-6 text-center">
            <Badge variant="outline" className="mb-4">Legal</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4 md:px-6 max-w-3xl prose prose-gray dark:prose-invert">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using BoostFlow (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              BoostFlow provides a platform for users to receive social media engagement (followers, likes, views, etc.) in exchange for watching advertisements. The Service is provided free of charge.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              To use the Service, you must create an account with a valid email address. You are responsible for maintaining the security of your account and for all activities that occur under your account.
            </p>

            <h2>4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to abuse or exploit the Service</li>
              <li>Create multiple accounts to circumvent limits</li>
              <li>Use automated tools or bots</li>
              <li>Interfere with the proper functioning of the Service</li>
            </ul>

            <h2>5. Service Availability</h2>
            <p>
              We strive to keep the Service available at all times, but we do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue the Service at any time.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
              BoostFlow is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from the use of the Service, including but not limited to direct, indirect, incidental, or consequential damages.
            </p>

            <h2>7. Third-Party Services</h2>
            <p>
              The Service relies on third-party providers for delivery. We are not responsible for the actions or policies of these third parties.
            </p>

            <h2>8. Privacy</h2>
            <p>
              Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>

            <h2>9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the Service.
            </p>

            <h2>10. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us at legal@boostflow.com.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
