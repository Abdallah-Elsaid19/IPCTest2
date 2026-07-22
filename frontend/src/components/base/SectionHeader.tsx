interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
  className?: string;
  eyebrowClassName?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  centered = false,
  light = false,
  className = "",
  eyebrowClassName = "",
}: SectionHeaderProps) {
  return (
    <div className={`${centered ? "text-center" : ""} ${className}`}>
      {eyebrow && (
        <span className={`eyebrow mb-3 block ${eyebrowClassName}`}>{eyebrow}</span>
      )}
      <h2
        className={`font-heading text-3xl md:text-4xl lg:text-[2.75rem] leading-tight ${
          light ? "text-background-50" : "text-background-950"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 md:mt-5 text-base md:text-lg leading-relaxed max-w-reading ${
            centered ? "mx-auto" : ""
          } ${light ? "text-background-200" : "text-foreground-600"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
