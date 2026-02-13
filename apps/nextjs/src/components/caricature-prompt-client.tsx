"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@saasfly/ui/button";
import { Card } from "@saasfly/ui/card";
import { CreditsDisplay } from "~/components/credits-display";

// 风格选项
const caricatureStyles = [
  {
    name: "Traditional Sketch",
    description: "Hand-drawn pencil or charcoal sketch appearance",
    checked: true
  },
  {
    name: "3D Cartoon",
    description: "Modern 3D animated style with depth and detailed textures"
  },
  {
    name: "Pixar-style",
    description: "High-quality animated movie style with expressive characters"
  }
];

export default function CaricaturePromptClient() {
  const router = useRouter();
  const [characterDescription, setCharacterDescription] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Traditional Sketch");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file");
        return;
      }
      
      // 检查文件大小 (限制 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);
      
      // 创建预览
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImageFile(null);
  };

  const handleGenerate = async () => {
    if (!characterDescription.trim() && !imageFile) {
      setError("Please upload an image or enter a character description");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let response;
      
      if (imageFile) {
        // 使用FormData上传文件，与首页保持一致
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('style', selectedStyle);
        if (characterDescription.trim()) {
          formData.append('description', characterDescription);
        }

        response = await fetch("/api/caricature-prompt", {
          method: "POST",
          body: formData,
        });
      } else {
        // 只有文字描述，使用JSON
        response = await fetch("/api/caricature-prompt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: characterDescription,
            style: selectedStyle,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate prompt");
      }

      const data = await response.json();
      setGeneratedPrompt(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
  };

  const handleClear = () => {
    setCharacterDescription("");
    setGeneratedPrompt("");
    setUploadedImage(null);
    setImageFile(null);
    setError("");
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

        <Card className="p-8">
          <div className="space-y-6">
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Your Selfie
              </label>
              <p className="text-sm text-muted-foreground mb-3">
                Upload a clear photo of yourself to generate a cartoon prompt
              </p>
              {!uploadedImage ? (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-3xl">📸</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Click to upload your selfie</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative border rounded-lg overflow-hidden">
                  <img
                    src={uploadedImage}
                    alt="Uploaded preview"
                    className="w-full h-auto max-h-64 object-contain bg-muted"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-8 h-8 flex items-center justify-center hover:bg-destructive/90 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Character Description Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Or Describe Your Character (Optional if image uploaded)
              </label>
              <p className="text-sm text-muted-foreground mb-3">
                Provide details or describe the character you want to transform into a cartoon
              </p>
              <textarea
                value={characterDescription}
                onChange={(e) => setCharacterDescription(e.target.value)}
                placeholder="E.g., 'A young woman with curly hair, wearing glasses and a casual t-shirt, smiling' or add details about your uploaded photo"
                className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-[120px] resize-y"
                rows={4}
              />
            </div>

            {/* Style Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Select Caricature Style</h3>
              <div className="grid gap-3">
                {caricatureStyles.map((style) => (
                  <label
                    key={style.name}
                    className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="style"
                      value={style.name}
                      checked={selectedStyle === style.name}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">{style.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {style.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleGenerate}
                disabled={(!characterDescription.trim() && !uploadedImage) || isLoading}
                size="lg"
                className="px-8"
              >
                {isLoading ? "Generating..." : "Generate Caricature Prompt"}
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                size="lg"
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

            {/* Generated Prompt */}
            {generatedPrompt && (
              <div className="space-y-4 mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold">Generated Caricature Prompt</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{generatedPrompt}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                  >
                    📋 Copy to Clipboard
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    variant="outline"
                    size="sm"
                  >
                    🔄 Regenerate
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
          </div>
        </Card>

        {/* Tips Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-semibold mb-2">💡 Pro Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Upload a clear, well-lit selfie for best results</li>
              <li>• Face the camera directly with good lighting</li>
              <li>• You can combine image + text for more details</li>
            </ul>
          </Card>
          <Card className="p-4">
            <h4 className="font-semibold mb-2">🎨 Best Practices</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Try different styles to find your preferred look</li>
              <li>• Add specific features in the description</li>
              <li>• Include clothing and accessories for context</li>
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
