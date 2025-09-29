import type { Service, Barber } from '../types';

export const services: Service[] = [
  { name: 'Corte de Precisión con IA', price: '$50', description: 'Un corte adaptado a la forma de tu rostro, impulsado por nuestro análisis de IA.' },
  { name: 'Afeitado Clásico con Toalla Caliente', price: '$45', description: 'Un afeitado tradicional con navaja, toallas calientes y bálsamos premium.' },
  { name: 'Recorte y Perfilado de Barba', price: '$30', description: 'Perfilado y acondicionamiento experto para una barba perfectamente esculpida.' },
  { name: 'Coloración y Disimulación de Canas', price: '$60+', description: 'Sutil o atrevido, ofrecemos servicios de coloración expertos para un look fresco.' },
  { name: 'El Paquete Completo', price: '$85', description: 'Incluye nuestro corte con IA y un afeitado clásico con toalla caliente para la experiencia definitiva.' },
  { name: 'Corte para Niños (Menores de 12)', price: '$30', description: 'Un corte elegante y cómodo para los jóvenes caballeros.'}
];

export const barbers: Barber[] = [
  { name: 'Alex "The Razor" Russo', specialty: 'Cortes Clásicos y Degradados', img: 'https://picsum.photos/id/1005/400/400' },
  { name: 'Benjamin "Benny" Carter', specialty: 'Estilos Modernos y Barbas', img: 'https://picsum.photos/id/1011/400/400' },
  { name: 'Carlos "Los" Ramirez', specialty: 'Diseños Creativos y Color', img: 'https://picsum.photos/id/1025/400/400' },
  { name: 'David Chen', specialty: 'Trabajo con Tijera y Textura', img: 'https://picsum.photos/id/1040/400/400' },
];

export const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00', '18:00'
];