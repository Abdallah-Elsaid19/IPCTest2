interface FeatureCardProps {
  icon: string;
  title: string;
  description?: string;
  light?: boolean;
}

export default function FeatureCard({
  icon,
  title,
  description,
  light = false,
}: FeatureCardProps) {
  return (
    <div
      className={`p-5 md:p-6 transition-all duration-300 hover:translate-y-[-2px] ${
        light
          ? "bg-background-50/5 border border-background-50/10"
          : "bg-background-50 border border-background-200/70 hover:border-primary-200"
      }`}
    >
      <div
        className={`w-10 h-10 flex items-center justify-center mb-4 ${
          light ? "bg-primary-500/20" : "bg-primary-100"
        }`}
      >
        <i
          className={`${icon} text-lg ${
            light ? "text-primary-400" : "text-primary-600"
          }`}
        />
      </div>
      <h4
        className={`font-heading text-base font-semibold mb-2 ${
          light ? "text-background-50" : "text-background-950"
        }`}
      >
        {title}
      </h4>
      {description && (
        <p
          className={`text-sm leading-relaxed ${
            light ? "text-background-300" : "text-foreground-600"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}