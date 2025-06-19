import AdminLayout from "./components/AdminLayout";

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Settings</h1>
        <p className="text-gray-600">This is the admin settings page. Add your settings here.</p>
      </div>
    </AdminLayout>
  );
} 