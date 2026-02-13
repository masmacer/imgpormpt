import type { Metadata } from "next";
import Script from "next/script";

import { Button } from "@saasfly/ui/button";
import { ColourfulText } from "@saasfly/ui/colorful-text";
import { Card } from "@saasfly/ui/card";
import Link from "next/link";

import type { Locale } from "~/config/i18n-config";
import TextToImageClient from "~/components/text-to-image-client";

export const metadata: Metadata = {
  title: "Free AI Text to Image Generator - Create Images from Text Prompts",
  description: "Transform your text descriptions into stunning images with our free AI-powered text to image generator. Create unique artwork, designs, and illustrations from simple text prompts. Powered by advanced GPT-4o image generation. Perfect for social media, marketing, creative projects, and more. Multiple aspect ratios, prompt enhancement, and reference image support!",
  keywords: [
    "text to image", "AI image generator", "text to image free", "AI art generator",
    "GPT-4o image", "text to picture", "AI image creation", "prompt to image",
    "free image generator", "AI artwork", "text description to image",
    "image from text", "AI visual generator", "text based image generator",
    "create image from text", "AI generated art", "text to visual", "KIE AI",
    "automatic image generation", "AI picture creator", "text prompt image"
  ],
  openGraph: {
    title: "Free AI Text to Image Generator - Create Images from Text Prompts",
    description: "Transform your text descriptions into stunning images with our free AI-powered text to image generator.",
    type: "website",
    url: "https://imagepromptgenerator.org/text-to-image",
    images: [
      {
        url: "/images/og-text-to-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Text to Image Generator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Text to Image Generator - Create Images from Text Prompts",
    description: "Transform text into stunning images with our free AI-powered generator.",
    images: ["/images/twitter-text-to-image.jpg"],
  },
  alternates: {
    canonical: "https://imagepromptgenerator.org/text-to-image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Features
const features = [
  {
    icon: "🎨",
    title: "GPT-4o Powered",
    description: "Advanced AI model that understands context and creates highly detailed, accurate images from text descriptions."
  },
  {
    icon: "📐",
    title: "Multiple Aspect Ratios",
    description: "Choose from square, landscape, portrait, and custom sizes to fit any project need or platform requirement."
  },
  {
    icon: "✨",
    title: "Prompt Enhancement",
    description: "Automatically improve your prompts with AI enhancement for professional-quality results every time."
  },
  {
    icon: "🖼️",
    title: "Reference Images",
    description: "Guide generation with reference images to match specific styles, compositions, or artistic directions."
  }
];

// Use Cases
const useCases = [
  {
    title: "Social Media Content",
    description: "Create eye-catching visuals for Instagram, Facebook, Twitter, and other social platforms to boost engagement."
  },
  {
    title: "Marketing Materials",
    description: "Generate unique images for ads, banners, promotional content, and marketing campaigns without stock photos."
  },
  {
    title: "Blog & Article Illustrations",
    description: "Create custom illustrations and featured images for blog posts, articles, and content marketing."
  },
  {
    title: "Creative Projects",
    description: "Bring your creative visions to life for art projects, presentations, storyboards, and concept development."
  },
  {
    title: "Product Mockups",
    description: "Visualize product ideas, packaging designs, and prototypes before physical production."
  },
  {
    title: "Educational Content",
    description: "Generate illustrations for educational materials, infographics, tutorials, and learning resources."
  }
];

// Size Options Info
const sizeInfo = [
  {
    name: "Square (1:1)",
    description: "Perfect for social media profile pictures, Instagram posts, and thumbnail images.",
    popular: true
  },
  {
    name: "Landscape (16:9)",
    description: "Ideal for banners, YouTube thumbnails, website headers, and desktop wallpapers.",
    popular: true
  },
  {
    name: "Portrait (9:16)",
    description: "Great for mobile screens, Instagram stories, Pinterest pins, and vertical displays.",
    popular: true
  },
  {
    name: "Standard (4:3)",
    description: "Classic photo ratio suitable for presentations, prints, and traditional displays."
  },
  {
    name: "Portrait (3:4)",
    description: "Traditional portrait format for professional photos and vertical compositions."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AI Text to Image Generator",
  "description": "Free AI-powered tool to generate images from text descriptions using GPT-4o technology. Create stunning visuals with customizable sizes and enhanced prompts.",
  "url": "https://imagepromptgenerator.org/text-to-image",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "creator": {
    "@type": "Organization",
    "name": "ImagePrompt"
  },
  "featureList": [
    "GPT-4o powered image generation",
    "Multiple aspect ratios (1:1, 16:9, 9:16, 4:3, 3:4)",
    "Automatic prompt enhancement",
    "Reference image support",
    "Free to use with no limits"
  ]
};

export default function TextToImagePage({
  params: { lang },
}: {
  params: {
    lang: string;
  };
}) {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="json-ld-text-to-image"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {/* Simple Header */}
      <section className="container mx-auto px-4 pt-12 pb-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AI Text to <ColourfulText text="Image Generator" />
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Transform your text descriptions into stunning images with GPT-4o
          </p>
        </div>
      </section>

      {/* Interactive Tool - First on Page */}
      <div id="tool" className="scroll-mt-20">
        <TextToImageClient />
      </div>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How to Create Images from Text
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Generate professional images in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                1. Describe Your Image
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Write a detailed text description of what you want to create. Be specific about colors, style, mood, and details.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2. Customize Settings
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose your preferred aspect ratio, enable prompt enhancement, and optionally add a reference image for guidance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎉</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3. Generate & Download
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Click generate and watch as AI creates your image. Download it instantly or copy the URL to share.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful AI Image Generation Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to create professional images from text
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Size Options */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose the Perfect Size
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Multiple aspect ratios to fit any platform or project
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sizeInfo.map((size, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border-2 transition-all ${
                  size.popular
                    ? "border-purple-200 bg-purple-50 dark:border-purple-400/30 dark:bg-purple-900/10"
                    : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {size.name}
                  </h3>
                  {size.popular && (
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {size.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Perfect for Every Creative Need
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Unlimited possibilities with AI text to image generation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Everything you need to know about text to image generation
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                What is a text to image generator?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                A text to image generator is an AI-powered tool that creates images from text descriptions. Simply describe what you want to see, and the AI will generate a unique image matching your description. Our tool uses advanced GPT-4o technology for high-quality results.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                How do I write good text prompts for image generation?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Be specific and detailed! Include information about the subject, style, colors, lighting, mood, and composition. For example, instead of "a cat," try "a fluffy orange cat sitting on a windowsill at sunset, watercolor style." Use the prompt enhancement feature for automatic improvements.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                What image sizes are available?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We offer multiple aspect ratios: Square (1:1) for social media, Landscape (16:9) for banners and wallpapers, Portrait (9:16) for mobile and stories, and Standard (4:3 and 3:4) for classic photo formats.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Can I use reference images?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! You can provide a reference image URL to guide the generation. The AI will use it as inspiration for style, composition, or artistic direction while still following your text prompt.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                What is prompt enhancement?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Prompt enhancement automatically improves your text description using AI to add relevant details, artistic terms, and quality modifiers. This helps generate more professional and detailed images without requiring expertise in prompt writing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Create Stunning Images from Text?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Start generating professional-quality images from your text descriptions with our AI-powered tool.
          </p>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 text-xl font-semibold rounded-lg"
            size="lg"
            asChild
          >
            <Link href="#tool">Start Creating Images</Link>
          </Button>
        </div>
      </section>
    </>
  );
}