"use client";

import { ReactNode, useEffect, useState } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * A container component that provides responsive classes based on the current viewport
 */
export function ResponsiveContainer({
  children,
  className = "",
}: ResponsiveContainerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 640);
      };

      // Initial check
      checkMobile();

      // Add event listener
      window.addEventListener("resize", checkMobile);

      // Cleanup
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  return (
    <div
      className={`${className} ${
        isMobile ? "responsive-mobile" : "responsive-desktop"
      }`}
      data-mobile={isMobile}
    >
      {children}
    </div>
  );
}
