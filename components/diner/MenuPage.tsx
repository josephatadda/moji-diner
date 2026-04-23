"use client";

import { useState, useRef, useEffect } from "react";
import type { MenuCategory } from "@/lib/mockData";
import { ItemCard } from "./ui/ItemCard";
import { Button } from "./ui/Button";
import { ModalContainer } from "./ui/ModalContainer";
import { cn } from "@/lib/utils";
import { Star, BowlFood, Clock, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { ItemDetailModal } from "./ItemDetailModal";

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
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

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
    const tabEl = tabsRef.current?.querySelector(`[data-cat="${categoryId}"]`) as HTMLElement | null;
    tabEl?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="bg-[var(--color-background)] min-h-screen">
      {/* Header / Hero */}
      <div className="relative">
        <div className="h-40 bg-[var(--color-surface)] overflow-hidden">
          {coverImageUrl ? (
            <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--color-warning)]/20 to-[var(--color-primary)]/10" />
          )}
        </div>
        
        <div className="px-[var(--space-4)] -mt-10 relative z-10 flex flex-col items-start">
          <div className="w-20 h-20 bg-[var(--color-background)] rounded-full border-4 border-[var(--color-background)] shadow-lg overflow-hidden flex items-center justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-[var(--color-primary)]">{restaurantName?.charAt(0)}</span>
            )}
          </div>
          
          <div className="mt-4 w-full">
            <h1 className="text-[var(--font-size-heading)] font-black text-[var(--color-primary)] tracking-tight">{restaurantName}</h1>
            {restaurantDescription && <p className="text-[var(--font-size-body)] text-[var(--color-muted)] mt-1 line-clamp-2">{restaurantDescription}</p>}
            
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-surface)] rounded-full border border-[var(--color-border)]">
                <div className="w-1.5 h-1.5 bg-[var(--color-success)] rounded-full animate-pulse" />
                <span className="text-[var(--font-size-label)] font-bold text-[var(--color-primary)] uppercase tracking-wider">Table {tableNumber}</span>
              </div>
              {rating && (
                <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-surface)] rounded-full border border-[var(--color-border)] text-[var(--font-size-label)] font-bold">
                  <Star size={12} weight="fill" className="text-[var(--color-warning)]" />
                  {rating}
                </div>
              )}
              {estimatedWaitMins && (
                <div className="flex items-center gap-1 px-3 py-1 bg-[var(--color-surface)] rounded-full border border-[var(--color-border)] text-[var(--font-size-label)] font-bold">
                  <Clock size={12} className="text-[var(--color-muted)]" />
                  {estimatedWaitMins}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div ref={tabsRef} className="sticky top-0 z-30 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-[var(--color-border)] flex gap-1 overflow-x-auto px-[var(--space-4)] py-3 scrollbar-none mt-6">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              data-cat={category.id}
              onClick={() => scrollToCategory(category.id)}
              className={cn(
                "flex-none h-10 px-5 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                isActive ? "bg-[var(--color-primary)] text-[var(--color-background)]" : "text-[var(--color-muted)] hover:text-[var(--color-primary)]"
              )}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="px-[var(--space-4)] py-[var(--space-6)] space-y-10">
        {categories.map((category) => (
          <section
            key={category.id}
            id={`section-${category.id}`}
            ref={(el) => { sectionRefs.current[category.id] = el; }}
          >
            <div className="mb-4">
              <h2 className="text-[var(--font-size-title)] font-black text-[var(--color-primary)]">{category.name}</h2>
              {category.description && <p className="text-[var(--font-size-body)] text-[var(--color-muted)] mt-1">{category.description}</p>}
            </div>
            <div className="space-y-[var(--space-3)]">
              {category.items.map((item) => (
                <ItemCard
                  key={item.id}
                  variant="menu"
                  name={item.name}
                  price={item.price}
                  description={item.description}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Footer */}
      <div className="px-[var(--space-4)] py-[var(--space-12)] text-center opacity-30">
        <p className="text-[var(--font-size-muted)] font-medium uppercase tracking-[2px]">Powered by Moji</p>
      </div>

      {/* Selection Modal */}
      {selectedItem && (
        <ItemDetailModal 
          item={selectedItem} 
          open={!!selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
}
