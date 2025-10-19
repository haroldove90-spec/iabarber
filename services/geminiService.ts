import { GoogleGenAI, Type, Modality } from '@google/genai';
import type { FaceAnalysis, HaircutRecommendation, Preferences } from '../types';

// Lazily initialize the AI client to avoid startup errors
// if process.env.API_KEY is not available on module load.
let aiInstance: GoogleGenAI | null = null;
const getAi = (): GoogleGenAI => {
    if (!aiInstance) {
        // This check prevents a ReferenceError if 'process' is not defined in the browser.
        if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
            // Throw a more informative error when AI features are used without configuration.
            throw new Error("API_KEY environment variable is not set. Configure it in your deployment environment to use AI features.");
        }
        aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return aiInstance;
}

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeFace = async (image: File): Promise<FaceAnalysis> => {
  const ai = getAi();
  const imagePart = await fileToGenerativePart(image);
  const prompt = "Analiza a la persona en esta imagen. Identifica la forma de su rostro (ej., Ovalada, Redonda, Cuadrada, Corazón, Diamante, Alargada) y cualquier rasgo facial prominente como barba, bigote o gafas. Devuelve la respuesta como un objeto JSON con las claves 'faceShape' (string) y 'features' (un array de strings).";
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                faceShape: { type: Type.STRING },
                features: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        }
    }
  });

  const jsonString = response.text?.trim();
  if (!jsonString) {
      throw new Error("La IA devolvió una respuesta vacía o inválida al analizar el rostro.");
  }
  return JSON.parse(jsonString) as FaceAnalysis;
};

export const getRecommendations = async (faceAnalysis: FaceAnalysis, preferences: Preferences): Promise<HaircutRecommendation[]> => {
  const ai = getAi();
    
  const lengthMap = {
      'short': 'corto',
      'medium': 'mediano',
      'long': 'largo'
  };

  const styleMap = {
      'classic': 'clásico',
      'modern': 'moderno',
      'casual': 'casual'
  }

  let prompt = `Basado en una forma de rostro '${faceAnalysis.faceShape}' y rasgos como [${faceAnalysis.features.join(', ')}], recomienda 4 estilos de corte de pelo.`;
  if (preferences.length !== 'any') {
    prompt += ` El usuario prefiere el pelo de largo ${lengthMap[preferences.length]}.`;
  }
  if (preferences.style !== 'any') {
    prompt += ` Le gusta un estilo ${styleMap[preferences.style]}.`;
  }
  prompt += " Para cada estilo, proporciona un 'name' (nombre) y una 'description' (descripción) breve en español. Devuelve el resultado como un array de objetos JSON, donde cada objeto tenga las claves 'name' y 'description'.";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING }
                }
            }
        }
    }
  });
  
  const jsonString = response.text?.trim();
  if (!jsonString) {
      throw new Error("La IA devolvió una respuesta vacía o inválida para las recomendaciones.");
  }
  return JSON.parse(jsonString) as HaircutRecommendation[];
};

export const generateExampleImage = async (haircutName: string, faceShape: string): Promise<string> => {
  const ai = getAi();
  const prompt = `Un retrato fotorrealista de alta calidad de un hombre con un rostro de forma '${faceShape}' y un peinado '${haircutName}'. Ambiente de barbería moderna, fondo limpio.`;
  
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '1:1',
      outputMimeType: 'image/jpeg',
    },
  });

  const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
  if (!base64ImageBytes) {
      throw new Error(`La IA no pudo generar una imagen de ejemplo para '${haircutName}'.`);
  }
  return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const simulateHaircut = async (userImage: File, haircutName: string): Promise<string> => {
  const ai = getAi();
  const imagePart = await fileToGenerativePart(userImage);
  const prompt = `
INSTRUCCIÓN: Eres un editor de imágenes experto en peinados.
TAREA: Edita la imagen proporcionada para cambiar el peinado de la persona y que coincida con el estilo '${haircutName}'.
REGLAS:
1.  Mantén los rasgos faciales originales, la expresión y el tono de piel de la persona.
2.  No alteres el fondo de la imagen.
3.  El resultado debe ser una imagen fotorrealista.
4.  Responde ÚNICAMENTE con la imagen modificada. No incluyas ningún texto, descripción o comentario en tu respuesta.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  for (const part of response.candidates?.[0]?.content.parts ?? []) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      return `data:image/png;base64,${base64ImageBytes}`;
    }
  }

  throw new Error("La IA no pudo generar una imagen simulada. Por favor, intenta con otra foto o estilo.");
};