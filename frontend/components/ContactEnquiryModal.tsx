"use client";

// import { X } from "lucide-react";
import { useState } from "react";
import { useEnquiryModal } from "@/context/EnquiryModalContext";

export default function ContactEnquiryModal() {
  const { open, closeModal } = useEnquiryModal();
  const [form, setForm] = useState({
    fullName: "",
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
    if (!form.fullName || !form.email || !form.phone) {
      alert("Please fill all required fields");
      return;
    }
    // ✅ Simple email check
    if (!form.email.includes("@") || !form.email.includes(".")) {
      alert("Enter a valid email");
      return;
    }

    // ✅ Simple phone check
    if (form.phone.length !== 10 || isNaN(Number(form.phone))) {
      alert("Enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.fullName,
          lastName: "",
          email: form.email,
          message: `
New Product Inquiry

Name: ${form.fullName}
Email: ${form.email}
Phone: ${form.phone}

Shipping Address:
${form.address || "Not provided"}
          `,
        }),
      });

      if (!res.ok) {
        alert("Failed to send enquiry");
        return;
      }

      setSuccess(true);
      setForm({
        fullName: "",
        email: "",
        phone: "",
        address: "",
      });

      setTimeout(() => {
        closeModal();
        setSuccess(false);
      }, 1500);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-8 relative animate-scaleIn   md:mt-15 mt-10">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer"
        >
          {/* <X /> */}
          <span>X</span>
        </button>

        <h2 className="text-xl font-semibold mb-1 text-[#4F2B17]">
          Complete Your Inquiry
        </h2>
        <p className="text-[#4B5563] text-sm mb-6">
          Please provide your contact details so our team can connect with you
          regarding shipping and payment for your selected Fox Nut products.
        </p>

        <div className="space-y-4 ">
          <input
            name="fullName"
            type="text"
            placeholder="Full Name *"
            className="w-full border border-[#E4DFDD] placeholder:text-[#9CA3AF] text-[#4F2B17] rounded-lg px-4 py-2"
            value={form.fullName}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              name="email"
              type="email"
              placeholder="Email Address *"
              className="w-full border border-[#E4DFDD] placeholder:text-[#9CA3AF] text-[#4F2B17] rounded-lg px-4 py-2"
              value={form.email}
              onChange={handleChange}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number *"
              className="w-full border border-[#E4DFDD] placeholder:text-[#9CA3AF] text-[#4F2B17] rounded-lg px-4 py-2"
              value={form.phone}
              maxLength={10}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value.replace(/\D/g, ""),
                })
              }
            />
          </div>

          <textarea
            rows={3}
            name="address"
            placeholder="Inquiry Details"
            className="w-full border border-[#E4DFDD] placeholder:text-[#9CA3AF] text-[#4F2B17] rounded-lg px-4 py-2"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={closeModal}
            className="px-6 py-2 border rounded-lg text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-amber-900 text-white rounded-lg disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Inquiry →"}
          </button>

          {success && (
            <p className="mt-4 text-green-600 text-sm">
              Inquiry sent successfully! 📩
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
