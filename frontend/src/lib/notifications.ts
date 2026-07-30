import { toast, type ToastOptions } from "react-toastify";
import { createElement } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";

const ipcToastStyle = {
  style: {
    background: "#0B0B0B",
    color: "#F4ECE1",
    border: "1px solid rgba(215, 149, 37, 0.65)",
    borderRadius: "12px",
    boxShadow: "0 18px 45px rgba(0, 0, 0, 0.35)",
  },
  progressClassName: "!bg-[#D79525]",
};

const ipcSuccessToast: ToastOptions = {
  ...ipcToastStyle,
  icon: () => createElement(CheckCircle2, { size: 22, color: "#D79525" }),
};

const ipcErrorToast: ToastOptions = {
  ...ipcToastStyle,
  style: {
    ...ipcToastStyle.style,
    border: "1px solid rgba(220, 38, 38, 0.72)",
  },
  progressClassName: "!bg-red-600",
  icon: () => createElement(CircleAlert, { size: 22, color: "#DC2626" }),
};

export const notifications = {
  signedIn: (name: string) => toast.success(`Signed in successfully — Welcome, ${name}`, {
    ...ipcSuccessToast,
    ariaLabel: "Signed in successfully",
  }),
  error: (message: string) => toast.error(message, {
    ...ipcErrorToast,
    ariaLabel: "Error notification",
  }),
  success: (message: string) => toast.success(message, {
    ...ipcSuccessToast,
    ariaLabel: "Success notification",
  }),
};
