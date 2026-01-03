import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy - Image to Prompt Generator",
  description: "Refund and cancellation policy for Image to Prompt Generator. Learn about our refund terms and conditions.",
};

export default function RefundPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Refund Policy</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-gray max-w-none dark:prose-invert">
          <h2>1. Overview</h2>
          <p>
            At Image to Prompt Generator, we strive to provide the best service possible. 
            This refund policy outlines the terms and conditions for refunds and cancellations.
          </p>

          <h2>2. Credits Pack Refund Policy</h2>
          
          <h3>2.1 Eligibility for Refund</h3>
          <p>Credits Pack purchases may be eligible for a refund under the following conditions:</p>
          <ul>
            <li>Request made within 7 days of purchase</li>
            <li>Less than 10% of purchased credits have been used</li>
            <li>No previous refund requests for the same account</li>
            <li>Valid reason provided for the refund request</li>
          </ul>

          <h3>2.2 Non-Refundable Situations</h3>
          <p>Refunds will not be provided in the following cases:</p>
          <ul>
            <li>More than 10% of credits have been used</li>
            <li>Request made after 7 days from purchase date</li>
            <li>Violation of our Terms of Service</li>
            <li>Abuse or fraudulent activity</li>
          </ul>

          <h2>3. Pro Monthly Subscription</h2>
          
          <h3>3.1 Cancellation</h3>
          <p>
            You can cancel your Pro Monthly subscription at any time. Upon cancellation:
          </p>
          <ul>
            <li>Your subscription will remain active until the end of the current billing period</li>
            <li>You will retain access to Pro features until the subscription expires</li>
            <li>No refund will be issued for the current billing period</li>
            <li>Auto-renewal will be disabled</li>
          </ul>

          <h3>3.2 Mid-Cycle Cancellation</h3>
          <p>
            If you cancel your subscription before the end of your billing period, you will not 
            receive a prorated refund. You will continue to have access to Pro features until 
            the end of the paid period.
          </p>

          <h3>3.3 Exceptional Circumstances</h3>
          <p>
            In exceptional circumstances (such as service outage or technical issues preventing 
            service use), we may provide prorated refunds at our discretion. Please contact our 
            support team for assistance.
          </p>

          <h2>4. Free Plan</h2>
          <p>
            The Free Plan does not involve any payment and therefore has no refund terms. 
            Free daily credits reset automatically and cannot be refunded or carried over.
          </p>

          <h2>5. How to Request a Refund</h2>
          
          <h3>5.1 Contact Support</h3>
          <p>To request a refund, please contact our support team with:</p>
          <ul>
            <li>Your account email address</li>
            <li>Order/Transaction ID</li>
            <li>Reason for refund request</li>
            <li>Date of purchase</li>
          </ul>

          <h3>5.2 Processing Time</h3>
          <p>
            Refund requests are typically processed within 5-7 business days. Once approved, 
            refunds will be issued to the original payment method within 10-14 business days, 
            depending on your payment provider.
          </p>

          <h2>6. Refund Abuse Policy</h2>
          <p>
            We reserve the right to refuse refunds to users who abuse this policy. This includes 
            but is not limited to:
          </p>
          <ul>
            <li>Repeated refund requests</li>
            <li>Using the majority of purchased credits before requesting a refund</li>
            <li>Creating multiple accounts to exploit refund policies</li>
            <li>Providing false information in refund requests</li>
          </ul>

          <h2>7. Disputes and Chargebacks</h2>
          <p>
            If you initiate a chargeback or dispute with your payment provider without first 
            contacting us:
          </p>
          <ul>
            <li>Your account may be suspended pending investigation</li>
            <li>Access to all services will be revoked</li>
            <li>Any remaining credits will be forfeited</li>
          </ul>
          <p>
            We encourage you to contact us directly before initiating any disputes with your 
            payment provider so we can work together to resolve the issue.
          </p>

          <h2>8. Service Issues</h2>
          <p>
            If you experience technical issues or service problems that prevent you from using 
            our service:
          </p>
          <ul>
            <li>Contact support immediately with details of the issue</li>
            <li>We will work to resolve the problem promptly</li>
            <li>Credits may be restored if lost due to technical errors</li>
            <li>Partial or full refunds may be considered for extended service outages</li>
          </ul>

          <h2>9. Changes to Pricing</h2>
          <p>
            If we change our pricing:
          </p>
          <ul>
            <li>Existing subscriptions will maintain current pricing until renewal</li>
            <li>You will be notified of price changes before your next billing cycle</li>
            <li>You may cancel before renewal to avoid new pricing</li>
            <li>No refunds for price changes will be provided</li>
          </ul>

          <h2>10. Contact Information</h2>
          <p>
            For refund requests or questions about this policy, please contact us at:
          </p>
          <ul>
            <li>Email: support@imagepromptgenerator.org</li>
            <li>Response time: Within 24-48 hours</li>
          </ul>

          <h2>11. Policy Updates</h2>
          <p>
            We reserve the right to modify this refund policy at any time. Changes will be 
            effective immediately upon posting on our website. Your continued use of the service 
            after changes constitutes acceptance of the updated policy.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mt-8">
            <h3 className="text-lg font-semibold mb-2">Questions?</h3>
            <p className="mb-0">
              If you have any questions about our refund policy, please don't hesitate to 
              contact our support team. We're here to help!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}