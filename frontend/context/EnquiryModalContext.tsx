"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type EnquiryModalContextType = {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const EnquiryModalContext = createContext<EnquiryModalContextType | null>(null);

export function EnquiryModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <EnquiryModalContext.Provider
      value={{
        open,
        openModal: () => setOpen(true),
        closeModal: () => setOpen(false),
      }}
    >
      {children}
    </EnquiryModalContext.Provider>
  );
}

export const useEnquiryModal = () => {
  const ctx = useContext(EnquiryModalContext);
  if (!ctx)
    throw new Error("useEnquiryModal must be used inside EnquiryModalProvider");
  return ctx;
};
