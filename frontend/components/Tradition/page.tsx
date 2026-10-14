import Image from "next/image";
import FarmerImg from "@/assets/farmer.png";
import Link from "next/link";

export default function Tradition() {
  return (
    <section className="bg-[#f2ece7] py-20 ">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
        {/* Left Content */}
        <div>
          <div className="flex items-center gap-3 text-sm font-bold text-[#4a2612] mb-4">
            <span className="w-8 h-[2px] bg-[#4a2612]" />
            OUR STORY
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-[#4a2612] leading-snug">
            Rooted in Tradition,
            <br />
            Roasted for Today.
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed max-w-lg">
            Our journey began in the lush wetlands of Bihar, India, where 90% of
            the world's fox nuts are grown. We work directly with local farmers
            to handpick the best harvest, ensuring fair trade and sustainable
            practices.
          </p>

          <p className="mt-4 text-gray-700 leading-relaxed max-w-lg">
            Unlike traditional fried snacks, our Makhanas are slow-roasted to
            perfection, locking in nutrients while delivering that satisfying
            crunch you crave. No guilt, just pure goodness.
          </p>
          <Link href={"/about"}>
            <button className="mt-8 bg-black text-white px-6 py-3 rounded-md cursor-pointer">
              Read Full Story
            </button>
          </Link>
        </div>

        {/* Right Image */}
        <div className="flex justify-center">
          <Image
            src={FarmerImg}
            alt="Our Story"
            className="w-full max-w-lg rounded-2xl shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
