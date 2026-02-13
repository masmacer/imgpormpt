"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@saasfly/ui/button";
import { Card } from "@saasfly/ui/card";
import { useImageToPrompt } from "~/hooks/use-image-to-prompt";
import { CreditsDisplay } from "~/components/credits-display";

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
    description: "Optimized for Midjourney AI models (midjourney)"
  },
  {
    name: "Stable Diffusion",
    description: "Optimized for Stable Diffusion AI models (stable-diffusion)"
  }
];

export default function ImageToPromptClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("image-to-prompt");
  const [selectedModel, setSelectedModel] = useState("General Image Prompt");
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { generatePrompt, generatePromptFromUrl, isLoading, error } = useImageToPrompt({
    onSuccess: (prompt) => {
      setGeneratedPrompt(prompt);
    }
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setImageUrl("");
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      setUploadedImage(imageUrl.trim());
    }
  };

  const handleGenerate = async () => {
    if (activeTab === "image-to-prompt") {
      // 文件上传模式
      if (fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        await generatePrompt(file, {
          model: selectedModel,
          language: "en"
        });
      } else {
        alert("Please upload an image file first");
      }
    } else if (activeTab === "url-input") {
      // URL模式
      if (imageUrl.trim()) {
        await generatePromptFromUrl(imageUrl.trim(), {
          model: selectedModel,
          language: "en"
        });
      } else {
        alert("Please enter an image URL first");
      }
    }
  };

  return (
    <section className="container pt-24 pb-32">
      <div className="max-w-4xl mx-auto">
        {/* Credits Display */}
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-md">
            <CreditsDisplay showDetails={false} />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-muted rounded-lg p-1 inline-flex">
            <button
              onClick={() => setActiveTab("image-to-prompt")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "image-to-prompt"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🖼️ Image to Prompt
            </button>
            <button
              onClick={() => setActiveTab("url-input")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "url-input"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🔗 URL Input
            </button>
          </div>
        </div>

        <Card className="p-8">
          {activeTab === "image-to-prompt" ? (
            <div className="space-y-6">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploadedImage ? (
                  <div className="space-y-4">
                    <img
                      src={uploadedImage}
                      alt="Uploaded preview"
                      className="max-w-full max-h-64 mx-auto rounded-lg"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUploadedImage(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl">📁</div>
                    <div>
                      <p className="text-lg font-medium">Drop your image here</p>
                      <p className="text-muted-foreground">or click to browse</p>
                    </div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      Choose File
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
                  />
                  <Button onClick={handleUrlSubmit} variant="outline">
                    Load Image
                  </Button>
                </div>
              </div>
              
              {uploadedImage && (
                <div className="text-center">
                  <img
                    src={uploadedImage}
                    alt="URL preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg"
                  />
                </div>
              )}
            </div>
          )}

          {/* Model Selection */}
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold">Select AI Model</h3>
            <div className="grid gap-3">
              {aiModels.map((model) => (
                <label
                  key={model.name}
                  className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                >
                  <input
                    type="radio"
                    name="model"
                    value={model.name}
                    checked={selectedModel === model.name}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {model.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center mt-8">
            <Button
              onClick={handleGenerate}
              disabled={!uploadedImage || isLoading}
              size="lg"
              className="px-8"
            >
              {isLoading ? "Generating..." : "Generate Prompt"}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {/* Generated Prompt */}
          {generatedPrompt && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold">Generated Prompt</h3>
              <div className="p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap">{generatedPrompt}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                  variant="outline"
                  size="sm"
                >
                  Copy to Clipboard
                </Button>
                <Button
                  onClick={() => router.push(`/text-to-image?prompt=${encodeURIComponent(generatedPrompt)}`)}
                  size="sm"
                >
                  🎨 Generate Image
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}