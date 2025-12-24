export default function MenuEditor() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Navigation Menus</h1>
        <p className="text-sm text-gray-500 mt-1">Manage header and footer navigation</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Header Menu</h2>
          <p className="text-gray-500 text-sm">Configure your header navigation</p>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Footer Menu</h2>
          <p className="text-gray-500 text-sm">Configure your footer navigation</p>
        </div>
      </div>
    </div>
  );
}
