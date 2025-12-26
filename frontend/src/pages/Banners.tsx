import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
    Plus,
    Edit2,
    Trash2,
    Image as ImageIcon,
    ExternalLink,
    Calendar,
    Save,
    X
} from 'lucide-react';

interface Banner {
    id: string;
    title: string;
    imageUrl: string;
    linkUrl: string | null;
    position: string;
    displayOrder: number;
    status: 'ACTIVE' | 'INACTIVE';
    startDate: string | null;
    endDate: string | null;
}

const Banners: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        linkUrl: '',
        position: 'homepage_hero',
        displayOrder: 0,
        status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const response = await api.get('/cms/banners');
            setBanners(response.data);
        } catch (err) {
            console.error('Failed to fetch banners');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                displayOrder: Number(formData.displayOrder),
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
                linkUrl: formData.linkUrl || null
            };

            if (editingBanner) {
                await api.patch(`/cms/banners/${editingBanner.id}`, data);
            } else {
                await api.post('/cms/banners', data);
            }

            setShowForm(false);
            setEditingBanner(null);
            setFormData({
                title: '',
                imageUrl: '',
                linkUrl: '',
                position: 'homepage_hero',
                displayOrder: 0,
                status: 'ACTIVE',
                startDate: '',
                endDate: ''
            });
            fetchBanners();
        } catch (err) {
            alert('Failed to save banner');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this banner?')) return;
        try {
            await api.delete(`/cms/banners/${id}`);
            fetchBanners();
        } catch (err) {
            alert('Failed to delete banner');
        }
    };

    const openEdit = (banner: Banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title,
            imageUrl: banner.imageUrl,
            linkUrl: banner.linkUrl || '',
            position: banner.position,
            displayOrder: banner.displayOrder,
            status: banner.status,
            startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
            endDate: banner.endDate ? banner.endDate.split('T')[0] : ''
        });
        setShowForm(true);
    };

    return (
        <div className="animate-fade-in text-secondary">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem' }}>Store Banners</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage promotional banners and hero images</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setEditingBanner(null);
                    setFormData({
                        title: '',
                        imageUrl: '',
                        linkUrl: '',
                        position: 'homepage_hero',
                        displayOrder: 0,
                        status: 'ACTIVE',
                        startDate: '',
                        endDate: ''
                    });
                    setShowForm(true);
                }}>
                    <Plus size={20} /> Add Banner
                </button>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {loading ? (
                    <p>Loading banners...</p>
                ) : banners.length === 0 ? (
                    <div className="glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                        <ImageIcon size={48} color="var(--glass-border)" style={{ marginBottom: '1rem' }} />
                        <p>No banners found. Create your first banner!</p>
                    </div>
                ) : (
                    banners.map(banner => (
                        <div key={banner.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ position: 'relative', background: 'var(--glass-bg)' }}>
                                <img src={banner.imageUrl} alt={banner.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                                    <span style={{
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.7rem',
                                        background: banner.status === 'ACTIVE' ? 'var(--success)' : 'var(--error)',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}>
                                        {banner.status}
                                    </span>
                                </div>
                            </div>
                            <div style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{banner.title}</h3>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                            Position: <span style={{ color: 'var(--primary-color)' }}>{banner.position}</span>
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => openEdit(banner)} className="btn btn-secondary" style={{ padding: '0.4rem' }}>
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(banner.id)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--error)' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                                        <Calendar size={14} />
                                        {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'No start date'}
                                    </div>
                                    {banner.linkUrl && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary-color)' }}>
                                            <ExternalLink size={14} />
                                            Link set
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showForm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '1rem'
                }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="label">Banner Title</label>
                                <input
                                    type="text"
                                    className="input"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label">Image URL</label>
                                <input
                                    type="text"
                                    className="input"
                                    required
                                    placeholder="https://..."
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label">Link URL / Slug (Optional)</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.linkUrl}
                                    onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="label">Position</label>
                                    <select
                                        className="input"
                                        value={formData.position}
                                        onChange={e => setFormData({ ...formData, position: e.target.value })}
                                    >
                                        <option value="homepage_hero">Homepage Hero</option>
                                        <option value="sidebar_promo">Sidebar Promo</option>
                                        <option value="footer_wide">Footer Wide</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Display Order</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.displayOrder}
                                        onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="label">Start Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">End Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    <Save size={18} /> {editingBanner ? 'Update' : 'Create'} Banner
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Banners;
