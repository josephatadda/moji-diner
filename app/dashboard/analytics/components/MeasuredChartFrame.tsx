"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

export function MeasuredChartFrame({
  className,
  children,
}: {
  className: string;
  children: (dimensions: { width: number; height: number }) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const update = () => {
      const { width, height } = element.getBoundingClientRect();
      setDimensions({
        width: Math.max(0, Math.floor(width)),
        height: Math.max(0, Math.floor(height)),
      });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {dimensions.width > 0 && dimensions.height > 0
        ? children(dimensions)
        : null}
    </div>
  );
}
