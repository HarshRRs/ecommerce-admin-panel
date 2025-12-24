export default function HomepageEditor() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Homepage Editor</h1>
        <p className="text-sm text-gray-500 mt-1">Customize your homepage sections</p>
      </div>

      <div className="flex justify-end mb-4">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          + Add Section
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <p className="text-gray-500 text-center">No sections yet. Add your first section to customize the homepage.</p>
      </div>
    </div>
  );
}
