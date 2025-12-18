import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    Package,
    AlertCircle,
    FileSpreadsheet,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BulkImport from '../components/BulkImport';

const ProductsList: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showImport, setShowImport] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (err) {
            console.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in text-secondary">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem' }}>Products</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your inventory and product catalogue</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => setShowImport(true)}>
                        <FileSpreadsheet size={20} /> Bulk Import
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
                        <Plus size={20} /> Add Product
                    </button>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Search products by name or SKU..."
                            style={{ paddingLeft: '3rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-secondary">
                        <Filter size={18} /> Filters
                    </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem 1.5rem' }}>Product</th>
                            <th style={{ padding: '1rem' }}>SKU</th>
                            <th style={{ padding: '1rem' }}>Price</th>
                            <th style={{ padding: '1rem' }}>Stock</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading products...</td>
                            </tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '4rem', textAlign: 'center' }}>
                                    <Package size={48} style={{ color: 'var(--glass-border)', marginBottom: '1rem' }} />
                                    <p style={{ color: 'var(--text-secondary)' }}>No products found.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((p) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition)' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'var(--glass-bg)', overflow: 'hidden' }}>
                                                {p.images?.[0] ? (
                                                    <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Package size={20} color="var(--text-secondary)" />
                                                    </div>
                                                )}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{p.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{p.sku}</td>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{p.currency || '$'}{p.basePrice}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            color: p.stock < 10 ? 'var(--warning)' : 'inherit',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem'
                                        }}>
                                            {p.stock}
                                            {p.stock < 10 && <AlertCircle size={14} />}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: p.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                            color: p.status === 'ACTIVE' ? 'var(--success)' : 'var(--text-secondary)'
                                        }}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => navigate(`/products/${p.id}`)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn btn-secondary" style={{ padding: '0.5rem', color: 'var(--error)' }} onClick={() => handleDelete(p.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Overlay */}
            {showImport && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                        <button
                            onClick={() => setShowImport(false)}
                            style={{
                                position: 'absolute',
                                top: '-2.5rem',
                                right: 0,
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={24} />
                        </button>
                        <BulkImport onComplete={() => {
                            setShowImport(false);
                            fetchProducts();
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsList;
