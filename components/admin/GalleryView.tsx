import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import * as db from '../../data/database';
import type { GalleryImage } from '../../types';
import { TrashIcon, UploadIcon, CameraIcon, SwitchCameraIcon } from '../icons';
import { Spinner } from '../Spinner';
import { ToastContext } from '../../context/ToastContext';
import { barbers } from '../../data/barbershopData';

export const GalleryView: React.FC = () => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const { addToast } = useContext(ToastContext);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshImages = () => {
        setImages(db.getGalleryImages());
    };

    useEffect(() => {
        refreshImages();
    }, []);

    // Camera logic
    useEffect(() => {
        if (isCameraOpen) {
            // Stop previous stream if any
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode } })
                .then(stream => {
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => {
                    console.error(`Error accessing ${facingMode} camera: `, err);
                    // Fallback to the other camera if the preferred one fails
                    const fallbackMode = facingMode === 'user' ? 'environment' : 'user';
                    setFacingMode(fallbackMode); // Switch state to reflect the fallback
                    navigator.mediaDevices.getUserMedia({ video: { facingMode: fallbackMode } })
                        .then(stream => {
                            streamRef.current = stream;
                            if (videoRef.current) {
                                videoRef.current.srcObject = stream;
                            }
                        })
                        .catch(fallbackErr => {
                            console.error(`Error accessing fallback ${fallbackMode} camera:`, fallbackErr);
                            addToast({ type: 'error', title: 'Error de Cámara', message: 'No se pudo acceder a la cámara. Revisa los permisos.' });
                            setIsCameraOpen(false);
                        });
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
    }, [isCameraOpen, facingMode]);

    const handleSwitchCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };
    
    const processNewImage = (file: File) => {
        setIsLoading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Simulate upload time and assign a random barber for demo
            setTimeout(() => {
                const randomBarber = barbers[Math.floor(Math.random() * barbers.length)];
                const newImage: Omit<GalleryImage, 'id'> = {
                    src: base64String,
                    alt: `Nuevo corte de pelo #${images.length + 1}`,
                    barberName: randomBarber.name,
                };
                db.addGalleryImage(newImage);
                refreshImages();
                setIsLoading(false);
            }, 1000);
        };
        reader.onerror = () => {
            console.error("Error reading file");
            setIsLoading(false);
            addToast({ type: 'error', title: 'Error de Subida', message: 'Hubo un error al procesar la imagen.' });
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            processNewImage(event.target.files[0]);
        }
        if(event.target) event.target.value = ''; // Reset input to allow same file upload
    };

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
                        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                        processNewImage(file);
                        setIsCameraOpen(false);
                    }
                }, 'image/jpeg');
            }
        }
    }, [videoRef, images]);

    const handleDelete = (id: number) => {
        if (window.confirm("¿Seguro que quieres eliminar esta imagen?")) {
            db.deleteGalleryImage(id);
            refreshImages();
        }
    };
    
    return (
        <div>
            {isCameraOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
                    <div className="relative w-full max-w-lg">
                        <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg shadow-2xl h-auto aspect-[4/3] object-cover" muted></video>
                        <button 
                            onClick={handleSwitchCamera} 
                            className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/75 transition-colors"
                            aria-label="Voltear cámara"
                        >
                            <SwitchCameraIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="mt-6 flex gap-4">
                        <button onClick={handleCapture} className="bg-gray-200 hover:bg-white text-black font-bold py-3 px-6 rounded-lg text-lg transition-colors">
                            Capturar y Subir
                        </button>
                        <button onClick={() => setIsCameraOpen(false)} className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
            
            <h1 className="text-3xl font-bold font-playfair text-white mb-6">Gestionar Galería</h1>
            
            <div className="bg-gray-950 p-6 rounded-lg shadow-xl mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Añadir Nueva Imagen</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors">
                        <UploadIcon className="w-5 h-5" />
                        <span>Subir Imagen</span>
                    </button>
                    <button onClick={() => setIsCameraOpen(true)} disabled={isLoading} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors">
                        <CameraIcon className="w-5 h-5" />
                        <span>Tomar Foto</span>
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center my-8">
                    <Spinner message="Procesando imagen..." />
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map(image => (
                    <div key={image.id} className="group relative rounded-lg overflow-hidden shadow-lg">
                        <img src={image.src} alt={image.alt} className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <p className="text-white font-bold text-sm truncate">{image.alt}</p>
                            <p className="text-gray-300 text-xs">por {image.barberName}</p>
                        </div>
                        <button onClick={() => handleDelete(image.id)} className="absolute top-2 right-2 p-1.5 bg-red-800/70 hover:bg-red-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrashIcon className="w-4 h-4 text-white" />
                        </button>
                    </div>
                ))}
            </div>
            {images.length === 0 && !isLoading && <p className="text-gray-500 col-span-full text-center py-8">La galería está vacía.</p>}
        </div>
    );
}