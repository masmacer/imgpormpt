import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - imageprompt",
  description: "Get in touch with the imageprompt team. We'd love to hear from you!",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Information */}
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold">Get in touch</h2>
            <div className="bg-muted/50 rounded-lg p-8 space-y-4">
              <div>
                <h3 className="font-medium text-lg">Email Us</h3>
                <p className="text-muted-foreground mb-4">
                  For all inquiries, support, and business opportunities
                </p>
                <a 
                  href="mailto:support@imagepromptgenerator.org" 
                  className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors text-lg font-medium"
                >
                  support@imagepromptgenerator.org
                </a>
              </div>
            </div>
          </div>

          
          <div className="mt-8 pt-6 border-t border-border text-center">
            <h3 className="font-medium text-lg mb-2">Response Time</h3>
            <p className="text-muted-foreground text-sm">
              We typically respond to all inquiries within 24 hours during business days. 
              For urgent technical issues, please mention "URGENT" in your subject line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}