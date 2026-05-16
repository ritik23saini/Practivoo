import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
// import { ChevronUp, ChevronDown } from "react-icons/hi";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function FeatureCarousel() {
  const slides = [
    {
      id: 0,
      title: "Customised, Autocorrected Exercises aligned with each school's syllabus",
      description:
        "Auto-graded exercises tailored to a school's curriculum, saving teacher time and improving learning accuracy.",
      images: ["/home/6.png", "/home/7.png"],
    },
    {
      id: 1,
      title: "Student Progress Tracker with detailed analytics",
      description:
        "Track each student’s progress through visual dashboards and quick exportable reports.",
      images: ["/home/6.png", "/home/7.png"],
    },
    {
      id: 2,
      title: "Teacher Dashboard for fast assignment management",
      description:
        "Create, assign and review work quickly — with smart filters and bulk operations.",
      images: ["/home/6.png", "/home/7.png"],
    },
  ];

  const len = slides.length;
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLElement | null>(null);
  const ignoreScrollRef = useRef(false);

  // change slide with wrap-around
  const go = (dir: "up" | "down") => {
    setIndex((prev) => {
      if (dir === "down") return prev === len - 1 ? 0 : prev + 1;
      if (dir === "up") return prev === 0 ? len - 1 : prev - 1;
      return prev;
    });
  };

  // keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") go("down");
      if (e.key === "ArrowUp") go("up");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // wheel navigation (throttle a bit)
  useEffect(() => {
    let wheelTimeout: number | undefined;
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (ignoreScrollRef.current) return;
      ignoreScrollRef.current = true;
      if (e.deltaY > 10) go("down");
      else if (e.deltaY < -10) go("up");
      if (wheelTimeout !== undefined) window.clearTimeout(wheelTimeout);
      wheelTimeout = window.setTimeout(() => (ignoreScrollRef.current = false), 400);
    };
    el.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (wheelTimeout !== undefined) window.clearTimeout(wheelTimeout);
    };
  }, [containerRef.current]);

  return (
    <section
      ref={containerRef}

      aria-label="Features carousel section"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center font-extrabold text-3xl md:text-4xl mb-8">Features</h2>

        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6">
          {/* LEFT: vertical carousel controls */}
          <div className="flex-shrink-0 w-full md:w-28 flex items-center md:flex-col justify-between md:justify-center gap-4">
            <button
              onClick={() => go("up")}
              aria-label="Previous feature"
              className="mx-auto md:mx-0 p-2 rounded-full border-2 border-slate-800/20 bg-white shadow-sm hover:shadow-md"
            >
              <ChevronUp className="w-5 h-5" />
            </button>

            {/* vertical indicator bar */}
            <div className="hidden md:flex flex-col items-center gap-3 py-6">
              {/* long bar composed of segmented ticks */}
              <div className="h-64 w-3 flex flex-col justify-between items-center py-2">
                {slides.map((s, i) => (
                  <div
                    key={s.id}
                    onClick={() => setIndex(i)}
                    className={`w-3 rounded-full cursor-pointer transition-all duration-300 ${i === index ? "h-14 bg-white shadow-lg" : "h-8 bg-white/60"
                      }`}
                    title={`Go to slide ${i + 1}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setIndex(i);
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => go("down")}
              aria-label="Next feature"
              className="mx-auto md:mx-0 p-2 rounded-full border-2 border-slate-800/20 bg-white shadow-sm hover:shadow-md"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* RIGHT: slides area */}
          <div className="flex-1">
            <div className="relative bg-white rounded-2xl p-6 md:p-12 shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* TEXT column */}
                <div className="order-2 md:order-1">
                  <div className="h-48 md:h-56 flex flex-col justify-center">
                    <h3 className="text-2xl md:text-3xl font-extrabold leading-tight mb-4">
                      {slides[index].title}
                    </h3>
                    <p className="text-slate-600 max-w-xl">{slides[index].description}</p>
                  </div>

                  {/* small dots for mobile under the text */}
                  <div className="flex gap-2 mt-6 md:hidden items-center">
                    {slides.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => setIndex(i)}
                        className={`w-2 h-2 rounded-full ${i === index ? "bg-slate-800" : "bg-slate-300"
                          }`}
                        aria-label={`Select slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* IMAGES column */}
                <div className="order-1 md:order-2 flex justify-center md:justify-end">
                  {/* container for stacked mockup images */}
                  <div className="relative w-[320px] md:w-[420px] lg:w-[540px] h-[220px] md:h-[260px]">
                    {/* map images but only show for active slide — add subtle offset stacking */}
                    {slides.map((s, i) => {
                      const active = i === index;
                      return (
                        <div
                          key={s.id}
                          aria-hidden={!active}
                          className={`absolute inset-0 transition-all duration-600 ease-in-out transform ${active ? "opacity-100 translate-y-0 scale-100 z-20" : "opacity-0 scale-95 -translate-y-6 z-10 pointer-events-none"
                            }`}
                        >
                          {/* top (front) image */}
                          <div className="absolute right-0 md:right-6 top-0 transform rotate-3 shadow-2xl rounded-xl overflow-hidden w-[220px] md:w-[260px]">
                            <Image
                              src={s.images[0]}
                              alt={`feature ${i} front`}
                              width={520}
                              height={420}
                              className="object-cover"
                            />
                          </div>

                          {/* back (offset) image */}
                          <div className="absolute right-10 md:right-20 bottom-0 transform -rotate-6 shadow-2xl rounded-xl overflow-hidden w-[220px] md:w-[260px]">
                            <Image
                              src={s.images[1]}
                              alt={`feature ${i} back`}
                              width={520}
                              height={420}
                              className="object-cover"
                            />
                          </div>

                          {/* subtle drop shadow / bluish glow (matches reference) */}
                          <div className="absolute inset-0 blur-3xl opacity-20 pointer-events-none" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* bottom helper: small pager text on md+ */}
              <div className="hidden md:flex justify-between items-center mt-6">
                <div className="text-sm text-slate-500">
                  {index + 1}/{len} features
                </div>
                <div className="flex gap-3">
                  {slides.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setIndex(i)}
                      className={`w-3 h-3 rounded-full transition ${i === index ? "bg-slate-800" : "bg-slate-300"
                        }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> {/* .max-w */}
    </section>
  );
}
