interface AudienceCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function AudienceCard({ icon, title, description }: AudienceCardProps) {
  return (
    <div className="bg-background-50 border border-background-200/70 p-6 md:p-7 text-center transition-all duration-300 hover:border-primary-200 hover:shadow-sm">
      <div className="w-14 h-14 mx-auto bg-accent-100 flex items-center justify-center mb-5">
        <i className={`${icon} text-2xl text-accent-600`} />
      </div>
      <h3 className="font-heading text-lg font-semibold text-background-950 mb-2">
        {title}
      </h3>
      <p className="text-sm text-foreground-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}