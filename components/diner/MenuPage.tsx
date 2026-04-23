"use client";

import { useState, useRef, useEffect } from "react";
import type { MenuCategory } from "@/lib/mockData";
import { MenuItemCard } from "./MenuItemCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Star, BowlFood, Clock } from "@phosphor-icons/react";

interface MenuPageProps {
  categories: MenuCategory[];
  restaurantSlug: string;
  tableNumber: number;
  restaurantName?: string;
  restaurantDescription?: string;
  coverImageUrl?: string;
  logoUrl?: string;
  rating?: string;
  estimatedWaitMins?: string;
}

export function MenuPage({
  categories,
  restaurantSlug,
  tableNumber,
  restaurantName,
  restaurantDescription,
  coverImageUrl,
  logoUrl,
  rating,
  estimatedWaitMins
}: MenuPageProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const tabsRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Scroll spy — update active tab on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id.replace("section-", ""));
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    for (const id of Object.keys(sectionRefs.current)) {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    sectionRefs.current[categoryId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Scroll the active tab into view
    const tabEl = tabsRef.current?.querySelector(`[data-cat="${categoryId}"]`) as HTMLElement | null;
    tabEl?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div>
      {/* Cover Image & Restaurant Info */}
      <div className="bg-white pb-4 relative">
        {/* Cover Image */}
        <div className="h-32 w-full bg-gray-200 overflow-hidden">
          {coverImageUrl ? (
            <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-orange-100 to-amber-100" />
          )}
        </div>

        {/* Info - Left aligned */}
        <div className="px-4 -mt-8 relative z-10">
          <div className="w-16 h-16 bg-white border-[3px] border-white rounded-full shadow-sm flex items-center justify-center mb-3 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-orange-500">{restaurantName?.charAt(0) || "R"}</span>
            )}
          </div>

          <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1.5">
            {restaurantName}
          </h1>

          {restaurantDescription && (
            <p className="text-sm text-gray-500 leading-relaxed mb-3 pr-4">
              {restaurantDescription}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-gray-700 rounded-full text-[11px] font-medium border border-gray-100 shadow-sm">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Table {tableNumber}
            </div>
            {rating && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-gray-700 rounded-full text-[11px] font-medium border border-gray-100 shadow-sm">
                <Star size={12} weight="fill" className="text-orange-400" />
                {rating}
              </div>
            )}
            {estimatedWaitMins && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-gray-700 rounded-full text-[11px] font-medium border border-gray-100 shadow-sm">
                <Clock size={12} className="text-gray-400" />
                {estimatedWaitMins}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky category tab bar */}
      <div
        ref={tabsRef}
        className="sticky top-[57px] z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 flex gap-1 overflow-x-auto px-4 py-2 scrollbar-none"
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              data-cat={category.id}
              onClick={() => scrollToCategory(category.id)}
              className={cn(
                "flex-none px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Category sections */}
      <div className="px-4 pt-4 space-y-8">
        {categories.map((category) => (
          <section
            key={category.id}
            id={`section-${category.id}`}
            ref={(el) => { sectionRefs.current[category.id] = el; }}
          >
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
              {category.description && (
                <p className="text-sm text-gray-400 mt-0.5">{category.description}</p>
              )}
            </div>
            <div className="space-y-3">
              {category.items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  restaurantSlug={restaurantSlug}
                  tableNumber={tableNumber}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom spacer info */}
      <div className="px-4 py-8 text-center">
        <p className="text-xs text-gray-300">{totalItems} items across {categories.length} categories</p>
        <p className="text-xs text-gray-300 mt-1">Powered by Moji</p>
      </div>
    </div>
  );
}
