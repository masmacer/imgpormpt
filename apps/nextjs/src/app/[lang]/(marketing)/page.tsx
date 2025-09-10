"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";

import { Button } from "@saasfly/ui/button";
import { ColourfulText } from "@saasfly/ui/colorful-text";
import * as Icons from "@saasfly/ui/icons";
import { Card } from "@saasfly/ui/card";

import type { Locale } from "~/config/i18n-config";
import { useImageToPrompt } from "~/hooks/use-image-to-prompt";

// 功能卡片数据
const features = [
  {
    icon: "🖼️",
    title: "Image to Prompt",
    description: "Convert Image to Prompt to generate your own image"
  },
  {
    icon: "✨",
    title: "Magic Enhance", 
    description: "Transform simple text into detailed, descriptive image prompt"
  },
  {
    icon: "🔍",
    title: "AI Describe Image",
    description: "Let AI help you understand and analyze any image in detail"
  },
  {
    icon: "🎨",
    title: "AI Image Generator",
    description: "Transform your image prompt into stunning visuals with AI-powered generation"
  }
];

// AI模型数据
const aiModels = [
  {
    name: "General Image Prompt",
    description: "Natural language description of the image (normal)",
    checked: true
  },
  {
    name: "Flux",
    description: "Optimized for state-of-the-art Flux AI models (flux)"
  },
  {
    name: "Midjourney",
    description: "Tailored for Midjourney generation with parameters (midjourney)"
  },
  {
    name: "Stable Diffusion",
    description: "Formatted for Stable Diffusion models (stableDiffusion)"
  }
];

export default function IndexPage({
  params: { lang },
}: {
  params: {
    lang: string;
  };
}) {
  const [activeTab, setActiveTab] = useState("image-to-prompt");
  const [selectedModel, setSelectedModel] = useState("General Image Prompt");
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { generatePrompt, isLoading, error } = useImageToPrompt({
    onSuccess: (prompt) => {
      setGeneratedPrompt(prompt);
    }
  });

  const handleFileUpload = (file: File) => {
    // 显示图片预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleGeneratePrompt = async () => {
    let file: File | null = null;

    // 如果有上传的文件，使用文件
    if (fileInputRef.current?.files?.[0]) {
      file = fileInputRef.current.files[0];
    } 
    // 如果有URL，尝试获取文件
    else if (imageUrl) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        file = new File([blob], 'image.jpg', { type: blob.type });
      } catch (error) {
        console.error('Failed to fetch image from URL:', error);
        return;
      }
    }

    if (!file) {
      alert('Please upload an image or provide an image URL');
      return;
    }

    await generatePrompt(file, {
      model: selectedModel,
      language: "en"
    });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* 主标题 */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Create Better AI Art
            <br />
            with <ColourfulText text="Image Prompt" />
          </h1>
          
          {/* 副标题 */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
            Inspire ideas, Enhance image prompt, Create masterpieces
          </p>
          
          {/* 行动按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-lg"
              size="lg"
            >
              Try it now !
            </Button>
            <Button 
              variant="outline" 
              className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20 px-8 py-3 text-lg font-semibold rounded-lg"
              size="lg"
            >
              Tutorials
            </Button>
          </div>
        </div>
      </section>

      {/* Main Feature Section - Image to Prompt Generator */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Free Image to Prompt Generator
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Convert Image to Prompt to generate your own image
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setActiveTab("image-to-prompt")}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-colors ${
                  activeTab === "image-to-prompt"
                    ? "bg-purple-600 text-white"
                    : "text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                }`}
              >
                <Icons.Page className="w-4 h-4" />
                <span>Image to Prompt</span>
              </button>
              <button
                onClick={() => setActiveTab("text-to-prompt")}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-colors ${
                  activeTab === "text-to-prompt"
                    ? "bg-purple-600 text-white"
                    : "text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                }`}
              >
                <Icons.Post className="w-4 h-4" />
                <span>Text to Prompt</span>
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Upload/Input */}
            <div className="space-y-6">
              {activeTab === "image-to-prompt" ? (
                <div>
                  <div className="flex space-x-4 mb-4">
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Image
                    </Button>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Input Image URL"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  
                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                      dragActive
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    onDragEnter={handleDragOver}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {uploadedImage ? (
                      <div className="space-y-4">
                        <img 
                          src={uploadedImage} 
                          alt="Uploaded" 
                          className="max-w-full max-h-64 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Image uploaded successfully
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="text-6xl text-gray-400 mb-4">🖼️</div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          Upload a photo or drag and drop
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          PNG, JPG, or WEBP up to 512MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <textarea
                    placeholder="Describe what you want to generate..."
                    className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                  />
                </div>
              )}

              {/* AI Model Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Select AI Model
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiModels.map((model, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedModel(model.name)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedModel === model.name
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {model.name}
                        </h4>
                        {selectedModel === model.name && (
                          <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                            <Icons.Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {model.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Prompt Language
                </h3>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white">
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>

            {/* Right Side - Preview */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Image Preview
                </h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center bg-gray-50 dark:bg-gray-800">
                  {uploadedImage || imageUrl ? (
                    <img 
                      src={uploadedImage || imageUrl} 
                      alt="Preview" 
                      className="max-w-full max-h-64 mx-auto rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <>
                      <div className="text-6xl text-gray-400 mb-4">🖼️</div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Your image will show here
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
                onClick={handleGeneratePrompt}
                disabled={isLoading || (!uploadedImage && !imageUrl)}
              >
                {isLoading ? (
                  <>
                    <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Prompt"
                )}
              </Button>

              {/* Result Area */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Generated Prompt
                </h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 min-h-32">
                  {error ? (
                    <p className="text-red-500 dark:text-red-400">
                      Error: {error}
                    </p>
                  ) : generatedPrompt ? (
                    <div className="space-y-3">
                      <p className="text-gray-900 dark:text-white">
                        {generatedPrompt}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      >
                        <Icons.Copy className="mr-2 h-4 w-4" />
                        Copy to Clipboard
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      Your generated prompt will appear here...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Interest Links Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You may be interested in:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="#" 
              className="text-purple-600 hover:text-purple-700 underline"
            >
              What is an Image Prompt?
            </Link>
            <Link 
              href="#" 
              className="text-purple-600 hover:text-purple-700 underline"
            >
              How to Write Effective Image Prompt?
            </Link>
          </div>
        </div>
      </section>

      {/* 保留原有的sponsor section */}
      <section className="container pt-24">
        <div className="flex flex-col justify-center items-center pt-10">
          <div className="text-lg text-neutral-500 dark:text-neutral-400">Our Sponsors</div>
          <div className="mt-4 flex items-center gap-4">
            <Link href="https://go.clerk.com/uKDp7Au" target="_blank">
              <Image src="/images/clerk.png" width="48" height="48" alt="clerk"/>
            </Link>
            <Link href="https://www.twillot.com/" target="_blank">
              <Image src="https://www.twillot.com/logo-128.png" width="48" height="48" alt="twillot"/>
            </Link>
            <Link href="https://www.setupyourpay.com/" target="_blank">
              <Image src="https://www.setupyourpay.com/logo.png" width="48" height="48" alt="setupyourpay" />
            </Link>
            <Link href="https://opencollective.com/saasfly" target="_blank">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:bg-accent dark:hover:bg-neutral-800/30">
                <Icons.Heart className="w-5 h-5 fill-pink-600 text-pink-600 dark:fill-pink-700 dark:text-pink-700" />
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-200">Donate</span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
