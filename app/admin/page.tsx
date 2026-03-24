import { Users, BarChart2, Settings, Stethoscope, Hospital, HeartHandshake, UserCog, Pill } from "lucide-react";
import Link from "next/link";

const quickLinks = [
  { href: '/admin/users', label: 'User Directory', description: 'Search users & assign roles', icon: UserCog, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { href: '/admin/patients', label: 'Patient Management', description: 'Browse all patients & view profiles', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { href: '/admin/doctors', label: 'Doctor Management', description: 'Add doctors with login credentials', icon: Stethoscope, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { href: '/admin/hospitals', label: 'Hospital Management', description: 'Add hospitals with Google Maps links', icon: Hospital, color: 'text-violet-500', bg: 'bg-violet-50' },
  { href: '/admin/donors', label: 'Donor Management', description: 'Register & manage blood donors', icon: HeartHandshake, color: 'text-rose-500', bg: 'bg-rose-50' },
  { href: '/admin/pharmacy', label: 'Pharmacy Inventory', description: 'Manage e-store medications', icon: Pill, color: 'text-teal-500', bg: 'bg-teal-50' },
  { href: '/admin/reports', label: 'Reports Library', description: 'Search patient records & reports', icon: BarChart2, color: 'text-amber-500', bg: 'bg-amber-50' },
];

const AdminPage = () => {
  return (
    <div>
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Admin Panel</h1>
        <p className="text-gray-600">
          Manage your application data, users, and content directly from this dashboard. Select a module below or from the sidebar to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 group flex items-start gap-4"
            >
              <div className={`p-3 rounded-lg ${item.bg} group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{item.label}</h2>
                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPage;
