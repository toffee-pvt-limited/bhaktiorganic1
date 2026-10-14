import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 bg-white ">
      {/* Header */}
      <div className="mb-10 border-b pb-6">
        <h2 className="text-4xl font-black text-[#181311]">About Us</h2>
        <p className="mt-1 text-[#896F61]">
          Premium Fox Nuts for healthy, guilt-free snacking.
        </p>
      </div>

      {/* Hero Banner */}
      <div className="relative h-[420px] rounded-3xl overflow-hidden mb-20">
        <Image
          src="/aboutbanner.png"
          alt="About banner"
          width={1400}
          height={500}
          className="object-cover"
        />

        <div className=" absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-white text-4xl md:text-5xl font-semibold leading-tight">
            Crunchy Goodness, <br /> Rooted in Tradition
          </h1>

          <p className="text-gray-200 max-w-xl mt-4">
            Discover the story behind your favourite guilt-free snack. <br />
            From the calm waters to your snack bowl.
          </p>

          {/* <button className="mt-6 bg-[#F4B39A] text-black px-6 py-2 rounded-lg">
            Our Story
          </button> */}
        </div>
      </div>

      {/* Origin Story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-[#181311]">
            The Origin Story
          </h3>
          <p className="text-[#896F61] leading-relaxed mb-6">
            Our journey begins in the wetlands of Eastern India. Fox Nuts, or
            Makhana, are derived from the seeds of the Euryale Fox lily.
            Harvested by hand and popped to perfection, they are a snacking
            tradition centuries old that we are proud to bring to the modern
            world.
          </p>

          {/* <button className="bg-amber-900 text-white px-6 py-2 rounded-lg">
            Read Full Story
          </button> */}
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <Image
            src="/ourstory.png"
            alt="Fox nuts bowl"
            width={500}
            height={500}
            className="rounded-xl object-cover"
          />
        </div>
      </div>
    </div>
  );
}
