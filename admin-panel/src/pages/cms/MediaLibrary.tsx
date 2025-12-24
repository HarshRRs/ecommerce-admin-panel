export default function MediaLibrary() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your images and media files</p>
      </div>

      <div className="flex justify-end mb-4">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          + Upload Images
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <p className="text-gray-500 text-center">No images yet. Upload your first image to get started.</p>
      </div>
    </div>
  );
}
