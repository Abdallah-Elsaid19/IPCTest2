import { toast, type ToastOptions } from "react-toastify";
import { createElement } from "react";
import { CheckCircle2 } from "lucide-react";

const ipcSuccessToast: ToastOptions = {
  icon: () => createElement(CheckCircle2, { size: 22, color: "#D79525" }),
  style: {
    background: "#0B0B0B",
    color: "#F4ECE1",
    border: "1px solid rgba(215, 149, 37, 0.65)",
    borderRadius: "12px",
    boxShadow: "0 18px 45px rgba(0, 0, 0, 0.35)",
  },
  progressClassName: "!bg-[#D79525]",
};

export const notifications = {
  signedIn: (name: string) => toast.success(`Signed in successfully — Welcome, ${name}`, {
    ...ipcSuccessToast,
    ariaLabel: "Signed in successfully",
  }),
  error: (message: string) => toast.error(message, {
    ariaLabel: "Error notification",
  }),
  success: (message: string) => toast.success(message, {
    ...ipcSuccessToast,
    ariaLabel: "Success notification",
  }),
};
