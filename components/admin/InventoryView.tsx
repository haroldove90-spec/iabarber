import React, { useState, useEffect, useContext } from 'react';
import * as db from '../../data/database';
import type { InventoryItem } from '../../types';
import { BoxIcon, ExclamationCircleIcon } from '../icons';
import { ToastContext } from '../../context/ToastContext';

const StockBadge: React.FC<{ stock: number, threshold: number }> = ({ stock, threshold }) => {
    let bgColor = 'bg-green-800/50 text-green-300';
    if (stock <= 0) {
        bgColor = 'bg-red-800/50 text-red-300';
    } else if (stock <= threshold) {
        bgColor = 'bg-yellow-800/50 text-yellow-300';
    }
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bgColor}`}>{stock}</span>;
};

const InventoryModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (item: Omit<InventoryItem, 'id'>) => void,
    item: Omit<InventoryItem, 'id'> | null,
    mode: 'add' | 'edit'
}> = ({ isOpen, onClose, onSave, item, mode }) => {
    const [formData, setFormData] = useState(item || { name: '', brand: '', category: '', stock: 0, lowStockThreshold: 5 });

    useEffect(() => {
        setFormData(item || { name: '', brand: '', category: '', stock: 0, lowStockThreshold: 5 });
    }, [item]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 text-gray-200 rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <form onSubmit={handleSubmit} className="p-8">
                    <h2 className="text-2xl font-bold font-playfair text-white mb-6 text-center">{mode === 'add' ? 'Añadir Producto' : 'Editar Producto'}</h2>
                    <div className="space-y-4">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre del Producto" className="w-full bg-gray-800 border-gray-700 rounded-md p-3" required />
                        <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Marca" className="w-full bg-gray-800 border-gray-700 rounded-md p-3" />
                        <input name="category" value={formData.category} onChange={handleChange} placeholder="Categoría" className="w-full bg-gray-800 border-gray-700 rounded-md p-3" />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400">Stock</label>
                                <input name="stock" type="number" value={formData.stock} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-md p-3" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Umbral Stock Bajo</label>
                                <input name="lowStockThreshold" type="number" value={formData.lowStockThreshold} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-md p-3" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex gap-4">
                        <button type="button" onClick={onClose} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Cancelar</button>
                        <button type="submit" className="w-full bg-gray-200 hover:bg-white text-black font-bold py-2 px-4 rounded-lg transition-colors">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const InventoryView: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
    const { addToast } = useContext(ToastContext);

    const refreshItems = () => setItems(db.getInventoryItems());

    useEffect(() => {
        refreshItems();
    }, []);

    const lowStockItems = items.filter(item => item.stock > 0 && item.stock <= item.lowStockThreshold);

    const handleOpenModal = (mode: 'add' | 'edit', item?: InventoryItem) => {
        setModalMode(mode);
        setCurrentItem(item || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSave = (itemData: Omit<InventoryItem, 'id'>) => {
        if (modalMode === 'add') {
            db.addInventoryItem(itemData);
            addToast({ type: 'success', title: 'Producto Añadido' });
        } else if (currentItem) {
            db.updateInventoryItem(currentItem.id, itemData);
            addToast({ type: 'success', title: 'Producto Actualizado' });
        }
        refreshItems();
        handleCloseModal();
    };
    
    const handleDelete = (itemId: number) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
            db.deleteInventoryItem(itemId);
            addToast({ type: 'info', title: 'Producto Eliminado' });
            refreshItems();
        }
    };
    
    const handleStockChange = (item: InventoryItem, amount: number) => {
        const newStock = Math.max(0, item.stock + amount);
        db.updateInventoryItem(item.id, { stock: newStock });
        refreshItems();
    };

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold font-playfair text-white">Control de Inventario</h1>
                <button 
                    onClick={() => handleOpenModal('add')}
                    className="bg-gray-200 hover:bg-white text-black font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                    <BoxIcon className="w-5 h-5" />
                    <span>Añadir Nuevo Producto</span>
                </button>
            </div>

            {lowStockItems.length > 0 && (
                <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 p-4 rounded-lg mb-6 flex gap-3">
                    <ExclamationCircleIcon className="w-6 h-6 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold">Alerta de Stock Bajo</h3>
                        <p className="text-sm">Los siguientes productos se están agotando: {lowStockItems.map(i => i.name).join(', ')}.</p>
                    </div>
                </div>
            )}
            
            {items.length === 0 ? (
                <p className="text-gray-500 bg-gray-950 p-8 text-center rounded-lg">No hay productos en el inventario.</p>
            ) : (
                <>
                    {/* Mobile View */}
                    <div className="md:hidden space-y-4">
                        {items.map(item => (
                            <div key={item.id} className="bg-gray-950 rounded-lg p-4 shadow-xl">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-white text-lg">{item.name}</p>
                                        <p className="text-sm text-gray-400">{item.brand} / {item.category}</p>
                                    </div>
                                    <StockBadge stock={item.stock} threshold={item.lowStockThreshold} />
                                </div>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleStockChange(item, -1)} className="bg-gray-800 rounded-full w-8 h-8 font-bold">-</button>
                                        <span>Stock</span>
                                        <button onClick={() => handleStockChange(item, 1)} className="bg-gray-800 rounded-full w-8 h-8 font-bold">+</button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenModal('edit', item)} className="bg-gray-700 py-1 px-3 rounded text-sm">Editar</button>
                                        <button onClick={() => handleDelete(item.id)} className="bg-red-900/80 py-1 px-3 rounded text-sm">Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block bg-gray-950 rounded-lg shadow-xl overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-900">
                                <tr>
                                    <th className="p-4 font-semibold">Producto</th>
                                    <th className="p-4 font-semibold">Marca</th>
                                    <th className="p-4 font-semibold">Categoría</th>
                                    <th className="p-4 font-semibold text-center">Stock Actual</th>
                                    <th className="p-4 font-semibold text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {items.map(item => (
                                    <tr key={item.id}>
                                        <td className="p-4 font-semibold text-white">{item.name}</td>
                                        <td className="p-4 text-gray-400">{item.brand}</td>
                                        <td className="p-4 text-gray-400">{item.category}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button onClick={() => handleStockChange(item, -1)} className="bg-gray-800 rounded-full w-7 h-7 font-bold text-lg leading-none">-</button>
                                                <StockBadge stock={item.stock} threshold={item.lowStockThreshold} />
                                                <button onClick={() => handleStockChange(item, 1)} className="bg-gray-800 rounded-full w-7 h-7 font-bold text-lg leading-none">+</button>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={() => handleOpenModal('edit', item)} className="bg-gray-700/50 hover:bg-gray-700 py-1 px-3 rounded text-sm transition-colors">Editar</button>
                                                <button onClick={() => handleDelete(item.id)} className="bg-red-900/50 hover:bg-red-900/80 py-1 px-3 rounded text-sm transition-colors">Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            <InventoryModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSave}
                item={currentItem}
                mode={modalMode}
            />
        </div>
    );
};