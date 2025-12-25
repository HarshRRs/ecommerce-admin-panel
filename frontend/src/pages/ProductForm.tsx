import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { apiService } from '../services/api';
import { Save, ArrowLeft, Loader2, Image as ImageIcon, X } from 'lucide-react';
import type { ProductStatus } from '../types';

const ProductForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        basePrice: 0,
        stock: 0,
        status: 'DRAFT' as ProductStatus,
        images: [] as string[],
        tags: [] as string[],
        taxable: true,
    });

    useEffect(() => {
        if (isEdit) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/products/${id}`);
            setFormData(response.data);
        } catch (err) {
            console.error('Failed to fetch product');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                await api.patch(`/products/${id}`, formData);
            } else {
                await api.post('/products', formData);
            }
            navigate('/products');
        } catch (err) {
            console.error('Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const response = await apiService.media.upload(file);
            // Assuming response.data returns the object with { url: ... } or { fileUrl: ... }
            // Based on MediaController, it calls uploadFile -> likely returns the ImageKit result or our DB record
            // Helper: The backend usually maps this. Let's assume it returns { fileUrl: ... } or check service. 
            // Standard NestJS/Prisma pattern: returns the created record.
            // Let's assume response.data.fileUrl based on schema
            const newImageUrl = response.data.fileUrl || response.data.url;

            if (newImageUrl) {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, newImageUrl]
                }));
            }
        } catch (err) {
            console.error('Failed to upload image', err);
            alert('Failed to upload image. Check your ImageKit configuration.');
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (loading) return <div className="flex-center" style={{ height: '400px' }}><Loader2 className="animate-spin" /></div>;

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => navigate('/products')}>
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem' }}>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>{isEdit ? `Editing ${formData.sku}` : 'Create a new item in your inventory'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* General Info */}
                    <div className="glass-card">
                        <h3 style={{ marginBottom: '1.5rem' }}>General Information</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="label">Product Name</label>
                            <input
                                className="input"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Description</label>
                            <textarea
                                className="input"
                                rows={5}
                                style={{ resize: 'vertical' }}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Pricing & Stock */}
                    <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ gridColumn: '1 / -1' }}><h3 style={{ marginBottom: '0.5rem' }}>Pricing & Inventory</h3></div>
                        <div>
                            <label className="label">Base Price</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.basePrice}
                                onChange={e => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="label">Inventory (Stock)</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="label">SKU</label>
                            <input
                                className="input"
                                value={formData.sku}
                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Images */}
                    <div className="glass-card">
                        <h3 style={{ marginBottom: '1.5rem' }}>Product Images</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            {formData.images.map((img, i) => (
                                <div key={i} style={{ aspectRatio: '1', background: 'var(--glass-bg)', borderRadius: 'var(--radius-sm)', position: 'relative', overflow: 'hidden' }}>
                                    <img src={img} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button
                                        type="button"
                                        style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', padding: '2px' }}
                                        onClick={() => setFormData({ ...formData, images: formData.images.filter((_, idx) => idx !== i) })}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            <div style={{
                                aspectRatio: '1',
                                border: '1px dashed var(--glass-border)',
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                                onClick={() => fileInputRef.current?.click()}>
                                <ImageIcon size={24} color="var(--text-secondary)" />
                                {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" size={20} /></div>}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Status & Actions */}
                    <div className="glass-card">
                        <h3 style={{ marginBottom: '1.5rem' }}>Status</h3>
                        <select
                            className="input"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                        >
                            <option value="DRAFT">Draft</option>
                            <option value="ACTIVE">Active</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>

                        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
                                {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Product</>}
                            </button>
                            <button type="button" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/products')}>
                                Cancel
                            </button>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="glass-card">
                        <h3 style={{ marginBottom: '1rem' }}>Tags</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>Separate tags with commas</p>
                        <input
                            className="input"
                            placeholder="Sale, New, Collection..."
                            value={formData.tags.join(', ')}
                            onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
