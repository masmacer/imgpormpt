import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Script from "next/script";

import { Button } from "@saasfly/ui/button";
import { ColourfulText } from "@saasfly/ui/colorful-text";
import * as Icons from "@saasfly/ui/icons";
import { Card } from "@saasfly/ui/card";

import type { Locale } from "~/config/i18n-config";
import ImageToPromptClient from "~/components/image-to-prompt-client";

export const metadata: Metadata = {
  title: "Free Image to Prompt Generator - Transform Images into AI Prompts",
  description: "Convert any image into detailed AI prompts with our free image to prompt generator. Perfect for Stable Diffusion, Midjourney, Flux, and other AI art tools. Upload your image and get instant, accurate prompts that capture style, composition, colors, and mood. Start creating better AI art today with our advanced image analysis technology!",
  keywords: [
    "image to prompt generator", "free image to prompt", "AI prompt generator", 
    "Stable Diffusion prompts", "Midjourney prompts", "Flux prompts", 
    "AI art prompts", "image analysis", "prompt engineering", "AI image generation",
    "reverse prompt", "image to text", "AI art generator", "prompt from image"
  ],
  openGraph: {
    title: "Free Image to Prompt Generator - Transform Images into AI Prompts",
    description: "Convert any image into detailed AI prompts with our free image to prompt generator. Perfect for Stable Diffusion, Midjourney, Flux, and other AI art tools.",
    type: "website",
    url: "https://imagepromptgenerator.org",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Image to Prompt Generator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image to Prompt Generator - Transform Images into AI Prompts",
    description: "Convert any image into detailed AI prompts with our free image to prompt generator.",
    images: ["/images/twitter-card.jpg"],
  },
  alternates: {
    canonical: "https://imagepromptgenerator.org",
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

// 功能卡片数据
const features = [
  {
    icon: "🖼️",
    title: "Image to Prompt Generator",
    description: "Convert any image into detailed, professional AI prompts instantly. Our advanced image analysis technology captures style, composition, colors, and artistic elements."
  },
  {
    icon: "✨",
    title: "Magic Prompt Enhancement", 
    description: "Transform simple descriptions into rich, detailed prompts optimized for AI art generation. Perfect for creating professional-quality results."
  },
  {
    icon: "🔍",
    title: "AI Image Analysis",
    description: "Get comprehensive image analysis including objects, style, lighting, mood, and technical details for precise prompt generation."
  },
  {
    icon: "🎨",
    title: "Multi-Model Support",
    description: "Generate prompts optimized for Stable Diffusion, Midjourney, Flux, and other popular AI art generation platforms."
  }
];

// AI模型支持
const supportedModels = [
  {
    name: "Stable Diffusion",
    description: "Generate prompts optimized for Stable Diffusion models with proper formatting and weight parameters.",
    popular: true
  },
  {
    name: "Midjourney",
    description: "Create Midjourney-style prompts with aspect ratios, stylize values, and version parameters.",
    popular: true
  },
  {
    name: "Flux",
    description: "Specialized prompts for the latest Flux AI models with enhanced detail and accuracy.",
    popular: true
  }
];

// SEO优化的使用场景
const useCases = [
  {
    title: "AI Art Creation",
    description: "Generate detailed prompts from reference images to create consistent AI artwork with your desired style and composition."
  },
  {
    title: "Style Transfer",
    description: "Analyze artistic styles from images and create prompts to replicate similar aesthetics in your AI-generated art."
  },
  {
    title: "Concept Art Development",
    description: "Transform concept sketches or reference photos into detailed prompts for professional concept art creation."
  },
  {
    title: "Digital Marketing",
    description: "Create branded visual content by analyzing your brand images and generating consistent style prompts."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Image to Prompt Generator",
  "description": "Free online tool to convert images into detailed AI prompts for Stable Diffusion, Midjourney, Flux, and other AI art generators.",
  "url": "https://imagepromptgenerator.org",
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
  }
};

export default function IndexPage({
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
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {/* Hero Section - SEO Optimized */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Free Image to Prompt
            <br />
            <ColourfulText text="Generator" /> Tool
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
            Transform any image into detailed AI prompts instantly. Our advanced image to prompt generator analyzes your images and creates professional prompts for Stable Diffusion, Midjourney, Flux, and other AI art tools. Start creating better AI art with precise, descriptive prompts that capture every detail.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-lg"
              size="lg"
              asChild
            >
              <Link href="#tool">Try Free Image to Prompt Generator</Link>
            </Button>
            <Button 
              variant="outline" 
              className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20 px-8 py-3 text-lg font-semibold rounded-lg"
              size="lg"
            >
              Learn How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Tool Introduction Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Free Image to Prompt Generator Tool
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Upload any image and get instant, detailed prompts optimized for AI art generation. Our advanced computer vision technology analyzes your images to create professional-quality prompts.
            </p>
          </div>

          {/* Step by Step Process */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📤</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                1. Upload Your Image
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload any image file (PNG, JPG, WEBP) or provide an image URL. Our tool supports high-resolution images up to 512MB.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2. AI Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our advanced AI analyzes colors, composition, style, objects, lighting, and artistic elements to understand your image completely.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3. Get Perfect Prompts
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive detailed, optimized prompts formatted for your chosen AI model. Copy and use them in your favorite AI art generator.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tool Section */}
      <div id="tool" className="scroll-mt-20">
        <ImageToPromptClient />
      </div>

      {/* Features Section - SEO Enhanced */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Image to Prompt Generator?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our free image to prompt generator offers the most advanced features for creating high-quality AI art prompts. Perfect for artists, designers, and AI enthusiasts.
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

      {/* Supported Models Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Compatible with All Major AI Art Platforms
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Generate optimized prompts for your favorite AI art generation tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportedModels.map((model, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border-2 transition-all ${
                  model.popular
                    ? "border-purple-200 bg-purple-50 dark:border-purple-400/30 dark:bg-purple-900/10"
                    : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {model.name}
                  </h3>
                  {model.popular && (
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {model.description}
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
              Discover how our image to prompt generator can enhance your creative workflow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

      {/* FAQ Section for SEO */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Everything you need to know about our image to prompt generator
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                What is an image to prompt generator?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                An image to prompt generator is an AI-powered tool that analyzes images and creates detailed text descriptions (prompts) that can be used to generate similar images with AI art tools like Stable Diffusion, Midjourney, or Flux.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Is this image to prompt generator free to use?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! Our image to prompt generator is completely free to use. You can upload images, generate prompts, and copy them for use in any AI art platform without any cost or registration required.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Which AI art platforms work with generated prompts?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our generated prompts work with all major AI art platforms including Stable Diffusion, Midjourney, Flux, Leonardo AI, and many others. We optimize prompts for each platform's specific requirements.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                What image formats are supported?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We support all common image formats including PNG, JPG, JPEG, WEBP, and GIF. You can upload images up to 512MB in size, and we also support image URLs from web sources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your Images into Perfect AI Prompts?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of artists and creators who use our free image to prompt generator to create stunning AI art. Start generating professional-quality prompts in seconds.
          </p>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 text-xl font-semibold rounded-lg"
            size="lg"
            asChild
          >
            <Link href="#tool">Get Started with Image to Prompt Generator</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
