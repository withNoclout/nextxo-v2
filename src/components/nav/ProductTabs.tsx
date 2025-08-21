import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';

function MonitoringIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M4 12h3l2-3 3 6 2-3h6" />
      <path d="M8 20h8" />
    </svg>
  );
}

function DatabaseIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </svg>
  );
}
function StorageIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="6" rx="2"/>
      <rect x="3" y="14" width="18" height="6" rx="2"/>
      <path d="M7 7h2M7 17h2" />
    </svg>
  );
}
function EdgeIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l8 4-8 4-8-4 8-4z" />
      <path d="M4 12l8 4 8-4" />
      <path d="M4 17l8 4 8-4" />
    </svg>
  );
}
function RealtimeIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </svg>
  );
}

export type ProductTab = { id: string; label: string; to: string; icon: React.ReactElement };

const TABS: ProductTab[] = [
  { id: 'db',         label: 'Database',        to: '/database',   icon: <DatabaseIcon size={18} /> },
  { id: 'monitoring', label: 'Monitoring',      to: '/monitoring', icon: <MonitoringIcon size={18} /> },
  { id: 'storage',    label: 'Storage',         to: '/storage',    icon: <StorageIcon size={18} /> },
  { id: 'edge',       label: 'Edge Functions',  to: '/edge',       icon: <EdgeIcon size={18} /> },
  { id: 'realtime',   label: 'Realtime',        to: '/realtime',   icon: <RealtimeIcon size={18} /> },
];

export default function ProductTabs() {
  const { pathname } = useLocation();
  const activeId =
    pathname.startsWith('/database')   ? 'db' :
    pathname.startsWith('/monitoring') ? 'monitoring' :
    pathname.startsWith('/storage')    ? 'storage' :
    pathname.startsWith('/edge')       ? 'edge' :
    pathname.startsWith('/realtime')   ? 'realtime' :
    'monitoring';

  return (
    <nav
      role="tablist"
      aria-label="Product Sections"
      className="w-full h-[55px] border-b border-white/10 bg-[#0b0b0b] flex items-center overflow-x-auto scrollbar-none"
    >
      <div className="mx-auto max-w-[1385px] h-[65px] px-4 w-full flex items-center">
        <div className="flex items-center gap-[30px]">
          {TABS.map(tab => {
            const isActive = tab.id === activeId;
            return (
              <Link
                key={tab.id}
                to={tab.to}
                role="tab"
                aria-selected={isActive}
                className={
                  'relative group h-[55px] leading-none text-[12px] flex items-center gap-[10px] ' +
                  (isActive ? 'text-emerald-400' : 'text-white/55 hover:text-white/80')
                }
              >
                {React.cloneElement(tab.icon, { className: isActive ? 'text-emerald-400' : 'text-white/55' })}
                <span>{tab.label}</span>
                <span
                  className={
                    'absolute left-0 right-0 -bottom-px h-[2px] transition-colors ' +
                    (isActive ? 'bg-emerald-400' : 'bg-transparent group-hover:bg-white/30')
                  }
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
