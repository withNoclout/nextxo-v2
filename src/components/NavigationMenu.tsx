import React, { useState, useRef, useEffect, ReactNode } from 'react'

interface NavItem {
  id: string
  label: string
  href?: string
  icon?: ReactNode
}

interface NavigationMenuProps {
  items: NavItem[]
  currentPage: string
  onNavigate?: (id: string) => void
}

export default function NavigationMenu({ items, currentPage, onNavigate }: NavigationMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const currentItem = items.find(item => item.id === currentPage)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleItemClick = (item: NavItem) => {
    setIsOpen(false)
    onNavigate?.(item.id)
  }

  return (
    <div className="w-full bg-[#0a0a0a] border-b border-white/6">
      <div className="max-w-[1350px] mx-auto px-6">
        <div className="flex items-center h-12">
          {/* Desktop horizontal menu */}
          <nav className="hidden md:flex items-center space-x-8">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`relative flex items-center space-x-3 text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                  currentPage === item.id
                    ? 'text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
                {/* Underline for active item */}
                {currentPage === item.id && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-emerald-500 rounded-full"></span>
                )}
              </button>
            ))}
          </nav>

          {/* Mobile/Compact dropdown */}
          <div className="md:hidden relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-2 text-white bg-white/10 px-4 py-2 rounded-md text-sm font-medium"
            >
              {currentItem?.icon && <span className="flex-shrink-0">{currentItem.icon}</span>}
              <span>{currentItem?.label || 'Select Page'}</span>
              <svg
                className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-[#0e0e0e] border border-white/10 rounded-md shadow-lg z-50">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center space-x-3 text-left px-4 py-2 text-sm transition-colors first:rounded-t-md last:rounded-b-md ${
                      currentPage === item.id
                        ? 'text-white bg-white/10'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
