/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Product,
  SlabSize,
  GraniteType,
  Thickness,
  FinishType,
  FobPort,
  LocationServing,
  LeadStage,
  WonProcessStep,
  Lead
} from '../types';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  Star,
  Layers,
  Settings,
  Image,
  Flame,
  Globe2,
  Anchor,
  Share2
} from 'lucide-react';
import DatabaseTabContent from './DatabaseTabContent';

interface CmsViewProps {
  products: Product[];
  slabSizes: SlabSize[];
  graniteTypes: GraniteType[];
  thicknesses: Thickness[];
  finishTypes: FinishType[];
  fobPorts: FobPort[];
  locationsServing: LocationServing[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateSlabSizes: (sizes: SlabSize[]) => void;
  onUpdateGraniteTypes: (types: GraniteType[]) => void;
  onUpdateThicknesses: (thicknesses: Thickness[]) => void;
  onUpdateFinishTypes: (finishes: FinishType[]) => void;
  onUpdateFobPorts: (ports: FobPort[]) => void;
  onUpdateLocationsServing: (locations: LocationServing[]) => void;
  globalMinQuantity?: number;
  onUpdateGlobalMinQuantity?: (qty: number) => void;
  leadStages?: LeadStage[];
  onUpdateLeadStages?: (stages: LeadStage[]) => void;
  wonProcessSteps?: WonProcessStep[];
  onUpdateWonProcessSteps?: (steps: WonProcessStep[]) => void;
  privacyPolicy?: string;
  onUpdatePrivacyPolicy?: (val: string) => void;
  termsConditions?: string;
  onUpdateTermsConditions?: (val: string) => void;
  exportDisclaimer?: string;
  onUpdateExportDisclaimer?: (val: string) => void;
  instagramUrl?: string;
  onUpdateInstagramUrl?: (val: string) => void;
  facebookUrl?: string;
  onUpdateFacebookUrl?: (val: string) => void;
  youtubeUrl?: string;
  onUpdateYoutubeUrl?: (val: string) => void;
  linkedinUrl?: string;
  onUpdateLinkedinUrl?: (val: string) => void;
  logoUrl?: string;
  onUpdateLogoUrl?: (val: string) => void;
  logoText?: string;
  onUpdateLogoText?: (val: string) => void;
  leads?: Lead[];
  onUpdateLeads?: (leads: Lead[]) => void;
}

const PREMIUM_STONE_IMAGES = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1525498128493-380d1990a112?w=1000&auto=format&fit=crop&q=80',
];

export default function CmsView({
  products,
  slabSizes,
  graniteTypes,
  thicknesses,
  finishTypes,
  fobPorts,
  locationsServing,
  onUpdateProducts,
  onUpdateSlabSizes,
  onUpdateGraniteTypes,
  onUpdateThicknesses,
  onUpdateFinishTypes,
  onUpdateFobPorts,
  onUpdateLocationsServing,
  globalMinQuantity,
  onUpdateGlobalMinQuantity,
  leadStages = [],
  onUpdateLeadStages,
  wonProcessSteps = [],
  onUpdateWonProcessSteps,
  privacyPolicy = '',
  onUpdatePrivacyPolicy,
  termsConditions = '',
  onUpdateTermsConditions,
  exportDisclaimer = '',
  onUpdateExportDisclaimer,
  instagramUrl = '',
  onUpdateInstagramUrl,
  facebookUrl = '',
  onUpdateFacebookUrl,
  youtubeUrl = '',
  onUpdateYoutubeUrl,
  linkedinUrl = '',
  onUpdateLinkedinUrl,
  logoUrl = '',
  onUpdateLogoUrl,
  logoText = 'FieryStone',
  onUpdateLogoText,
  leads = [],
  onUpdateLeads
}: CmsViewProps) {
  // Navigation tabs (Products CMS, Master Lists CMS, Metrics, or Supabase connection syncing)
  const [cmsTab, setCmsTab] = useState<'products' | 'masters' | 'metrics'>('products');
  // Sub-tabs inside Masters CMS
  const [masterSubTab, setMasterSubTab] = useState<'sizes' | 'types' | 'thicknesses' | 'finishes' | 'ports' | 'locations' | 'sourcing'>('sizes');

  // Product Form states
  const [isEditingProduct, setIsEditingProduct] = useState<boolean>(false);
  const [productFormId, setProductFormId] = useState<string | null>(null); // null = adding
  const [prodTitle, setProdTitle] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodDescription, setProdDescription] = useState('');
  const [prodSlabSizes, setProdSlabSizes] = useState<string[]>([]);
  const [prodGraniteTypes, setProdGraniteTypes] = useState<string[]>([]);
  const [prodThicknesses, setProdThicknesses] = useState<string[]>([]);
  const [prodFinishTypes, setProdFinishTypes] = useState<string[]>([]);
  const [prodFobPorts, setProdFobPorts] = useState<string[]>([]);
  const [prodLocationsServing, setProdLocationsServing] = useState<string[]>([]);
  const [prodActive, setProdActive] = useState<boolean>(true);
  const [prodFeatured, setProdFeatured] = useState<boolean>(false);

  // Master Forms states
  const [masterFormName, setMasterFormName] = useState('');
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [previewImageIndex, setPreviewImageIndex] = useState<number>(0);
  const [editingMasterId, setEditingMasterId] = useState<string | null>(null);
  const [editingMasterName, setEditingMasterName] = useState('');

  // CRM / Won Pipeline stage sub-states for the Others tab
  const [newStageName, setNewStageName] = useState('');
  const [newWonStepName, setNewWonStepName] = useState('');

  // Handle uploaded files base64 conversions
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProdImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file as any);
    });
  };

  // QUICK PRODUCT CONTROLS
  const handleToggleProductActive = (id: string) => {
    onUpdateProducts(
      products.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const handleToggleProductFeatured = (id: string) => {
    onUpdateProducts(
      products.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p))
    );
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you absolutely sure you want to remove this stone product from administrative listings?')) {
      onUpdateProducts(products.filter((p) => p.id !== id));
    }
  };

  // OPEN PRODUCT FORM
  const handleOpenProductForm = (product?: Product) => {
    if (product) {
      setProductFormId(product.id);
      setProdTitle(product.title);
      setProdImage(product.image);
      setProdImages(product.images || [product.image]);
      setProdDescription(product.description);
      setProdSlabSizes(product.slabSizeIds);
      setProdGraniteTypes(product.graniteTypeIds);
      setProdThicknesses(product.thicknessIds);
      setProdFinishTypes(product.finishTypeIds);
      setProdFobPorts(product.fobPortIds || []);
      setProdLocationsServing(product.locationsServingIds || []);
      setProdActive(product.active);
      setProdFeatured(product.featured);
    } else {
      setProductFormId(null);
      setProdTitle('');
      const defaultImg = PREMIUM_STONE_IMAGES[Math.floor(Math.random() * PREMIUM_STONE_IMAGES.length)];
      setProdImage(defaultImg);
      setProdImages([defaultImg]);
      setProdDescription('');
      // Autocomplete initial active links
      setProdSlabSizes(slabSizes.filter(s => s.active).map(s => s.id));
      setProdGraniteTypes(graniteTypes.filter(g => g.active).map(g => g.id));
      setProdThicknesses(thicknesses.filter(t => t.active).map(t => t.id));
      setProdFinishTypes(finishTypes.filter(f => f.active).map(f => f.id));
      setProdFobPorts(fobPorts.filter(p => p.active).map(p => p.id));
      setProdLocationsServing(locationsServing.filter(l => l.active).map(l => l.id));
      setProdActive(true);
      setProdFeatured(false);
    }
    setIsEditingProduct(true);
  };

  // SAVE PRODUCT FORM
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim()) {
      alert('Product Title is mandatory.');
      return;
    }

    const firstImage = prodImages[0] || prodImage || PREMIUM_STONE_IMAGES[0];

    const savedProduct: Product = {
      id: productFormId || `prod-${Date.now()}`,
      title: prodTitle,
      image: firstImage,
      images: prodImages.length > 0 ? prodImages : [firstImage],
      description: prodDescription || 'Premium quarry selection slab cut.',
      slabSizeIds: prodSlabSizes,
      graniteTypeIds: prodGraniteTypes,
      thicknessIds: prodThicknesses,
      finishTypeIds: prodFinishTypes,
      fobPortIds: prodFobPorts,
      locationsServingIds: prodLocationsServing,
      minQuantity: globalMinQuantity || 500, // Standardizes with global configurations as shifted
      active: prodActive,
      featured: prodFeatured
    };

    if (productFormId) {
      onUpdateProducts(products.map((p) => (p.id === productFormId ? savedProduct : p)));
    } else {
      onUpdateProducts([...products, savedProduct]);
    }

    setIsEditingProduct(false);
  };

  const toggleFormArray = (id: string, list: string[], setter: (val: string[]) => void) => {
    if (list.includes(id)) {
      setter(list.filter((item) => item !== id));
    } else {
      setter([...list, id]);
    }
  };

  // MASTER CRUD ACTIONS
  const handleAddMasterItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterFormName.trim()) return;

    const newItem = {
      id: `${masterSubTab}-${Date.now()}`,
      name: masterFormName.trim(),
      active: true
    };

    if (masterSubTab === 'sizes') onUpdateSlabSizes([...slabSizes, newItem]);
    else if (masterSubTab === 'types') onUpdateGraniteTypes([...graniteTypes, newItem]);
    else if (masterSubTab === 'thicknesses') onUpdateThicknesses([...thicknesses, newItem]);
    else if (masterSubTab === 'finishes') onUpdateFinishTypes([...finishTypes, newItem]);
    else if (masterSubTab === 'ports') onUpdateFobPorts([...fobPorts, newItem]);
    else if (masterSubTab === 'locations') onUpdateLocationsServing([...locationsServing, newItem]);

    setMasterFormName('');
  };

  const handleToggleMasterActive = (id: string) => {
    if (masterSubTab === 'sizes') onUpdateSlabSizes(slabSizes.map(s => s.id === id ? { ...s, active: !s.active } : s));
    else if (masterSubTab === 'types') onUpdateGraniteTypes(graniteTypes.map(t => t.id === id ? { ...t, active: !t.active } : t));
    else if (masterSubTab === 'thicknesses') onUpdateThicknesses(thicknesses.map(t => t.id === id ? { ...t, active: !t.active } : t));
    else if (masterSubTab === 'finishes') onUpdateFinishTypes(finishTypes.map(f => f.id === id ? { ...f, active: !f.active } : f));
    else if (masterSubTab === 'ports') onUpdateFobPorts(fobPorts.map(p => p.id === id ? { ...p, active: !p.active } : p));
    else if (masterSubTab === 'locations') onUpdateLocationsServing(locationsServing.map(l => l.id === id ? { ...l, active: !l.active } : l));
  };

  const handleDeleteMasterItem = (id: string) => {
    if (!confirm('This may decouple related products in custom lead views. Proceed with deletion?')) return;
    
    if (masterSubTab === 'sizes') onUpdateSlabSizes(slabSizes.filter(s => s.id !== id));
    else if (masterSubTab === 'types') onUpdateGraniteTypes(graniteTypes.filter(t => t.id !== id));
    else if (masterSubTab === 'thicknesses') onUpdateThicknesses(thicknesses.filter(t => t.id !== id));
    else if (masterSubTab === 'finishes') onUpdateFinishTypes(finishTypes.filter(f => f.id !== id));
    else if (masterSubTab === 'ports') onUpdateFobPorts(fobPorts.filter(p => p.id !== id));
    else if (masterSubTab === 'locations') onUpdateLocationsServing(locationsServing.filter(l => l.id !== id));
  };

  const handleStartEditMaster = (id: string, name: string) => {
    setEditingMasterId(id);
    setEditingMasterName(name);
  };

  const handleSaveMasterName = () => {
    if (!editingMasterName.trim() || !editingMasterId) return;

    const updater = (list: any[]) => list.map(item => item.id === editingMasterId ? { ...item, name: editingMasterName } : item);

    if (masterSubTab === 'sizes') onUpdateSlabSizes(updater(slabSizes));
    else if (masterSubTab === 'types') onUpdateGraniteTypes(updater(graniteTypes));
    else if (masterSubTab === 'thicknesses') onUpdateThicknesses(updater(thicknesses));
    else if (masterSubTab === 'finishes') onUpdateFinishTypes(updater(finishTypes));
    else if (masterSubTab === 'ports') onUpdateFobPorts(updater(fobPorts));
    else if (masterSubTab === 'locations') onUpdateLocationsServing(updater(locationsServing));

    setEditingMasterId(null);
  };

  return (
    <div id="cms-view-root" className="min-h-screen bg-stone-950 text-stone-300 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        
        {/* Header administrative block */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-stone-900 pb-6 mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-wide uppercase">CMS Panel</h2>
            <p className="text-xs text-stone-500 mt-1">Configure active stone catalog, available thicknesses, ports, size specs, and export limits.</p>
          </div>

          <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none rounded-lg bg-stone-900 p-1 border border-stone-800 text-xs font-sans w-full md:w-auto max-w-full">
            <button
              onClick={() => setCmsTab('products')}
              className={`rounded px-4 py-1.5 font-semibold transition ${
                cmsTab === 'products' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Our Granites Collection
            </button>
            <button
              onClick={() => setCmsTab('masters')}
              className={`rounded px-4 py-1.5 font-semibold transition ${
                cmsTab === 'masters' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Configurations
            </button>
            <button
              onClick={() => setCmsTab('metrics')}
              className={`rounded px-4 py-1.5 font-semibold transition ${
                cmsTab === 'metrics' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Others & Quick Links
            </button>
          </div>
        </div>

        {/* ======================================================= */}
        {/* PRODUCTS ADMINISTRATIVE LAYOUT */}
        {/* ======================================================= */}
        {cmsTab === 'products' && (
          <div className="space-y-6">
            {!isEditingProduct ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-500 font-sans uppercase bg-amber-500/5 px-3 py-1.5 rounded-full border border-amber-500/20 font-semibold">
                    Product Records count: {products.length}
                  </span>
                  
                  <button
                    id="add-new-product-btn"
                    onClick={() => handleOpenProductForm()}
                    className="flex items-center gap-1.5 rounded-lg bg-amber-500 text-stone-950 px-4 py-2 text-xs font-bold shadow-lg shadow-amber-500/10 hover:bg-amber-400 transition"
                  >
                    <Plus className="h-4 w-4 text-stone-950" /> Add Stone Slab
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {products.map((p) => {
                    const prodSizeCount = p.slabSizeIds.length;
                    const prodThickCount = p.thicknessIds.length;
                    return (
                      <div key={p.id} id={`cms-prod-card-${p.id}`} className="rounded-xl border border-stone-800 bg-stone-900/30 overflow-hidden flex flex-col justify-between font-sans">
                        <div className="relative h-44 w-full bg-stone-950">
                          <img src={p.image} alt={p.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
                          
                          <div className="absolute top-3 left-3 flex gap-1">
                            <span className={`rounded font-sans font-bold text-[9px] px-1.5 py-0.5 border ${
                              p.active 
                                ? 'bg-stone-950/80 text-emerald-400 border-emerald-500/20' 
                                : 'bg-stone-950/80 text-rose-450 border-rose-500/20 text-stone-500'
                            }`}>
                              {p.active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                            {p.featured && (
                              <div className="flex h-4 w-4 items-center justify-center rounded bg-amber-500 text-stone-950">
                                <Star className="h-2.5 w-2.5 fill-stone-950 text-stone-950" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-stone-100 uppercase font-sans tracking-wider truncate">{p.title}</h4>
                            <p className="text-[10px] text-stone-500 font-sans mt-1">Global Min: <strong className="text-amber-500">{globalMinQuantity || 500} SQFT</strong></p>
                            
                            <div className="grid grid-cols-2 gap-1 text-[9px] font-sans mt-3 text-stone-400 bg-stone-950/40 p-2 rounded">
                              <div>SIZES: {prodSizeCount} active</div>
                              <div>THICK: {prodThickCount} active</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-1 mt-4 border-t border-stone-800 pt-3">
                            <button
                              title="Toggle Visibility"
                              onClick={() => handleToggleProductActive(p.id)}
                              className={`rounded py-1 px-2.5 text-[10px] uppercase font-sans font-bold flex items-center justify-center border transition ${
                                p.active 
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500 hover:text-stone-950' 
                                  : 'bg-stone-800 text-stone-500 border-stone-700 hover:bg-stone-750'
                              }`}
                            >
                              {p.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                            </button>

                            <button
                              title="Edit specifications"
                              onClick={() => handleOpenProductForm(p)}
                              className="rounded bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 py-1 flex items-center justify-center text-[10px]"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              title="Delete stone"
                              onClick={() => handleDeleteProduct(p.id)}
                              className="rounded bg-stone-900 hover:bg-rose-950 border border-stone-800 hover:border-rose-900 text-stone-400 hover:text-rose-400 py-1 flex items-center justify-center text-[10px]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* FORM COMPONENT FOR PRODUCTS (ADD & EDIT) */
              <div className="rounded-2xl border border-stone-800 bg-stone-900/20 p-6 md:p-8">
                <div className="flex justify-between items-center border-b border-stone-800 pb-4 mb-6">
                  <h3 className="text-base font-bold text-white uppercase font-mono">
                    {productFormId ? `Edit Product: ${prodTitle}` : 'Add New Stone Product'}
                  </h3>
                  <button
                    onClick={() => setIsEditingProduct(false)}
                    className="rounded bg-stone-800 text-stone-400 hover:text-white px-3 py-1.5 text-xs font-mono border border-stone-700"
                  >
                    Cancel Edit
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="text-xs font-mono space-y-6">
                  
                  {/* Title */}
                  <div>
                    <label className="block text-stone-400 uppercase text-[9px] font-bold mb-1.5">Stone Title *</label>
                    <input
                      type="text"
                      required
                      value={prodTitle}
                      onChange={(e) => setProdTitle(e.target.value)}
                      placeholder="e.g. Thunder Gold Granite"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-200"
                    />
                  </div>

                  {/* Product Images Upload & Collection Selector */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-stone-400 uppercase text-[9px] font-bold">Product Slab Images (One or More)</label>
                      <span className="text-[10px] text-amber-500 font-mono">{prodImages.length} Image{prodImages.length !== 1 ? 's' : ''} Linked</span>
                    </div>

                    {/* Integrated file drag-and-drop or click selector */}
                    <div className="border-2 border-dashed border-stone-800 hover:border-amber-500/50 bg-stone-950/40 rounded-xl p-6 text-center cursor-pointer transition relative group">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <p className="text-stone-300 font-bold">Drag & Drop or Click to Upload Slab Images</p>
                      <p className="text-[10px] text-stone-500 mt-1 font-sans">
                        Local images compile instantly to offline-safe Base64 strings.
                      </p>
                    </div>

                    {/* Or URL input paste */}
                    <div className="flex gap-2 bg-stone-950 p-2 rounded-lg border border-stone-850">
                      <input
                        type="url"
                        value={manualImageUrl}
                        onChange={(e) => setManualImageUrl(e.target.value)}
                        placeholder="Paste additional slab image URL..."
                        className="flex-1 bg-transparent px-2 text-stone-300 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (manualImageUrl.trim()) {
                            setProdImages((prev) => [...prev, manualImageUrl.trim()]);
                            setPreviewImageIndex(prodImages.length);
                            setManualImageUrl('');
                          }
                        }}
                        className="rounded bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-205 px-3 py-1 font-bold font-sans"
                      >
                        Add Image
                      </button>
                    </div>

                    {/* Preset options */}
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-stone-500 uppercase font-mono">Quarry Gallery quick-add:</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {PREMIUM_STONE_IMAGES.map((img, idx) => {
                          const isAlreadyAdded = prodImages.includes(img);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (!isAlreadyAdded) {
                                  setProdImages((prev) => [...prev, img]);
                                  setPreviewImageIndex(prodImages.length);
                                }
                              }}
                              className={`h-7 w-12 rounded overflow-hidden border transition relative block ${
                                isAlreadyAdded ? 'border-emerald-500 opacity-40' : 'border-stone-800 hover:border-stone-500'
                              }`}
                              title={isAlreadyAdded ? 'Already in product images' : 'Click to add this preset'}
                            >
                              <img src={img} alt="preset" className="h-full w-full object-cover" />
                              {isAlreadyAdded && <div className="absolute inset-0 bg-stone-950/40 flex items-center justify-center font-bold text-[8px] text-emerald-400">✓</div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Integrated dynamic carousel with change one-by-one buttons */}
                    {prodImages.length > 0 && (
                      <div className="bg-stone-950 border border-stone-850 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-stone-400 font-bold uppercase font-mono text-[9px] tracking-wider">
                            Interactive Image Sandbox
                          </span>
                          <span className="font-mono text-stone-500">
                            Viewing Image #{previewImageIndex + 1} of {prodImages.length}
                          </span>
                        </div>

                        <div className="relative h-64 w-full bg-stone-900 rounded-lg overflow-hidden flex items-center justify-center border border-stone-800/80">
                          <img
                            src={prodImages[previewImageIndex]}
                            alt={`Slide preview ${previewImageIndex}`}
                            className="h-full w-full object-cover"
                            referrerPolicy="referrer"
                          />

                          {/* Navigation helpers */}
                          {prodImages.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={() => setPreviewImageIndex((prev) => (prev > 0 ? prev - 1 : prodImages.length - 1))}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-stone-950/80 hover:bg-stone-950 text-amber-500 p-2 rounded-full border border-stone-800 font-extrabold transition cursor-pointer select-none text-xs"
                              >
                                &larr;
                              </button>
                              <button
                                type="button"
                                onClick={() => setPreviewImageIndex((prev) => (prev < prodImages.length - 1 ? prev + 1 : 0))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-stone-950/80 hover:bg-stone-950 text-amber-500 p-2 rounded-full border border-stone-800 font-extrabold transition cursor-pointer select-none text-xs"
                              >
                                &rarr;
                              </button>
                            </>
                          )}

                          {/* Delete tool */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextImages = prodImages.filter((_, i) => i !== previewImageIndex);
                              setProdImages(nextImages);
                              setPreviewImageIndex(0);
                            }}
                            className="absolute top-2 right-2 bg-rose-950 hover:bg-rose-900 border border-rose-800 rounded px-2.5 py-1 text-[9px] font-bold text-rose-400 font-sans"
                          >
                            Remove this Image
                          </button>
                        </div>

                        {/* Thumbnails row */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                          {prodImages.map((img, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setPreviewImageIndex(i)}
                              className={`h-9 w-14 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
                                previewImageIndex === i ? 'border-amber-500 opacity-100 scale-102' : 'border-stone-850 opacity-50 hover:opacity-100'
                              }`}
                            >
                              <img src={img} alt="thumb" className="h-full w-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-stone-400 uppercase text-[9px] font-bold mb-1.5">Description *</label>
                    <textarea
                      rows={4}
                      value={prodDescription}
                      onChange={(e) => setProdDescription(e.target.value)}
                      placeholder="Specify geological details, crystal structure veins, Mohs strength ratings, and architectural recommended usages..."
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-2 text-stone-300"
                    />
                  </div>

                  {/* RELATIONAL MASTER LIST MATCHERS (Tied items) */}
                  <div className="grid sm:grid-cols-2 gap-6 p-4 rounded-xl border border-stone-800 bg-stone-900/30">
                    
                    {/* Slab Sizes mapping */}
                    <div>
                      <p className="text-[10px] text-amber-500 font-bold uppercase mb-2 flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" /> Linking Available Slab Sizes
                      </p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-stone-950 rounded border border-stone-850">
                        {slabSizes.map((size) => (
                          <label key={size.id} className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-stone-105">
                            <input
                              type="checkbox"
                              checked={prodSlabSizes.includes(size.id)}
                              onChange={() => toggleFormArray(size.id, prodSlabSizes, setProdSlabSizes)}
                              className="accent-amber-500"
                            />
                            <span className={size.active ? '' : 'text-stone-500 line-through'}>
                              {size.name} {!size.active && '(Inactive)'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Granite Types mapping */}
                    <div>
                      <p className="text-[10px] text-amber-500 font-bold uppercase mb-2 flex items-center gap-1.5">
                        <Flame className="h-3.5 w-3.5" /> Granite & Stone Types
                      </p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-stone-950 rounded border border-stone-850">
                        {graniteTypes.map((type) => (
                          <label key={type.id} className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-stone-105">
                            <input
                              type="checkbox"
                              checked={prodGraniteTypes.includes(type.id)}
                              onChange={() => toggleFormArray(type.id, prodGraniteTypes, setProdGraniteTypes)}
                              className="accent-amber-500"
                            />
                            <span className={type.active ? '' : 'text-stone-500 line-through'}>
                              {type.name} {!type.active && '(Inactive)'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Thicknesses mapping */}
                    <div>
                      <p className="text-[10px] text-amber-500 font-bold uppercase mb-2 flex items-center gap-1.5">
                        <Settings className="h-3.5 w-3.5" /> Calibrated Thicknesses
                      </p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-stone-950 rounded border border-stone-850">
                        {thicknesses.map((t) => (
                          <label key={t.id} className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-stone-105">
                            <input
                              type="checkbox"
                              checked={prodThicknesses.includes(t.id)}
                              onChange={() => toggleFormArray(t.id, prodThicknesses, setProdThicknesses)}
                              className="accent-amber-500"
                            />
                            <span className={t.active ? '' : 'text-stone-500 line-through'}>
                              {t.name} {!t.active && '(Inactive)'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Finishes mapping */}
                    <div>
                      <p className="text-[10px] text-amber-500 font-bold uppercase mb-2 flex items-center gap-1.5">
                        <Image className="h-3.5 w-3.5" /> Surface Finish Types
                      </p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-stone-950 rounded border border-stone-850">
                        {finishTypes.map((f) => (
                          <label key={f.id} className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-stone-105">
                            <input
                              type="checkbox"
                              checked={prodFinishTypes.includes(f.id)}
                              onChange={() => toggleFormArray(f.id, prodFinishTypes, setProdFinishTypes)}
                              className="accent-amber-500"
                            />
                            <span className={f.active ? '' : 'text-stone-500 line-through'}>
                              {f.name} {!f.active && '(Inactive)'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* FOB Ports mapping */}
                    <div>
                      <p className="text-[10px] text-amber-500 font-bold uppercase mb-2 flex items-center gap-1.5">
                        <Anchor className="h-3.5 w-3.5" /> FOB Shipping Ports
                      </p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-stone-950 rounded border border-stone-850">
                        {fobPorts.map((port) => (
                          <label key={port.id} className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-stone-105">
                            <input
                              type="checkbox"
                              checked={prodFobPorts.includes(port.id)}
                              onChange={() => toggleFormArray(port.id, prodFobPorts, setProdFobPorts)}
                              className="accent-amber-500"
                            />
                            <span className={port.active ? '' : 'text-stone-500 line-through'}>
                              {port.name} {!port.active && '(Inactive)'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Locations Serving mapping */}
                    <div>
                      <p className="text-[10px] text-amber-500 font-bold uppercase mb-2 flex items-center gap-1.5">
                        <Globe2 className="h-3.5 w-3.5" /> Locations Serving
                      </p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-stone-950 rounded border border-stone-850">
                        {locationsServing.map((loc) => (
                          <label key={loc.id} className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-stone-105">
                            <input
                              type="checkbox"
                              checked={prodLocationsServing.includes(loc.id)}
                              onChange={() => toggleFormArray(loc.id, prodLocationsServing, setProdLocationsServing)}
                              className="accent-amber-500"
                            />
                            <span className={loc.active ? '' : 'text-stone-500 line-through'}>
                              {loc.name} {!loc.active && '(Inactive)'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Active & Featured toggles */}
                  <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl border border-stone-850 bg-stone-950">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setProdActive(!prodActive)}>
                      {prodActive ? <ToggleRight className="h-6 w-6 text-emerald-450" /> : <ToggleLeft className="h-6 w-6 text-stone-605" />}
                      <div>
                        <p className="text-stone-200 font-bold">Catalog Visibility</p>
                        <p className="text-[10px] text-stone-500">Display this stone dynamically inside public RFQ lists</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setProdFeatured(!prodFeatured)}>
                      {prodFeatured ? <ToggleRight className="h-6 w-6 text-amber-500" /> : <ToggleLeft className="h-6 w-6 text-stone-605" />}
                      <div>
                        <p className="text-stone-200 font-bold">Featured Layout Spot</p>
                        <p className="text-[10px] text-stone-500">Pin product with gilded highlight badge on landing section</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="save-product-submit"
                    className="w-full rounded bg-amber-500 hover:bg-amber-400 text-stone-950 py-3 uppercase tracking-wider font-bold transition cursor-pointer"
                  >
                    Save Product Setup
                  </button>

                </form>
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* MASTER LISTS ADMINISTRATIVE CMS */}
        {/* ======================================================= */}
        {cmsTab === 'masters' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-8">
            
             {/* Sidebar master switchers */}
             <div className="md:col-span-1 flex flex-row md:flex-col overflow-x-auto md:overflow-visible whitespace-nowrap md:whitespace-normal gap-1.5 p-2.5 rounded-xl bg-stone-900/30 border border-stone-850/60 font-mono text-xs scrollbar-none w-full max-w-full">
               <p className="hidden md:block text-[10px] text-stone-500 font-bold uppercase p-2 border-b border-stone-800">Master Entities</p>
               
               <button
                 _id="subtab-sizes"
                 onClick={() => setMasterSubTab('sizes')}
                 className={`w-auto md:w-full text-left rounded px-3 py-2 transition tracking-wider uppercase font-semibold flex-shrink-0 ${
                   masterSubTab === 'sizes' ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
                 }`}
               >
                 Slab Sizes ({slabSizes.length})
               </button>
 
               <button
                 _id="subtab-types"
                 onClick={() => setMasterSubTab('types')}
                 className={`w-auto md:w-full text-left rounded px-3 py-2 transition tracking-wider uppercase font-semibold flex-shrink-0 ${
                   masterSubTab === 'types' ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
                 }`}
               >
                 Product Categories ({graniteTypes.length})
               </button>
 
               <button
                 _id="subtab-thicknesses"
                 onClick={() => setMasterSubTab('thicknesses')}
                 className={`w-auto md:w-full text-left rounded px-3 py-2 transition tracking-wider uppercase font-semibold flex-shrink-0 ${
                   masterSubTab === 'thicknesses' ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
                 }`}
               >
                 Thicknesses ({thicknesses.length})
               </button>
 
               <button
                 _id="subtab-finishes"
                 onClick={() => setMasterSubTab('finishes')}
                 className={`w-auto md:w-full text-left rounded px-3 py-2 transition tracking-wider uppercase font-semibold flex-shrink-0 ${
                   masterSubTab === 'finishes' ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
                 }`}
               >
                 Finish Types ({finishTypes.length})
               </button>
 
               <button
                 _id="subtab-ports"
                 onClick={() => setMasterSubTab('ports')}
                 className={`w-auto md:w-full text-left rounded px-3 py-2 transition tracking-wider uppercase font-semibold flex-shrink-0 ${
                   masterSubTab === 'ports' ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
                 }`}
               >
                 FOB Ports ({fobPorts.length})
               </button>
 
               <button
                 _id="subtab-locations"
                 onClick={() => setMasterSubTab('locations')}
                 className={`w-auto md:w-full text-left rounded px-3 py-2 transition tracking-wider uppercase font-semibold flex-shrink-0 ${
                   masterSubTab === 'locations' ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
                 }`}
               >
                 Locations Serving ({locationsServing.length})
               </button>
 
               <button
                 _id="subtab-sourcing"
                 onClick={() => setMasterSubTab('sourcing')}
                 className={`w-auto md:w-full text-left rounded px-3 py-2 transition tracking-wider uppercase font-semibold flex-shrink-0 ${
                   masterSubTab === 'sourcing' ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
                 }`}
               >
                 Sourcing Metrics
               </button>
             </div>

            {/* Master sublist controller panel */}
            <div className="md:col-span-3 space-y-6">
              
              {masterSubTab === 'sourcing' ? (
                /* Sourcing Rules / Limits Column */
                <div className="bg-stone-900 border border-stone-850 rounded-xl p-6 shadow-lg space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-stone-800">
                    <div className="p-2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sourcing Metrics</h3>
                      <p className="text-[10px] text-stone-500 font-mono">Global parameters</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-stone-300 uppercase font-mono tracking-wide block">
                        Global Minimum Sourcing Rule
                      </label>
                      <p className="text-[11px] text-stone-400 leading-relaxed mb-3">
                        Applies as a minimum area threshold across all custom granite selected configurations.
                      </p>
                      
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 500"
                          value={globalMinQuantity || 500}
                          onChange={(e) => onUpdateGlobalMinQuantity?.(Number(e.target.value) || 0)}
                          className="w-full bg-stone-950 border border-stone-800 text-amber-500 font-mono font-bold text-sm rounded px-3 py-2 focus:border-amber-500 outline-none pr-14"
                        />
                        <span className="absolute right-3 top-2.5 text-[10px] text-stone-500 font-mono font-bold">SQFT</span>
                      </div>
                    </div>
                    
                    <div className="rounded bg-amber-500/5 border border-amber-500/10 p-3 text-[11px] text-stone-400 mt-2 leading-relaxed">
                      💡 Setting this rule dynamically guards checkouts to ensure container-crating labor yields profitable logistics throughput.
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Form to insert item */}
                  <div className="p-4 rounded-xl border border-stone-800 bg-stone-900/10">
                    <p className="text-[10px] text-stone-500 font-bold uppercase mb-2 font-mono">Create Master Entity Record</p>
                    
                    <form onSubmit={handleAddMasterItem} className="flex gap-2 text-xs font-mono">
                      <input
                        type="text"
                        required
                        value={masterFormName}
                        onChange={(e) => setMasterFormName(e.target.value)}
                        placeholder={`e.g. New ${
                          masterSubTab === 'sizes' ? '3200 x 1800 x 20mm' : 
                          masterSubTab === 'types' ? 'Material category name (e.g. Exotic Quartzite)' : 
                          masterSubTab === 'thicknesses' ? 'Thickness rule (e.g. 50 mm)' :
                          masterSubTab === 'finishes' ? 'Finish style (e.g. Sandblasted Textured)' :
                          masterSubTab === 'ports' ? 'FOB seaport descriptor' :
                          'Geographic service territory'
                        }`}
                        className="flex-1 bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-1.5 text-stone-300"
                      />
                      <button
                        type="submit"
                        className="rounded bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-1.5 font-bold transition"
                      >
                        Add Entry
                      </button>
                    </form>
                  </div>

                  {/* Entity listing rendering */}
                  <div className="rounded-xl border border-stone-800 bg-stone-950 overflow-hidden text-xs font-mono">
                    
                    <div className="grid grid-cols-12 bg-stone-900 p-3 text-[10px] font-bold text-stone-400 border-b border-stone-800 tracking-wider">
                      <div className="col-span-7">ENTITY NAME VALUE</div>
                      <div className="col-span-3 text-center">VISIBLE/ACTIVE</div>
                      <div className="col-span-2 text-right">OPERATIONS</div>
                    </div>

                    <div className="divide-y divide-stone-900">
                      {/* Unified dynamic dispatcher size/types/thick/finish */}
                      {(() => {
                        let activeList: any[] = [];
                        if (masterSubTab === 'sizes') activeList = slabSizes;
                        else if (masterSubTab === 'types') activeList = graniteTypes;
                        else if (masterSubTab === 'thicknesses') activeList = thicknesses;
                        else if (masterSubTab === 'finishes') activeList = finishTypes;
                        else if (masterSubTab === 'ports') activeList = fobPorts;
                        else if (masterSubTab === 'locations') activeList = locationsServing;

                    if (activeList.length === 0) {
                      return (
                        <div className="p-8 text-center text-stone-605">
                          No active configuration objects listed. Create entries above.
                        </div>
                      );
                    }

                    return activeList.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 p-3.5 items-center hover:bg-stone-900/20">
                        {/* Title col */}
                        <div className="col-span-7 pr-4">
                          {editingMasterId === item.id ? (
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={editingMasterName}
                                onChange={(e) => setEditingMasterName(e.target.value)}
                                className="bg-stone-900 border border-stone-800 px-2 py-0.5 rounded text-stone-200 text-xs w-full"
                              />
                              <button onClick={handleSaveMasterName} className="p-1 rounded bg-emerald-500 text-stone-950"><Check className="h-3.5 w-3.5" /></button>
                              <button onClick={() => setEditingMasterId(null)} className="p-1 rounded bg-stone-800 text-stone-400"><X className="h-3.5 w-3.5" /></button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={item.active ? 'text-stone-200' : 'text-stone-500 line-through'}>
                                {item.name}
                              </span>
                              {!item.active && (
                                <span className="bg-stone-900 text-rose-500 text-[8px] px-1 rounded border border-rose-950">disabled</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Active toggle col */}
                        <div className="col-span-3 flex justify-center">
                          <button
                            onClick={() => handleToggleMasterActive(item.id)}
                            className={`rounded px-3 py-1 font-bold text-[9px] border transition ${
                              item.active 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-stone-950' 
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500 hover:text-stone-950'
                            }`}
                          >
                            {item.active ? 'ACTIVE' : 'INACTIVE'}
                          </button>
                        </div>

                        {/* Operations col */}
                        <div className="col-span-2 flex justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEditMaster(item.id, item.name)}
                            className="bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-stone-700 text-stone-300 p-1 rounded"
                            title="Edit specification text"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMasterItem(item.id)}
                            className="bg-stone-900 hover:bg-rose-950 border border-stone-800 hover:border-rose-900 text-stone-400 hover:text-rose-450 p-1 rounded"
                            title="Purge master record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>

              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )}

        {/* ======================================================= */}
        {/* OTHERS & QUICK LINKS ADMINISTRATIVE CMS */}
        {/* ======================================================= */}
        {cmsTab === 'metrics' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-12 gap-8">
              
              {/* CRM Lead Stages & Won Process Pipelines Column (Column 1) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* BRAND & LOGO CONFIGURATION */}
                <div className="bg-stone-900 border border-stone-850 rounded-xl p-5 shadow-lg space-y-4 font-sans">
                  <div className="flex items-center gap-2 pb-3 border-b border-stone-800">
                    <div className="p-2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Image className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Enterprise Branding</h3>
                      <p className="text-[10px] text-stone-500">Corporate Logo & Company Display Name</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Brand Name */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] text-stone-400 font-bold uppercase block">
                        Company Brand Name
                      </label>
                      <input
                        type="text"
                        value={logoText}
                        onChange={(e) => onUpdateLogoText?.(e.target.value)}
                        placeholder="e.g. FieryStone"
                        className="w-full bg-stone-950 border border-stone-800 text-stone-200 text-xs rounded px-3 py-2 outline-none focus:border-amber-500 font-normal"
                      />
                    </div>

                    {/* Logo Image Source */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] text-stone-400 font-bold uppercase block">
                        Logo Image Source (URL)
                      </label>
                      <input
                        type="text"
                        value={logoUrl}
                        onChange={(e) => onUpdateLogoUrl?.(e.target.value)}
                        placeholder="Paste image URL or use uploader below..."
                        className="w-full bg-stone-950 border border-stone-800 text-stone-200 text-xs rounded px-3 py-2 outline-none focus:border-amber-500 font-normal"
                      />
                    </div>

                    {/* Interactive File Upload Zone */}
                    

                    {/* Logo Preview */}
                    {logoUrl && (
                      <div className="pt-2 flex flex-col gap-2 border-t border-stone-850/50 text-xs">
                        <span className="text-[9px] text-stone-550 uppercase tracking-widest font-mono">Live Brand Logo Preview</span>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={logoUrl} alt="Logo preview" className="h-14 md:h-18 max-h-[72px] w-auto object-contain bg-stone-900 p-2 rounded-lg border border-stone-800 shadow-inner" referrerPolicy="no-referrer" />
                            <span className="text-[10px] text-amber-500 font-medium">Optimal resolution set</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onUpdateLogoUrl?.('')}
                            className="text-[9px] font-bold uppercase text-rose-400 hover:text-rose-350 bg-rose-500/5 hover:bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/10 cursor-pointer transition"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CRM LEAD STAGES CUSTOMIZER */}
                <div className="bg-stone-900 border border-stone-850 rounded-xl p-5 shadow-lg space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-stone-800">
                    <div className="p-2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">CRM Lead Stages</h3>
                      <p className="text-[10px] text-stone-500 font-mono">Workflow status phases</p>
                    </div>
                  </div>

                  {/* Add Stage Inline Form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newStageName.trim() || !onUpdateLeadStages) return;
                      const newItem: LeadStage = {
                        id: `stage-${Date.now()}`,
                        name: newStageName.trim(),
                        active: true
                      };
                      onUpdateLeadStages([...leadStages, newItem]);
                      setNewStageName('');
                    }}
                    className="flex gap-2 text-xs font-mono"
                  >
                    <input
                      type="text"
                      required
                      value={newStageName}
                      onChange={(e) => setNewStageName(e.target.value)}
                      placeholder="e.g. Technical Audit"
                      className="flex-1 bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-1.5 text-stone-300 outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded bg-amber-500 hover:bg-amber-400 text-stone-950 px-3 py-1.5 font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </form>

                  {/* Stages List */}
                  <div className="rounded-lg border border-stone-850 bg-stone-950/60 overflow-hidden text-xs font-mono max-h-[220px] overflow-y-auto">
                    {leadStages.length === 0 ? (
                      <p className="p-4 text-center text-stone-500">No custom lead stages configured.</p>
                    ) : (
                      <div className="divide-y divide-stone-900">
                        {leadStages.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2.5 hover:bg-stone-900/30">
                            <span className={item.active ? 'text-stone-300' : 'text-stone-500 line-through'}>
                              {item.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  if (!onUpdateLeadStages) return;
                                  onUpdateLeadStages(leadStages.map(s => s.id === item.id ? { ...s, active: !s.active } : s));
                                }}
                                className={`rounded px-2 py-0.5 font-bold text-[9px] border transition ${
                                  item.active 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-stone-950' 
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500 hover:text-stone-950'
                                }`}
                              >
                                {item.active ? 'ACTIVE' : 'INACTIVE'}
                              </button>
                              <button
                                onClick={() => {
                                  if (!confirm('Proceed with purging this CRM stage?') || !onUpdateLeadStages) return;
                                  onUpdateLeadStages(leadStages.filter(s => s.id !== item.id));
                                }}
                                className="bg-stone-900 hover:bg-rose-950 border border-stone-800 text-stone-405 hover:text-rose-450 p-1 rounded transition"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* WON PROCESS PIPELINE CUSTOMIZER */}
                <div className="bg-stone-900 border border-stone-850 rounded-xl p-5 shadow-lg space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-stone-800">
                    <div className="p-2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Won Pipeline Milestones</h3>
                      <p className="text-[10px] text-stone-500 font-mono">Fulfillment steps for won accounts</p>
                    </div>
                  </div>

                  {/* Add Step Inline Form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newWonStepName.trim() || !onUpdateWonProcessSteps) return;
                      const newItem: WonProcessStep = {
                        id: `won-${Date.now()}`,
                        name: newWonStepName.trim(),
                        active: true
                      };
                      onUpdateWonProcessSteps([...wonProcessSteps, newItem]);
                      setNewWonStepName('');
                    }}
                    className="flex gap-2 text-xs font-mono"
                  >
                    <input
                      type="text"
                      required
                      value={newWonStepName}
                      onChange={(e) => setNewWonStepName(e.target.value)}
                      placeholder="e.g. Ocean Bill of Lading"
                      className="flex-1 bg-stone-950 border border-stone-800 focus:border-amber-500 rounded px-3 py-1.5 text-stone-300 outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded bg-amber-500 hover:bg-amber-400 text-stone-950 px-3 py-1.5 font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </form>

                  {/* Won Steps List */}
                  <div className="rounded-lg border border-stone-850 bg-stone-950/60 overflow-hidden text-xs font-mono max-h-[220px] overflow-y-auto">
                    {wonProcessSteps.length === 0 ? (
                      <p className="p-4 text-center text-stone-500">No pipeline process milestones configured.</p>
                    ) : (
                      <div className="divide-y divide-stone-900">
                        {wonProcessSteps.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2.5 hover:bg-stone-900/30">
                            <span className={item.active ? 'text-stone-300' : 'text-stone-500 line-through'}>
                              {item.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  if (!onUpdateWonProcessSteps) return;
                                  onUpdateWonProcessSteps(wonProcessSteps.map(s => s.id === item.id ? { ...s, active: !s.active } : s));
                                }}
                                className={`rounded px-2 py-0.5 font-bold text-[9px] border transition ${
                                  item.active 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-stone-950' 
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500 hover:text-stone-950'
                                }`}
                              >
                                {item.active ? 'ACTIVE' : 'INACTIVE'}
                              </button>
                              <button
                                onClick={() => {
                                  if (!confirm('Proceed with purging this pipeline milestone?') || !onUpdateWonProcessSteps) return;
                                  onUpdateWonProcessSteps(wonProcessSteps.filter(s => s.id !== item.id));
                                }}
                                className="bg-stone-900 hover:bg-rose-950 border border-stone-800 text-stone-405 hover:text-rose-450 p-1 rounded transition"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
              
              {/* Quick Links / Legal Documentation Column (Column 2) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-stone-900 border border-stone-850 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Globe2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Website Quick Links Configuration</h3>
                      <p className="text-[10px] text-stone-400 font-mono">Real-time Privacy, Terms, & Disclaimer updates</p>
                    </div>
                  </div>

                  <div className="space-y-6 border-t border-stone-800/60 pt-6">
                    {/* Privacy Policy */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-stone-950/40 p-2 rounded border border-stone-850">
                        <span className="text-xs font-bold text-amber-500 uppercase font-mono tracking-wider">
                          Privacy Policy Document
                        </span>
                        <span className="text-[9px] text-stone-500 font-mono">DYNAMIC RICH TEXT</span>
                      </div>
                      <textarea
                        rows={5}
                        value={privacyPolicy}
                        onChange={(e) => onUpdatePrivacyPolicy?.(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 text-stone-300 font-sans text-xs rounded-lg p-3 outline-none focus:border-amber-500 font-normal leading-relaxed"
                        placeholder="Define Privacy Policy content..."
                      />
                    </div>

                    {/* Terms & Conditions */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-stone-950/40 p-2 rounded border border-stone-850">
                        <span className="text-xs font-bold text-amber-500 uppercase font-mono tracking-wider">
                          Terms & Conditions Rules
                        </span>
                        <span className="text-[9px] text-stone-500 font-mono">DYNAMIC RICH TEXT</span>
                      </div>
                      <textarea
                        rows={5}
                        value={termsConditions}
                        onChange={(e) => onUpdateTermsConditions?.(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 text-stone-300 font-sans text-xs rounded-lg p-3 outline-none focus:border-amber-500 font-normal leading-relaxed"
                        placeholder="Define Terms & Conditions..."
                      />
                    </div>

                    {/* Export Disclaimer */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-stone-950/40 p-2 rounded border border-stone-850">
                        <span className="text-xs font-bold text-amber-500 uppercase font-mono tracking-wider">
                          Export & Geological Disclaimer
                        </span>
                        <span className="text-[9px] text-stone-500 font-mono">DYNAMIC RICH TEXT</span>
                      </div>
                      <textarea
                        rows={5}
                        value={exportDisclaimer}
                        onChange={(e) => onUpdateExportDisclaimer?.(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 text-stone-300 font-sans text-xs rounded-lg p-3 outline-none focus:border-amber-500 font-normal leading-relaxed"
                        placeholder="Define Geological & Export Disclaimer..."
                      />
                    </div>

                    {/* Social Media Links Quick Configuration */}
                    <div className="space-y-4 pt-5 border-t border-stone-800/60">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-amber-500/10 text-amber-500">
                          <Share2 className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-amber-500 uppercase font-mono tracking-wider">
                          Social Media URL Channels
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] text-stone-400 font-bold uppercase block font-mono">
                            Instagram Account URL
                          </label>
                          <input
                            type="text"
                            value={instagramUrl}
                            onChange={(e) => onUpdateInstagramUrl?.(e.target.value)}
                            placeholder="e.g. https://instagram.com/fierystone"
                            className="w-full bg-stone-950 border border-stone-800 text-stone-300 font-sans text-xs rounded px-3 py-2 outline-none focus:border-amber-500 font-normal"
                          />
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] text-stone-400 font-bold uppercase block font-mono">
                            Facebook Page URL
                          </label>
                          <input
                            type="text"
                            value={facebookUrl}
                            onChange={(e) => onUpdateFacebookUrl?.(e.target.value)}
                            placeholder="e.g. https://facebook.com/fierystone"
                            className="w-full bg-stone-950 border border-stone-800 text-stone-300 font-sans text-xs rounded px-3 py-2 outline-none focus:border-amber-500 font-normal"
                          />
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] text-stone-400 font-bold uppercase block font-mono">
                            YouTube Channel URL
                          </label>
                          <input
                            type="text"
                            value={youtubeUrl}
                            onChange={(e) => onUpdateYoutubeUrl?.(e.target.value)}
                            placeholder="e.g. https://youtube.com/fierystone"
                            className="w-full bg-stone-950 border border-stone-800 text-stone-300 font-sans text-xs rounded px-3 py-2 outline-none focus:border-amber-500 font-normal"
                          />
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] text-stone-400 font-bold uppercase block font-mono">
                            LinkedIn Company URL
                          </label>
                          <input
                            type="text"
                            value={linkedinUrl}
                            onChange={(e) => onUpdateLinkedinUrl?.(e.target.value)}
                            placeholder="e.g. https://linkedin.com/company/fierystone"
                            className="w-full bg-stone-950 border border-stone-800 text-stone-300 font-sans text-xs rounded px-3 py-2 outline-none focus:border-amber-500 font-normal"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-stone-950/60 p-4 rounded-lg border border-stone-850 flex items-center justify-between text-xs">
                      <p className="text-stone-400">
                        ✨ Changes are instantly pushed live to the public footer modals of your website.
                      </p>
                      <span className="text-emerald-500 font-mono font-bold uppercase text-[10px] bg-emerald-500/10 px-2.5 py-1 rounded">
                         Active & Verified
                      </span>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
