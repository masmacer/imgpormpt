import { useState, useCallback } from "react";
import { toast } from "@saasfly/ui/use-toast";
import { useSigninModal } from "~/hooks/use-signin-modal";

interface UseImageToPromptOptions {
  onSuccess?: (prompt: string) => void;
  onError?: (error: string) => void;
}

interface UseImageToPromptReturn {
  generatePrompt: (file: File, options?: {
    model?: string;
    language?: string;
  }) => Promise<void>;
  generatePromptFromUrl: (imageUrl: string, options?: {
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
  const signInModal = useSigninModal();

  const handleError = useCallback((err: any, response?: Response) => {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    setError(errorMessage);
    options.onError?.(errorMessage);
    
    // ✅ Show login modal when authentication is required
    if (response?.status === 401) {
      signInModal.onOpen();
      toast({
        title: "Login Required",
        description: "Please sign in to use the image-to-prompt feature",
        variant: "default",
      });
    } else if (response?.status === 402) {
      // Insufficient credits
      toast({
        title: "Insufficient Credits",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [options, signInModal]);

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

    let response: Response | undefined;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", requestOptions.model || "General Image Prompt");
      formData.append("language", requestOptions.language || "en");

      response = await fetch("/api/image-to-prompt", {
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
      handleError(err, response);
    } finally {
      setIsLoading(false);
    }
  }, [options, handleError]);

  const generatePromptFromUrl = useCallback(async (
    imageUrl: string,
    requestOptions: {
      model?: string;
      language?: string;
    } = {}
  ) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    let response: Response | undefined;

    try {
      response = await fetch("/api/image-to-prompt", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          model: requestOptions.model || "General Image Prompt",
          language: requestOptions.language || "en"
        }),
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
      handleError(err, response);
    } finally {
      setIsLoading(false);
    }
  }, [options, handleError]);

  return {
    generatePrompt,
    generatePromptFromUrl,
    isLoading,
    error,
    result
  };
}
