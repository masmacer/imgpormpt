import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - imageprompt",
  description: "Privacy Policy for imageprompt. Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-gray max-w-none dark:prose-invert">
          <h2>1. Introduction</h2>
          <p>
            At imageprompt, we respect your privacy and are committed to protecting your personal data. 
            This privacy policy explains how we collect, use, and safeguard your information when you 
            use our service.
          </p>

          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Personal Information</h3>
          <p>When you create an account or contact us, we may collect:</p>
          <ul>
            <li>Name and email address</li>
            <li>Profile information (if provided)</li>
            <li>Communication preferences</li>
          </ul>

          <h3>2.2 Usage Data</h3>
          <p>We automatically collect certain information when you use our service:</p>
          <ul>
            <li>IP address and device information</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent on our service</li>
            <li>Usage patterns and preferences</li>
          </ul>

          <h3>2.3 Images and Generated Content</h3>
          <p>
            When you upload images to our service, we temporarily process them to generate prompts. 
            <strong>Important:</strong> We do not permanently store your uploaded images. Images are 
            processed and deleted from our servers immediately after prompt generation.
          </p>

          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul>
            <li>Provide and improve our AI prompt generation service</li>
            <li>Authenticate and manage user accounts</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Send important service updates and notifications</li>
            <li>Analyze usage patterns to improve our service</li>
            <li>Ensure the security and proper functioning of our service</li>
          </ul>

          <h2>4. Information Sharing and Disclosure</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:</p>
          <ul>
            <li>With your explicit consent</li>
            <li>To comply with legal obligations or valid legal requests</li>
            <li>To protect our rights, property, or safety, or that of our users</li>
            <li>With trusted service providers who assist in operating our service (under strict confidentiality agreements)</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal 
            information against unauthorized access, alteration, disclosure, or destruction. These include:
          </p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security audits and monitoring</li>
            <li>Access controls and authentication measures</li>
            <li>Secure server infrastructure</li>
          </ul>

          <h2>6. Data Retention</h2>
          <p>
            We retain your personal information only as long as necessary to provide our services 
            and fulfill the purposes outlined in this policy. Specifically:
          </p>
          <ul>
            <li>Account information: Until you delete your account or request deletion</li>
            <li>Usage data: Up to 2 years for analytics and service improvement</li>
            <li>Uploaded images: Immediately deleted after processing</li>
            <li>Generated prompts: Stored with your account unless you delete them</li>
          </ul>

          <h2>7. Your Rights and Choices</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and review your personal information</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Delete your account and associated data</li>
            <li>Object to or restrict certain processing activities</li>
            <li>Export your data in a portable format</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>

          <h2>8. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar technologies to enhance your experience, analyze usage, and 
            provide personalized content. You can control cookie settings through your browser, 
            but disabling cookies may affect service functionality.
          </p>

          <h2>9. Third-Party Services</h2>
          <p>
            Our service may contain links to third-party websites or integrate with third-party 
            services. We are not responsible for the privacy practices of these external services. 
            We encourage you to review their privacy policies.
          </p>

          <h2>10. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly 
            collect personal information from children under 13. If you believe we have collected 
            such information, please contact us immediately.
          </p>

          <h2>11. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your 
            country of residence. We ensure appropriate safeguards are in place to protect your 
            information during such transfers.
          </p>

          <h2>12. Changes to This Privacy Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any 
            significant changes via email or through our service. The updated policy will be 
            effective when posted.
          </p>

          <h2>13. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us:
            <br />
            Email: <a href="mailto:support@imagepromptgenerator.org" className="text-primary hover:underline">support@imagepromptgenerator.org</a>
            <br />
            Subject: Privacy Policy Inquiry
          </p>
        </div>
      </div>
    </div>
  );
}