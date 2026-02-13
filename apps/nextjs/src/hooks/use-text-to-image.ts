"use client";

import { useState, useRef } from "react";
import { useToast } from "@saasfly/ui/use-toast";
import { useSigninModal } from "~/hooks/use-signin-modal";

interface TextToImageOptions {
  size?: string;
}

interface TextToImageResult {
  imageUrl?: string;
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
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 轮询检查任务状态
  const pollTaskStatus = async (taskId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 2分钟（每2秒一次）
    
    return new Promise<TextToImageResult>((resolve, reject) => {
      pollIntervalRef.current = setInterval(async () => {
        attempts++;
        console.log(`轮询状态 ${attempts}/${maxAttempts}...`);

        try {
          const response = await fetch(`/api/text-to-image/status?taskId=${taskId}`);
          const data = await response.json();

          if (!response.ok) {
            clearInterval(pollIntervalRef.current!);
            reject(new Error(data.error || "Failed to check task status"));
            return;
          }

          const taskStatus = data.data?.status;
          console.log('任务状态:', taskStatus);

          if (taskStatus === 'SUCCESS') {
            clearInterval(pollIntervalRef.current!);
            const imageResult: TextToImageResult = {
              imageUrl: data.data.imageUrl,
              taskId: taskId,
              status: 'SUCCESS',
            };
            resolve(imageResult);
          } else if (taskStatus === 'FAILED') {
            clearInterval(pollIntervalRef.current!);
            reject(new Error(data.data?.errorMessage || '图片生成失败'));
          } else if (attempts >= maxAttempts) {
            clearInterval(pollIntervalRef.current!);
            reject(new Error('图片生成超时，请稍后重试'));
          }
        } catch (err) {
          clearInterval(pollIntervalRef.current!);
          reject(err);
        }
      }, 2000); // 每2秒轮询一次
    });
  };

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
      // 步骤1: 创建生成任务
      const response = await fetch("/api/text-to-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          size: generateOptions?.size || "1:1",
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

      const taskId = data.data.taskId;
      console.log('任务已创建:', taskId);

      // 步骤2: 轮询任务状态，直到完成
      const imageResult = await pollTaskStatus(taskId);

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
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
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
