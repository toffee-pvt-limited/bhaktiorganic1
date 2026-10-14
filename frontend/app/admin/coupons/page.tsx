"use client";
import { useEffect, useState } from "react";
interface Coupon {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: number;
  expires_at: string | null;
  created_at: string;
  coupon_category: string;
}
export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  // Form state
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "0",
    max_uses: "",
    is_active: 1,
    expires_at: "",
    coupon_category: "regular", // 'regular' or 'extra'
  });
  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCoupons();
  }, []);
  // Reset form
  const resetForm = () => {
    setFormData({
      code: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_amount: "0",
      max_uses: "",
      is_active: 1,
      expires_at: "",
      coupon_category: "regular",
    });
    setEditingCoupon(null);
    setShowForm(false);
  };
  // Handle form input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
            ? 1
            : 0
          : value,
    }));
  };
  // Handle form submit (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      discount_value: parseFloat(formData.discount_value),
      min_order_amount: parseFloat(formData.min_order_amount) || 0,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      expires_at: formData.expires_at || null,
    };
    try {
      if (editingCoupon) {
        // Update existing coupon
        await fetch("/api/admin/coupons", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingCoupon.id }),
        });
        alert("Coupon updated successfully!");
      } else {
        // Create new coupon
        await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        alert("Coupon created successfully!");
      }
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error("Error saving coupon:", error);
      alert("Failed to save coupon");
    }
  };
  // Handle edit
  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_amount: coupon.min_order_amount.toString(),
      max_uses: coupon.max_uses?.toString() || "",
      is_active: coupon.is_active,
      expires_at: coupon.expires_at?.split("T")[0] || "",
      coupon_category: coupon.coupon_category || "regular",
    });
    setEditingCoupon(coupon);
    setShowForm(true);
  };
  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      fetchCoupons();
      alert("Coupon deleted successfully!");
    } catch (error) {
      console.error("Error deleting coupon:", error);
      alert("Failed to delete coupon");
    }
  };
  // Toggle active status
  const toggleActive = async (coupon: Coupon) => {
    try {
      await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...coupon,
          is_active: coupon.is_active === 1 ? 0 : 1,
        }),
      });
      fetchCoupons();
    } catch (error) {
      console.error("Error toggling coupon:", error);
    }
  };
  if (loading) return <div className="p-6">Loading...</div>;
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupon Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Add Coupon"}
        </button>
      </div>
      {/* Add/Edit Coupon Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow mb-6 text-black"
        >
          <h2 className="text-lg font-semibold mb-4">
            {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 ">
                Coupon Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 capitalize"
                placeholder="e.g., FOXNUT10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Discount Type *
              </label>
              <select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Coupon Type *
              </label>
              <select
                name="coupon_category"
                value={formData.coupon_category}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="regular">
                  Regular (Salesman gives to user)
                </option>
                <option value="extra">Extra Discount (Above ₹500 bonus)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.coupon_category === "regular"
                  ? "User enters this code manually"
                  : "Shows automatically when cart reaches minimum amount"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Discount Value * (
                {formData.discount_type === "percentage" ? "%" : "₹"})
              </label>
              <input
                type="number"
                name="discount_value"
                value={formData.discount_value}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Order Amount (₹)
              </label>
              <input
                type="number"
                name="min_order_amount"
                value={formData.min_order_amount}
                onChange={handleChange}
                min="0"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Max Uses (leave empty for unlimited)
              </label>
              <input
                type="number"
                name="max_uses"
                value={formData.max_uses}
                onChange={handleChange}
                min="1"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Expiry Date (optional)
              </label>
              <input
                type="date"
                name="expires_at"
                value={formData.expires_at}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active === 1}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <label className="text-sm font-medium">Active</label>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              {editingCoupon ? "Update Coupon" : "Create Coupon"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden   text-black">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Code
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Discount
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Min Order
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Usage
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No coupons found. Create your first coupon!
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold">
                    {coupon.code}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        coupon.coupon_category === "extra"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {coupon.coupon_category === "extra"
                        ? "🎁 Extra"
                        : "🎟️ Regular"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {coupon.discount_type === "percentage"
                      ? `${coupon.discount_value}%`
                      : `₹${coupon.discount_value}`}
                  </td>
                  <td className="px-4 py-3">₹{coupon.min_order_amount}</td>
                  <td className="px-4 py-3">
                    {coupon.used_count} / {coupon.max_uses || "∞"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(coupon)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        coupon.is_active === 1
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {coupon.is_active === 1 ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    {/* <button
                      onClick={() => handleDelete(coupon.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button> */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
