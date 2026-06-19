/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Product,
  SlabSize,
  GraniteType,
  Thickness,
  FinishType,
  FobPort,
  LocationServing,
  Lead
} from '../types';
import {
  Sparkles,
  Layers,
  Container,
  Flame,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Shield,
  FileCheck,
  Scale,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Search,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Quote
} from 'lucide-react';

const heroBgAssetUrl = new URL('./herobg.jpg', import.meta.url).href;
const aboutAssetUrl = new URL('./about.png', import.meta.url).href;

interface WebsiteViewProps {
  products: Product[];
  slabSizes: SlabSize[];
  graniteTypes: GraniteType[];
  thicknesses: Thickness[];
  finishTypes: FinishType[];
  fobPorts: FobPort[];
  locationsServing: LocationServing[];
  onAddLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'history' | 'reminders' | 'emailLogs'>) => void;
  globalMinQuantity: number;
  activeWebTab: 'home' | 'products' | 'bulk-order' | 'contact';
  setActiveWebTab: (tab: 'home' | 'products' | 'bulk-order' | 'contact') => void;
  searchSelectedProductId?: string | null;
  onClearSearchSelectedProduct?: () => void;
  privacyPolicy?: string;
  termsConditions?: string;
  exportDisclaimer?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  logoUrl?: string;
  logoText?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  selectedSlabSizeId: string;
  selectedThicknessId: string;
  selectedFinishTypeId: string;
  quantity: number;
}

export default function WebsiteView({
  products,
  slabSizes,
  graniteTypes,
  thicknesses,
  finishTypes,
  fobPorts,
  locationsServing,
  onAddLead,
  globalMinQuantity,
  activeWebTab,
  setActiveWebTab,
  searchSelectedProductId,
  onClearSearchSelectedProduct,
  privacyPolicy,
  termsConditions,
  exportDisclaimer,
  instagramUrl,
  facebookUrl,
  youtubeUrl,
  linkedinUrl,
  logoUrl,
  logoText
}: WebsiteViewProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  
  // Lead form state inside product detailed view
  const [leadCustomerName, setLeadCustomerName] = useState('');
  const [leadCustomerEmail, setLeadCustomerEmail] = useState('');
  const [leadCustomerPhone, setLeadCustomerPhone] = useState('');
  const [leadCustomerCompany, setLeadCustomerCompany] = useState('');
  const [leadCustomerCountry, setLeadCustomerCountry] = useState('USA');
  const [leadSelectedSlabSize, setLeadSelectedSlabSize] = useState('');
  const [leadSelectedThickness, setLeadSelectedThickness] = useState('');
  const [leadSelectedFinish, setLeadSelectedFinish] = useState('');
  const [leadQuantity, setLeadQuantity] = useState<number>(globalMinQuantity || 500);
  const [leadNotes, setLeadNotes] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // General inquiry lead state (for contact us page)
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactNotes, setContactNotes] = useState('');
  const [contactProductChoice, setContactProductChoice] = useState('General Inquiry');
  const [contactSuccess, setContactSuccess] = useState(false);

  // Legal popup states
  const [activeLegalPopup, setActiveLegalPopup] = useState<'privacy' | 'terms' | 'disclaimer' | null>(null);

  // --- BULK GRANITE CUSTOM ORDER PLANNER STATES ---
  const [bulkCart, setBulkCart] = useState<CartItem[]>([]);
  const [builderProductId, setBuilderProductId] = useState<string>('');
  const [builderSlabSizeId, setBuilderSlabSizeId] = useState<string>('');
  const [builderThicknessId, setBuilderThicknessId] = useState<string>('');
  const [builderFinishTypeId, setBuilderFinishTypeId] = useState<string>('');
  const [builderQuantity, setBuilderQuantity] = useState<number>(globalMinQuantity || 500);

  const [bulkCustomerName, setBulkCustomerName] = useState('');
  const [bulkCustomerEmail, setBulkCustomerEmail] = useState('');
  const [bulkCustomerPhone, setBulkCustomerPhone] = useState('');
  const [bulkCustomerCompany, setBulkCustomerCompany] = useState('');
  const [bulkCustomerCountry, setBulkCustomerCountry] = useState('USA');
  const [bulkNotes, setBulkNotes] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState(false);
  const [bulkError, setBulkError] = useState('');

  // Auto initialize builder defaults
  React.useEffect(() => {
    const firstActiveProduct = products.find(p => p.active);
    if (firstActiveProduct) {
      setBuilderProductId(firstActiveProduct.id);
      
      const firstActiveSize = firstActiveProduct.slabSizeIds.find(id => slabSizes.find(s => s.id === id)?.active) || '';
      setBuilderSlabSizeId(firstActiveSize);

      const firstActiveThick = firstActiveProduct.thicknessIds.find(id => thicknesses.find(t => t.id === id)?.active) || '';
      setBuilderThicknessId(firstActiveThick);

      const firstActiveFinish = firstActiveProduct.finishTypeIds.find(id => finishTypes.find(f => f.id === id)?.active) || '';
      setBuilderFinishTypeId(firstActiveFinish);
    }
  }, [products, slabSizes, thicknesses, finishTypes]);

  // Handle building selected defaults whenever builderProductId changes
  const handleBuilderProductChange = (prodId: string) => {
    setBuilderProductId(prodId);
    const targetProduct = products.find(p => p.id === prodId);
    if (targetProduct) {
      const activeSize = targetProduct.slabSizeIds.find(id => slabSizes.find(s => s.id === id)?.active) || '';
      const activeThick = targetProduct.thicknessIds.find(id => thicknesses.find(t => t.id === id)?.active) || '';
      const activeFinish = targetProduct.finishTypeIds.find(id => finishTypes.find(f => f.id === id)?.active) || '';
      
      setBuilderSlabSizeId(activeSize);
      setBuilderThicknessId(activeThick);
      setBuilderFinishTypeId(activeFinish);
    }
  };

  // Filter products by active state & category
  const activeProducts = useMemo(() => {
    return products.filter((p) => p.active);
  }, [products]);

  const sortedActiveProducts = useMemo(() => {
    return [...activeProducts].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [activeProducts]);

  const homepageProducts = useMemo(() => {
    return sortedActiveProducts.slice(0, 6);
  }, [sortedActiveProducts]);

  const productsPageProducts = useMemo(() => {
    let result = sortedActiveProducts;
    if (activeCategoryFilter !== 'all') {
      result = result.filter((p) => p.graniteTypeIds.includes(activeCategoryFilter));
    }
    if (catalogSearchQuery.trim()) {
      const q = catalogSearchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.graniteTypeIds.some(id => {
            const name = graniteTypes.find(g => g.id === id)?.name;
            return name && name.toLowerCase().includes(q);
          })
      );
    }
    return result;
  }, [sortedActiveProducts, activeCategoryFilter, catalogSearchQuery, graniteTypes]);

  // Open product details and pre-fill specifications based on CMS linking
  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormSuccess(false);
    setFormError('');

    // Pre-select first available active specs
    const activeProductSizeIds = product.slabSizeIds.filter(id => slabSizes.find(s => s.id === id)?.active);
    const activeProductThickIds = product.thicknessIds.filter(id => thicknesses.find(t => t.id === id)?.active);
    const activeProductFinishIds = product.finishTypeIds.filter(id => finishTypes.find(f => f.id === id)?.active);

    setLeadSelectedSlabSize(activeProductSizeIds[0] || '');
    setLeadSelectedThickness(activeProductThickIds[0] || '');
    setLeadSelectedFinish(activeProductFinishIds[0] || '');
    setLeadQuantity(Math.max(product.minQuantity || 0, globalMinQuantity || 500));
    setLeadCustomerName('');
    setLeadCustomerEmail('');
    setLeadCustomerPhone('');
    setLeadCustomerCompany('');
    setLeadNotes('');
  };

  // Synchronize outer searches (e.g. from the primary top navigation search bar)
  React.useEffect(() => {
    if (searchSelectedProductId) {
      const foundProd = products.find(p => p.id === searchSelectedProductId);
      if (foundProd) {
        handleOpenProduct(foundProd);
      }
      onClearSearchSelectedProduct?.();
    }
  }, [searchSelectedProductId, products, slabSizes, thicknesses, finishTypes]);

  const handleProductLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (!leadCustomerName || !leadCustomerEmail || !leadCustomerPhone) {
      setFormError('Please complete your name, email, and phone contact details.');
      return;
    }

    const requiredMin = Math.max(selectedProduct.minQuantity || 0, globalMinQuantity || 500);
    if (leadQuantity < requiredMin) {
      setFormError(`Minimum order is ${requiredMin.toLocaleString()} SQFT.`);
      return;
    }

    onAddLead({
      customerName: leadCustomerName,
      customerEmail: leadCustomerEmail,
      customerPhone: leadCustomerPhone,
      customerCompany: leadCustomerCompany,
      customerCountry: leadCustomerCountry,
      productId: selectedProduct.id,
      selectedSlabSizeId: leadSelectedSlabSize,
      selectedThicknessId: leadSelectedThickness,
      selectedFinishTypeId: leadSelectedFinish,
      quantity: leadQuantity,
      notes: leadNotes || 'Requested quotation details.',
      status: 'New'
    });

    setFormSuccess(true);
    setFormError('');
  };

  const handleGeneralContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactPhone) {
      alert('Please fill out all mandatory contact fields.');
      return;
    }

    const selectedReason = contactProductChoice || 'General Inquiry';
    const associatedProduct = activeProducts.find(p => p.id === selectedReason || p.title === selectedReason);
    
    onAddLead({
      customerName: contactName,
      customerEmail: contactEmail,
      customerPhone: contactPhone,
      customerCompany: 'Direct Web Inquiry',
      customerCountry: 'India',
      productId: associatedProduct ? associatedProduct.id : selectedReason,
      selectedSlabSizeId: associatedProduct ? (associatedProduct.slabSizeIds[0] || 'size-standard') : 'size-standard',
      selectedThicknessId: associatedProduct ? (associatedProduct.thicknessIds[0] || 'thick-20') : 'thick-20',
      selectedFinishTypeId: associatedProduct ? (associatedProduct.finishTypeIds[0] || 'fin-mirror') : 'fin-mirror',
      quantity: associatedProduct ? (associatedProduct.minQuantity || 500) : 500,
      notes: contactNotes || `Direct contact form submission. Reason: ${selectedReason}`,
      status: 'New'
    });

    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setContactNotes('');
    setContactProductChoice('General Inquiry');
  };

  // --- BULK GRANITE CUSTOM CONFIGURATOR SUBROUTINES ---
  const handleAddItemToBulkOrder = () => {
    if (!builderProductId) {
      setBulkError('Please select a granite product first.');
      return;
    }

    if (builderQuantity < globalMinQuantity) {
      setBulkError(`Each selection must be at least the global minimum rule of ${globalMinQuantity.toLocaleString()} SQFT.`);
      return;
    }

    // Capture specifications
    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: builderProductId,
      selectedSlabSizeId: builderSlabSizeId || slabSizes.find(s => s.active)?.id || '',
      selectedThicknessId: builderThicknessId || thicknesses.find(t => t.active)?.id || '',
      selectedFinishTypeId: builderFinishTypeId || finishTypes.find(f => f.active)?.id || '',
      quantity: builderQuantity
    };

    setBulkCart([...bulkCart, newItem]);
    setBulkError('');
  };

  const handleRemoveItemFromBulkOrder = (id: string) => {
    setBulkCart(bulkCart.filter(item => item.id !== id));
  };

  const handleBulkInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBulkError('');

    if (bulkCart.length === 0) {
      setBulkError('Your bulk order quotation list is empty. Please configure & add at least one granite option.');
      return;
    }

    if (!bulkCustomerName.trim() || !bulkCustomerEmail.trim() || !bulkCustomerPhone.trim()) {
      setBulkError('Contact Name, Email and Phone details are required to finalize export inquiry.');
      return;
    }

    // Submit bulk query
    const firstItem = bulkCart[0];
    onAddLead({
      customerName: bulkCustomerName.trim(),
      customerEmail: bulkCustomerEmail.trim(),
      customerPhone: bulkCustomerPhone.trim(),
      customerCompany: bulkCustomerCompany.trim(),
      customerCountry: bulkCustomerCountry,
      productId: firstItem.productId,
      selectedSlabSizeId: firstItem.selectedSlabSizeId,
      selectedThicknessId: firstItem.selectedThicknessId,
      selectedFinishTypeId: firstItem.selectedFinishTypeId,
      quantity: bulkCart.reduce((total, it) => total + it.quantity, 0),
      notes: bulkNotes.trim() || 'Bulk custom customized order quotation request.',
      status: 'New',
      items: bulkCart
    });

    setBulkSuccess(true);
    setBulkCart([]);
    setBulkCustomerName('');
    setBulkCustomerEmail('');
    setBulkCustomerPhone('');
    setBulkCustomerCompany('');
    setBulkNotes('');
    setBulkError('');
  };

  return (
    <div id="website-view-root" className="min-h-screen bg-stone-950 text-stone-300">
      
      {/* ========================================= */}
      {/* HOME PAGE VIEW */}
      {/* ========================================= */}
      {activeWebTab === 'home' && (
        <>
          {/* HERO SECTION */}
          <section id="hero" className="relative flex min-h-[80vh] items-center justify-center overflow-hidden border-b border-stone-900 px-6 py-20 pb-32">
            {/* Granite block shadow backdrop */}
            <div className="absolute inset-0 z-0 opacity-30">
              <img 
                src={heroBgAssetUrl} 
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1610018556010-6a11691bc905?w=1600&auto=format&fit=crop&q=80";
                }}
                alt="Elite Crystalline Granite Texture" 
                className="h-full w-full object-cover filter brightness-50 contrast-115 grayscale-[20%]"
              />
              <div className="absolute inset-0 bg-radial-gradient from-transparent via-stone-950/80 to-stone-950" />
            </div>

            <div className="relative z-10 mx-auto max-w-5xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-500 font-mono tracking-wider uppercase mb-6">
                <Sparkles className="h-3 w-3 animate-pulse" /> Direct Quarry-to-Port Wholesalers
              </div>
              <h1 className="text-4xl font-light tracking-tight text-white sm:text-6xl lg:text-7xl font-display italic">
                Quarrying Nature's <br />
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-600 bg-clip-text text-transparent not-italic font-bold">
                  Molten Artistry
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-sm md:text-base text-stone-300 sm:text-lg leading-relaxed font-sans">
                We supply installation-ready granite in export-standard dimensions, focusing on materials renowned globally for their durability and striking appearance. Our commitment is to deliver the consistency your large-scale project demands.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <button 
                  onClick={() => setActiveWebTab('products')} 
                  className="group flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3.5 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition cursor-pointer"
                >
                  View Catalog
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                </button>
                <button
                  onClick={() => setActiveWebTab('bulk-order')} 
                  className="rounded-lg border border-stone-700 bg-stone-900/50 px-6 py-3.5 text-sm font-semibold text-stone-200 hover:border-stone-500 transition cursor-pointer"
                >
                  Bulk Order
                </button>
              </div>
            </div>

            {/* Floating details banner */}
            <div className="absolute bottom-6 left-6 right-6 z-10 hidden max-w-7xl mx-auto rounded-xl border border-stone-800 bg-stone-900/60 p-4 backdrop-blur-md md:grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-950 text-amber-500 border border-stone-800">
                  <Container className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-200 uppercase font-mono">FOB Ocean Gateways</p>
                  <p className="text-xs text-stone-400">Vizag, Chennai, & Mundra Ports</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-950 text-amber-500 border border-stone-800">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-200 uppercase font-mono">Multiple finish options</p>
                  <p className="text-xs text-stone-400">Polished, satin, flamed or textured surfaces</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-950 text-amber-500 border border-stone-800">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-200 uppercase font-mono">High Petrographic Density</p>
                  <p className="text-xs text-stone-400">Mohs Hardness Grade 7 Weather Resilience</p>
                </div>
              </div>
            </div>
          </section>

          {/* TOP 6 SHOWCASE ON HOME */}
          <section id="products-homepage-section" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500 font-mono">Crystalline Masterpieces</span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                The Premium Granite Showcase
              </h2>
              <p className="mt-3 text-stone-400 text-xs sm:text-sm">
                Each signature raw slab is selected for exceptional petrography and mineral pattern coherence. Showcasing our top 6 premium gangshawn granites.
              </p>
            </div>

            {homepageProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-800 py-16 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
                <h4 className="mt-4 text-stone-200 font-bold">No Materials Currently Featured</h4>
                <p className="text-xs text-stone-500 mt-1">Configure active featured products in the Supplier CMS panel.</p>
              </div>
            ) : (
              <div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {homepageProducts.map((product) => {
                    const prodTypes = product.graniteTypeIds
                      .map(id => graniteTypes.find(g => g.id === id)?.name)
                      .filter(Boolean);
                    
                    const isFeatured = product.featured;

                    return (
                      <div
                        key={product.id}
                        id={`homepage-prod-${product.id}`}
                        className={`group flex flex-col justify-between overflow-hidden rounded-xl border transition duration-300 bg-stone-900 ${
                          isFeatured 
                            ? 'border-amber-500/40 shadow-md shadow-amber-900/10' 
                            : 'border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <div className="relative h-64 w-full overflow-hidden bg-stone-950">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                          
                          {/* Badge panel */}
                          {isFeatured && (
                            <div className="absolute top-4 left-4 flex flex-col gap-1.5 bg-stone-950/50 p-1.5 rounded-lg">
                              <span className="rounded-md bg-amber-500 text-stone-950 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-center">
                                Premium Featured
                              </span>
                            </div>
                          )}

                          <div className="absolute bottom-4 left-4 right-4 animate-fade-in">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                              {prodTypes.join(', ') || 'Granite Material'}
                            </span>
                            <h3 className="text-lg font-bold text-white mt-1 group-hover:text-amber-300 transition uppercase font-mono">
                              {product.title}
                            </h3>
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <p className="text-sm text-stone-400 line-clamp-3 leading-relaxed mb-6">
                            {product.description}
                          </p>

                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-stone-500 border-t border-stone-800/80 pt-4">
                              <div>
                                <p className="text-stone-400 uppercase tracking-widest text-[9px]">Quarry Ports</p>
                                <p className="truncate text-amber-500/90 text-[10px] font-bold mt-0.5">
                                  {product.fobPortIds.map(id => fobPorts.find(p => p.id === id)?.name.split(',')[0]).filter(Boolean).join(', ') || 'Any Port'}
                                </p>
                              </div>
                              <div>
                                <p className="text-stone-400 uppercase tracking-widest text-[9px]">Sourcing served</p>
                                <p className="truncate text-stone-300 text-[10px] mt-0.5">
                                  Houston, Hamburg, GCC
                                </p>
                              </div>
                            </div>

                            <button
                              id={`homepage-btn-configure-${product.id}`}
                              onClick={() => handleOpenProduct(product)}
                              className="w-full mt-2 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-xs font-semibold text-stone-200 py-2.5 transition text-center cursor-pointer font-sans"
                            >
                              Know More
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-14 text-center">
                  <button
                    onClick={() => {
                      setActiveWebTab('products');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/40 px-8 py-4 rounded-xl text-amber-500 hover:text-amber-400 font-bold text-xs uppercase tracking-wider items-center justify-center gap-2 inline-flex transition cursor-pointer"
                  >
                    <span>View Premium catalog</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* OUR PROMISE SECTION */}
          <section className="bg-stone-900/20 border-y border-stone-900 py-24 px-6 relative overflow-hidden font-sans">
            <div className="absolute top-0 left-1/4 h-80 w-80 rounded-full bg-amber-600/5 filter blur-3xl animate-pulse" />
            <div className="mx-auto max-w-7xl">
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                <span className="text-sm font-bold uppercase tracking-widest text-amber-500 font-sans">
                  The FieryStone Standard
                </span>
                <h2 className="text-4xl sm:text-5xl font-light text-white font-display italic leading-tight">
                  Our Promise
                </h2>
                <div className="h-0.5 w-16 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto my-3" />
                <p className="text-stone-200 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto italic font-sans font-light">
                  "Every slab we export reflects India’s craftsmanship and nature’s artistry —"
                </p>
              </div>

              {/* SPLIT LAYOUT: Grid of 3 on Row 1, and 2 + Quote on Row 2 */}
              <div className="space-y-6">
                {/* Row 1: 3 Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Point 1: Whole Slabs */}
                  <div className="bg-stone-950/80 border border-stone-850/80 p-7 rounded-2xl hover:border-amber-500/30 transition duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="h-11 w-11 flex items-center justify-center bg-stone-900/80 text-amber-500 rounded-xl mb-6 group-hover:bg-amber-500 group-hover:text-stone-950 transition duration-300">
                        <Layers className="h-5.5 w-5.5" />
                      </div>
                      <h3 className="text-base font-bold text-stone-100 uppercase tracking-wider font-sans leading-snug">
                        100% Export-grade whole granite slabs
                      </h3>
                      <p className="text-stone-300 text-sm leading-relaxed mt-4 font-light">
                        Quarried directly from pristine geologic veins, ensuring large-scale structural length, rich density, and premium durability.
                      </p>
                    </div>
                  </div>

                  {/* Point 2: Finish */}
                  <div className="bg-stone-950/80 border border-stone-850/80 p-7 rounded-2xl hover:border-amber-500/30 transition duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="h-11 w-11 flex items-center justify-center bg-stone-900/80 text-amber-500 rounded-xl mb-6 group-hover:bg-amber-500 group-hover:text-stone-950 transition duration-300">
                        <Flame className="h-5.5 w-5.5" />
                      </div>
                      <h3 className="text-base font-bold text-stone-100 uppercase tracking-wider font-sans leading-snug">
                        Multiple surface types finishes with precise edges
                      </h3>
                      <p className="text-stone-300 text-sm leading-relaxed mt-4 font-light">
                        Whether polished to a high mirror-sheen, satin-honed, or flamed, every slab undergoes precise edge profiling and double-bevel calibration.
                      </p>
                    </div>
                  </div>

                  {/* Point 3: Consistency */}
                  <div className="bg-stone-950/80 border border-stone-850/80 p-7 rounded-2xl hover:border-amber-500/30 transition duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="h-11 w-11 flex items-center justify-center bg-stone-900/80 text-amber-500 rounded-xl mb-6 group-hover:bg-amber-500 group-hover:text-stone-950 transition duration-300">
                        <CheckCircle2 className="h-5.5 w-5.5" />
                      </div>
                      <h3 className="text-base font-bold text-stone-100 uppercase tracking-wider font-sans leading-snug">
                        Reliable color and pattern consistency
                      </h3>
                      <p className="text-stone-300 text-sm leading-relaxed mt-4 font-light">
                        Strict color shade mapping and block alignment, verifying that consecutive gangsaw slabs align seamlessly on prominent architectural installations.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Row 2: 3 Column Grid with 2 Promises + 1 Inspiring Quote */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Point 4: Logistics */}
                  <div className="bg-stone-950/80 border border-stone-850/80 p-7 rounded-2xl hover:border-amber-500/30 transition duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="h-11 w-11 flex items-center justify-center bg-stone-900/80 text-amber-500 rounded-xl mb-6 group-hover:bg-amber-500 group-hover:text-stone-950 transition duration-300">
                        <Container className="h-5.5 w-5.5" />
                      </div>
                      <h3 className="text-base font-bold text-stone-100 uppercase tracking-wider font-sans leading-snug">
                        On-time global deliveries via optimized logistics
                      </h3>
                      <p className="text-stone-300 text-sm leading-relaxed mt-4 font-light">
                        Sash-bundled wooden A-frame reinforcement, direct custom gateway clearance at Vizag & Chennai ports, and optimized shipping route selection.
                      </p>
                    </div>
                  </div>

                  {/* Point 5: Pricing */}
                  <div className="bg-stone-950/80 border border-stone-850/80 p-7 rounded-2xl hover:border-amber-500/30 transition duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="h-11 w-11 flex items-center justify-center bg-stone-900/80 text-amber-500 rounded-xl mb-6 group-hover:bg-amber-500 group-hover:text-stone-950 transition duration-300">
                        <Scale className="h-5.5 w-5.5" />
                      </div>
                      <h3 className="text-base font-bold text-stone-100 uppercase tracking-wider font-sans leading-snug">
                        Transparent, competitive pricing (FOB/CIF)
                      </h3>
                      <p className="text-stone-300 text-sm leading-relaxed mt-4 font-light">
                        Clear breakout documentation with precise Indian port handling and international shipping costs – with direct quarry-to-client rates.
                      </p>
                    </div>
                  </div>

                  {/* Inspiring Granite Quote Card */}
                  <div className="bg-stone-900/40 border border-amber-500/10 p-7 rounded-2xl flex flex-col justify-between font-sans relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-28 w-28 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full filter blur-xl" />
                    <div className="mb-4">
                      <Quote className="h-6 w-6 text-amber-500/40 mb-4" />
                      <p className="text-stone-250 text-sm italic font-sans font-light leading-relaxed">
                        "Sought by empires, shaped by time, India’s granite is nature’s poetry written in stone — forged by planetary fires, curated by Indian artistry, and sculpted to endure for generations."
                      </p>
                    </div>
                    <div className="text-[10px] uppercase font-mono tracking-widest text-amber-500/80 font-bold mt-4 pt-4 border-t border-stone-800/55">
                      — Nature's Timeless Artistry
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ========================================= */}
      {/* PRODUCTS CATALOG PAGE VIEW (Showing remaining items) */}
      {/* ========================================= */}
      {activeWebTab === 'products' && (
        <section id="products-section" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="text-center md:text-left md:flex md:items-end md:justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500 font-mono">Exquisite Block Collection</span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white uppercase sm:text-4xl font-sans">
                The Premium Slabs Portfolio
              </h2>
              <p className="mt-3 text-stone-400 text-xs sm:text-sm max-w-xl">
                Browse our complete, exquisite collection of hand-selected structural crystalline granites, tectonic quartzites, and volcanic basalts.
              </p>
            </div>

            {/* Dynamic Active categorization filters from CMS */}
            <div className="mt-6 md:mt-0 flex flex-wrap gap-2 overflow-x-auto justify-center font-mono">
              <button
                onClick={() => setActiveCategoryFilter('all')}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase transition cursor-pointer ${
                  activeCategoryFilter === 'all'
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                }`}
              >
                All Materials
              </button>
              {graniteTypes.filter(g => g.active).map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveCategoryFilter(type.id)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase transition cursor-pointer ${
                    activeCategoryFilter === type.id
                      ? 'bg-amber-500 text-stone-950 shadow-md'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar inside Products portfolio */}
          <div className="mb-10 max-w-md mx-auto md:mx-0 flex items-center relative">
            <input
              type="text"
              placeholder="Search premium slabs by name, description, material type..."
              value={catalogSearchQuery}
              onChange={(e) => setCatalogSearchQuery(e.target.value)}
              className="w-full bg-stone-900 border border-stone-850 text-xs px-4 pl-10 py-2.5 rounded-lg text-stone-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-sans shadow-inner placeholder:text-stone-500"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-500" />
            {catalogSearchQuery && (
              <button
                type="button"
                onClick={() => setCatalogSearchQuery('')}
                className="absolute right-3 top-2 max-h-6 flex items-center bg-stone-800 hover:bg-stone-750 text-[9px] text-stone-400 hover:text-stone-200 uppercase px-1.5 py-1 rounded font-bold font-mono transition"
              >
                Clear
              </button>
            )}
          </div>

          {productsPageProducts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-850 py-16 text-center max-w-xl mx-auto bg-stone-900/10 space-y-4">
              <Sparkles className="mx-auto h-8 w-8 text-amber-500 animate-pulse" />
              <h4 className="text-stone-200 font-bold uppercase font-mono text-xs">No Matching Slabs Available</h4>
              <p className="text-[11px] text-stone-400 leading-relaxed px-5">
                We currently don't have active slabs matching this material filter in our catalog. Use our Bulk Order Builder to specify your custom stone requirements or reach out to our team directly.
              </p>
              <button
                onClick={() => {
                  setActiveWebTab('bulk-order');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="rounded bg-amber-500 hover:bg-amber-450 text-stone-950 px-4 py-2 font-bold text-[10px] uppercase tracking-wider transition cursor-pointer font-sans"
              >
                Start Bulk Order
              </button>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {productsPageProducts.map((product) => {
                const prodTypes = product.graniteTypeIds
                  .map(id => graniteTypes.find(g => g.id === id)?.name)
                  .filter(Boolean);
                
                const isFeatured = product.featured;

                return (
                  <div
                    key={product.id}
                    id={`prod-card-${product.id}`}
                    className={`group flex flex-col justify-between overflow-hidden rounded-xl border transition duration-300 bg-stone-900 ${
                      isFeatured 
                        ? 'border-amber-500/40 shadow-md shadow-amber-900/10' 
                        : 'border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="relative h-64 w-full overflow-hidden bg-stone-950">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                      
                      {/* Badge panel */}
                      {isFeatured && (
                        <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                          <span className="rounded-md bg-amber-500 text-stone-950 px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
                            Premium Featured
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                          {prodTypes.join(', ') || 'Stone'}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1 group-hover:text-amber-300 transition">
                          {product.title}
                        </h3>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between font-mono">
                      <p className="text-sm text-stone-400 line-clamp-3 leading-relaxed mb-6">
                        {product.description}
                      </p>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-stone-500 border-t border-stone-800/80 pt-4">
                          <div>
                            <p className="text-stone-400 font-bold uppercase">PORTS AVAILABLE</p>
                            <p className="truncate text-amber-500/90 text-[10px]">
                              {product.fobPortIds.map(id => fobPorts.find(p => p.id === id)?.name.split(',')[0]).filter(Boolean).join(', ') || 'Direct Quarry'}
                            </p>
                          </div>
                          <div>
                            <p className="text-stone-400 font-bold uppercase">Locations Served</p>
                            <p className="truncate text-stone-300 text-[10px]">
                              All World Harbors
                            </p>
                          </div>
                        </div>

                        <button
                          id={`btn-configure-${product.id}`}
                          onClick={() => handleOpenProduct(product)}
                          className="w-full mt-2 rounded-lg bg-stone-850 hover:bg-amber-500 hover:text-stone-950 text-xs font-semibold text-stone-200 py-2.5 transition text-center cursor-pointer font-sans border border-stone-800/80"
                        >
                          Configure & Request Quote
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
      {/* BULK ORDER PLANNER SECTION */}
      {activeWebTab === 'bulk-order' && (
        <section id="bulk-planner-section" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 scroll-mt-24">
        <div id="bulk-planner-heading" className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500 font-mono tracking-wider flex items-center justify-center gap-1.5 ring-1 ring-amber-500/20 px-3 py-1 bg-amber-500/5 rounded-full w-fit mx-auto mb-3">
            <Sparkles className="h-3.5 w-3.5" /> High-Volume Exporters
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white uppercase">
            Bulk Order
          </h2>
          <p className="mt-3 text-stone-400 max-w-2xl mx-auto text-xs sm:text-sm">
            Configure multiple distinct granite colors, thickness values, processing finishes, and sizes within a single consolidated container shipment to optimize ocean freight parameters.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Builder Controls Form (Left panel) */}
          <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-stone-200 font-sans uppercase tracking-wider pb-3 border-b border-stone-800 flex items-center gap-2">
                Configure Custom Specification
              </h3>
            </div>

            {/* Select product */}
            <div className="space-y-1.5 font-sans">
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-sans">
                Select Granite Material
              </label>
              <select
                value={builderProductId}
                onChange={(e) => handleBuilderProductChange(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-sans"
              >
                <option value="" disabled>Select granite style...</option>
                {activeProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {builderProductId && (
              <>
                {/* Slab size mapping */}
                <div className="space-y-1.5 font-sans">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-sans">
                    Select Slab Dimension Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {slabSizes
                      .filter((s) => s.active && (products.find((p) => p.id === builderProductId)?.slabSizeIds.includes(s.id)))
                      .map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setBuilderSlabSizeId(s.id)}
                          className={`border p-2.5 rounded text-left transition font-sans ${
                            builderSlabSizeId === s.id
                              ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                              : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-300'
                          }`}
                        >
                          <p className="text-[10px] uppercase truncate">{s.name}</p>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Thickness mapping */}
                <div className="space-y-1.5 font-sans">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-sans">
                    Select Slab Thickness
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {thicknesses
                      .filter((t) => t.active && (products.find((p) => p.id === builderProductId)?.thicknessIds.includes(t.id)))
                      .map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setBuilderThicknessId(t.id)}
                          className={`border p-2 rounded text-left transition font-sans ${
                            builderThicknessId === t.id
                              ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                              : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-300'
                          }`}
                        >
                          <p className="text-[10px] uppercase truncate">{t.name}</p>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Finish mapping */}
                <div className="space-y-1.5 font-sans">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-sans">
                    Select Slab Processing Finish
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {finishTypes
                      .filter((f) => f.active && (products.find((p) => p.id === builderProductId)?.finishTypeIds.includes(f.id)))
                      .map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setBuilderFinishTypeId(f.id)}
                          className={`border p-2 rounded text-left transition font-sans ${
                            builderFinishTypeId === f.id
                              ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                              : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-300'
                          }`}
                        >
                          <p className="text-[10px] uppercase truncate">{f.name}</p>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Quantity planner */}
                <div className="space-y-2 font-sans">
                  <div className="flex justify-between items-center text-[10px] font-sans font-bold text-stone-400 uppercase">
                    <span>Slab Quantity Needed</span>
                    <span className="text-amber-500 text-xs">{builderQuantity.toLocaleString()} SQFT</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={globalMinQuantity}
                      step="50"
                      value={builderQuantity}
                      onChange={(e) => setBuilderQuantity(Number(e.target.value))}
                      className="w-full bg-stone-950 border border-stone-800 rounded px-3 py-2 text-stone-200 font-sans text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <div className="flex bg-stone-950 rounded border border-stone-800 text-stone-400 font-sans text-[10px] items-center px-3 font-semibold">
                      SQFT
                    </div>
                  </div>
                  <p className="text-[10px] font-sans text-stone-500">
                    *Global Minimum rule: {globalMinQuantity.toLocaleString()} SQFT required per custom config item.
                  </p>
                </div>

                {/* Error prompt */}
                {bulkError && (
                  <div className="text-[11px] font-sans text-rose-400 bg-rose-500/5 rounded border border-rose-500/10 p-3 leading-snug">
                    {bulkError}
                  </div>
                )}

                {/* Add block to cart button */}
                <button
                  type="button"
                  id="add-item-to-bulk-btn"
                  onClick={handleAddItemToBulkOrder}
                  className="w-full rounded-lg bg-amber-500 hover:bg-amber-450 text-stone-950 font-bold py-3 text-xs uppercase tracking-wider transition cursor-pointer border-none"
                >
                  Add Custom Granite Config to Inquiry List
                </button>
              </>
            )}
          </div>

          {/* Cart & Consolidated Quotation Submission Layout (Right panel) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-6">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
                <h3 className="text-xs font-bold text-stone-300 font-sans uppercase tracking-wider">
                  Sourced Quotation Export List ({bulkCart.length} item{bulkCart.length === 1 ? '' : 's'})
                </h3>
                {bulkCart.length > 0 && (
                  <button
                    onClick={() => setBulkCart([])}
                    className="text-[10px] font-sans text-stone-550 hover:text-amber-550 transition uppercase border-none bg-transparent cursor-pointer font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {bulkCart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="h-10 w-10 text-stone-600 mx-auto animate-pulse flex items-center justify-center">
                    <Layers className="h-8 w-8" />
                  </div>
                  <p className="text-xs text-stone-500 font-sans">No configured granites in your bulk order yet.</p>
                  <p className="text-[11px] text-stone-600">Select material parameters on the left to stack customized bulk orders.</p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-2">
                  {bulkCart.map((item) => {
                    const prodObj = products.find(p => p.id === item.productId);
                    const sizeObj = slabSizes.find(s => s.id === item.selectedSlabSizeId);
                    const thickObj = thicknesses.find(t => t.id === item.selectedThicknessId);
                    const finishObj = finishTypes.find(f => f.id === item.selectedFinishTypeId);

                    return (
                      <div
                        key={item.id}
                        className="bg-stone-950 p-4 rounded-lg border border-stone-850 flex items-center justify-between gap-4 font-sans text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white uppercase truncate">{prodObj?.title || 'Premium Granite'}</h4>
                          <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-stone-400 mt-1 pl-1 border-l border-amber-500/20 font-sans">
                            <div>SIZE: <span className="text-stone-200 font-semibold">{sizeObj?.name || 'Custom'}</span></div>
                            <div>THICK: <span className="text-stone-200 font-semibold">{thickObj?.name.split(' (')[0] || 'Custom'}</span></div>
                            <div>FINISH: <span className="text-stone-200 font-semibold">{finishObj?.name || 'Custom'}</span></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 border-l border-stone-800 pl-4">
                          <div className="text-right">
                            <p className="text-xs font-sans font-bold text-amber-500">{item.quantity.toLocaleString()} SQFT</p>
                            <p className="text-[9px] text-stone-600 mt-0.5">Est. weight: {((item.quantity * 0.0929 * 0.02 * 2.73)).toFixed(1)} tons</p>
                          </div>

                          <button
                            onClick={() => handleRemoveItemFromBulkOrder(item.id)}
                            className="text-stone-600 hover:text-red-400 p-1.5 rounded transition bg-stone-900 border border-stone-800 cursor-pointer"
                            title="Remove style"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Accumulator stats */}
              {bulkCart.length > 0 && (
                <div className="grid grid-cols-3 gap-3 border-t border-stone-800 pt-4 mt-4 text-center font-sans text-xs bg-stone-950/40 p-3 rounded">
                  <div>
                    <span className="text-[9px] text-stone-500 block uppercase font-sans">Total Area</span>
                    <strong className="text-stone-200 text-sm mt-0.5 block">{bulkCart.reduce((acc, c) => acc + c.quantity, 0).toLocaleString()} SQFT</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-500 block uppercase font-sans">Transit Payload</span>
                    <strong className="text-stone-200 text-sm mt-0.5 block">{((bulkCart.reduce((acc, c) => acc + c.quantity, 0) * 0.0929 * 0.025 * 2.75)).toFixed(1)} tons</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-500 block uppercase font-sans">Cigar Containers</span>
                    <strong className="text-amber-500 text-sm mt-0.5 block font-bold">
                      {Math.ceil((bulkCart.reduce((acc, c) => acc + c.quantity, 0) * 0.0929 * 0.025 * 2.75) / 21.5)} × 20FT
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {bulkCart.length > 0 && (
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 font-sans">
                <h3 className="text-xs font-bold text-stone-300 font-sans uppercase tracking-wider border-b border-stone-800 pb-3 mb-4 flex items-center gap-2">
                  Submit Bulk Sourcing Details
                </h3>

                {bulkSuccess ? (
                  <div className="bg-stone-950 border border-amber-500/20 rounded-lg p-6 text-center space-y-4">
                    <CheckCircle2 className="h-10 w-10 text-amber-500 mx-auto" />
                    <h4 className="text-sm font-bold text-white font-sans uppercase">Request Sent to CRM Pipeline</h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed font-sans">
                      We have dispatched your requested custom granite dimensions. Mailtrap auto-responders have been triggered. Your export manager will schedule structural drawing sheets.
                    </p>
                    <button
                      onClick={() => setBulkSuccess(false)}
                      className="px-4 py-1.5 bg-stone-800 text-stone-300 text-[11px] rounded hover:text-white transition uppercase font-sans border-none cursor-pointer"
                    >
                      Configure Another Sourcing
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBulkInquirySubmit} className="space-y-4 font-sans text-xs">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-stone-400 uppercase text-[9px] mb-1 font-bold">Contact Name *</label>
                        <input
                          type="text"
                          required
                          value={bulkCustomerName}
                          onChange={(e) => setBulkCustomerName(e.target.value)}
                          placeholder="e.g. David Vance"
                          className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-400 uppercase text-[9px] mb-1 font-bold">Business Email *</label>
                        <input
                          type="email"
                          required
                          value={bulkCustomerEmail}
                          onChange={(e) => setBulkCustomerEmail(e.target.value)}
                          placeholder="e.g. purchase@buildercorp.com"
                          className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-200 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-stone-400 uppercase text-[9px] mb-1 font-bold">Phone Number *</label>
                        <input
                          type="text"
                          required
                          value={bulkCustomerPhone}
                          onChange={(e) => setBulkCustomerPhone(e.target.value)}
                          placeholder="e.g. +1 (314) 220-4491"
                          className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-400 uppercase text-[9px] mb-1 font-bold">Company Name</label>
                        <input
                          type="text"
                          value={bulkCustomerCompany}
                          onChange={(e) => setBulkCustomerCompany(e.target.value)}
                          placeholder="e.g. United Masonry LLC"
                          className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-200 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-400 uppercase text-[9px] mb-1 font-bold">Special Sourcing Instructions</label>
                      <textarea
                        rows={3}
                        value={bulkNotes}
                        onChange={(e) => setBulkNotes(e.target.value)}
                        placeholder="Specify target delivery timeline, custom double-bevel sizing or bundle wood crate requirements..."
                        className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-200 outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      id="btn-bulk-submit"
                      className="w-full rounded bg-amber-500 hover:bg-amber-450 text-stone-950 font-bold py-3 uppercase tracking-wider text-xs transition cursor-pointer border-none text-center"
                    >
                      Transmit Integrated Bulk quotation list
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      {/* ABOUT US & MISSION SECTION */}
      {activeWebTab === 'home' && (
      <section id="about" className="bg-stone-900/40 border-y border-stone-900 py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16 font-sans">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500 font-sans">Corporate Heritage</span>
            <h2 className="mt-2 text-4xl font-light tracking-tight text-white mb-6 font-display italic">
              About FieryStone
            </h2>
            <div className="mt-4 text-stone-300 max-w-3xl mx-auto text-[15px] leading-relaxed space-y-4 font-sans">
              <p>
                At FieryStone, we bring India’s finest granite to the world — sourced from top quarries, expertly processed, and precision-finished for modern architecture and design.
              </p>
              <p>
                Whether it’s for commercial spaces, residential interiors, or monumental projects, FieryStone delivers consistent export quality, on-time shipments, and competitive pricing that aligns with your project goals.
              </p>
            </div>
            
            <div className="mt-8 border-t border-stone-800/80 pt-6 max-w-lg mx-auto font-sans">
              <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-1 font-sans">
                FIERYSTONE TRADERS PRIVATE LIMITED
              </h3>
              <p className="text-xs text-amber-500 uppercase tracking-wider font-semibold font-sans">
                Premium Indian Granite, Crafted for Global Projects
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 font-sans">
              <div className="rounded-xl border border-stone-800 bg-stone-950 p-6">
                <h3 className="text-base font-bold text-amber-500 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
                  OUR MISSION
                </h3>
                <p className="text-stone-300 text-xs leading-relaxed mt-2 font-light">
                  To quarry, process, and supply Indian granite of peerless pedigree directly to global landmarks; maintaining unwavering commitments to honest mineral selection, dimensional precision, and transparent corporate partnerships.
                </p>
              </div>

              <div className="rounded-xl border border-stone-800 bg-stone-950 p-6">
                <h3 className="text-base font-bold text-amber-500 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-amber-500" />
                  OUR VISION
                </h3>
                <p className="text-stone-300 text-xs leading-relaxed mt-2 font-light">
                  To stand across generations as India’s preeminent premium stone exporter; inspiring architects worldwide to shape monumental spaces with the raw, natural elegance and enduring quality of Indian granite.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-amber-600/10 filter blur-3xl" />
              <img
                src={aboutAssetUrl}
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=1000&auto=format&fit=crop&q=80";
                }}
                alt="Exquisite collections of Indian Granite Slabs varieties"
                className="rounded-xl border border-stone-800 shadow-2xl relative z-10 w-full h-80 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>
      )}

      {/* CONTACT DESKS & CORPORATE OFFICES */}
      {activeWebTab === 'contact' && (
      <section id="contact-section" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Detailed Address blocks */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500 font-mono">Get in Touch</span>
              <h2 className="mt-1 text-3xl font-extrabold text-white">Corporate Offices</h2>
              <p className="text-stone-400 text-xs mt-2">
                Reach out to our domestic or North American sales director queues directly.
              </p>
            </div>

            {/* India Portal */}
            <div className="rounded-xl border border-stone-800 bg-stone-950 p-6 relative overflow-hidden group hover:border-amber-500/20 transition">
              <div className="absolute top-0 right-0 bg-stone-900 text-stone-400 text-[10px] uppercase tracking-wider px-3 py-1 font-mono rounded-bl border-l border-b border-stone-800 font-bold group-hover:bg-amber-500 group-hover:text-stone-950 transition">
                India Head Quarters
              </div>
              <h4 className="text-base font-bold text-white uppercase font-sans">FieryStone Traders (IND)</h4>
              
              <div className="space-y-3 mt-4 text-xs font-mono">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-stone-300">
                    G4, Green Tress Apt., Vepagunta Visakhapatnam, Andhra Pradesh – 530047
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <a href="tel:+917337260719" className="text-stone-300 hover:text-amber-400 transition">+91 73372 60719</a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <a href="mailto:sales.india@fierystone.com" className="text-stone-300 hover:text-amber-400 transition">sales.india@fierystone.com</a>
                </div>
              </div>
            </div>

            {/* US Portal */}
            <div className="rounded-xl border border-stone-800 bg-stone-950 p-6 relative overflow-hidden group hover:border-amber-500/20 transition">
              <div className="absolute top-0 right-0 bg-stone-900 text-stone-400 text-[10px] uppercase tracking-wider px-3 py-1 font-mono rounded-bl border-l border-b border-stone-800 font-bold group-hover:bg-amber-500 group-hover:text-stone-950 transition">
                North America Office
              </div>
              <h4 className="text-base font-bold text-white uppercase font-sans">FieryStone Traders (US)</h4>
              
              <div className="space-y-3 mt-4 text-xs font-mono">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-stone-300">
                    Palisades Dr, St Charles, MO 63301
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <a href="tel:+12676397454" className="text-stone-300 hover:text-amber-400 transition">+1 (267) 639-7454</a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <a href="mailto:sales.us@fierystone.com" className="text-stone-300 hover:text-amber-400 transition">sales.us@fierystone.com</a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Lead Form */}
          <div className="lg:col-span-3 rounded-xl border border-stone-800 bg-stone-900/30 p-8 relative">
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">Submit general inquiry</h3>
            <p className="text-stone-400 text-xs mb-6">Your message will be routed directly to our India or US sales representatives based on your regional requirements.</p>

            {contactSuccess ? (
              <div className="bg-stone-950 border border-amber-500/40 p-6 rounded-lg text-center space-y-4">
                <CheckCircle2 className="h-10 w-10 text-amber-500 mx-auto" />
                <h4 className="text-stone-200 font-bold font-mono">INQUIRY REQUEST TRANSMITTED</h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">Thank you for contacting us. A dedicated export sales advisor has been assigned to your request and will follow up with you within 24 hours.</p>
                <button 
                  onClick={() => setContactSuccess(false)}
                  className="rounded-lg bg-stone-800 hover:bg-stone-700 text-xs text-stone-100 font-semibold px-4 py-2 transition"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleGeneralContactSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-400 uppercase text-[9px] mb-1 font-bold">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 uppercase text-[9px] mb-1 font-bold">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. john@company.com"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-200"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-400 uppercase text-[9px] mb-1 font-bold">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 019-2834"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 uppercase text-[9px] mb-1 font-bold">Reason</label>
                    <select
                      value={contactProductChoice}
                      onChange={(e) => setContactProductChoice(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-200"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Business Collaboration">Business Collaboration</option>
                      {activeProducts.map((p) => (
                        <option key={p.id} value={p.title}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 uppercase text-[9px] mb-1 font-bold">Specification Detail / Notes</label>
                  <textarea
                    rows={4}
                    value={contactNotes}
                    onChange={(e) => setContactNotes(e.target.value)}
                    placeholder="Specify container loading quantity, destination port parameters or delivery timing constraints..."
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-200"
                  />
                </div>

                <button
                  type="submit"
                  id="btn-general-submit"
                  className="w-full rounded-md bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 uppercase tracking-wider text-xs transition"
                >
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
      )}

      {/* FOOTER */}
      <footer id="web-footer" className="bg-stone-950 border-t border-stone-900 py-12 px-6">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center md:items-start gap-8 font-sans">
          
          {/* Column 1: Social Media first, and then three links */}
          <div className="flex flex-col items-center md:items-start gap-4">
            {/* Social Media Links */}
            <div className="flex items-center gap-2.5">
              {instagramUrl && (
                <a 
                  href={instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-8 w-8 rounded-full bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 flex items-center justify-center text-stone-400 hover:text-amber-400 transition shadow-sm"
                  title="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {facebookUrl && (
                <a 
                  href={facebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-8 w-8 rounded-full bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 flex items-center justify-center text-stone-400 hover:text-amber-400 transition shadow-sm"
                  title="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {youtubeUrl && (
                <a 
                  href={youtubeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-8 w-8 rounded-full bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 flex items-center justify-center text-stone-400 hover:text-amber-400 transition shadow-sm"
                  title="YouTube"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
              {linkedinUrl && (
                <a 
                  href={linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-8 w-8 rounded-full bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 flex items-center justify-center text-stone-400 hover:text-amber-400 transition shadow-sm"
                  title="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Three Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-stone-400 font-sans">
              <button
                onClick={() => setActiveLegalPopup('privacy')}
                className="hover:text-amber-400 transition cursor-pointer font-medium"
              >
                Privacy Policy
              </button>
              <span className="text-stone-800">|</span>
              <button
                onClick={() => setActiveLegalPopup('terms')}
                className="hover:text-amber-400 transition cursor-pointer font-medium"
              >
                Terms & Conditions
              </button>
              <span className="text-stone-800">|</span>
              <button
                onClick={() => setActiveLegalPopup('disclaimer')}
                className="hover:text-amber-400 transition cursor-pointer font-medium"
              >
                Export Disclaimer
              </button>
            </div>
          </div>

          {/* Column 2: Copyright and developer credits */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right gap-1.5 font-sans text-xs text-stone-500 md:self-end">
            <p>
              © 2026 FieryStone Traders. All rights reserved.
            </p>
            <p className="text-[11px] text-stone-600">
              Developed by <a href="https://innovalley.in" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400 hover:underline transition font-semibold">Innovalley</a>
            </p>
          </div>

        </div>
      </footer>

      {/* DYNAMIC MODAL: PRODUCT DETAILS AND RELATIONAL INQUIRY FORM */}
      {selectedProduct && (
        <div 
          id="product-detail-modal-root" 
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-4 overflow-y-auto backdrop-blur-sm"
        >
          <div id="product-detail-modal" className="relative w-full max-w-4xl rounded-2xl border border-stone-800 bg-stone-950 shadow-2xl text-stone-300">
            {/* Close */}
            <button
              id="modal-close-btn"
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 h-9 w-9 flex items-center justify-center text-stone-400 hover:text-amber-500 rounded-full bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/30 transition shadow-md z-50 cursor-pointer"
              title="Close Specifications"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="grid md:grid-cols-2 gap-0 overflow-hidden rounded-2xl max-h-[85vh] md:max-h-none overflow-y-auto">
              
              {/* Product Info Panel (Left) */}
              <div className="p-6 md:p-8 bg-stone-900/30 border-r border-stone-800 flex flex-col justify-between">
                <div>
                  <div className="h-48 w-full rounded-xl overflow-hidden bg-stone-950 border border-stone-800 mb-6">
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.title} 
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <span className="rounded bg-amber-500/15 text-amber-500 border border-amber-500/20 text-[10px] font-mono px-2 py-0.5 uppercase tracking-widest">
                    Specifications Sheet
                  </span>
                  
                  <h3 className="text-xl font-black text-white mt-2 tracking-wide uppercase">
                    {selectedProduct.title}
                  </h3>
                  
                  <p className="text-xs text-stone-300 mt-3 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  {/* Ports Served / Locations Served list */}
                  <div className="grid grid-cols-2 gap-4 text-[11px] font-mono border-t border-stone-800 pt-4">
                    <div>
                      <p className="text-stone-500 uppercase font-bold text-[9px]">Linked Shipping Port</p>
                      {selectedProduct.fobPortIds.length > 0 ? (
                        <ul className="list-disc pl-3 text-stone-300 mt-1 space-y-1">
                          {selectedProduct.fobPortIds.map(id => (
                            <li key={id} className="truncate">{fobPorts.find(p => p.id === id)?.name || id}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-stone-500 mt-1">Direct shipping available</p>
                      )}
                    </div>
                    <div>
                      <p className="text-stone-500 uppercase font-bold text-[9px]">Locations Serviced</p>
                      {selectedProduct.locationsServingIds.length > 0 ? (
                        <ul className="list-disc pl-3 text-stone-300 mt-1 space-y-1">
                          {selectedProduct.locationsServingIds.map(id => (
                            <li key={id} className="truncate">{locationsServing.find(l => l.id === id)?.name || id}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-stone-500 mt-1">Global Shipping</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Inquiry Lead Generator Form (Right) */}
              <div className="p-6 md:p-8 bg-stone-950 flex flex-col justify-center">
                <h4 className="text-base font-bold text-white uppercase tracking-wider mb-1">
                  Custom Specification RFQ
                </h4>
                <p className="text-stone-400 text-xs mb-6"> Configure custom specifications based on raw stock bounds.</p>

                {formSuccess ? (
                  <div className="bg-stone-900 border border-amber-500/30 rounded-xl p-6 text-center space-y-4 font-sans">
                    <CheckCircle2 className="h-12 w-12 text-amber-500 mx-auto" />
                    <h5 className="text-stone-200 font-bold uppercase font-sans text-sm">Quotation Request Sent</h5>
                    <p className="text-stone-400 text-xs max-w-xs mx-auto">
                      Your specifications have been successfully transmitted. Our logistics team will review your parameters and email a detailed custom quotation shortly.
                    </p>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="rounded-lg bg-amber-500 text-stone-950 text-xs font-bold px-6 py-2 transition hover:bg-amber-400 font-sans"
                    >
                      Return to Gallery
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleProductLeadSubmit} className="space-y-4 text-xs font-sans">
                    {/* Error display */}
                    {formError && (
                      <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-[11px] text-red-400">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{formError}</span>
                      </div>
                    )}

                    {/* Preloaded CMS dynamic choices based on product setup */}
                    <div className="space-y-3 p-3.5 rounded-xl border border-stone-800 bg-stone-900/40">
                      <p className="text-[10px] text-amber-500 font-bold uppercase">Configure Slab Details</p>

                      {/* Dynamic choice of slab size */}
                      <div>
                        <label className="block text-stone-400 text-[9px] uppercase mb-1 font-bold">Select Slab Size *</label>
                        <select
                          id="lead-size-select"
                          value={leadSelectedSlabSize}
                          onChange={(e) => setLeadSelectedSlabSize(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-2.5 py-1.5 text-stone-200"
                        >
                          {selectedProduct.slabSizeIds.map((id) => {
                            const sizeObj = slabSizes.find(s => s.id === id);
                            if (!sizeObj || !sizeObj.active) return null;
                            return <option key={id} value={id}>{sizeObj.name}</option>;
                          })}
                          {selectedProduct.slabSizeIds.length === 0 && (
                            <option value="">No Active Sizes Available</option>
                          )}
                        </select>
                      </div>

                      {/* Dynamic Choice of thickness */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-stone-400 text-[9px] uppercase mb-1 font-bold">Thickness *</label>
                          <select
                            id="lead-thickness-select"
                            value={leadSelectedThickness}
                            onChange={(e) => setLeadSelectedThickness(e.target.value)}
                            className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-2.5 py-1.5 text-stone-200"
                          >
                            {selectedProduct.thicknessIds.map((id) => {
                              const thickObj = thicknesses.find(t => t.id === id);
                              if (!thickObj || !thickObj.active) return null;
                              return <option key={id} value={id}>{thickObj.name}</option>;
                            })}
                            {selectedProduct.thicknessIds.length === 0 && (
                              <option value="">No Active Thickness</option>
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="block text-stone-400 text-[9px] uppercase mb-1 font-bold">Finish Type *</label>
                          <select
                            id="lead-finish-select"
                            value={leadSelectedFinish}
                            onChange={(e) => setLeadSelectedFinish(e.target.value)}
                            className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-2.5 py-1.5 text-stone-200"
                          >
                            {selectedProduct.finishTypeIds.map((id) => {
                              const finObj = finishTypes.find(f => f.id === id);
                              if (!finObj || !finObj.active) return null;
                              return <option key={id} value={id}>{finObj.name}</option>;
                            })}
                            {selectedProduct.finishTypeIds.length === 0 && (
                              <option value="">No Active Finishes</option>
                            )}
                          </select>
                        </div>
                      </div>

                      {/* Quantity requesting */}
                      <div>
                        <label className="block text-stone-400 text-[9px] uppercase mb-1 font-bold">
                          Requested volume (sqft) *
                        </label>
                        <input
                          type="number"
                          value={leadQuantity}
                          onChange={(e) => setLeadQuantity(Number(e.target.value))}
                          className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-2.5 py-1.5 text-stone-200 font-bold"
                        />
                      </div>
                    </div>

                    {/* CONTACT FORM */}
                    <div className="space-y-3">
                      <p className="text-[10px] text-amber-500 font-bold uppercase">Customer Demographics</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-stone-400 text-[9px] uppercase mb-1">Full Name *</label>
                          <input
                            type="text"
                            required
                            id="lead-form-name"
                            value={leadCustomerName}
                            onChange={(e) => setLeadCustomerName(e.target.value)}
                            placeholder="e.g. Liam Sterling"
                            className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-2.5 py-1.5 text-stone-300"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-400 text-[9px] uppercase mb-1">Email *</label>
                          <input
                            type="email"
                            required
                            id="lead-form-email"
                            value={leadCustomerEmail}
                            onChange={(e) => setLeadCustomerEmail(e.target.value)}
                            placeholder="liam@sterling.com"
                            className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-2.5 py-1.5 text-stone-300"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-stone-400 text-[9px] uppercase mb-1">Phone *</label>
                          <input
                            type="text"
                            required
                            id="lead-form-phone"
                            value={leadCustomerPhone}
                            onChange={(e) => setLeadCustomerPhone(e.target.value)}
                            placeholder="+1 (415) 322-1922"
                            className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-2.5 py-1.5 text-stone-300"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-400 text-[9px] uppercase mb-1 font-bold">Location / Port City *</label>
                          <input
                            type="text"
                            required
                            id="lead-form-location"
                            value={leadCustomerCountry}
                            onChange={(e) => setLeadCustomerCountry(e.target.value)}
                            placeholder="e.g. Houston, Texas, USA"
                            className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-2.5 py-1.5 text-stone-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-stone-400 text-[9px] uppercase mb-1">Enterprise / Company Name</label>
                        <input
                          type="text"
                          value={leadCustomerCompany}
                          onChange={(e) => setLeadCustomerCompany(e.target.value)}
                          placeholder="e.g. Sterling Developers Inc."
                          className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-2.5 py-1.5 text-stone-300"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-400 text-[9px] uppercase mb-1">Logistics requirements / Notes</label>
                        <textarea
                          rows={2}
                          value={leadNotes}
                          onChange={(e) => setLeadNotes(e.target.value)}
                          placeholder="Specify custom wood packing, continuous vein requirements etc."
                          className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-2.5 py-1.5 text-stone-300"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      id="lead-submit-btn"
                      className="w-full rounded bg-amber-500 hover:bg-amber-400 text-stone-950 py-3 uppercase tracking-wider font-bold transition mt-2 cursor-pointer"
                    >
                      Submit Quotation Request
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* POPUP LEGAL MODALS */}
      {activeLegalPopup && (
        <div id="legal-popup-root" className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-sm">
          <div id="legal-popup-card" className="w-full max-w-2xl rounded-2xl border border-stone-800 bg-stone-950 p-6 md:p-8 text-stone-300 max-h-[80vh] overflow-y-auto relative">
            
            <button
              id="legal-close-btn"
              onClick={() => setActiveLegalPopup(null)}
              className="absolute right-4 top-4 h-9 w-9 flex items-center justify-center text-stone-400 hover:text-amber-500 rounded-full bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/30 transition shadow-md z-50 cursor-pointer"
              title="Close Dialog"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {activeLegalPopup === 'privacy' && (
              <div className="space-y-4 font-sans">
                <div className="flex items-center gap-2 text-amber-500 font-sans">
                  <Shield className="h-5 w-5" />
                  <h3 className="text-lg font-bold uppercase tracking-wider">Privacy Policy</h3>
                </div>
                <p className="text-xs text-stone-400"><strong>Effective Date: June 17, 2026</strong></p>
                <div className="text-xs whitespace-pre-line leading-relaxed text-stone-300 bg-stone-900/10 p-3 rounded-lg border border-stone-850">
                  {privacyPolicy}
                </div>
              </div>
            )}

            {activeLegalPopup === 'terms' && (
              <div className="space-y-4 font-sans">
                <div className="flex items-center gap-2 text-amber-500 font-sans">
                  <FileCheck className="h-5 w-5" />
                  <h3 className="text-lg font-bold uppercase tracking-wider">Terms & Conditions</h3>
                </div>
                <p className="text-xs text-stone-400"><strong>Effective Date: June 17, 2026</strong></p>
                <div className="text-xs whitespace-pre-line leading-relaxed text-stone-300 bg-stone-900/10 p-3 rounded-lg border border-stone-850">
                  {termsConditions}
                </div>
              </div>
            )}

            {activeLegalPopup === 'disclaimer' && (
              <div className="space-y-4 font-sans">
                <div className="flex items-center gap-2 text-amber-500 font-sans">
                  <Scale className="h-5 w-5" />
                  <h3 className="text-lg font-bold uppercase tracking-wider">Geological & Export Disclaimer</h3>
                </div>
                <p className="text-xs text-stone-400"><strong>Export Standard Regulation</strong></p>
                <div className="text-xs whitespace-pre-line leading-relaxed text-stone-300 bg-stone-900/10 p-3 rounded-lg border border-stone-850">
                  {exportDisclaimer}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
