"use client";

import { Clock, Star, Storefront } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MenuCategory } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { MenuItemCard } from "./MenuItemCard";
import { DINER } from "./ui/diner-tokens";

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
  estimatedWaitMins,
}: MenuPageProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
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
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );
    for (const id of Object.keys(sectionRefs.current)) {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    sectionRefs.current[categoryId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    const tabEl = tabsRef.current?.querySelector(
      `[data-cat="${categoryId}"]`,
    ) as HTMLElement | null;
    tabEl?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div>
      {/* Cover Image & Restaurant Info */}
      <div className="bg-white pb-5 relative">
        <div className="relative h-36 w-full overflow-hidden bg-gray-200">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={`${restaurantName ?? "Restaurant"} cover`}
              fill
              unoptimized
              sizes="480px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[linear-gradient(135deg,#fff7ed_0%,#fef3c7_45%,#f3f4f6_100%)]" />
          )}
        </div>

        <div className="px-4 -mt-8 relative z-10">
          <div className="relative w-16 h-16 bg-white border-[3px] border-white rounded-xl flex items-center justify-center mb-3 overflow-hidden">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${restaurantName ?? "Restaurant"} logo`}
                fill
                unoptimized
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-orange-500">
                <Storefront size={28} weight="fill" />
              </div>
            )}
          </div>

          <h1 className={cn(DINER.displayTitle, "mb-1.5")}>{restaurantName}</h1>

          {restaurantDescription && (
            <p className={cn(DINER.body, "leading-relaxed mb-3 pr-4")}>
              {restaurantDescription}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <div className={DINER.metaChip}>
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Table {tableNumber}
            </div>
            {rating && (
              <div className={DINER.metaChip}>
                <Star size={12} weight="fill" className="text-orange-400" />
                {rating}
              </div>
            )}
            {estimatedWaitMins && (
              <div className={DINER.metaChip}>
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
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-y border-gray-100 flex gap-1.5 overflow-x-auto px-4 py-2.5 scrollbar-none"
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              type="button"
              key={category.id}
              data-cat={category.id}
              onClick={() => scrollToCategory(category.id)}
              className={cn(
                DINER.categoryTab,
                isActive && DINER.categoryTabActive,
                DINER.pressable,
              )}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Category sections */}
      <div className="px-4 pt-5 space-y-8">
        {categories.map((category) => (
          <section
            key={category.id}
            id={`section-${category.id}`}
            ref={(el) => {
              sectionRefs.current[category.id] = el;
            }}
            className="scroll-mt-16"
          >
            <div className="mb-3.5 flex items-end justify-between gap-3">
              <div>
                <h2 className={DINER.sectionTitle}>{category.name}</h2>
                {category.description && (
                  <p className={cn(DINER.caption, "mt-0.5")}>
                    {category.description}
                  </p>
                )}
              </div>
              <span className="flex-none text-xs font-semibold text-gray-400">
                {category.items.length}{" "}
                {category.items.length === 1 ? "item" : "items"}
              </span>
            </div>
            <div className={DINER.listGap}>
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

      <div className="px-4 py-8 text-center">
        <p className={DINER.caption}>
          {totalItems} items across {categories.length} categories
        </p>
        <p className={cn(DINER.caption, "mt-1")}>Powered by Moji</p>
      </div>
    </div>
  );
}
