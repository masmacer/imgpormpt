import type { Metadata } from "next";
import Script from "next/script";

import { Button } from "@saasfly/ui/button";
import { ColourfulText } from "@saasfly/ui/colorful-text";
import { Card } from "@saasfly/ui/card";
import Link from "next/link";

import type { Locale } from "~/config/i18n-config";
import CaricaturePromptClient from "~/components/caricature-prompt-client";

export const metadata: Metadata = {
  title: "Free ChatGPT Caricature Prompt Generator - Create AI Cartoon Prompts",
  description: "Generate professional caricature and cartoon prompts with our free ChatGPT-powered tool. Perfect for creating exaggerated character illustrations, anime-style art, comic book characters, and chibi designs. Transform your character descriptions into detailed AI prompts for Midjourney, Stable Diffusion, DALL-E, and other AI art generators. Create unique caricatures with customizable styles and exaggeration levels!",
  keywords: [
    "caricature prompt generator", "ChatGPT caricature", "cartoon prompt generator",
    "AI caricature prompts", "character illustration prompts", "anime prompt generator",
    "comic book prompts", "chibi character prompts", "cartoon AI generator",
    "exaggerated character art", "caricature AI tool", "cartoon character prompts",
    "Midjourney caricature", "Stable Diffusion cartoon", "DALL-E character prompts",
    "AI cartoon generator", "character design prompts", "free caricature tool"
  ],
  openGraph: {
    title: "Free ChatGPT Caricature Prompt Generator - Create AI Cartoon Prompts",
    description: "Generate professional caricature and cartoon prompts with our free AI-powered tool. Perfect for creating unique character illustrations with customizable styles.",
    type: "website",
    url: "https://imagepromptgenerator.org/caricature-prompt",
    images: [
      {
        url: "/images/og-caricature.jpg",
        width: 1200,
        height: 630,
        alt: "ChatGPT Caricature Prompt Generator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free ChatGPT Caricature Prompt Generator - Create AI Cartoon Prompts",
    description: "Generate professional caricature and cartoon prompts with our free AI-powered tool.",
    images: ["/images/twitter-caricature.jpg"],
  },
  alternates: {
    canonical: "https://imagepromptgenerator.org/caricature-prompt",
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

// 功能特性
const features = [
  {
    icon: "🎨",
    title: "3 Professional Styles",
    description: "Choose from 3D Cartoon, Pixar-style, or Traditional Sketch to transform your photo into amazing artwork."
  },
  {
    icon: "📸",
    title: "Selfie Upload Support",
    description: "Upload your own selfie or describe a character - both text and image inputs are supported for maximum flexibility."
  },
  {
    icon: "✨",
    title: "AI-Powered Generation",
    description: "Advanced AI technology creates detailed, professional prompts optimized for creating stunning cartoon avatars."
  },
  {
    icon: "🚀",
    title: "Instant Results",
    description: "Get high-quality cartoon prompts in seconds, ready to create your personalized avatar or character art."
  }
];

// 支持的风格
const supportedStyles = [
  {
    name: "3D Cartoon",
    description: "Modern 3D animated style with depth, detailed textures, and vibrant colors - perfect for profile pictures and avatars.",
    popular: true
  },
  {
    name: "Pixar-style",
    description: "High-quality animated movie style with expressive, charming characters and professional movie-grade quality.",
    popular: true
  },
  {
    name: "Traditional Sketch",
    description: "Hand-drawn pencil or charcoal sketch appearance with artistic, classic illustration vibes.",
    popular: true
  }
];

// 使用场景
const useCases = [
  {
    title: "Social Media Avatars",
    description: "Transform your selfie into a unique cartoon avatar for Instagram, Twitter, Discord, and other social platforms."
  },
  {
    title: "Personal Branding",
    description: "Create a professional cartoon version of yourself for business cards, websites, and professional profiles."
  },
  {
    title: "Digital Art & NFTs",
    description: "Generate prompts to create unique cartoon characters for digital art collections and NFT projects."
  },
  {
    title: "Gifts & Portraits",
    description: "Create personalized cartoon portraits of friends and family as unique digital gifts and keepsakes."
  },
  {
    title: "Gaming & Streaming",
    description: "Design custom cartoon avatars for gaming profiles, Twitch streams, and online communities."
  },
  {
    title: "Creative Projects",
    description: "Generate character prompts for animations, comics, storyboards, and other creative endeavors."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AI Cartoon Avatar Generator",
  "description": "Transform your selfie into stunning cartoon art with our AI-powered tool. Choose from 3D Cartoon, Pixar-style, or Traditional Sketch styles.",
  "url": "https://imagepromptgenerator.org/caricature-prompt",
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
    "Selfie upload support",
    "3 professional cartoon styles (3D Cartoon, Pixar-style, Traditional Sketch)",
    "AI-powered prompt generation",
    "Instant cartoon avatar creation",
    "Text or image input support"
  ]
};

export default function CaricaturePromptPage({
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
        id="json-ld-caricature"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {/* Simple Header */}
      <section className="container mx-auto px-4 pt-12 pb-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            ChatGPT Caricature <ColourfulText text="Prompt Generator" />
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Create professional caricature and cartoon prompts with AI-powered technology
          </p>
        </div>
      </section>

      {/* Interactive Tool - First on Page */}
      <div id="tool" className="scroll-mt-20">
        <CaricaturePromptClient />
      </div>

      {/* Tool Introduction */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How to Use the Caricature Prompt Generator
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Generate perfect caricature prompts in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">�</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                1. Upload Selfie or Describe
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload your selfie photo or describe the character you want to transform. Both image and text inputs are supported.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2. Choose Your Style
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Select from 3D Cartoon, Pixar-style, or Traditional Sketch to match your desired cartoon look.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3. Generate & Create
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Click generate to create your cartoon prompt. Use it to generate your personalized cartoon avatar instantly.
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
              Why Use Our Caricature Prompt Generator?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Powerful features designed to create the perfect caricature prompts for your creative projects
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

      {/* Supported Styles Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Caricature Styles
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Choose from multiple professional caricature and cartoon styles
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportedStyles.map((style, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border-2 transition-all ${
                  style.popular
                    ? "border-purple-200 bg-purple-50 dark:border-purple-400/30 dark:bg-purple-900/10"
                    : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {style.name}
                  </h3>
                  {style.popular && (
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {style.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Perfect for Every Creative Project
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Discover how caricature prompts can enhance your work
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
              Everything you need to know about our caricature prompt generator
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                What is a caricature prompt generator?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                A caricature prompt generator is an AI-powered tool that transforms character descriptions into detailed text prompts optimized for creating caricature and cartoon illustrations using AI art generators like Midjourney, Stable Diffusion, and DALL-E. It helps you create exaggerated, stylized character portraits with specific artistic styles.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                What AI art platforms work with these prompts?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our generated caricature prompts are optimized for all major AI art platforms including Midjourney, Stable Diffusion, DALL-E, Leonardo AI, Bing Image Creator, and more. The prompts are formatted to work seamlessly across different AI art generators.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                How do I create the best caricature prompts?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                For best results, describe distinctive facial features (glasses, beard, hair style), clothing, expressions, and any unique characteristics. Choose a caricature style that matches your vision, adjust the exaggeration level, and add specific details about poses, backgrounds, or artistic elements you want to include.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                What's the difference between caricature styles?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Classic caricature emphasizes exaggerated features with traditional art style. Anime style creates Japanese manga-inspired characters. Cartoon style produces Western animated aesthetics. Comic book style adds dramatic effects and bold colors. Chibi creates cute, super-deformed characters with large heads and small bodies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Create Amazing Caricature Art?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Start generating professional caricature prompts with our ChatGPT-powered tool. Perfect for artists, designers, and content creators.
          </p>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 text-xl font-semibold rounded-lg"
            size="lg"
            asChild
          >
            <Link href="#tool">Start Creating Prompts</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
