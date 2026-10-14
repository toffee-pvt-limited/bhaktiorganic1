import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Be_Vietnam_Pro } from "next/font/google";
import Navbar from "@/components/Navbar/page";
import Footer from "@/components/Footer/page";
import { CartProvider } from "@/context/CartContext";
import { EnquiryModalProvider } from "@/context/EnquiryModalContext";
import { OrderModalProvider } from "@/context/OrderModalContext";
import ContactEnquiryModal from "@/components/ContactEnquiryModal";
import AdminSessionManager from "@/components/AdminSessionManager";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-be-vietnam",
});

export const metadata: Metadata = {
  title: "BhaktiOrganic",
  description: "Crunchy, Healthy, Guilt Free Snacking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${beVietnamPro.variable} font-sans antialiased bg-[#fafafa] text-gray-900`}
      >
        <EnquiryModalProvider>
          <AdminSessionManager />
          <ContactEnquiryModal />
          <OrderModalProvider>
            <CartProvider>
              <Navbar />
              {children}
              <Footer />
            </CartProvider>
          </OrderModalProvider>
        </EnquiryModalProvider>
      </body>
    </html>
  );
}
