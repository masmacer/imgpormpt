"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@saasfly/ui/button";
import { Card } from "@saasfly/ui/card";
import { useTextToImage } from "~/hooks/use-text-to-image";
import { CreditsDisplay } from "~/components/credits-display";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

// 尺寸选项
const sizeOptions = [
  { value: "1:1", label: "Square (1:1)", description: "Perfect for social media posts" },
  { value: "3:2", label: "Landscape (3:2)", description: "Great for wallpapers and banners" },
  { value: "2:3", label: "Portrait (2:3)", description: "Ideal for mobile screens and stories" },
];

export default function TextToImageClient() {
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [selectedSize, setSelectedSize] = useState("1:1");
  const [isEnhance, setIsEnhance] = useState(false);
  const [referenceImageUrl, setReferenceImageUrl] = useState("");
  const [useReference, setUseReference] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  const { generateImage, isLoading, error } = useTextToImage({
    onSuccess: (result) => {
      setGeneratedImageUrl(result.imageUrl);
      setTaskId(result.taskId);
    }
  });

  // 从 URL 参数自动填充 prompt
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam) {
      setPrompt(decodeURIComponent(promptParam));
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      return;
    }

    await generateImage(prompt, {
      size: selectedSize,
      isEnhance: isEnhance,
      referenceImageUrl: useReference ? referenceImageUrl : undefined,
    });
  };

  const handleDownload = () => {
    if (generatedImageUrl) {
      window.open(generatedImageUrl, '_blank');
    }
  };

  const handleClear = () => {
    setPrompt("");
    setReferenceImageUrl("");
    setGeneratedImageUrl(null);
    setTaskId(null);
    setUseReference(false);
  };

  return (
    <section className="container pt-24 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Credits Display */}
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-md">
            <CreditsDisplay showDetails={false} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Input Controls */}
          <Card className="p-6 h-fit">
            <div className="space-y-6">
              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Text Prompt *
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create... (e.g., 'A beautiful sunset over the mountains with vibrant orange and purple colors')"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-[150px] resize-y"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Be specific and detailed for best results
                </p>
              </div>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Image Size
                </label>
                <div className="grid gap-2">
                  {sizeOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedSize === option.value
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={option.value}
                        checked={selectedSize === option.value}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Enhance Option */}
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <input
                  type="checkbox"
                  id="enhance"
                  checked={isEnhance}
                  onChange={(e) => setIsEnhance(e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <label htmlFor="enhance" className="font-medium text-sm cursor-pointer">
                    ✨ Enhance Prompt
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatically improve your prompt for better quality results
                  </p>
                </div>
              </div>

              {/* Reference Image Toggle */}
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <input
                  type="checkbox"
                  id="useReference"
                  checked={useReference}
                  onChange={(e) => setUseReference(e.target.checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="useReference" className="font-medium text-sm cursor-pointer">
                    🖼️ Use Reference Image (Optional)
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add a reference image URL to guide the generation
                  </p>
                  
                  {useReference && (
                    <input
                      type="url"
                      value={referenceImageUrl}
                      onChange={(e) => setReferenceImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full mt-3 px-3 py-2 border border-input rounded-md bg-background text-sm"
                    />
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isLoading}
                  size="lg"
                  className="flex-1"
                >
                  {isLoading ? "Generating..." : "Generate Image"}
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  size="lg"
                  disabled={isLoading}
                >
                  Clear
                </Button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Right Side - Generated Image */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Generated Image</h3>
              
              {generatedImageUrl ? (
                <div className="space-y-4">
                  <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={generatedImageUrl}
                      alt="Generated image"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      📥 Download Image
                    </Button>
                    <Button
                      onClick={() => navigator.clipboard.writeText(generatedImageUrl)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      📋 Copy URL
                    </Button>
                  </div>

                  {taskId && (
                    <p className="text-xs text-muted-foreground text-center">
                      Task ID: {taskId}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center aspect-square bg-muted rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-muted-foreground">
                    Your generated image will appear here
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Enter a prompt and click "Generate Image" to start
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Tips Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h4 className="font-semibold mb-2">💡 Writing Great Prompts</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Be specific about details and style</li>
              <li>• Include colors, lighting, and mood</li>
              <li>• Mention artistic style or technique</li>
              <li>• Add quality keywords like "detailed", "HD"</li>
            </ul>
          </Card>
          <Card className="p-4">
            <h4 className="font-semibold mb-2">🎯 Best Practices</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Start simple, then refine</li>
              <li>• Use the enhance feature for better results</li>
              <li>• Choose the right size for your use case</li>
              <li>• Reference images can guide the style</li>
            </ul>
          </Card>
          <Card className="p-4">
            <h4 className="font-semibold mb-2">✨ Example Prompts</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• "Cyberpunk city at night, neon lights"</li>
              <li>• "Watercolor painting of a forest in autumn"</li>
              <li>• "Minimalist logo design, modern, clean"</li>
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
