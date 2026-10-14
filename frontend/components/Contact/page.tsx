import { useState } from "react";
export default function Contact() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    // ✅ Simple email check
    if (!form.email.includes("@") || !form.email.includes(".")) {
      alert("Enter a valid email");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        alert("Failed to send message");
        return;
      }

      setSuccess(true);
      setForm({ firstName: "", lastName: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#faf7f4] py-20">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg px-10 py-14 grid md:grid-cols-2 gap-12">
        {/* Left Content */}
        <div>
          <h2 className="text-4xl font-bold text-[#2b1b12] mb-4">
            Get in Touch
          </h2>
          <p className="text-gray-600 max-w-md mb-8">
            Have questions about bulk orders, shipping, or just want to say hi?
            We&apos;d love to hear from you.
          </p>

          <div className="space-y-6 text-[#4B5563]">
            <div className="flex items-start gap-4">
              <div className="bg-[#f2ebe6] p-3 rounded-full">✉️</div>
              <div>
                <p className="font-semibold">Email Us</p>
                <p className="text-gray-600">Bhakti@nareshaenterprises.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-[#f2ebe6] p-3 rounded-full">📞</div>
              <div>
                <p className="font-semibold">Call Us</p>
                <p className="text-gray-600">+91 9999999999</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-[#f2ebe6] p-3 rounded-full">📍</div>
              <div>
                <p className="font-semibold">Visit Us</p>
                <p className="text-gray-600">
                  1023 SVH Metro Street 83, Sector 83,
                  <br /> Noida, Uttar Pradesh 201301
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-6 text-[#4B5563]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 ">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="Rahul"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={form.firstName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="kumar"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={form.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              name="message"
              rows={4}
              placeholder="How can we help you?"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              value={form.message}
              onChange={handleChange}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#4b2613] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#3a1e0f] transition cursor-pointer disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>

          {success && (
            <p className="text-green-600 text-sm">
              Message sent successfully! 📩
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
