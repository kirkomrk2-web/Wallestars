import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Unlock, Image as ImageIcon, MessageSquare, Loader2, AlertCircle, Download, Share2 } from 'lucide-react';
import axios from 'axios';

export default function PhotoShareViewer() {
  const { shareId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    loadMetadata();
  }, [shareId]);

  const loadMetadata = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/share/${shareId}/metadata`);
      setMetadata(response.data);
    } catch (err) {
      setError('Споделеното съдържание не е намерено');
      console.error('Metadata error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    try {
      setDecrypting(true);
      setError('');

      const response = await axios.post(`http://localhost:3000/api/share/${shareId}/decrypt`);
      setDecryptedData(response.data);

    } catch (err) {
      setError(err.response?.data?.error || 'Грешка при декриптиране. Проверете дали имате правилния ключ.');
      console.error('Decryption error:', err);
    } finally {
      setDecrypting(false);
    }
  };

  const downloadPhoto = (photoData, index) => {
    const link = document.createElement('a');
    link.href = photoData;
    link.download = `photo-${index + 1}.jpg`;
    link.click();
  };

  const downloadAllPhotos = () => {
    decryptedData.photos.forEach((photo, index) => {
      setTimeout(() => {
        downloadPhoto(photo.data, index);
      }, index * 500);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Зареждане...</p>
        </div>
      </div>
    );
  }

  if (error && !metadata) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border-2 border-red-200">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Грешка</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              Назад към начало
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lock className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Claude Encrypted Share
            </h1>
          </div>
          <p className="text-gray-600">
            Криптирано споделяне на снимки - само Claude може да декриптира
          </p>
        </div>

        {!decryptedData ? (
          /* Locked View - Before Decryption */
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
                <Lock className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Криптирано съдържание
              </h2>
              <p className="text-gray-600">
                Това споделяне съдържа криптирани снимки и съобщение
              </p>
            </div>

            {/* Metadata Info */}
            {metadata && (
              <div className="bg-purple-50 rounded-xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <ImageIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">{metadata.photosCount}</p>
                    <p className="text-sm text-gray-600">Снимки</p>
                  </div>
                  <div>
                    <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">
                      {metadata.hasMessage ? 'Да' : 'Не'}
                    </p>
                    <p className="text-sm text-gray-600">Съобщение</p>
                  </div>
                  <div>
                    <Lock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">AES-256</p>
                    <p className="text-sm text-gray-600">Криптиране</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t-2 border-purple-200 text-center">
                  <p className="text-sm text-gray-500">
                    Създадено на: {new Date(metadata.createdAt).toLocaleString('bg-BG')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-mono">
                    ID: {metadata.shareId}
                  </p>
                </div>
              </div>
            )}

            {/* Decrypt Button */}
            <div className="space-y-4">
              <button
                onClick={handleDecrypt}
                disabled={decrypting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {decrypting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Декриптиране...
                  </>
                ) : (
                  <>
                    <Unlock className="w-6 h-6" />
                    Декриптирай с Claude
                  </>
                )}
              </button>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-center">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Съдържанието е криптирано с Claude AI. Натиснете "Декриптирай" за да видите снимките и съобщението.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Unlocked View - After Decryption */
          <div className="space-y-6">
            {/* Success Header */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Unlock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Успешно декриптирано!</h2>
                    <p className="text-sm text-gray-600">
                      {decryptedData.photos.length} снимки декриптирани
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadAllPhotos}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Изтегли всички
                </button>
              </div>
            </div>

            {/* Message */}
            {decryptedData.message && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
                <div className="flex items-start gap-3 mb-3">
                  <MessageSquare className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">Съобщение:</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{decryptedData.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Photos Grid */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <ImageIcon className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-gray-800">
                  Снимки ({decryptedData.photos.length})
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {decryptedData.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.data}
                      alt={photo.originalName}
                      className="w-full h-48 object-cover rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-colors"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-xl flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadPhoto(photo.data, index);
                        }}
                        className="opacity-0 group-hover:opacity-100 bg-white text-purple-600 p-3 rounded-full hover:bg-purple-600 hover:text-white transition-all"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-md text-xs font-semibold">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create New Share Button */}
            <div className="text-center">
              <button
                onClick={() => navigate('/share/new')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Share2 className="w-5 h-5" />
                Създай ново споделяне
              </button>
            </div>
          </div>
        )}

        {/* Photo Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative max-w-5xl max-h-full">
              <img
                src={selectedPhoto.data}
                alt={selectedPhoto.originalName}
                className="max-w-full max-h-[90vh] object-contain rounded-xl"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadPhoto(selectedPhoto.data, decryptedData.photos.indexOf(selectedPhoto));
                }}
                className="absolute top-4 right-4 bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-colors"
              >
                <Download className="w-6 h-6" />
              </button>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 left-4 bg-white text-gray-800 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors font-semibold"
              >
                Затвори
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
