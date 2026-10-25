
import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "Lead",
};

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");
      setCustomers(response.data.customers || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, form);
      } else {
        await api.post("/customers", form);
      }

      setForm(emptyForm);
      setEditingId(null);
      await fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save customer.");
    }
  };

  const handleEdit = (customer) => {
    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      company: customer.company || "",
      status: customer.status || "Lead",
    });
    setEditingId(customer._id);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      await api.delete(`/customers/${id}`);
      await fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete customer.");
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = [
      customer.name,
      customer.email,
      customer.company,
    ].some((value) =>
      (value || "").toLowerCase().includes(search.toLowerCase())
    );

    const matchesStatus =
      statusFilter === "All" || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600">
            ClientFlow CRM
          </h1>
          <p className="text-sm text-slate-500">
            Customer relationship management
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            {user?.name || "User"}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="mt-1 text-slate-500">
            Manage your customers in one place.
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold">
            {editingId ? "Edit customer" : "Add a customer"}
          </h3>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Customer name"
              required
              className="rounded-lg border border-slate-300 px-4 py-3"
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              required
              className="rounded-lg border border-slate-300 px-4 py-3"
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
              required
              className="rounded-lg border border-slate-300 px-4 py-3"
            />
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Company (optional)"
              className="rounded-lg border border-slate-300 px-4 py-3"
            />
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="rounded-lg border border-slate-300 px-4 py-3"
            >
              <option value="Lead">Lead</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
              >
                {editingId ? "Save changes" : "Add customer"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setForm(emptyForm);
                    setEditingId(null);
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-3"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold">Customers</h3>
              <p className="text-sm text-slate-500">
                {filteredCustomers.length} customer(s)
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers..."
                className="rounded-lg border border-slate-300 px-4 py-2"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-300 px-4 py-2"
              >
                <option value="All">All statuses</option>
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="py-6 text-slate-500">Loading customers...</p>
          ) : filteredCustomers.length === 0 ? (
            <p className="py-6 text-slate-500">No customers found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Company</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="border-b last:border-0">
                      <td className="p-3 font-medium">{customer.name}</td>
                      <td className="p-3">{customer.email}</td>
                      <td className="p-3">{customer.phone}</td>
                      <td className="p-3">{customer.company || "—"}</td>
                      <td className="p-3">{customer.status}</td>
                      <td className="p-3">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="font-medium text-indigo-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(customer._id)}
                            className="font-medium text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
