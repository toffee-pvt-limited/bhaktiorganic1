"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type OrderModalContextType = {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const OrderModalContext = createContext<OrderModalContextType | null>(null);

export function OrderModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <OrderModalContext.Provider
      value={{
        open,
        openModal: () => setOpen(true),
        closeModal: () => setOpen(false),
      }}
    >
      {children}
    </OrderModalContext.Provider>
  );
}

export const useOrderModal = () => {
  const ctx = useContext(OrderModalContext);
  if (!ctx)
    throw new Error("useOrderModal must be used inside OrderModalProvider");
  return ctx;
};
