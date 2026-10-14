"use client";
import { useEnquiryModal } from "@/context/EnquiryModalContext";
import Link from "next/link";

export default function Footer() {
  const { openModal } = useEnquiryModal();

  return (
    <footer className="bg-gradient-to-b from-[#1a1814] to-[#0f0e0c] text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
        {/* Top Section */}
        <div className="flex flex-col gap-8 sm:gap-12 lg:flex-row lg:justify-between">
          {/* Brand */}
          <div className="text-center sm:text-left lg:max-w-md">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              Bhakti Organic
            </h2>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-relaxed text-gray-400">
              Delicious, nutritious, and ethically sourced. We are bringing the
              superfood power of Makhana to the world, one crunch at a time.
            </p>
          </div>

          {/* Links - All in one row */}
          <div className="flex justify-center sm:justify-start gap-8 sm:gap-12 lg:gap-16">
            {/* Shop */}
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-semibold text-white">Shop</h3>
              <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
                <li>
                  <Link
                    href="/products"
                    className="hover:text-white transition"
                  >
                    All Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="hover:text-white transition"
                  >
                    Bundles
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-semibold text-white">Company</h3>
              <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-semibold text-white">Support</h3>
              <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
                <li>
                  <Link
                    href="#"
                    onClick={() => {
                      openModal();
                    }}
                    className="hover:text-white transition"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 sm:my-12 h-px w-full bg-white/10" />

        {/* Bottom Section */}
        <div className="flex flex-col gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 text-center sm:text-left sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 Bhakti Organic. All rights reserved.</p>
          <div className="flex justify-center sm:justify-start gap-4 sm:gap-6">
            <a href="#" className="hover:text-white transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
