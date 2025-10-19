import type { Appointment, Customer, InventoryItem, GalleryImage, Service } from '../types';
import { services, barbers } from './barbershopData';

interface DB {
    customers: Customer[];
    appointments: Appointment[];
    inventory: InventoryItem[];
    gallery: GalleryImage[];
    nextIds: {
        customer: number;
        appointment: number;
        inventory: number;
        gallery: number;
    }
}

let db: DB;

const saveDb = () => {
    try {
        localStorage.setItem('aiBarberDb', JSON.stringify(db));
    } catch (e) {
        console.error("Failed to save to localStorage", e);
    }
}

const loadDb = () => {
    try {
        const storedDb = localStorage.getItem('aiBarberDb');
        if (storedDb) {
            const parsedDb = JSON.parse(storedDb);
            // Dates are stored as strings, need to convert them back
            parsedDb.appointments.forEach((app: any) => {
                app.date = new Date(app.date);
            });
            db = parsedDb;
            return;
        }
    } catch (e) {
        console.error("Failed to load from localStorage", e);
    }

    // If nothing in localStorage, initialize with seed data
    db = getSeedData();
    saveDb();
}

const getSeedData = (): DB => {
    const today = new Date();
    const customers: Customer[] = [
        { id: 1, name: 'Juan Pérez', email: 'juan.perez@email.com', phone: '555-0101', password: 'password123' },
        { id: 2, name: 'Carlos Gómez', email: 'cliente@email.com', phone: '555-0102', password: 'cliente123' },
        { id: 3, name: 'Ana Torres', email: 'ana.torres@email.com', phone: '555-0103', password: 'password123' },
    ];
    
    const appointments: Appointment[] = [
        // Past appointments
        { id: 1, customerId: 2, service: services[0], barber: barbers[1], date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7), time: '10:00' },
        { id: 2, customerId: 1, service: services[2], barber: barbers[0], date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3), time: '15:00' },
        
        // Future appointments
        { id: 3, customerId: 3, service: services[4], barber: barbers[2], date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2), time: '11:00' },
        { id: 4, customerId: 2, service: services[1], barber: barbers[3], date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), time: '16:00' },
        { id: 5, customerId: 1, service: services[0], barber: barbers[1], date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), time: '12:00' },
    ];

    const inventory: InventoryItem[] = [
        { id: 1, name: 'Cera Fijadora Fuerte', brand: 'StylePro', category: 'Fijadores', stock: 15, lowStockThreshold: 10 },
        { id: 2, name: 'Aceite para Barba', brand: 'BeardLuxe', category: 'Cuidado Barba', stock: 8, lowStockThreshold: 10 },
        { id: 3, name: 'Shampoo Anticaída', brand: 'ReviveHair', category: 'Shampoos', stock: 25, lowStockThreshold: 5 },
        { id: 4, name: 'Gel de Afeitar', brand: 'Gillette', category: 'Afeitado', stock: 0, lowStockThreshold: 5 },
        { id: 5, name: 'Tónico Capilar', brand: 'Vitality', category: 'Tratamientos', stock: 12, lowStockThreshold: 15 },
    ];

    const gallery: GalleryImage[] = [
        { id: 1, src: 'https://picsum.photos/id/1062/500/500', alt: 'Fade con Textura', barberName: 'Alex "The Razor" Russo' },
        { id: 2, src: 'https://picsum.photos/id/219/500/500', alt: 'Pompadour Moderno', barberName: 'Benjamin "Benny" Carter' },
        { id: 3, src: 'https://picsum.photos/id/343/500/500', alt: 'Buzz Cut con Diseño', barberName: 'Carlos "Los" Ramirez' },
        { id: 4, src: 'https://picsum.photos/id/447/500/500', alt: 'Corte Largo con Capas', barberName: 'David Chen' },
    ];

    return {
        customers,
        appointments,
        inventory,
        gallery,
        nextIds: {
            customer: 4,
            appointment: 6,
            inventory: 6,
            gallery: 5,
        }
    };
};

// --- API Functions ---

export const getCustomers = (): Customer[] => {
    return [...db.customers];
};

export const findCustomerByEmail = (email: string): Customer | undefined => {
    return db.customers.find(c => c.email.toLowerCase() === email.toLowerCase());
};

export const getAppointments = (): (Appointment & { customer?: Customer })[] => {
    return db.appointments.map(app => ({
        ...app,
        customer: db.customers.find(c => c.id === app.customerId)
    })).sort((a,b) => a.date.getTime() - b.date.getTime());
};

export const getAppointmentsForCustomer = (customerId: number): Appointment[] => {
    return db.appointments.filter(app => app.customerId === customerId)
                         .sort((a,b) => b.date.getTime() - a.date.getTime());
};

export const addOrUpdateCustomer = (customerData: Omit<Customer, 'id'>, id?: number): Customer => {
    const existingCustomer = id ? db.customers.find(c => c.id === id) : db.customers.find(c => c.email.toLowerCase() === customerData.email.toLowerCase());

    if (existingCustomer) {
        Object.assign(existingCustomer, customerData);
        saveDb();
        return existingCustomer;
    }
    
    const newCustomer = { ...customerData, id: db.nextIds.customer++ };
    db.customers.push(newCustomer);
    saveDb();
    return newCustomer;
};

export const addAppointment = (appointmentData: Omit<Appointment, 'id'>): Appointment => {
    const newAppointment = { ...appointmentData, id: db.nextIds.appointment++ };
    db.appointments.push(newAppointment);
    saveDb();
    return newAppointment;
};

export const isTimeSlotTaken = (date: Date, time: string, barberName: string): boolean => {
    return db.appointments.some(app => 
        app.barber.name === barberName &&
        app.time === time &&
        app.date.getFullYear() === date.getFullYear() &&
        app.date.getMonth() === date.getMonth() &&
        app.date.getDate() === date.getDate()
    );
};

export const getInventoryItems = (): InventoryItem[] => {
    return [...db.inventory];
};

export const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>): InventoryItem => {
    const newItem = { ...itemData, id: db.nextIds.inventory++ };
    db.inventory.push(newItem);
    saveDb();
    return newItem;
};

export const updateInventoryItem = (id: number, updates: Partial<Omit<InventoryItem, 'id'>>): InventoryItem | undefined => {
    const item = db.inventory.find(i => i.id === id);
    if (item) {
        Object.assign(item, updates);
        saveDb();
    }
    return item;
};

export const deleteInventoryItem = (id: number): void => {
    db.inventory = db.inventory.filter(i => i.id !== id);
    saveDb();
};

export const getGalleryImages = (): GalleryImage[] => {
    return [...db.gallery];
};
export const getPublicGalleryImages = (): GalleryImage[] => {
    return [...db.gallery];
};

export const addGalleryImage = (imageData: Omit<GalleryImage, 'id'>): GalleryImage => {
    const newImage = { ...imageData, id: db.nextIds.gallery++ };
    db.gallery.push(newImage);
    saveDb();
    return newImage;
};

export const deleteGalleryImage = (id: number): void => {
    db.gallery = db.gallery.filter(i => i.id !== id);
    saveDb();
};

// --- Sales Metrics ---
export const getSalesMetrics = () => {
    const pastAppointments = db.appointments.filter(app => app.date < new Date());
    
    const totalRevenue = pastAppointments.reduce((acc, app) => {
        const price = parseFloat(app.service.price.replace('$', '').replace('+', ''));
        return acc + (isNaN(price) ? 0 : price);
    }, 0);

    const serviceCounts = pastAppointments.reduce((acc, app) => {
        acc[app.service.name] = (acc[app.service.name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const barberCounts = pastAppointments.reduce((acc, app) => {
        acc[app.barber.name] = (acc[app.barber.name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return { totalRevenue, serviceCounts, barberCounts };
};


// Initialize the DB on module load
loadDb();