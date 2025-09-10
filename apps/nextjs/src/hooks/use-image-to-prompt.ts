import { useState, useCallback } from "react";
import { toast } from "@saasfly/ui/use-toast";

interface UseImageToPromptOptions {
  onSuccess?: (prompt: string) => void;
  onError?: (error: string) => void;
}

interface UseImageToPromptReturn {
  generatePrompt: (file: File, options?: {
    model?: string;
    language?: string;
  }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  result: string | null;
}

export function useImageToPrompt(options: UseImageToPromptOptions = {}): UseImageToPromptReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const generatePrompt = useCallback(async (
    file: File,
    requestOptions: {
      model?: string;
      language?: string;
    } = {}
  ) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", requestOptions.model || "General Image Prompt");
      formData.append("language", requestOptions.language || "en");

      const response = await fetch("/api/image-to-prompt", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate prompt");
      }

      if (data.success && data.data.prompt) {
        setResult(data.data.prompt);
        options.onSuccess?.(data.data.prompt);
        
        toast({
          title: "Success!",
          description: "Prompt generated successfully",
        });
      } else {
        throw new Error("No prompt generated");
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      options.onError?.(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    generatePrompt,
    isLoading,
    error,
    result,
  };
}
