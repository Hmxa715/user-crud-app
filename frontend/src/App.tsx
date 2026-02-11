import { Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-96 bg-white shadow-md">
        <div className="p-6 text-xl font-bold border-b">
          User Management System
        </div>

        <nav className="p-4 space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${
                isActive ? "bg-blue-500 text-white" : "hover:bg-gray-100"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${
                isActive ? "bg-blue-500 text-white" : "hover:bg-gray-100"
              }`
            }
          >
            Users
          </NavLink>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
