import { Link } from "react-router-dom";

interface CtaButtonProps {
  to?: string;
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
  className?: string;
  icon?: string;
}

export default function CtaButton({
  to,
  href,
  children,
  variant = "primary",
  onClick,
  className = "",
  icon,
}: CtaButtonProps) {
  const baseClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
  };

  const content = (
    <>
      {icon && <i className={`${icon} text-base`} />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${baseClasses[variant]} ${className}`}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={`${baseClasses[variant]} ${className}`}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClasses[variant]} ${className}`}>
      {content}
    </button>
  );
}