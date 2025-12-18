import { useState, useRef } from 'react';
import api from '../lib/api';

interface ImportProductsModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function ImportProductsModal({ onClose, onSuccess }: ImportProductsModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<any | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/products/import/csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResult(response.data);
            if (response.data.success > 0) {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload CSV.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Import Products from CSV</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {!result ? (
                        <div className="space-y-4">
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer bg-gray-50"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-4xl">📄</span>
                                    <p className="text-sm font-medium text-gray-700">
                                        {file ? file.name : 'Click to select CSV file'}
                                    </p>
                                    <p className="text-xs text-gray-500">Supported format provided by template</p>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={!file || isUploading}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-all active:scale-95"
                                >
                                    {isUploading ? 'Uploading...' : 'Import'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className={`p-4 rounded-lg border ${result.success > 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                <h4 className="font-semibold text-lg mb-2">Import Complete</h4>
                                <div className="space-y-1 text-sm">
                                    <p>✅ Successfully imported: <strong>{result.success}</strong></p>
                                    <p>❌ Errors: <strong>{result.errors.length}</strong></p>
                                    <p className="text-gray-500">Total processed: {result.total}</p>
                                </div>
                            </div>

                            {result.errors.length > 0 && (
                                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 text-xs bg-gray-50">
                                    {result.errors.map((err: any, i: number) => (
                                        <div key={i} className="text-red-600 border-b border-gray-100 last:border-0 py-1">
                                            Row {err.row} (SKU: {err.sku}): {err.error}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={onClose}
                                className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
