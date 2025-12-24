import { useState } from 'react';

interface SEOFieldsProps {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  noIndex: boolean;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onOgImageChange: (value: string) => void;
  onNoIndexChange: (value: boolean) => void;
  onOpenImagePicker?: () => void;
}

export default function SEOFields({
  metaTitle,
  metaDescription,
  ogImage,
  noIndex,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onOgImageChange,
  onNoIndexChange,
  onOpenImagePicker,
}: SEOFieldsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
      >
        <span className="font-medium text-gray-900">SEO Settings</span>
        <span className="text-gray-500">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <div className="px-4 py-4 border-t border-gray-200 space-y-4">
          {/* Meta Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title
              <span className="text-gray-400 text-xs ml-2">
                ({metaTitle.length}/60 recommended)
              </span>
            </label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => onMetaTitleChange(e.target.value)}
              maxLength={200}
              placeholder="SEO title for search engines"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
              <span className="text-gray-400 text-xs ml-2">
                ({metaDescription.length}/160 recommended)
              </span>
            </label>
            <textarea
              value={metaDescription}
              onChange={(e) => onMetaDescriptionChange(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Brief description for search results"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Open Graph Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Open Graph Image
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={ogImage}
                onChange={(e) => onOgImageChange(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              {onOpenImagePicker && (
                <button
                  type="button"
                  onClick={onOpenImagePicker}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Browse
                </button>
              )}
            </div>
            {ogImage && (
              <img src={ogImage} alt="OG Preview" className="mt-2 h-20 object-cover rounded" />
            )}
          </div>

          {/* No Index */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="noIndex"
              checked={noIndex}
              onChange={(e) => onNoIndexChange(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="noIndex" className="ml-2 block text-sm text-gray-700">
              Prevent search engines from indexing this page
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
