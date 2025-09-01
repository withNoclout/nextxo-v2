/**
 * mp-SubNavTabs.jsx
 *
 * IMPORTANT: This component is intentionally self-contained and scoped.
 * - DO NOT modify any other part of the website, global tokens, or shared components
 *   unless you have explicit written permission from the owner.
 * - If a build or global Tailwind change is required, STOP and ask for permission.
 *
 * Usage: import and place directly under your main nav markup. It uses only local Tailwind classes
 * and inline styles; it does not add global CSS or mutate document-level styles.
 */

import React, { useState, useRef, useEffect, ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface MpSubNavTabsProps {
  tabs?: Tab[];
  onTabChange?: (activeId: string) => void;
}

export default function MpSubNavTabs({
  tabs = [
  { id: 'overview', label: 'Overview', icon: <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] block"><circle cx="12" cy="12" r="10" /></svg> },
  { id: 'metrics', label: 'Metrics', icon: <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] block"><rect x="4" y="8" width="4" height="12" /><rect x="10" y="4" width="4" height="16" /><rect x="16" y="12" width="4" height="8" /></svg> },
  { id: 'events', label: 'Events', icon: <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] block"><path d="M6 8h12v2H6z" /></svg> },
  { id: 'logs', label: 'Logs', icon: <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] block"><path d="M4 6h16v2H4zM4 10h16v2H4z" /></svg> },
  ],
  onTabChange, // optional callback if parent needs notification
}: MpSubNavTabsProps) {
  const [active, setActive] = useState(tabs[0].id);
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (typeof onTabChange === "function") onTabChange(active);
  }, [active, onTabChange]);

  function onKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === "ArrowRight") {
      const next = (idx + 1) % tabs.length;
      setActive(tabs[next].id);
      tabRefs.current[tabs[next].id]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      const prev = (idx - 1 + tabs.length) % tabs.length;
      setActive(tabs[prev].id);
      tabRefs.current[tabs[prev].id]?.focus();
      e.preventDefault();
    }
  }

  // keep active tab visible (auto-scroll)
  useEffect(() => {
    const el = tabRefs.current[active];
    const container = listRef.current;
    if (el && container) {
      const elRect = el.getBoundingClientRect();
      const contRect = container.getBoundingClientRect();
      if (elRect.left < contRect.left + 8) {
        container.scrollBy({ left: elRect.left - contRect.left - 8, behavior: "smooth" });
      } else if (elRect.right > contRect.right - 48) {
        container.scrollBy({ left: elRect.right - contRect.right + 48, behavior: "smooth" });
      }
    }
  }, [active]);

  // Optional runtime alignment nudge: align first subnav icon left edge with brand/logo
  useEffect(() => {
    const logo = document.querySelector(
      '.site-logo, .brand-logo, [data-site-logo]'
    ) as HTMLElement | null;
    const listEl = listRef.current;
    if (logo && listEl && tabs.length > 0) {
      const deltaX = logo.getBoundingClientRect().left - listEl.getBoundingClientRect().left;
      if (Math.abs(deltaX) > 1) {
        const firstId = tabs[0].id;
        const btn = tabRefs.current[firstId];
        if (btn) {
          // Only shift right (never negative) to preserve container gutter contract
          btn.style.marginLeft = `${Math.max(0, Math.round(deltaX))}px`;
        }
      }
    }
  }, [tabs]);

  return (
    <div
      className="mp-subnav-root w-full bg-[#0e0e0e] border-b border-[rgba(255,255,255,0.03)]"
      style={{ height: "100px" }}
    >
      <div className="max-w-[1350px] mx-auto h-full px-6 flex items-center">
        <div
          ref={listRef}
          role="tablist"
          aria-label="Sub navigation"
          className="mp-subnav-list relative flex items-center gap-[25px] overflow-x-auto no-scrollbar w-full"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {tabs.map((t, i) => {
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                ref={(el) => (tabRefs.current[t.id] = el)}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? "true" : undefined}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(t.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={`mp-subnav-tab relative flex items-center h-[40px] whitespace-nowrap text-[12px] rounded-lg px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 transition-colors duration-200 ease-out ${
                  isActive
                    ? 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.03)] text-[rgba(255,255,255,0.95)]'
                    : 'text-[rgba(255,255,255,0.70)]'
                }`}
                style={{ gap: 8, minWidth: 56 }}
              >
                <span className="mp-subnav-icon inline-flex items-center justify-center flex-shrink-0 w-[15px] h-[15px]" aria-hidden>
                  {t.icon}
                </span>
                <span className={`mp-subnav-label leading-none`}>{t.label}</span>
              </button>
            );
          })}

          {/* Right-side gradient fade — purely visual, scoped */}
          <div
            aria-hidden
            className="mp-subnav-fade pointer-events-none"
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              height: "100px",
              width: 60,
              background: "linear-gradient(90deg, rgba(14,14,14,0) 0%, rgba(14,14,14,1) 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
