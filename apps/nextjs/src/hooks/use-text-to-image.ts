"use client";

import { useState } from "react";
import { useToast } from "@saasfly/ui/use-toast";
import { useSigninModal } from "~/hooks/use-signin-modal";

interface TextToImageOptions {
  size?: string;
  isEnhance?: boolean;
  referenceImageUrl?: string;
}

interface TextToImageResult {
  imageUrl: string;
  taskId: string;
  status: string;
}

export function useTextToImage(options?: {
  onSuccess?: (result: TextToImageResult) => void;
  onError?: (error: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TextToImageResult | null>(null);
  const { toast } = useToast();
  const signInModal = useSigninModal();

  const generateImage = async (
    prompt: string,
    generateOptions?: TextToImageOptions
  ) => {
    if (!prompt || prompt.trim() === "") {
      const errorMsg = "Please enter a text prompt";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/text-to-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          size: generateOptions?.size || "1:1",
          isEnhance: generateOptions?.isEnhance || false,
          referenceImageUrl: generateOptions?.referenceImageUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle authentication error
        if (response.status === 401) {
          signInModal.onOpen();
          throw new Error("Please sign in to generate images");
        }

        // Handle insufficient credits
        if (response.status === 402) {
          const errorMessage = data.message || "Insufficient credits";
          toast({
            title: "Insufficient Credits",
            description: errorMessage,
            variant: "destructive",
          });
          throw new Error(errorMessage);
        }

        throw new Error(data.error || "Failed to generate image");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to generate image");
      }

      const imageResult: TextToImageResult = {
        imageUrl: data.data.imageUrl,
        taskId: data.data.taskId,
        status: data.data.status,
      };

      setResult(imageResult);
      
      if (options?.onSuccess) {
        options.onSuccess(imageResult);
      }

      toast({
        title: "Success",
        description: "Image generated successfully!",
      });

      return imageResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      
      if (options?.onError) {
        options.onError(errorMessage);
      }

      // Only show toast if it's not a credits or auth error (already handled above)
      if (!(err instanceof Error && (err.message.includes("credits") || err.message.includes("sign in")))) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkTaskStatus = async (taskId: string) => {
    try {
      const response = await fetch(`/api/text-to-image/status?taskId=${taskId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to check task status");
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to check status";
      console.error("Status check error:", errorMessage);
      return null;
    }
  };

  return {
    generateImage,
    checkTaskStatus,
    isLoading,
    error,
    result,
  };
}
