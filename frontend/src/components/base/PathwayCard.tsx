interface PathwayCardProps {
  grade: string;
  abbreviation: string;
  title: string;
  description: string;
  step: number;
  isLast?: boolean;
}

export default function PathwayCard({
  grade,
  abbreviation,
  title,
  description,
  step,
  isLast = false,
}: PathwayCardProps) {
  return (
    <div className="relative flex-shrink-0 w-[280px] md:w-[320px]">
      <div className="bg-background-50 border border-background-200/70 p-6 md:p-7 h-full flex flex-col transition-all duration-300 hover:border-primary-300 hover:shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-accent-500 flex items-center justify-center">
            <span className="font-heading text-background-50 text-sm font-bold">
              {step}
            </span>
          </div>
          <span className="font-heading text-3xl md:text-4xl font-bold text-primary-500 leading-none">
            {abbreviation}
          </span>
        </div>
        <h3 className="font-heading text-lg font-semibold text-background-950 mb-2">
          {grade}
        </h3>
        <p className="text-sm text-foreground-600 leading-relaxed flex-grow">
          {description}
        </p>
        <div className="mt-4 pt-4 border-t border-background-200/50">
          <span className="text-xs text-foreground-500 font-medium">
            {title}
          </span>
        </div>
      </div>
      {!isLast && (
        <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
          <i className="ri-arrow-right-line text-primary-500 text-lg" />
        </div>
      )}
    </div>
  );
}