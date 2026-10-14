"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
// import { ShoppingCart } from "lucide-react";

const EMPTY_SIZES: any[] = [];
const EMPTY_IMAGES: string[] = [];

export default function ProductDetails({
  images = EMPTY_IMAGES,
  id,
  tag,
  name,
  flavor,
  image,
  size,
  available_sizes = EMPTY_SIZES,
  price,
  discount,
  description,
  description2,
  productName,
}: {
  images: string[];
  id: number;
  tag: string;
  name: string;
  flavor?: string;
  image: string;
  size: string;
  available_sizes?: {
    id?: number;
    size: string;
    price: number;
    is_default?: number;
  }[];
  price: number;
  discount: number;
  description: string;
  description2: string;
  productName?: string;
}) {
  const [selectedImage, setSelectedImage] = useState(images[0] || image || ""); // Fallback image
  console.log("images", images);

  // Use available sizes if present, otherwise fallback to prop size (as array)
  const displaySizes =
    available_sizes && available_sizes.length > 0
      ? available_sizes
      : [{ size: size, price: price }];

  const getDefaultSize = () => {
    if (available_sizes && available_sizes.length > 0) {
      return (
        available_sizes.find((s) => s.is_default === 1) || available_sizes[0]
      );
    }
    return { size, price };
  };

  const [selectedSizeObj, setSelectedSizeObj] = useState(getDefaultSize());
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [cartMessage, setCartMessage] = useState(false);

  // Update selectedImage when images prop changes
  useEffect(() => {
    if (images && images.length > 0) {
      setSelectedImage(images[0]);
    }
  }, [images]);

  // Reset selected size when available_sizes changes
  useEffect(() => {
    setSelectedSizeObj(getDefaultSize());
  }, [available_sizes, size, price]);

  const activePrice = selectedSizeObj?.price ?? price ?? 0;

  const getFinalPrice = (price: number, discount: number | null) => {
    if (!discount || discount <= 0) return price;
    return Math.round(price - (price * discount) / 100);
  };
  const discountPrice = getFinalPrice(activePrice, discount);
  const totalPrice = discountPrice * quantity;

  const cartMessageHandler = () => {
    setCartMessage(true);
    setTimeout(() => {
      setCartMessage(false);
    }, 3000);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
      {/* Breadcrumb */}
      <p className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-500">
        Home <span className="mx-1 ">›</span> {productName || "Product"}{" "}
        <span className="mx-1">›</span>{" "}
        <span className="text-gray-800 font-medium">
          {name} – {flavor}
        </span>
      </p>

      <div className="grid grid-cols-1 gap-6 sm:gap-10 lg:grid-cols-2">
        {/* LEFT: Images */}
        <div>
          {/* Main Image */}
          <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[504px] overflow-hidden rounded-xl sm:rounded-2xl bg-gray-100">
            {tag && (
              <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white text-xs px-2 sm:px-3 py-1 rounded-full shadow text-black z-10">
                {tag}
              </span>
            )}

            {selectedImage ? (
              <Image
                src={selectedImage}
                alt="Product image"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Thumbnails - Horizontal scroll on mobile */}
          <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible no-scrollbar">
            {images.filter(Boolean).map((img) => (
              <button
                key={img}
                onClick={() => setSelectedImage(img)}
                className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 lg:w-full lg:h-[100px] xl:h-[120px] overflow-hidden rounded-lg sm:rounded-xl border-2 transition ${
                  selectedImage === img
                    ? "border-amber-800"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                {img && (
                  <Image
                    src={img}
                    alt="Thumbnail"
                    fill
                    className="object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Product Info */}
        <div className="mt-2 lg:mt-0">
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#181511] uppercase">
            {productName || "Product"}
          </p>

          <h1 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-[#181511] capitalize">
            {name}
            <br />– {description}
          </h1>

          {/* Price */}
          <div className="mt-3 sm:mt-4 text-black">
            {discount ? (
              <>
                <div className="flex gap-3 sm:gap-6 items-end flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold text-[#4D2A17]">
                    ₹ {totalPrice.toLocaleString()}
                  </span>
                  <span className="text-base sm:text-lg font-normal text-[#897961] line-through">
                    ₹ {(activePrice * quantity).toLocaleString()}
                  </span>

                  <span className="text-xs text-[#DC2626] font-bold px-2 py-1 rounded">
                    {discount}%
                  </span>
                </div>
              </>
            ) : (
              <>
                <span className="text-2xl sm:text-3xl text-[#4D2A17] font-bold">
                  ₹ {totalPrice.toLocaleString()}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-base max-w-xl text-[#4E4539] leading-relaxed">
            {description2}
          </p>

          {/* Size */}
          <div className="mt-6 sm:mt-8">
            <p className="mb-2 sm:mb-3 font-medium text-[#181511] text-sm sm:text-base">
              Size
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {displaySizes.map((s, index) => (
                <button
                  key={`${s.size}-${index}`}
                  onClick={() => {
                    setSelectedSizeObj(s);
                    setQuantity(1);
                  }}
                  className={`rounded-lg sm:rounded-xl border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition ${
                    selectedSizeObj?.size === s.size
                      ? "border-[#4D2A17] bg-amber-50 text-[#4D2A17]"
                      : "border-[#E6E4DF] text-[#181511] bg-white hover:border-gray-400"
                  }`}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="mt-6 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Quantity */}
            <div className="flex items-center rounded-lg sm:rounded-xl border text-black">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 sm:px-4 py-2 text-base sm:text-lg"
              >
                −
              </button>
              <span className="w-8 sm:w-10 text-center font-medium text-sm sm:text-base">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 sm:px-4 py-2 text-base sm:text-lg"
              >
                +
              </button>
            </div>

            {/* Add to Cart */}
            <button
              onClick={() => {
                const cartItem = {
                  id: id.toString(),
                  name,
                  image: selectedImage,
                  size: selectedSizeObj?.size,
                  sizeId: selectedSizeObj?.id, // variant_sizes table ID for backend verification
                  price: discountPrice,
                  originalPrice: discount > 0 ? activePrice : undefined, // Original price before discount
                  quantity,
                };
                cartMessageHandler();
                console.log("🟢 Adding to cart:", cartItem);
                addToCart(cartItem);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl bg-[#4D2A17] px-6 sm:px-8 py-2.5 sm:py-3 text-white text-sm sm:text-base font-semibold transition hover:bg-amber-800 cursor-pointer"
            >
              Add to Cart
            </button>
          </div>

          {/* Cart Success Message */}
          {cartMessage && (
            <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-4 animate-fade-once">
              <span className="text-xs text-green-700 bg-green-100 font-medium border border-green-900 px-4 py-2 rounded">
                Added to cart
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
