import Link from "next/link";

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10 ">
      <div className="relative h-[420px] rounded-2xl overflow-hidden shadow-lg">
        {/* Background Image */}
        <img
          src="/bannernew.png"
          alt="Makhana Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#4a2612]/90 to-[#4a2612]/20" />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="px-10 max-w-xl text-white">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              Crunchy, Healthy,
              <br />
              Guilt-Free
              <br />
              Snacking.
            </h1>

            <p className="mt-4 text-sm md:text-base text-white/90 leading-relaxed">
              Premium Fox Nuts (Makhana) sourced directly from the finest farms.
              Experience the perfect blend of taste and health in every bite.
            </p>

            <Link href={"/products"}>
              <button className="mt-6 bg-[#f3d2bf] text-[#4a2612] font-medium px-6 py-2 rounded-md shadow cursor-pointer">
                View Collection
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
