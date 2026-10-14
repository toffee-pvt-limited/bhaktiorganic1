"use client";
import Link from "next/link";
import { useState } from "react";
import LogoImg from "@/assets/makhanalogo.svg";
import Image from "next/image";
import { useEnquiryModal } from "@/context/EnquiryModalContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { openModal, closeModal } = useEnquiryModal();

  return (
    <header className="bg-[#ffffff] border-b border-[#F4F3F0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href={"/"}>
          {/* <div className="flex items-center gap-2"> */}
          <Image src={LogoImg} alt="Bhakti Organic" className="w-full h-full" />
          {/* <span className="font-semibold text-lg text-[#4a2612]">
              Bhakti <span className="font-bold">Organic</span>
            </span> */}
          {/* </div> */}
        </Link>

        {/* Search Bar - Desktop */}
        {/* <div className="hidden br md:flex items-center bg-white rounded-sm px-4 py-2 shadow-sm w-[320px]">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            className="ml-2 text-sm outline-none w-full bg-transparent"
          />
        </div> */}

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4a2612]">
          <Link href="/products">Products</Link>
          <Link href="/about">About</Link>
          <Link
            href="#"
            onClick={() => {
              setOpen(!open);
              openModal();
            }}
          >
            Contact
          </Link>
          <Link
            href="/cart"
            className="bg-[#4a2612] text-white px-5 py-2 rounded-md"
          >
            View Cart
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <div className="flex gap-4 md:hidden">
          <button
            onClick={() => {
              closeModal();
              setOpen(!open);
            }}
            className="md:hidden text-2xl text-[#4a2612]"
          >
            ☰
          </button>
          <Link href={"/cart"} className="md:hidden text-[#4a2612]">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 20"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t">
          <div className="px-6 py-4 space-y-4">
            {/* Search */}
            {/* <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <input
                type="text"
                placeholder="Search products..."
                className="text-sm outline-none w-full bg-transparent"
              />
            </div> */}

            {/* Links */}
            <nav className="flex flex-col gap-3 text-sm font-medium text-[#4a2612]">
              <Link href="/products" onClick={() => setOpen(false)}>
                Products
              </Link>
              <Link href="/about" onClick={() => setOpen(false)}>
                About
              </Link>
              <Link
                href="#"
                onClick={() => {
                  setOpen(false);
                  openModal();
                }}
              >
                Contact
              </Link>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="bg-[#4a2612] text-white py-2 rounded-md text-center"
              >
                View Cart
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
