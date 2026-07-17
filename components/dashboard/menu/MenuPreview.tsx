"use client";

import { BowlFood, ShoppingCart } from "@phosphor-icons/react";
import type { MenuCategory } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface MenuPreviewProps {
  categories: MenuCategory[];
  restaurantName: string;
  mode?: "phone" | "fullscreen";
}

export function MenuPreview({
  categories,
  restaurantName,
  mode = "phone",
}: MenuPreviewProps) {
  const isFullscreen = mode === "fullscreen";

  return (
    <div
      className={cn(
        "mx-auto overflow-hidden bg-white",
        isFullscreen
          ? "h-full w-full rounded-none border-0"
          : "rounded-[2rem] border-4 border-gray-800 shadow-2xl",
      )}
      style={
        isFullscreen
          ? undefined
          : {
              width: 280,
              minHeight: 520,
            }
      }
    >
      {/* Status bar mock */}
      <div
        className={cn(
          "flex items-center justify-between bg-gray-900 px-4",
          isFullscreen ? "py-2" : "py-1.5",
        )}
      >
        <span
          className={cn(
            "font-semibold text-white",
            isFullscreen ? "text-xs" : "text-[9px]",
          )}
        >
          9:41
        </span>
        <div className="flex items-center gap-1">
          <span
            className={cn(
              "text-white",
              isFullscreen ? "text-xs" : "text-[9px]",
            )}
          >
            ●●●
          </span>
          <span
            className={cn(
              "text-white",
              isFullscreen ? "text-xs" : "text-[9px]",
            )}
          >
            WiFi
          </span>
          <span
            className={cn(
              "text-white",
              isFullscreen ? "text-xs" : "text-[9px]",
            )}
          >
            100%
          </span>
        </div>
      </div>

      {/* Restaurant header */}
      <div
        className={cn(
          "flex items-center justify-between border-b border-gray-100 bg-white",
          isFullscreen ? "px-4 py-4" : "px-3 py-2.5",
        )}
      >
        <div>
          <p
            data-testid="menu-preview-restaurant-name"
            className={cn(
              "truncate font-bold leading-tight text-gray-900",
              isFullscreen ? "max-w-[240px] text-lg" : "max-w-[140px] text-xs",
            )}
          >
            {restaurantName}
          </p>
          <p
            className={cn(
              "mt-0.5 text-gray-400",
              isFullscreen ? "text-xs" : "text-[9px]",
            )}
          >
            Table 1
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 rounded-full bg-gray-900",
            isFullscreen ? "px-3 py-2" : "px-2 py-1",
          )}
        >
          <span
            className={cn(
              "text-white",
              isFullscreen ? "text-base" : "text-[12px]",
            )}
          >
            <ShoppingCart />
          </span>
          <span
            className={cn(
              "font-bold text-white",
              isFullscreen ? "text-xs" : "text-[9px]",
            )}
          >
            Cart
          </span>
        </div>
      </div>

      {/* Category tabs */}
      <div
        className={cn(
          "flex gap-1 overflow-x-auto border-b border-gray-100 scrollbar-none",
          isFullscreen ? "px-4 py-3" : "px-2 py-1.5",
        )}
      >
        {categories.map((cat, i) => (
          <span
            key={cat.id}
            className={cn(
              "flex-none rounded-full font-semibold whitespace-nowrap",
              isFullscreen ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-[9px]",
              i === 0 ? "bg-gray-900 text-white" : "text-gray-400 bg-gray-100",
            )}
          >
            {cat.name}
          </span>
        ))}
      </div>

      {/* Menu items preview */}
      <div
        className={cn(
          "overflow-y-auto",
          isFullscreen && "h-[calc(100%-132px)]",
        )}
        style={isFullscreen ? undefined : { maxHeight: 360 }}
      >
        {categories.map((category) => (
          <div key={category.id}>
            {/* Category header */}
            <div
              className={cn(isFullscreen ? "px-4 pt-5 pb-2" : "px-3 pt-3 pb-1")}
            >
              <p
                className={cn(
                  "font-bold text-gray-900",
                  isFullscreen ? "text-base" : "text-[10px]",
                )}
              >
                {category.name}
              </p>
            </div>

            {/* Items */}
            {category.items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex border-b border-gray-50",
                  isFullscreen ? "gap-3 px-4 py-3" : "gap-2 px-3 py-2",
                  !item.isAvailable && "opacity-40",
                )}
              >
                {/* Mini thumb */}
                <div
                  className={cn(
                    "relative flex flex-none items-center justify-center rounded-lg bg-gray-100 text-gray-500",
                    isFullscreen ? "h-12 w-12" : "h-9 w-9",
                  )}
                >
                  <span className={cn(isFullscreen ? "text-xl" : "text-base")}>
                    <BowlFood />
                  </span>
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center">
                      <span className="text-[7px] font-bold text-gray-500">
                        Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "font-semibold leading-tight text-gray-900 line-clamp-1",
                      isFullscreen ? "text-sm" : "text-[10px]",
                    )}
                  >
                    {item.name}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 font-bold text-orange-600",
                      isFullscreen ? "text-xs" : "text-[8px]",
                    )}
                  >
                    ₦{item.price.toLocaleString()}
                  </p>
                </div>

                {/* Add btn */}
                {item.isAvailable && (
                  <div
                    className={cn(
                      "flex flex-none items-center justify-center rounded-full bg-gray-900",
                      isFullscreen ? "h-8 w-8" : "h-5 w-5",
                    )}
                  >
                    <span
                      className={cn(
                        "font-bold leading-none text-white",
                        isFullscreen ? "text-sm" : "text-[10px]",
                      )}
                    >
                      +
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
