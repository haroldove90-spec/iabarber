import React, { useState, useCallback, ChangeEvent, useRef, useEffect } from 'react';
import { analyzeFace, getRecommendations, generateExampleImage, simulateHaircut } from '../services/geminiService';
import type { FaceAnalysis, HaircutRecommendation, Preferences } from '../types';
import { UploadIcon, CameraIcon, MagicWandIcon, ScissorsIcon, DownloadIcon, HeartIcon } from './icons';
import { Spinner } from './Spinner';

export const StyleRecommender: React.FC = () => {
  const [userImage, setUserImage] = useState<File | null>(null);
  const [userImagePreview, setUserImagePreview] = useState<string | null>(null);
  const [faceAnalysis, setFaceAnalysis] = useState<FaceAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<HaircutRecommendation[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({ length: 'any', style: 'any' });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [simulatedImage, setSimulatedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showSuccessHighlight, setShowSuccessHighlight] = useState(false);
  const [favoriteStyles, setFavoriteStyles] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load favorites from local storage on component mount
    try {
      const savedFavorites = localStorage.getItem('favoriteStyles');
      if (savedFavorites) {
        setFavoriteStyles(JSON.parse(savedFavorites));
      }
    } catch (e) {
      console.error("Failed to parse favorites from localStorage", e);
    }
  }, []);

  const toggleFavorite = (styleName: string) => {
    const updatedFavorites = favoriteStyles.includes(styleName)
      ? favoriteStyles.filter(name => name !== styleName)
      : [...favoriteStyles, styleName];
    
    setFavoriteStyles(updatedFavorites);
    localStorage.setItem('favoriteStyles', JSON.stringify(updatedFavorites));
  };

  useEffect(() => {
    if (simulatedImage && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setShowSuccessHighlight(true);
      const timer = setTimeout(() => {
        setShowSuccessHighlight(false);
      }, 4000); // Highlight for 4 seconds
      return () => clearTimeout(timer);
    }
  }, [simulatedImage]);

  const resetState = () => {
    setUserImage(null);
    setUserImagePreview(null);
    setFaceAnalysis(null);
    setRecommendations([]);
    setIsLoading(false);
    setError(null);
    setSimulatedImage(null);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      resetState();
      setUserImage(file);
      setUserImagePreview(URL.createObjectURL(file));
    }
  };
  
  useEffect(() => {
    if (isCameraOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Error accessing camera: ", err);
          setError("No se pudo acceder a la cámara. Asegúrate de haber otorgado los permisos necesarios en tu navegador.");
          setIsCameraOpen(false);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen]);

  const handleCapture = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
            resetState();
            setUserImage(file);
            setUserImagePreview(URL.createObjectURL(file));
            setIsCameraOpen(false);
          }
        }, 'image/jpeg');
      }
    }
  }, [videoRef]);


  const handleAnalysis = useCallback(async () => {
    if (!userImage) return;

    setIsLoading(true);
    setError(null);
    setFaceAnalysis(null);
    setRecommendations([]);
    setSimulatedImage(null);

    try {
      setLoadingMessage('Analizando tus rasgos faciales...');
      const analysis = await analyzeFace(userImage);
      setFaceAnalysis(analysis);

      setLoadingMessage('Buscando los mejores estilos para ti...');
      const recs = await getRecommendations(analysis, preferences);

      if (recs.length === 0) {
        setRecommendations([]);
        setError("No pudimos encontrar recomendaciones para tu foto. Intenta con otra imagen.");
        setIsLoading(false);
        return;
      }
      
      setLoadingMessage('Creando imágenes de ejemplo fotorrealistas...');
      const recsWithLoading = recs.map(rec => ({ ...rec, isLoadingImage: true }));
      setRecommendations(recsWithLoading);
      
      const imageResults = await Promise.allSettled(
        recs.map(rec => generateExampleImage(rec.name, analysis.faceShape))
      );

      const finalRecs = recs.map((rec, index) => {
        const result = imageResults[index];
        if (result.status === 'fulfilled') {
          return { ...rec, exampleImageUrl: result.value, isLoadingImage: false };
        } else {
          console.error(`Error al generar imagen para ${rec.name}:`, result.reason);
          return { ...rec, isLoadingImage: false }; // Show card without image on failure
        }
      });
      setRecommendations(finalRecs);

    } catch (err) {
      setError('Hubo un error durante el proceso de recomendación. Por favor, intenta con otra foto.');
      console.error(err);
      setFaceAnalysis(null);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [userImage, preferences]);

  const handleSimulate = async (haircutName: string) => {
      if (!userImage) return;
      setIsLoading(true);
      setSimulatedImage(null);
      setLoadingMessage(`Simulando el corte '${haircutName}' en tu foto...`);
      setError(null);
      
      try {
        const resultImage = await simulateHaircut(userImage, haircutName);
        setSimulatedImage(resultImage);
      } catch (err) {
          setError('No se pudo simular el corte. Por favor, intenta de nuevo.');
          console.error(err);
      } finally {
          setIsLoading(false);
          setLoadingMessage('');
      }
  };

  const handleDownload = () => {
    if (!simulatedImage) return;
    const link = document.createElement('a');
    link.href = simulatedImage;
    link.download = 'mi-nuevo-look.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <section id="recommender" className="py-20 bg-gray-950/50">
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg rounded-lg shadow-2xl h-auto aspect-[4/3] object-cover" muted></video>
            <div className="mt-6 flex gap-4">
                <button onClick={handleCapture} className="bg-gray-200 hover:bg-white text-black font-bold py-3 px-6 rounded-lg text-lg transition-colors">
                    Tomar Foto
                </button>
                <button onClick={() => setIsCameraOpen(false)} className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">
                    Cancelar
                </button>
            </div>
        </div>
      )}
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-playfair text-white">Asesor de Estilo con IA</h2>
          <p className="text-gray-400 mt-2 max-w-2xl mx-auto">Sube una foto clara de tu rostro y deja que nuestra IA te encuentre el peinado perfecto.</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {/* Uploader */}
          <div className="bg-gray-950 rounded-lg p-8 shadow-2xl mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <label htmlFor="photo-upload" className="block text-lg font-semibold text-white mb-2">Paso 1: Sube tu Foto</label>
                <p className="text-gray-400 mb-4 text-sm">Para mejores resultados, usa una foto de frente con buena iluminación y sin gafas de sol.</p>
                <div className="mt-4 flex flex-wrap gap-4">
                    <input type="file" id="photo-upload" accept="image/*" className="hidden" onChange={handleImageChange} />
                    <label htmlFor="photo-upload" className="cursor-pointer inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <UploadIcon className="w-5 h-5" />
                        <span>Seleccionar Archivo</span>
                    </label>
                    <button onClick={() => setIsCameraOpen(true)} className="cursor-pointer inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <CameraIcon className="w-5 h-5" />
                        <span>Tomar Selfie</span>
                    </button>
                </div>
              </div>
              <div className="flex justify-center items-center bg-gray-900 rounded-lg h-48">
                {userImagePreview ? (
                  <img src={userImagePreview} alt="User preview" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <div className="text-center text-gray-600">
                    <CameraIcon className="w-12 h-12 mx-auto" />
                    <p>Vista Previa de la Imagen</p>
                  </div>
                )}
              </div>
            </div>
             {userImage && !faceAnalysis && (
                <div className="mt-6 text-center">
                    <button onClick={handleAnalysis} disabled={isLoading} className="bg-gray-200 hover:bg-white text-black font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400">
                        {isLoading ? 'Analizando...' : 'Analizar mi Rostro y Recomendar'}
                    </button>
                </div>
            )}
          </div>

          {isLoading && <div className="flex justify-center my-8"><Spinner message={loadingMessage} /></div>}
          {error && <div className="text-center my-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">{error}</div>}

          {faceAnalysis && recommendations.length > 0 && (
            <div className="bg-gray-950 rounded-lg p-8 shadow-2xl animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-200 mb-4">Resultados del Análisis</h3>
              <div className="flex flex-wrap gap-x-8 gap-y-2 mb-6">
                <p className="text-gray-300"><strong className="font-semibold text-white">Forma del Rostro:</strong> {faceAnalysis.faceShape}</p>
                {faceAnalysis.features.length > 0 && (
                    <p className="text-gray-300"><strong className="font-semibold text-white">Rasgos:</strong> {faceAnalysis.features.join(', ')}</p>
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-6 pt-4 border-t border-gray-800">Tus Recomendaciones de Estilo</h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {recommendations.map((rec, index) => (
                    <div key={index} className="bg-gray-900 p-4 rounded-lg flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-bold text-gray-300 pr-2">{rec.name}</h4>
                             <button 
                                onClick={() => toggleFavorite(rec.name)}
                                className={`text-gray-500 hover:text-red-500 transition-colors ${favoriteStyles.includes(rec.name) ? 'text-red-500' : ''}`}
                                aria-label="Añadir a favoritos"
                            >
                                <HeartIcon filled={favoriteStyles.includes(rec.name)} className="w-6 h-6" />
                            </button>
                        </div>
                        <p className="text-gray-500 text-sm mb-4 flex-grow">{rec.description}</p>
                        
                        <div className="aspect-square bg-gray-800 rounded-md mb-4 flex items-center justify-center relative overflow-hidden">
                            {rec.isLoadingImage && (
                                <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                                    <Spinner size="sm" />
                                </div>
                            )}
                            {rec.exampleImageUrl ? (
                                <img src={rec.exampleImageUrl} alt={`Ejemplo de ${rec.name}`} className="w-full h-full object-cover transition-opacity duration-300" />
                            ) : (
                                !rec.isLoadingImage && (
                                    <div className="text-center text-gray-600 p-4">
                                        <ScissorsIcon className="w-8 h-8 mx-auto mb-2" />
                                        <span className="text-xs">Error al generar imagen.</span>
                                    </div>
                                )
                            )}
                        </div>
                        
                        <button 
                            onClick={() => handleSimulate(rec.name)} 
                            className="w-full flex items-center justify-center gap-2 mt-auto bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                            disabled={isLoading}
                        >
                            <MagicWandIcon className="w-4 h-4" />
                            <span>Probar este Look</span>
                        </button>
                    </div>
                ))}
              </div>

              {simulatedImage && (
                  <div 
                    ref={resultsRef}
                    className={`mt-8 border-t border-gray-800 pt-8 p-4 rounded-lg transition-all duration-500 ${showSuccessHighlight ? 'ring-4 ring-gray-400 shadow-2xl shadow-gray-400/20' : 'ring-0 ring-transparent'}`}
                    >
                      <h3 className="text-2xl font-bold text-center text-white mb-2">¡Tu Nuevo Look!</h3>
                      {showSuccessHighlight && <p className="text-center text-gray-300 mb-4 animate-pulse">¡Simulación generada con éxito!</p>}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mt-4">
                          <div className='text-center'>
                            <h4 className='font-semibold mb-2'>Original</h4>
                            <img src={userImagePreview!} alt="Original user" className="rounded-lg mx-auto max-h-80" />
                          </div>
                          <div className='text-center'>
                            <h4 className='font-semibold mb-2'>Simulación</h4>
                            <img src={simulatedImage} alt="Simulated haircut" className="rounded-lg mx-auto max-h-80" />
                            <button
                                onClick={handleDownload}
                                className="mt-4 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                <DownloadIcon className="w-5 h-5" />
                                <span>Descargar Look</span>
                            </button>
                          </div>
                      </div>
                  </div>
              )}

            </div>
          )}
        </div>
      </div>
    </section>
  );
};