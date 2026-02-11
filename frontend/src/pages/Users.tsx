import { useEffect, useState } from "react";
import { api } from "../api";
import type { User } from "../types/User";
import Modal from "../components/Modal";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    avatar: null as File | null,
    avatarPreview: null as string | null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.name.trim()) e.name = "Name is required";
    else if (form.name.length < 3) e.name = "Minimum 3 characters";

    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Invalid email address";
    }

    if (form.avatar) {
      if (!form.avatar.type.startsWith("image/")) {
        e.avatar = "Only image files allowed";
      } else if (form.avatar.size > MAX_FILE_SIZE) {
        e.avatar = "Image must be less than 5MB";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      avatar: null,
      avatarPreview: null
    });
    setErrors({});
    setEditingId(null);
  };

  const saveUser = async () => {
    if (!validate()) return;

    setLoading(true);

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    if (form.avatar) fd.append("avatar", form.avatar);

    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, fd);

        // Optimistic update
        setUsers(prev =>
          prev.map(u =>
            u.id === editingId
              ? { ...u, name: form.name, email: form.email }
              : u
          )
        );

        toast.success("User updated successfully.");
      } else {
        await api.post("/users", fd);
        toast.success("User added successfully.");
      }

      resetForm();
      setOpenAdd(false);
      setOpenEdit(false);
      loadUsers();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setErrors({ email: err.response.data.message });
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!openDelete) return;

    try {
      await api.delete(`/users/${openDelete}`);
      setUsers(prev => prev.filter(u => u.id !== openDelete));
      toast.success("User deleted successfully.");
    } catch {
      toast.error("Delete failed.");
    } finally {
      setOpenDelete(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 w-full">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Users</h2>
        <button
          onClick={() => {
            resetForm();
            setOpenAdd(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add User
        </button>
      </div>

      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Avatar</th>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t">
              <td className="p-3 text-center">
                <img
                  src={
                    u.avatar
                      ? `http://localhost:4000${u.avatar}`
                      : `https://i.pravatar.cc/40?u=${u.id}`
                  }
                  className="avatar-circle mx-auto"
                />
              </td>
              <td className="p-3 text-center">{u.name}</td>
              <td className="p-3 text-center">{u.email}</td>
              <td className="p-3 text-right space-x-2">
                <button
                  onClick={() => {
                    setEditingId(u.id!);
                    setForm({
                      name: u.name,
                      email: u.email,
                      avatar: null,
                      avatarPreview: u.avatar
                        ? `http://localhost:4000${u.avatar}`
                        : null
                    });
                    setErrors({});
                    setOpenEdit(true);
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => setOpenDelete(u.id!)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add / Edit Modal */}
      <Modal open={openAdd || openEdit} onClose={() => {
        setOpenAdd(false);
        setOpenEdit(false);
      }}>
        <h3 className="text-lg font-semibold mb-4">
          {editingId ? "Edit User" : "Add User"}
        </h3>

        <input
          className="w-full border px-3 py-2 rounded mb-2"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

        <input
          className={`w-full border px-3 py-2 rounded mb-2 ${
            errors.email ? "border-red-500 bg-red-50" : ""
          }`}
          placeholder="Email"
          value={form.email}
          onChange={e => {
            setForm({ ...form, email: e.target.value });
            setErrors(prev => ({ ...prev, email: "" }));
          }}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        <input
          type="file"
          accept="image/*"
          className="w-full border px-3 py-2 rounded mb-2"
          onChange={e => {
            const file = e.target.files?.[0] || null;
            setForm({
              ...form,
              avatar: file,
              avatarPreview: file
                ? URL.createObjectURL(file)
                : form.avatarPreview
            });
          }}
        />

        {form.avatarPreview && (
          <img
            src={form.avatarPreview}
            className="w-[100px] h-[100px] mx-auto my-3 object-cover rounded-full"
          />
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => {
              setOpenAdd(false);
              setOpenEdit(false);
            }}
            className="bg-gray-400 text-white px-3 py-1 rounded"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={saveUser}
            className={`px-3 py-1 rounded text-white ${
              loading ? "bg-gray-400" : "bg-green-600"
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!openDelete} onClose={() => setOpenDelete(null)}>
        <h3 className="text-lg font-semibold">Confirm Delete</h3>
        <p className="text-gray-600 mt-2">
          Are you sure you want to delete this user?
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setOpenDelete(null)}>Cancel</button>
          <button
            onClick={confirmDelete}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
