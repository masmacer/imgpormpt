'use client';

import { useState } from 'react';

export default function UrlTestPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testUrl = async () => {
    if (!imageUrl.trim()) {
      setError('Please enter image URL');
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
          language: 'en'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Request failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">URL Image Test</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter image URL, e.g.: https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={testUrl}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md"
        >
          {loading ? 'Processing...' : 'Test URL'}
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <h3 className="font-semibold">Success!</h3>
              <p>Input Type: {result.inputType}</p>
              <p>Model: {result.model}</p>
              <p>Language: {result.language}</p>
              {result.imageUrl && <p>Image URL: {result.imageUrl}</p>}
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <h4 className="font-semibold mb-2">Generated Prompt:</h4>
              <p className="whitespace-pre-wrap">{result.prompt}</p>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Sample Image URLs for Testing:</h3>
          <div className="space-y-2 text-sm">
            <button
              onClick={() => setImageUrl('https://picsum.photos/800/600')}
              className="block text-blue-600 hover:underline"
            >
              https://picsum.photos/800/600 (Random Image)
            </button>
            <button
              onClick={() => setImageUrl('https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800')}
              className="block text-blue-600 hover:underline"
            >
              https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800 (Cat Image)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
