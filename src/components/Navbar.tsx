/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame, ShieldCheck, Mail, Globe, Settings, ClipboardList, Sparkles, Search, Menu, X, LogOut } from 'lucide-react';
import { Product } from '../types';

interface NavbarProps {
  currentView: 'website' | 'cms' | 'crm' | 'secure';
  setView: (view: 'website' | 'cms' | 'crm' | 'secure') => void;
  leadCount: number;
  activeWebTab: 'home' | 'products' | 'bulk-order' | 'contact';
  setActiveWebTab: (tab: 'home' | 'products' | 'bulk-order' | 'contact') => void;
  products: Product[];
  onSelectProduct: (productId: string) => void;
  logoUrl?: string;
  logoText?: string;
  isAdminLoggedIn?: boolean;
  onLogout?: () => void;
}

export default function Navbar({ 
  currentView, 
  setView, 
  leadCount, 
  activeWebTab, 
  setActiveWebTab,
  products,
  onSelectProduct,
  logoUrl,
  logoText,
  isAdminLoggedIn,
  onLogout
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest('#hamburger-toggle')) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredProducts = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products.filter(p => p.active && p.title.toLowerCase().includes(q));
  }, [searchQuery, products]);

  return (
    <header id="nav-header" className="sticky top-0 z-50 w-full border-b border-stone-850 bg-stone-950/95 text-stone-100 backdrop-blur-md">
      {/* Main navigation container */}
      <div id="nav-main" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* LOGO */}
        <div 
          id="logo-block" 
          className="flex items-center gap-2.5 cursor-pointer flex-shrink-0" 
          onClick={() => {
            setView('website');
            setActiveWebTab('home');
            setIsMobileMenuOpen(false);
          }}
        >
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={logoText || 'FieryStone'} 
              className="h-11 md:h-14 max-h-[56px] w-auto object-contain rounded" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-amber-500 text-stone-950 font-sans font-black text-sm">
                F
              </div>
              <span className="text-base font-black tracking-wider uppercase text-stone-100 font-sans">
                {logoText || 'FieryStone'}
              </span>
            </div>
          )}
        </div>

        {/* NAVIGATION TABS SELECTOR - DESKTOP ONLY */}
        <div className="hidden md:flex flex-1 md:flex-initial mx-6">
          {currentView === 'website' ? (
            <div id="website-navigation-tabs" className="flex items-center gap-6 text-stone-400 font-sans text-xs">
              <button
                onClick={() => {
                  setActiveWebTab('home');
                  setIsMobileMenuOpen(false);
                }}
                className={`hover:text-amber-500 transition py-1 text-[11px] font-semibold cursor-pointer border-b-2 ${
                  activeWebTab === 'home' 
                    ? 'text-amber-500 border-amber-500 font-bold' 
                    : 'border-transparent text-stone-400'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  setActiveWebTab('products');
                  setIsMobileMenuOpen(false);
                }}
                className={`hover:text-amber-500 transition py-1 text-[11px] font-semibold cursor-pointer border-b-2 ${
                  activeWebTab === 'products' 
                    ? 'text-amber-500 border-amber-500 font-bold' 
                    : 'border-transparent text-stone-400'
                }`}
              >
                Premium Catalog
              </button>
              <button
                onClick={() => {
                  setActiveWebTab('bulk-order');
                  setIsMobileMenuOpen(false);
                }}
                className={`hover:text-amber-500 transition py-1 text-[11px] font-semibold cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  activeWebTab === 'bulk-order' 
                    ? 'text-amber-500 border-amber-550 font-bold' 
                    : 'border-transparent text-stone-400'
                }`}
              >
                <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" /> Bulk Order
              </button>
              <button
                onClick={() => {
                  setActiveWebTab('contact');
                  setIsMobileMenuOpen(false);
                }}
                className={`hover:text-amber-500 transition py-1 text-[11px] font-semibold cursor-pointer border-b-2 ${
                  activeWebTab === 'contact' 
                    ? 'text-amber-500 border-amber-500 font-bold' 
                    : 'border-transparent text-stone-400'
                }`}
              >
                Contact Us
              </button>
            </div>
          ) : (
            /* CENTER SWITCHER FOR ADMIN / STAFF ONLY */
            <div id="portal-switchers" className="flex items-center rounded-full bg-stone-900 p-0.5 border border-stone-850">
              <button
                id="tab-btn-crm"
                onClick={() => setView('crm')}
                className={`relative flex items-center gap-1.5 rounded-full px-4 py-1.25 text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                  currentView === 'crm'
                    ? 'bg-amber-600 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <ClipboardList className="h-3 w-3" />
                <span>CRM</span>
                {leadCount > 0 && (
                  <span className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-mono font-black ${
                    currentView === 'crm' ? 'bg-stone-950 text-amber-550' : 'bg-amber-500 text-stone-950'
                  }`}>
                    {leadCount}
                  </span>
                )}
              </button>

              <button
                id="tab-btn-cms"
                onClick={() => setView('cms')}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.25 text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                  currentView === 'cms'
                    ? 'bg-amber-600 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Settings className="h-3 w-3" />
                <span>CMS</span>
              </button>
            </div>
          )}
        </div>

        {/* MOBILE ADMIN SWITCHER - IF NOT IN WEBSITE VIEW */}
        <div className="flex md:hidden flex-1 justify-center mx-2">
          {currentView !== 'website' && (
            <div id="portal-switchers-mobile" className="flex items-center rounded-full bg-stone-905 p-0.5 border border-stone-850">
              <button
                onClick={() => setView('crm')}
                className={`relative flex items-center gap-1.25 rounded-full px-3 py-1 text-[9px] uppercase font-bold tracking-wider transition-all ${
                  currentView === 'crm'
                    ? 'bg-amber-600 text-stone-950'
                    : 'text-stone-400'
                }`}
              >
                <span>CRM</span>
                {leadCount > 0 && (
                  <span className="ml-1 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setView('cms')}
                className={`flex items-center gap-1.25 rounded-full px-3 py-1 text-[9px] uppercase font-bold tracking-wider transition-all ${
                  currentView === 'cms'
                    ? 'bg-amber-600 text-stone-950'
                    : 'text-stone-400'
                }`}
              >
                <span>CMS</span>
              </button>
            </div>
          )}
        </div>

        {/* CUSTOM RIGHT ACTION CTA / DESKTOP AND HAMBURGER ON MOBILE */}
        <div id="nav-cta" className="flex items-center gap-3.5 flex-shrink-0">
          {currentView === 'website' ? (
            <>
              {/* Desktop Admin Portal Shortcut & Logout if authenticated */}
              {isAdminLoggedIn && (
                <div id="admin-quick-links" className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => setView('crm')}
                    className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-amber-500 hover:text-amber-400 transition cursor-pointer px-2.5 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
                    title="Control Panel"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>Admin Panel</span>
                  </button>

                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-1.5 rounded-lg border border-red-950 bg-red-955/10 hover:bg-red-950/20 px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-red-400 hover:text-red-350 transition cursor-pointer"
                      title="Logout Session"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Logout</span>
                    </button>
                  )}
                </div>
              )}

              {/* Desktop Search Bar */}
              <div ref={containerRef} className="relative hidden md:flex items-center">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search granites..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="bg-stone-900 border border-stone-800 hover:border-stone-700 text-xs px-3 pl-8 py-1.5 rounded-lg text-stone-250 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 w-44 transition-all placeholder:text-stone-550 font-sans"
                  />
                  <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-stone-500" />
                </div>

                {isOpen && searchQuery.trim() && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-stone-950 border border-stone-800 rounded-lg shadow-xl py-1 z-50 max-h-60 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="text-[10px] text-stone-500 px-3.5 py-2 font-mono">No matching granites</div>
                    ) : (
                      filteredProducts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onSelectProduct(p.id);
                            setSearchQuery('');
                            setIsOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-stone-900 flex items-center gap-2 border-b border-stone-900 last:border-0 transition"
                        >
                          <img 
                            src={p.image} 
                            alt={p.title} 
                            className="h-6 w-8 object-cover rounded bg-stone-900 flex-shrink-0" 
                            referrerPolicy="no-referrer" 
                          />
                          <div className="truncate">
                            <p className="text-xs font-bold text-stone-100 truncate">{p.title}</p>
                            <p className="text-[9px] font-mono text-stone-500 truncate">{p.originCountry || 'Premium Source'}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* MOBILE HAMBURGER BUTTON */}
              <button
                id="hamburger-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex md:hidden items-center justify-center p-2 rounded-lg border border-stone-850 hover:bg-stone-900 text-stone-300 hover:text-amber-500 transition duration-200"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              {!isAdminLoggedIn && (
                <button
                  onClick={() => {
                    setView('website');
                    setActiveWebTab('home');
                  }}
                  className="flex items-center justify-center p-2 rounded-lg border border-stone-800 bg-stone-900/60 hover:bg-stone-904 text-stone-350 hover:text-amber-500 transition cursor-pointer"
                  title="View Website"
                >
                  <Globe className="h-4 w-4" />
                </button>
              )}

              {isAdminLoggedIn && onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center justify-center p-2 rounded-lg border border-red-950/40 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition cursor-pointer"
                  title="Logout Session"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE EXPANDED DROPDOWN DRAWER */}
      {currentView === 'website' && isMobileMenuOpen && (
        <div 
          id="mobile-navigation-drawer"
          ref={mobileMenuRef}
          className="md:hidden border-t border-stone-850 bg-stone-950/98 backdrop-blur-lg px-5 py-5 space-y-4 shadow-2xl absolute left-0 right-0 top-16 z-50 transition duration-300"
        >
          {/* Mobile Search input */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search granites..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="bg-stone-900 border border-stone-800 text-xs px-3 pl-9 py-2.5 rounded-lg text-stone-200 outline-none focus:border-amber-500 w-full placeholder:text-stone-500"
            />
            <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-stone-500" />
            
            {isOpen && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-stone-950 border border-stone-850 rounded-lg shadow-2xl py-1 z-50 max-h-48 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="text-[10px] text-stone-500 px-3.5 py-2 font-mono">No matching granites</div>
                ) : (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProduct(p.id);
                        setSearchQuery('');
                        setIsOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-stone-900 flex items-center gap-2 border-b border-stone-900 last:border-0 transition"
                    >
                      <img 
                        src={p.image} 
                        alt={p.title} 
                        className="h-6 w-8 object-cover rounded bg-stone-900 flex-shrink-0" 
                        referrerPolicy="no-referrer" 
                      />
                      <div>
                        <p className="text-xs font-bold text-stone-100">{p.title}</p>
                        <p className="text-[9px] font-mono text-stone-500">{p.originCountry}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-2.5 font-sans">
            <button
              onClick={() => {
                setActiveWebTab('home');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeWebTab === 'home'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-amber-500'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveWebTab('products');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeWebTab === 'products'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-amber-500'
              }`}
            >
              Premium Catalog
            </button>
            <button
              onClick={() => {
                setActiveWebTab('bulk-order');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                activeWebTab === 'bulk-order'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-amber-500'
              }`}
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Bulk Order</span>
            </button>
            <button
              onClick={() => {
                setActiveWebTab('contact');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeWebTab === 'contact'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-amber-500'
              }`}
            >
              Contact Us
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
