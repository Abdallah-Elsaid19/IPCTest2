import type { ButtonHTMLAttributes } from "react";
import { useChat } from "./useChat";

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type"> {
  source?: string;
}

export default function ChatContactButton({ source = "membership", className = "", ...props }: Props) {
  const { openChat } = useChat();
  return (
    <button
      type="button"
      onClick={() => openChat(source)}
      className={className}
      {...props}
    >
      Contact us for more information
    </button>
  );
}
