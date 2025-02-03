import React, { useState } from 'react';
import { Download, Youtube, Settings, FileVideo, FileAudio } from 'lucide-react';

type Quality = '1080p' | '720p' | '480p' | '360p';
type Format = 'video' | 'audio';

// L'URL de l'API en production ou en développement
const API_URL = import.meta.env.PROD 
  ? 'https://nassoudl-backend.onrender.com' // Nous devrons déployer le backend sur Render ou un service similaire
  : 'http://localhost:3000';

function App() {
  const [url, setUrl] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [format, setFormat] = useState<Format>('video');
  const [quality, setQuality] = useState<Quality>('720p');
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setDownloading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          format,
          quality,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec du téléchargement');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = response.headers.get('content-disposition')?.split('filename=')[1].replace(/"/g, '') || 'video';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      setUrl('');
    } catch (error) {
      console.error('Download error:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center mb-16">
          <div className="bg-purple-100 rounded-full p-6 mb-4">
            <Download className="w-16 h-16 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">NassouDL</h1>
        </div>

        <main className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Téléchargez vos vidéos YouTube
            </h2>
            <p className="text-lg text-gray-600">
              Simple, rapide et efficace
            </p>
          </div>

          <form onSubmit={handleDownload} className="space-y-6">
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Collez l'URL de la vidéo YouTube ici..."
                className="w-full px-4 py-4 pr-12 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Youtube className="w-6 h-6 text-red-500" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
              <div className="flex flex-col space-y-3">
                <label className="text-sm font-medium text-gray-700">Format</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setFormat('video')}
                    className={`flex items-center justify-center px-4 py-3 rounded-lg w-full ${
                      format === 'video'
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                    }`}
                  >
                    <FileVideo className="w-5 h-5 mr-2" />
                    MP4 Vidéo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('audio')}
                    className={`flex items-center justify-center px-4 py-3 rounded-lg w-full ${
                      format === 'audio'
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                    }`}
                  >
                    <FileAudio className="w-5 h-5 mr-2" />
                    MP3 Audio
                  </button>
                </div>
              </div>

              {format === 'video' && (
                <div className="flex flex-col space-y-3">
                  <label className="text-sm font-medium text-gray-700">Qualité</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['1080p', '720p', '480p', '360p'] as Quality[]).map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuality(q)}
                        className={`px-3 py-3 rounded-lg text-sm font-medium ${
                          quality === q
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                            : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!url || downloading}
              className={`w-full py-4 px-6 text-lg font-semibold text-white rounded-lg transition-all
                ${downloading 
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800'}`}
            >
              {downloading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement en cours...
                </span>
              ) : (
                'Télécharger'
              )}
            </button>
          </form>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Haute Qualité</h3>
              <p className="text-gray-600">Téléchargez vos vidéos dans la meilleure qualité disponible</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Formats Multiples</h3>
              <p className="text-gray-600">Choisissez entre MP4 vidéo ou MP3 audio</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Youtube className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">YouTube</h3>
              <p className="text-gray-600">Téléchargez facilement depuis YouTube</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;