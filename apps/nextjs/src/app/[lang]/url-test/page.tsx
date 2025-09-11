'use client';

import { useState } from 'react';

export default function UrlTestPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testUrl = async () => {
    if (!imageUrl.trim()) {
      setError('请输入图片URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/image-to-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageUrl.trim(),
          model: 'General Image Prompt',
          language: 'zh'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || '请求失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">URL 图片测试</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            图片 URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="输入图片URL，例如：https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={testUrl}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md"
        >
          {loading ? '处理中...' : '测试 URL'}
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            错误: {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <h3 className="font-semibold">处理成功！</h3>
              <p>输入类型: {result.inputType}</p>
              <p>模型: {result.model}</p>
              <p>语言: {result.language}</p>
              {result.imageUrl && <p>图片URL: {result.imageUrl}</p>}
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <h4 className="font-semibold mb-2">生成的提示词:</h4>
              <p className="whitespace-pre-wrap">{result.prompt}</p>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">测试用的图片URL示例:</h3>
          <div className="space-y-2 text-sm">
            <button
              onClick={() => setImageUrl('https://picsum.photos/800/600')}
              className="block text-blue-600 hover:underline"
            >
              https://picsum.photos/800/600 (随机图片)
            </button>
            <button
              onClick={() => setImageUrl('https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800')}
              className="block text-blue-600 hover:underline"
            >
              https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800 (猫咪图片)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
