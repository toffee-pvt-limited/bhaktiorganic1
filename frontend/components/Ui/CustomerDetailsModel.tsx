"use client";

import { useState } from "react";
import { useEnquiryModal } from "@/context/EnquiryModalContext";

type Props = {
  onSubmit: (form: {
    name: string;
    email: string;
    phone: string;
    address: string;
  }) => Promise<void>;
};

export default function CustomerDetailsModal({ onSubmit }: Props) {
  const { open, closeModal } = useEnquiryModal();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form); // 🔥 PARENT CONTROLS LOGIC
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", address: "" });

      setTimeout(() => {
        setSuccess(false);
        closeModal();
      }, 1500);
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-8 relative">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-1">Enter Your Details</h2>

        <div className="space-y-4 mt-4">
          <input
            name="name"
            placeholder="Full Name *"
            className="w-full border rounded-lg px-4 py-2"
            value={form.name}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              name="email"
              type="email"
              placeholder="Email *"
              className="border rounded-lg px-4 py-2"
              value={form.email}
              onChange={handleChange}
            />
            <input
              name="phone"
              placeholder="Phone *"
              className="border rounded-lg px-4 py-2"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <textarea
            name="address"
            placeholder="Shipping Address"
            className="w-full border rounded-lg px-4 py-2"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="px-6 py-2 bg-amber-900 text-white rounded-lg"
          >
            {loading ? "Submitting..." : "Continue →"}
          </button>
        </div>

        {success && (
          <p className="mt-4 text-green-600 text-sm">
            Details submitted successfully ✅
          </p>
        )}
      </div>
    </div>
  );
}
