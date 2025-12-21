import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const CMSPages: React.FC = () => {
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPage, setEditingPage] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        metaTitle: '',
        metaDescription: '',
        status: 'DRAFT'
    });

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            setLoading(true);
            const response = await api.get('/cms/pages');
            setPages(response.data);
        } catch (error) {
            console.error('Error fetching pages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPage) {
                await api.patch(`/cms/pages/${editingPage.id}`, formData);
            } else {
                await api.post('/cms/pages', formData);
            }
            fetchPages();
            resetForm();
        } catch (error) {
            console.error('Error saving page:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this page?')) {
            try {
                await api.delete(`/cms/pages/${id}`);
                fetchPages();
            } catch (error) {
                console.error('Error deleting page:', error);
            }
        }
    };

    const handleEdit = (page: any) => {
        setEditingPage(page);
        setFormData({
            title: page.title,
            slug: page.slug,
            content: page.content || '',
            metaTitle: page.metaTitle || '',
            metaDescription: page.metaDescription || '',
            status: page.status
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            content: '',
            metaTitle: '',
            metaDescription: '',
            status: 'DRAFT'
        });
        setEditingPage(null);
        setShowForm(false);
    };

    if (loading) return <div className="flex-center" style={{ height: '300px' }}><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1>CMS Pages</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your store's content pages</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={20} />
                    <span>New Page</span>
                </button>
            </div>

            {showForm && (
                <div className="glass" style={{ marginBottom: '2rem', padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{editingPage ? 'Edit' : 'Create'} Page</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid-responsive" style={{ marginBottom: '1rem' }}>
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Slug *</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Content</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={8}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="grid-responsive" style={{ marginBottom: '1rem' }}>
                            <div className="form-group">
                                <label>Meta Title</label>
                                <input
                                    type="text"
                                    value={formData.metaTitle}
                                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="PUBLISHED">Published</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Meta Description</label>
                            <textarea
                                value={formData.metaDescription}
                                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                rows={3}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary">
                                {editingPage ? 'Update' : 'Create'} Page
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Slug</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map((page) => (
                            <tr key={page.id}>
                                <td>{page.title}</td>
                                <td><code>/{page.slug}</code></td>
                                <td>
                                    <span className={`badge ${page.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
                                        {page.status}
                                    </span>
                                </td>
                                <td>{new Date(page.updatedAt).toLocaleDateString()}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-icon" onClick={() => handleEdit(page)} title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn-icon" onClick={() => handleDelete(page.id)} title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {pages.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        No pages yet. Create your first page!
                    </p>
                )}
            </div>
        </div>
    );
};

export default CMSPages;
