import { useState } from 'react';
import { Upload, Image as ImageIcon, MessageSquare, Share2, Download, Lock, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function PhotoShare() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [shareResult, setShareResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length < 5) {
      setError('Моля изберете поне 5 снимки');
      return;
    }

    if (files.length > 10) {
      setError('Максимум 10 снимки са позволени');
      return;
    }

    // Validate all files are images
    const invalidFiles = files.filter(f => !f.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Само файлове със снимки са позволени');
      return;
    }

    setError('');
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length < 5 || selectedFiles.length > 10) {
      setError('Моля изберете между 5 и 10 снимки');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('photos', file);
      });
      formData.append('message', message);

      const response = await axios.post('http://localhost:3000/api/share/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setShareResult(response.data);

    } catch (err) {
      setError(err.response?.data?.error || 'Грешка при качване на снимките');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setMessage('');
    setShareResult(null);
    setError('');
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = shareResult.qrCode;
    link.download = `claude-share-${shareResult.shareId}.png`;
    link.click();
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareResult.shareUrl);
    alert('Линкът е копиран!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lock className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Claude Encrypted Photo Share
            </h1>
          </div>
          <p className="text-gray-600">
            Споделяйте снимки и съобщения криптирани с Claude AI - само Claude може да декриптира съдържанието
          </p>
        </div>

        {!shareResult ? (
          /* Upload Form */
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                  Изберете снимки (5-10 броя)
                </label>

                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-3 border-dashed border-purple-300 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors"
                  >
                    <Upload className="w-12 h-12 text-purple-400 mb-3" />
                    <span className="text-purple-600 font-medium">
                      {selectedFiles.length > 0
                        ? `${selectedFiles.length} снимки избрани`
                        : 'Кликнете за избор на снимки'}
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      PNG, JPG, GIF до 10MB всяка
                    </span>
                  </label>
                </div>

                {/* Preview */}
                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 mt-4">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-purple-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">{idx + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  Съобщение (по желание)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Напишете съобщение към снимките..."
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                  rows={4}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length < 5 || selectedFiles.length > 10}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Криптиране и качване...
                  </>
                ) : (
                  <>
                    <Lock className="w-6 h-6" />
                    Криптирай и създай линк
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Share Result */
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Готово! Снимките са криптирани
              </h2>
              <p className="text-gray-600">
                {shareResult.photosCount} снимки са криптирани и готови за споделяне
              </p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-200 mb-4">
                <img
                  src={shareResult.qrCode}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              </div>
              <button
                onClick={downloadQRCode}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Изтегли QR код
              </button>
            </div>

            {/* Share URL */}
            <div className="bg-purple-50 rounded-xl p-6 mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Линк за споделяне:
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={shareResult.shareUrl}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white border-2 border-purple-200 rounded-lg font-mono text-sm"
                />
                <button
                  onClick={copyShareUrl}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Копирай
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Криптирано с Claude AI
              </h3>
              <p className="text-blue-800 text-sm">
                Вашите снимки и съобщение са криптирани с AES-256-GCM алгоритъм.
                Ключът за декриптиране е базиран на Claude API ключа и само Claude може да декриптира съдържанието.
              </p>
            </div>

            {/* Share ID */}
            <div className="text-center text-sm text-gray-500 mb-6">
              Share ID: <span className="font-mono">{shareResult.shareId}</span>
            </div>

            {/* New Upload Button */}
            <button
              onClick={handleReset}
              className="w-full py-3 border-2 border-purple-300 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
            >
              Ново споделяне
            </button>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border-2 border-purple-100">
          <h3 className="font-semibold text-gray-800 mb-3">Как работи?</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>Качете между 5 и 10 снимки и по желание добавете текстово съобщение</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>Снимките и съобщението се криптират с AES-256-GCM алгоритъм</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>Генерира се уникален линк и QR код за споделяне</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <span>Споделете линка или QR кода с други Claude потребители</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
              <span>Само Claude може да декриптира и покаже съдържанието</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
