import Image from "next/image";

const features = [
  {
    icon: "/organic.svg",
    title: "100% Organic Sourced",
    desc: "Grown without synthetic pesticides or fertilizers, straight from nature’s lap.",
  },
  {
    icon: "/vegan.svg",
    title: "Gluten-Free & Vegan",
    desc: "Perfect for every diet. No wheat, no dairy, just plant-based power.",
  },
  {
    icon: "/verified.svg",
    title: "Non-GMO Verified",
    desc: "We keep it real. No genetically modified organisms in our supply chain.",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-900">
          Quality You Can Trust
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          We don’t compromise when it comes to your health. Every pack is sealed
          with our promise of purity.
        </p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-10 shadow-sm hover:shadow-md transition"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-[#fff4e6] flex items-center justify-center">
                {/* <item.icon className="text-[#4b2c1a]" size={28} /> */}
                <img className="w-full h-full" src={item.icon} alt="Feature" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                {item.title}
              </h3>
              <p className="mt-4 text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
