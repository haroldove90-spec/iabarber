// For AI recommender
export interface FaceAnalysis {
  faceShape: string;
  features: string[];
}

export interface HaircutRecommendation {
  name: string;
  description: string;
  exampleImageUrl?: string;
  isLoadingImage?: boolean;
}

export interface Preferences {
  length: 'short' | 'medium' | 'long' | 'any';
  style: 'classic' | 'modern' | 'casual' | 'any';
}

// For Barbershop
export interface Service {
  name: string;
  price: string;
  description: string;
}

export interface Barber {
  name: string;
  specialty: string;
  img: string;
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    password?: string;
}

export interface Appointment {
    id: number;
    service: Service;
    barber: Barber;
    date: Date;
    time: string;
    customerId: number;
}

export interface AppointmentDetails {
    service: Service | null;
    barber: Barber | null;
    date: Date | null;
    time: string | null;
    customer?: Omit<Customer, 'id'>;
}

// For Authentication
export interface User {
    username: string;
    role: 'admin' | 'client';
    customerId?: number;
}

// For Admin Dashboard
export interface InventoryItem {
    id: number;
    name: string;
    brand: string;
    category: string;
    stock: number;
    lowStockThreshold: number;
}

export interface GalleryImage {
    id: number;
    src: string;
    alt: string;
    barberName: string;
}