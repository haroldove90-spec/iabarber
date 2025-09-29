import type { Appointment, Customer, InventoryItem, GalleryImage } from '../types';
import { services, barbers } from './barbershopData';

// Mock Data
let customers: Customer[] = [
    { id: 1, name: 'John Doe', email: 'john.doe@email.com', phone: '555-111-2222' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@email.com', phone: '555-333-4444' },
];

let appointments: Appointment[] = [
    {
        id: 1,
        service: services[0],
        barber: barbers[1],
        date: new Date(new Date().setDate(new Date().getDate() + 3)),
        time: '10:00',
        customerId: 1,
    },
    {
        id: 2,
        service: services[2],
        barber: barbers[0],
        date: new Date(new Date().setDate(new Date().getDate() + 5)),
        time: '15:00',
        customerId: 2,
    },
    {
        id: 3,
        service: services[0],
        barber: barbers[1],
        date: new Date(new Date().setDate(new Date().getDate() - 2)),
        time: '11:00',
        customerId: 2,
    },
    {
        id: 4,
        service: services[4],
        barber: barbers[3],
        date: new Date(new Date().setDate(new Date().getDate() - 10)),
        time: '16:00',
        customerId: 1,
    }
];

let inventory: InventoryItem[] = [
    { id: 1, name: 'Pomada Fijación Fuerte', brand: 'Reuzel', category: 'Styling', stock: 15, lowStockThreshold: 5 },
    { id: 2, name: 'Aceite para Barba', brand: 'Proraso', category: 'Cuidado Barba', stock: 8, lowStockThreshold: 4 },
    { id: 3, name: 'Champú Anticaída', brand: 'Nioxin', category: 'Cuidado Cabello', stock: 3, lowStockThreshold: 5 },
];

let gallery: GalleryImage[] = [
    { id: 1, src: 'https://picsum.photos/seed/hair1/500/500', alt: 'Corte de pelo moderno', barberName: 'Benjamin Carter' },
    { id: 2, src: 'https://picsum.photos/seed/hair2/500/500', alt: 'Degradado clásico', barberName: 'Alex "The Razor" Russo' },
    { id: 3, src: 'https://picsum.photos/seed/hair3/500/500', alt: 'Diseño de pelo creativo', barberName: 'Carlos "Los" Ramirez' },
    { id: 4, src: 'https://picsum.photos/seed/hair4/500/500', alt: 'Corte largo texturizado', barberName: 'David Chen' },
];

let nextCustomerId = 3;
let nextAppointmentId = 5;
let nextInventoryId = 4;
let nextGalleryId = 5;

// Functions
export const getCustomers = (): Customer[] => [...customers];

export const getAppointments = (): (Appointment & { customer?: Customer })[] => {
    return appointments
        .map(app => ({
            ...app,
            customer: customers.find(c => c.id === app.customerId),
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const getAppointmentsForCustomer = (customerId: number): Appointment[] => {
    return appointments
        .filter(app => app.customerId === customerId)
        .sort((a, b) => b.date.getTime() - a.date.getTime()); // Most recent first
};

export const addOrUpdateCustomer = (customerData: Omit<Customer, 'id'>): Customer => {
    const existingCustomer = customers.find(c => c.email.toLowerCase() === customerData.email.toLowerCase());
    if (existingCustomer) {
        Object.assign(existingCustomer, customerData);
        return existingCustomer;
    }
    const newCustomer = { ...customerData, id: nextCustomerId++ };
    customers.push(newCustomer);
    return newCustomer;
};

export const addAppointment = (appointmentData: Omit<Appointment, 'id'>): Appointment => {
    const newAppointment = { ...appointmentData, id: nextAppointmentId++ };
    appointments.push(newAppointment);
    return newAppointment;
};

export const isTimeSlotTaken = (date: Date, time: string, barberName: string): boolean => {
    return appointments.some(app => 
        app.barber.name === barberName &&
        app.time === time &&
        app.date.getFullYear() === date.getFullYear() &&
        app.date.getMonth() === date.getMonth() &&
        app.date.getDate() === date.getDate()
    );
};

export const getInventoryItems = (): InventoryItem[] => [...inventory];

export const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>): InventoryItem => {
    const newItem = { ...itemData, id: nextInventoryId++ };
    inventory.push(newItem);
    return newItem;
};

export const updateInventoryItem = (id: number, updates: Partial<Omit<InventoryItem, 'id'>>): InventoryItem | undefined => {
    const item = inventory.find(i => i.id === id);
    if (item) {
        Object.assign(item, updates);
    }
    return item;
};

export const deleteInventoryItem = (id: number): void => {
    inventory = inventory.filter(i => i.id !== id);
};

export const getGalleryImages = (): GalleryImage[] => [...gallery];

export const addGalleryImage = (imageData: Omit<GalleryImage, 'id'>): GalleryImage => {
    const newImage = { ...imageData, id: nextGalleryId++ };
    gallery.unshift(newImage); // Add to the beginning to show newest first
    return newImage;
};

export const deleteGalleryImage = (id: number): void => {
    gallery = gallery.filter(img => img.id !== id);
};

export const getPublicGalleryImages = (): GalleryImage[] => {
    // Devuelve las últimas 8 imágenes, con la más nueva primero.
    return [...gallery].slice(0, 8);
};

// --- Sales Metrics ---
export const getSalesMetrics = () => {
    const totalRevenue = appointments.reduce((acc, app) => {
        const priceString = app.service.price.replace('$', '').replace('+', '').trim();
        const price = parseInt(priceString, 10);
        return acc + (isNaN(price) ? 0 : price);
    }, 0);

    const serviceCounts = appointments.reduce((acc, app) => {
        acc[app.service.name] = (acc[app.service.name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const barberCounts = appointments.reduce((acc, app) => {
        acc[app.barber.name] = (acc[app.barber.name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return { totalRevenue, serviceCounts, barberCounts };
};