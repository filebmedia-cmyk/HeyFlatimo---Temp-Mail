'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Server, Search, Sparkles, X, Crown } from 'lucide-react';

export interface DomainOption {
  domain: string;
  isVip?: boolean;
}

interface DomainDropdownProps {
  domains: (string | DomainOption)[];
  selectedDomain: string;
  onSelect: (domain: string) => void;
  className?: string;
  showLabel?: boolean;
  isVipUnlocked?: boolean;
  onRequestVipUnlock?: (domain: string) => void;
}

export default function DomainDropdown({
  domains,
  selectedDomain,
  onSelect,
  className = '',
  showLabel = true,
  isVipUnlocked = false,
  onRequestVipUnlock,
}: DomainDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize domain list to DomainOption[]
  const normalizedDomains: DomainOption[] = useMemo(() => {
    return domains.map((d) => {
      if (typeof d === 'string') {
        return { domain: d, isVip: false };
      }
      return d;
    });
  }, [domains]);

  const currentSelectedOption = useMemo(() => {
    return normalizedDomains.find((d) => d.domain.toLowerCase() === selectedDomain.toLowerCase());
  }, [normalizedDomains, selectedDomain]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      if (normalizedDomains.length >= 5) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    } else {
      setSearchQuery('');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, normalizedDomains.length]);

  const filteredDomains = useMemo(() => {
    if (!searchQuery.trim()) return normalizedDomains;
    const q = searchQuery.toLowerCase().trim();
    return normalizedDomains.filter((d) => d.domain.toLowerCase().includes(q));
  }, [normalizedDomains, searchQuery]);

  const handleSelect = (domain: string) => {
    const selectedItem = normalizedDomains.find((d) => d.domain.toLowerCase() === domain.toLowerCase());
    if (selectedItem?.isVip && !isVipUnlocked) {
      setIsOpen(false);
      if (onRequestVipUnlock) {
        onRequestVipUnlock(domain);
      }
      return;
    }
    onSelect(domain);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="brutal-btn bg-white dark:bg-zinc-900 text-[var(--text-main)] px-2.5 xs:px-3.5 py-2 sm:py-2.5 text-[11px] xs:text-xs font-mono-custom font-bold flex items-center justify-between gap-1.5 xs:gap-2 w-full shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)] hover:bg-[#f0f9ff] dark:hover:bg-zinc-800 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-shrink">
          {currentSelectedOption?.isVip ? (
            <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-400 flex-shrink-0" />
          ) : (
            <Server className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-blue)] dark:text-[var(--color-cyan)] flex-shrink-0" />
          )}
          <span className="whitespace-nowrap font-bold">{selectedDomain || (normalizedDomains[0]?.domain ?? 'pilih domain')}</span>
          {currentSelectedOption?.isVip && (
            <span className="bg-[var(--color-yellow)] text-black text-[8px] font-mono-custom font-black px-1 py-0.2 border border-[var(--border-color)] uppercase flex items-center gap-0.5 flex-shrink-0">
              <Crown className="w-2.5 h-2.5 fill-black" />
              <span>VIP</span>
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-main)] transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-[var(--color-orange)]' : ''
          }`}
        />
      </button>

      {/* Animated Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 sm:left-auto sm:right-0 sm:min-w-[260px] md:min-w-[300px] mt-1.5 z-50 brutal-card bg-white dark:bg-zinc-950 border-[2.5px] sm:border-[3px] border-[var(--border-color)] shadow-[4px_4px_0px_var(--shadow-color)] sm:shadow-[6px_6px_0px_var(--shadow-color)] p-2 motion-dropdown-enter">
          {/* Header Label inside Dropdown with Domain Counter */}
          <div className="px-2 py-1 text-[9px] xs:text-[10px] font-mono-custom font-black uppercase text-[var(--text-muted)] border-b-[2px] border-dashed border-[var(--border-color)] mb-2 flex items-center justify-between">
            <span>PILIH DOMAIN</span>
            <span className="bg-[var(--color-yellow)] text-black px-1.5 py-0.2 border border-[var(--border-color)] font-mono text-[9px]">
              {normalizedDomains.length} TOTAL
            </span>
          </div>

          {/* Search Box if domains >= 5 or if searching */}
          {normalizedDomains.length >= 5 && (
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari domain..."
                className="w-full pl-8 pr-7 py-1.5 text-xs font-mono-custom font-bold bg-[#f8fafc] dark:bg-zinc-900 border-[2px] border-[var(--border-color)] focus:outline-none focus:border-[var(--color-blue)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-black"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* List of Domains with Scroll */}
          <ul className="max-h-56 sm:max-h-64 overflow-y-auto space-y-1 select-none pr-0.5" role="listbox">
            {filteredDomains.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs font-mono-custom text-[var(--text-muted)]">
                Tidak ada domain &quot;{searchQuery}&quot;
              </li>
            ) : (
              filteredDomains.map((item) => {
                const isSelected = item.domain.toLowerCase() === selectedDomain.toLowerCase();
                return (
                  <li
                    key={item.domain}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(item.domain)}
                    className={`px-2.5 py-2 text-xs font-mono-custom font-bold flex items-center justify-between gap-2 rounded-none border-[1.5px] cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-[var(--color-yellow)] text-black border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] -translate-y-0.5'
                        : 'bg-transparent text-[var(--text-main)] border-transparent hover:border-[var(--border-color)] hover:bg-[#f1f5f9] dark:hover:bg-zinc-800 hover:translate-x-1'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {item.isVip ? (
                        <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400 flex-shrink-0" />
                      ) : (
                        <Server className="w-3.5 h-3.5 text-[var(--color-blue)] dark:text-[var(--color-cyan)] flex-shrink-0" />
                      )}
                      <span className="whitespace-nowrap font-bold text-xs">{item.domain}</span>
                      {item.isVip && (
                        <span className="bg-[var(--color-yellow)] text-black text-[8px] font-mono-custom font-black px-1 py-0.2 border border-[var(--border-color)] uppercase flex-shrink-0 flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5 fill-black" />
                          <span>VIP</span>
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <div className="w-4 h-4 bg-black text-white dark:bg-zinc-900 flex items-center justify-center border border-black flex-shrink-0">
                        <Check className="w-3 h-3 text-[var(--color-yellow)]" />
                      </div>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
