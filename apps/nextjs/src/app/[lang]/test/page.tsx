import React from 'react';

export default function TestImagePromptPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            图片转Prompt测试工具
          </h1>
          
          <form id="uploadForm" className="space-y-6">
            <div>
              <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-2">
                选择图片文件:
              </label>
              <input
                type="file"
                id="imageFile"
                name="file"
                accept="image/*"
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div id="imagePreview" className="mt-4"></div>
            </div>
            
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                模型类型:
              </label>
              <select
                id="model"
                name="model"
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
                语言:
              </label>
              <select
                id="language"
                name="language"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
            </div>
            
            <button
              type="submit"
              id="submitBtn"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              生成Prompt
            </button>
          </form>
          
          <div id="result" className="mt-8"></div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
        const form = document.getElementById('uploadForm');
        const resultDiv = document.getElementById('result');
        const submitBtn = document.getElementById('submitBtn');
        const imageFileInput = document.getElementById('imageFile');
        const imagePreview = document.getElementById('imagePreview');
        
        // 图片预览
        imageFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = '<img src="' + e.target.result + '" alt="预览图片" class="max-w-xs h-auto border-2 border-gray-300 rounded-lg">';
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.innerHTML = '';
            }
        });
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('imageFile');
            const file = fileInput.files[0];
            
            if (!file) {
                showResult('请选择一个图片文件', 'error');
                return;
            }
            
            // 检查文件类型
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'image/bmp', 'image/tiff'];
            if (!allowedTypes.includes(file.type)) {
                showResult('请选择有效的图片文件格式 (JPEG, PNG, GIF, WebP, HEIC, HEIF, BMP, TIFF)', 'error');
                return;
            }
            
            // 检查文件大小 (512MB)
            const maxSize = 512 * 1024 * 1024;
            if (file.size > maxSize) {
                showResult('文件太大，最大支持 512MB', 'error');
                return;
            }
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('model', document.getElementById('model').value);
            formData.append('language', document.getElementById('language').value);
            
            submitBtn.disabled = true;
            submitBtn.textContent = '处理中...';
            showResult('正在上传和处理图片，请稍候...', 'loading');
            
            try {
                const response = await fetch('/api/image-to-prompt', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    showResult('生成成功！\\n\\n生成的Prompt:\\n' + result.data.prompt + '\\n\\n文件信息:\\n- 文件名: ' + result.data.fileName + '\\n- 文件大小: ' + (result.data.fileSize / 1024).toFixed(2) + ' KB\\n- 模型: ' + result.data.model + '\\n- 语言: ' + result.data.language, 'success');
                } else {
                    showResult('生成失败:\\n' + (result.error || '未知错误') + '\\n\\n调试信息:\\n' + JSON.stringify(result.debug || {}, null, 2), 'error');
                }
            } catch (error) {
                showResult('请求失败: ' + error.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '生成Prompt';
            }
        });
        
        function showResult(message, type) {
            let bgColor = '';
            let textColor = '';
            let borderColor = '';
            
            switch(type) {
                case 'success':
                    bgColor = 'bg-green-50';
                    textColor = 'text-green-800';
                    borderColor = 'border-green-200';
                    break;
                case 'error':
                    bgColor = 'bg-red-50';
                    textColor = 'text-red-800';
                    borderColor = 'border-red-200';
                    break;
                case 'loading':
                    bgColor = 'bg-blue-50';
                    textColor = 'text-blue-800';
                    borderColor = 'border-blue-200';
                    break;
                default:
                    bgColor = 'bg-gray-50';
                    textColor = 'text-gray-800';
                    borderColor = 'border-gray-200';
            }
            
            resultDiv.innerHTML = '<div class="p-4 rounded-lg border-2 ' + bgColor + ' ' + textColor + ' ' + borderColor + '"><pre class="whitespace-pre-wrap font-mono text-sm">' + message + '</pre></div>';
        }
        `
      }} />
    </div>
  );
}
