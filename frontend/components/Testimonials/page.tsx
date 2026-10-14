const testimonials = [
  {
    name: "Riya M.",
    text: "I’m obsessed! The Peri Peri flavor is exactly what I needed for my afternoon cravings. Finally, a snack that doesn’t make me feel sluggish.",
    avatar: "/avatar1.svg",
  },
  {
    name: "Manoj Gupta",
    text: "My kids love the Cream & Onion, and I love that it’s healthy. It’s become a staple in our pantry. Shipping was super fast too!",
    avatar: "/avatar2.svg",
  },
  {
    name: "Shreya",
    text: "Great alternative to popcorn. No kernels getting stuck in your teeth! The texture is amazing. Will be ordering bulk for my office.",
    avatar: "/avatar3.svg",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#faf8f5] py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-14 text-[#4a2612]">
          Loved by Snackers Everywhere
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm p-8 flex flex-col justify-between"
            >
              {/* Stars */}
              <div className="flex gap-1 text-[#4b2a17] mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09L5.5 11.545 1 7.455l6.06-.88L10 1l2.94 5.575 6.06.88-4.5 4.09 1.378 6.545z" />
                  </svg>
                ))}
              </div>

              <p className="italic text-lg text-gray-800 mb-8 leading-relaxed">
                “{t.text}”
              </p>

              <div className="border-t pt-6 flex items-center gap-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-[#181511]">{t.name}</p>
                  <p className="text-sm text-gray-500">Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
