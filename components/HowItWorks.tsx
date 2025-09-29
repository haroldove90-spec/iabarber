import React from 'react';
import { UploadIcon, ScissorsIcon, MagicWandIcon } from './icons';

const StepCard: React.FC<{ icon: React.ReactNode; title: string; description: string; stepNumber: number }> = ({ icon, title, description, stepNumber }) => {
    return (
        <div className="text-center p-6 bg-gray-900 rounded-lg shadow-lg">
            <div className="relative inline-block">
                <div className="w-20 h-20 mx-auto bg-gray-800 rounded-full flex items-center justify-center text-gray-300">
                    {icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-black font-bold text-lg">
                    {stepNumber}
                </div>
            </div>
            <h3 className="text-xl font-bold mt-6 mb-2 text-white">{title}</h3>
            <p className="text-gray-400">{description}</p>
        </div>
    );
}

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-playfair text-white">Cómo Funciona</h2>
          <p className="text-gray-400 mt-2">Consigue tu corte perfecto en tres sencillos pasos.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <StepCard 
            stepNumber={1}
            icon={<UploadIcon className="w-10 h-10" />}
            title="Sube Tu Foto"
            description="Elige una foto tuya clara y de frente. Nuestra IA necesita una buena vista para hacer su magia."
          />
          <StepCard 
            stepNumber={2}
            icon={<ScissorsIcon className="w-10 h-10" />}
            title="Obtén Recomendaciones de IA"
            description="Nuestro algoritmo avanzado analiza la forma de tu rostro y sugiere los peinados más favorecedores para ti."
          />
          <StepCard 
            stepNumber={3}
            icon={<MagicWandIcon className="w-10 h-10" />}
            title="Visualiza Tu Nuevo Look"
            description="Ve una simulación de cómo te quedarán los estilos recomendados antes de poner un pie en la barbería."
          />
        </div>
      </div>
    </section>
  );
};