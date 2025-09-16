'use client';

import React, { useState } from 'react';

export default function TestImagePromptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState('General Image Prompt');
  const [language, setLanguage] = useState('en');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setImagePreview('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an image file');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'image/bmp', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file format (JPEG, PNG, GIF, WebP, HEIC, HEIF, BMP, TIFF)');
      return;
    }

    // Check file size (512MB)
    const maxSize = 512 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large, maximum 512MB supported');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', model);
    formData.append('language', language);

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/image-to-prompt', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Image to Prompt Test Tool
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-2">
                Select Image File:
              </label>
              <input
                type="file"
                id="imageFile"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {imagePreview && (
                <div className="mt-4">
                  <img src={imagePreview} alt="Preview" className="max-w-xs h-auto border-2 border-gray-300 rounded-lg" />
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                Model Type:
              </label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="General Image Prompt">General Image Prompt</option>
                <option value="Stable Diffusion">Stable Diffusion</option>
                <option value="Flux">Flux</option>
                <option value="Midjourney">Midjourney</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                Language:
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Generate Prompt'}
            </button>
          </form>
          
          {error && (
            <div className="mt-8 p-4 rounded-lg border-2 bg-red-50 text-red-800 border-red-200">
              <pre className="whitespace-pre-wrap font-mono text-sm">Error: {error}</pre>
            </div>
          )}

          {loading && (
            <div className="mt-8 p-4 rounded-lg border-2 bg-blue-50 text-blue-800 border-blue-200">
              <pre className="whitespace-pre-wrap font-mono text-sm">Uploading and processing image, please wait...</pre>
            </div>
          )}

          {result && (
            <div className="mt-8 p-4 rounded-lg border-2 bg-green-50 text-green-800 border-green-200">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {`Generation successful!

Generated Prompt:
${result.prompt}

File Information:
- File name: ${result.fileName}
- File size: ${(result.fileSize / 1024).toFixed(2)} KB
- Model: ${result.model}
- Language: ${result.language}`}
              </pre>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
