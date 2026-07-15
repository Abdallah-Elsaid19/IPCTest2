import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const insights = [
  {
    id: "i1",
    category: "Technical Paper",
    title: "Schedule Risk Analysis in Major Rail Programmes",
    image: "https://readdy.ai/api/search-image?query=Aerial%20view%20of%20British%20railway%20junction%20with%20multiple%20tracks%20converging%20complex%20overhead%20line%20equipment%20signal%20gantries%20infrastructure%20precision%20engineering%20monochrome%20with%20subtle%20gold%20warmth%20editorial%20photography%20architectural%20composition%20sharp%20geometry%20no%20people&width=800&height=500&seq=ipc-knowledge-01&orientation=landscape",
    span: "lg:col-span-8 lg:row-span-2",
    aspect: "aspect-[16/10]",
  },
  {
    id: "i2",
    category: "Case Study",
    title: "Earned Value on Nuclear New-Build",
    image: "https://readdy.ai/api/search-image?query=Nuclear%20power%20station%20construction%20site%20with%20reactor%20containment%20dome%20massive%20concrete%20structures%20cooling%20towers%20against%20overcast%20sky%20industrial%20scale%20precision%20engineering%20monochrome%20photography%20strong%20architectural%20geometry%20charcoal%20tones%20no%20people&width=600&height=600&seq=ipc-knowledge-02&orientation=squarish",
    span: "lg:col-span-4",
    aspect: "aspect-square",
  },
  {
    id: "i3",
    category: "Guidance Note",
    title: "Competence Framework v2.4",
    image: "https://readdy.ai/api/search-image?query=Engineering%20technical%20drawings%20and%20project%20controls%20documentation%20laid%20out%20on%20drafting%20table%20with%20precision%20instruments%20warm%20desk%20lamp%20lighting%20architectural%20plans%20schedules%20and%20data%20sheets%20editorial%20photography%20charcoal%20and%20cream%20tones&width=600&height=450&seq=ipc-knowledge-03&orientation=landscape",
    span: "lg:col-span-4",
    aspect: "aspect-[4/3]",
  },
  {
    id: "i4",
    category: "Community",
    title: "Professional Recognition: A Pathway Guide",
    image: "https://readdy.ai/api/search-image?query=Modern%20glass%20and%20steel%20building%20interior%20with%20warm%20lighting%20professional%20atmosphere%20abstract%20architectural%20composition%20leading%20lines%20perspective%20view%20reflection%20on%20polished%20surfaces%20cream%20and%20charcoal%20tones%20sophisticated%20editorial%20photography%20no%20people&width=800&height=400&seq=ipc-knowledge-04&orientation=landscape",
    span: "lg:col-span-8",
    aspect: "aspect-[2/1]",
  },
];

export default function KnowledgeMosaic() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative bg-background-50 section-padding overflow-hidden">
      {/* ── Dot grid ── */}
      <div className="absolute inset-0 dot-grid opacity-20" />

      {/* ── Decorative ring frame ── */}
      <div className="absolute top-1/3 right-0 w-[350px] h-[350px] pointer-events-none opacity-[0.04]">
        <svg viewBox="0 0 300 300" className="w-full h-full">
          <circle cx="300" cy="150" r="280" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" />
          <circle cx="300" cy="150" r="240" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" strokeDasharray="4 12" />
          <circle cx="300" cy="150" r="190" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" strokeDasharray="2 16" />
        </svg>
      </div>

      <div className="container-content relative z-10">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-14 md:mb-20">
          <span className="text-[10px] font-mono text-primary-500 tracking-[0.3em] uppercase">Knowledge</span>
          <span className="flex-1 h-px bg-gradient-to-r from-primary-500/40 to-transparent" />
        </div>

        <div className="mb-12 md:mb-16">
          <h2 className="font-heading text-[clamp(1.8rem,4vw,3.5rem)] font-extrabold text-foreground-950 leading-[1.05] tracking-[-0.03em] max-w-[700px]">
            Knowledge <span className="text-primary-600">that advances</span> the profession.
          </h2>
        </div>

        {/* ── Editorial Mosaic ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
          {insights.map((item) => {
            const isHovered = hovered === item.id;
            return (
              <Link
                key={item.id}
                to="/events"
                className={`group relative overflow-hidden ${item.span} ${item.aspect} bg-background-200 cursor-pointer`}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <img
            loading="lazy"
            decoding="async"
                  src={item.image}
                  alt={item.title}
                  className={`w-full h-full object-cover object-top transition-all duration-800 ease-out ${
                    isHovered ? "scale-[1.04] saturate-100" : "saturate-[0.55]"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-950/70 via-background-950/10 to-transparent transition-opacity duration-500" />

                {/* ── Circular ring accent on hover ── */}
                <div className={`absolute top-4 right-4 w-12 h-12 pointer-events-none transition-all duration-500 ${
                  isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
                }`}>
                  <svg viewBox="0 0 48 48" className="w-full h-full">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="oklch(0.685 0.132 72 / 0.5)" strokeWidth="1" />
                    <circle cx="24" cy="24" r="15" fill="none" stroke="oklch(0.685 0.132 72 / 0.3)" strokeWidth="0.5" strokeDasharray="20 4" />
                  </svg>
                </div>

                {/* ── Content ── */}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <span className="text-[9px] font-mono text-primary-400 tracking-[0.2em] uppercase block mb-2">
                    {item.category}
                  </span>
                  <h3 className={`text-sm md:text-base font-bold leading-tight transition-colors duration-400 ${
                    isHovered ? "text-background-50" : "text-background-100"
                  }`}>
                    {item.title}
                  </h3>
                  <div className={`flex items-center gap-2 mt-3 transition-all duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}>
                    <span className="text-[10px] text-primary-400 font-mono">Read</span>
                    <i className="ri-arrow-right-line text-primary-400 text-xs" />
                  </div>
                </div>

                {/* ── Gold border hover ── */}
                <div className={`absolute inset-0 border transition-all duration-500 pointer-events-none ${
                  isHovered ? "border-primary-500/40" : "border-transparent"
                }`} />
              </Link>
            );
          })}
        </div>

        {/* ── Bottom link ── */}
        <div className="mt-10 pt-8 border-t border-foreground-200/40 flex items-center justify-between">
          <span className="text-xs text-foreground-500 font-medium">
            Technical papers, guidance notes and case studies from the Institute.
          </span>
          <Link
            to="/events"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground-900 hover:text-primary-600 transition-colors duration-300"
          >
            <span>Knowledge library</span>
            <i className="ri-arrow-right-line text-xs group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 gold-rule opacity-25" />
    </section>
  );
}