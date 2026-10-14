"use client";

import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import ChevronLeft from "@/public/ChevronLeft.svg";
import ChevronRight from "@/public/ChevronRight.svg";
import { useRouter } from "next/navigation";

type Size = {
  price: number;
  is_default: number;
};
type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  available_sizes: Size[];
};

type RelatedProductsProps = {
  currentProductId?: number;
};

export default function RelatedProducts({
  currentProductId,
}: RelatedProductsProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const router = useRouter();

  const scroll = (dir: "left" | "right") => {
    if (!sliderRef.current) return;
    const width = sliderRef.current.clientWidth;
    sliderRef.current.scrollBy({
      left: dir === "left" ? -width : width,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/admin/variants");
        const data = await response.json();
        console.log("related data", data);
        // Filter out the current product
        const filtered = currentProductId
          ? data.filter((item: Product) => item.id !== currentProductId)
          : data;
        setRelated(filtered);
      } catch (error) {
        console.log("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [currentProductId]);

  if (related.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-semibold text-[#181511]">
          You might also like
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
          >
            <Image src={ChevronLeft} alt={"ChevronLeft"} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
          >
            <Image src={ChevronRight} alt={"ChevronRight"} />
          </button>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="flex gap-8 overflow-x-auto pb-4 scroll-smooth no-scrollbar"
      >
        {related.map((item) => (
          <div key={item.id} className="min-w-[280px]">
            <div className="relative h-[350px] w-full rounded-3xl overflow-hidden bg-gray-100">
              <span className="absolute right-4 bottom-4 z-10 rounded-full px-2 bg-white text-xs font-semibold text-white ">
                <Image
                  onClick={() => router.push(`/product/${item.id}`)}
                  src={"/carticon.png"}
                  alt="Cart"
                  width={"50"}
                  height={"50"}
                  className="object-cover"
                />
              </span>
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No image
                </div>
              )}
            </div>

            <div className="flex justify-between items-start mt-5">
              <div>
                <h3 className="text-lg font-semibold text-[#181511]">
                  {item.name}
                </h3>
                <p className="text-sm text-[#897961] mt-1">
                  {item.description}
                </p>
              </div>
              <p className="text-lg text-[#181511] font-semibold">
                ₹
                {item.available_sizes?.find((s) => s.is_default === 1)?.price ??
                  item.available_sizes?.[0]?.price ??
                  "N/A"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
