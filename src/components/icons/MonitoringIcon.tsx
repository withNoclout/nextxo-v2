import * as React from 'react';

export default function MonitoringIcon({
  className = '',
  size = 20,
}: { className?: string; size?: number }) {
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
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M4 12h3l2-3 3 6 2-3h6" />
      <path d="M8 20h8" />
    </svg>
  );
}
