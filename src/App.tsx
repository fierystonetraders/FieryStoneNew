/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import WebsiteView from './components/WebsiteView';
import CmsView from './components/CmsView';
import CrmView from './components/CrmView';
import AdminLogin from './components/AdminLogin';
import {
  checkSupabaseConnection,
  getSupabaseStatus,
  dbFetchProducts,
  dbFetchLeads,
  dbFetchSetting,
  dbSaveProduct,
  dbSaveLead,
  dbSaveSetting,
  dbDeleteProduct,
  dbDeleteLead
} from './supabaseService';
import {
  initialSlabSizes,
  initialGraniteTypes,
  initialThicknesses,
  initialFinishTypes,
  initialFobPorts,
  initialLocationsServing,
  initialProducts,
  initialLeads,
  initialFollowUpRules,
  initialLeadStages,
  initialWonProcessSteps
} from './mockData';
import {
  Product,
  SlabSize,
  GraniteType,
  Thickness,
  FinishType,
  FobPort,
  LocationServing,
  Lead,
  FollowUpSequenceRule,
  EmailLog,
  LeadStage,
  WonProcessStep
} from './types';
import { AlertCircle, Bell, X } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'website' | 'cms' | 'crm'>('website');
  const [activeWebTab, setActiveWebTab] = useState<'home' | 'products' | 'bulk-order' | 'contact'>('home');
  const [searchSelectedProductId, setSearchSelectedProductId] = useState<string | null>(null);
  
  // Guard for internal admin apps (CMS & CRM)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('fstone_admin_session_active') === 'true';
  });

  // Listen for specific admin URL routing triggers to enter secure panels
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;

      if (
        path === '/admin' || 
        path === '/admin/' || 
        path.endsWith('/admin') ||
        path.endsWith('/admin/') ||
        search.includes('admin=true') || 
        hash === '#admin' ||
        hash === '#/admin'
      ) {
        setView('crm');
      }
    };

    // Check once at component initialization
    handleUrlRoute();

    // Setup window event listeners for navigation changes without whole page reload
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);

    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, []);

  // --- LOCAL CACHING ENGINE FOR INSTANT FLICKER-FREE LOADS ---
  const getLocalItem = <T,>(key: string, defaultValue: T): T => {
    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const getLocalGlobalSetting = <T,>(settingKey: string, defaultValue: T): T => {
    try {
      const cached = localStorage.getItem('fstone_global_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed[settingKey] !== undefined) {
          return parsed[settingKey] as T;
        }
      }
    } catch (_) {}
    return defaultValue;
  };

  const [globalMinQuantity, setGlobalMinQuantity] = useState<number>(() => getLocalGlobalSetting('globalMinQuantity', 500));

  const [privacyPolicy, setPrivacyPolicy] = useState<string>(() => 
    getLocalGlobalSetting('privacyPolicy', `FieryStone respects client confidentiality under state export protocols. When you submit customized slab requests via our website lead forms, we store your contact configurations, company demographics, and requested stone sizes securely in our logistics CRM database.\n\nWe under no circumstances share client logistics criteria or destination port details with unauthorized competitors or third-party marketing networks.\n\n1. Information We Log\nIncluded: Sourcing names, emails, direct phones, port configurations, and desired slab quantities. We route these statistics selectively to our Visakhapatnam, India HQ sales desk and our St. Charles, MO, USA sales queue.\n\n2. Auto-responder logs\nOur automation engine operates via server-authenticated scripts to send transactional specification confirmations. We store follow-up reminder metrics solely for sales dispatch efficiency.`)
  );

  const [termsConditions, setTermsConditions] = useState<string>(() => 
    getLocalGlobalSetting('termsConditions', `Welcome to FieryStone. Sourcing and exporting raw mineral blocks or slice-gangsaw slabs implies acceptance of our standard container terms:\n\n1. Minimum Order Rule (CMS Bounds)\nAll items configured in our Supplier Catalog carry minimum order thresholds (ranging between 300 to 600 square feet) to absorb wood-crating and crane-handling labor overhead. Submissions below these quantities fail compliance approval inside the CRM portal.\n\n2. Shipping & Freight Port Delivery\nAll pricing values are quoted FOB (Free on Board) at Vizag Port, Chennai Port or Mundra Port. Title transfers completely once wooden crates are loaded onto designated ocean container ships. Risk pass-through is subject to international maritime terms.`)
  );

  const [exportDisclaimer, setExportDisclaimer] = useState<string>(() => 
    getLocalGlobalSetting('exportDisclaimer', `Please examine our standard mineral processing guidelines carefully prior to closing transactional proposals:\n\n1. Natural Mineral Variation:\nGranite, Quartzite, and Basalt are geological materials mined across deep reserves. Natural hairline cracks, quartz clusters, shade variations, and mica grouping formations are authentic details of igneous origin. Slabs will never exhibit identical, repetitive computer-designed patterns.\n\n2. Calibrated Dimensions:\nWhile gangsaw blades slice block structures at high accuracy, dimensional thickness tolerance remains standard at +/- 1.5mm.\n\n3. Port Delays:\nExport times may fluctuate based on customs queue clearance and ocean cargo space schedules at Visakhapatnam (VPT), Chennai (MAA), or Mundra (MUN) ports.`)
  );

  const handleUpdatePrivacyPolicy = (val: string) => {
    setPrivacyPolicy(val);
    localStorage.setItem('fstone_privacy_policy', val);
  };

  const handleUpdateTermsConditions = (val: string) => {
    setTermsConditions(val);
  };

  const handleUpdateExportDisclaimer = (val: string) => {
    setExportDisclaimer(val);
  };

  const [instagramUrl, setInstagramUrl] = useState<string>(() => getLocalGlobalSetting('instagramUrl', 'https://instagram.com/fierystone_traders'));

  const [logoUrl, setLogoUrl] = useState<string>(() => getLocalGlobalSetting('logoUrl', ''));

  const [logoText, setLogoText] = useState<string>(() => getLocalGlobalSetting('logoText', 'FieryStone'));

  const handleUpdateLogoUrl = (val: string) => {
    setLogoUrl(val);
  };

  const handleUpdateLogoText = (val: string) => {
    setLogoText(val);
  };

  const [facebookUrl, setFacebookUrl] = useState<string>(() => getLocalGlobalSetting('facebookUrl', 'https://facebook.com/fierystone_traders'));

  const [youtubeUrl, setYoutubeUrl] = useState<string>(() => getLocalGlobalSetting('youtubeUrl', 'https://youtube.com/c/fierystone_traders'));

  const [linkedinUrl, setLinkedinUrl] = useState<string>(() => getLocalGlobalSetting('linkedinUrl', 'https://linkedin.com/company/fierystone_traders'));

  const handleUpdateInstagramUrl = (val: string) => {
    setInstagramUrl(val);
  };

  const handleUpdateFacebookUrl = (val: string) => {
    setFacebookUrl(val);
  };

  const handleUpdateYoutubeUrl = (val: string) => {
    setYoutubeUrl(val);
  };

  const handleUpdateLinkedinUrl = (val: string) => {
    setLinkedinUrl(val);
  };

  const [products, setProducts] = useState<Product[]>(() => getLocalItem('fstone_products', initialProducts));

  const [slabSizes, setSlabSizes] = useState<SlabSize[]>(() => getLocalItem('fstone_slab_sizes', initialSlabSizes));

  const [graniteTypes, setGraniteTypes] = useState<GraniteType[]>(() => getLocalItem('fstone_granite_types', initialGraniteTypes));

  const [thicknesses, setThicknesses] = useState<Thickness[]>(() => getLocalItem('fstone_thicknesses', initialThicknesses));

  const [finishTypes, setFinishTypes] = useState<FinishType[]>(() => getLocalItem('fstone_finish_types', initialFinishTypes));

  const [fobPorts, setFobPorts] = useState<FobPort[]>(() => getLocalItem('fstone_fob_ports', initialFobPorts));

  const [locationsServing, setLocationsServing] = useState<LocationServing[]>(() => getLocalItem('fstone_locations_serving', initialLocationsServing));

  const [leads, setLeads] = useState<Lead[]>(() => getLocalItem('fstone_leads', initialLeads));

  const [followUpRules, setFollowUpRules] = useState<FollowUpSequenceRule[]>(() => getLocalItem('fstone_followup_rules', initialFollowUpRules));

  const [leadStages, setLeadStages] = useState<LeadStage[]>(() => getLocalItem('fstone_lead_stages', initialLeadStages));

  const [wonProcessSteps, setWonProcessSteps] = useState<WonProcessStep[]>(() => getLocalItem('fstone_won_process_steps', initialWonProcessSteps));

  // --- BRANDING, FAVICON, AND DOCUMENT TITLE SYNCHRONIZER ---
  useEffect(() => {
    // Dynamically update document title based on company brand settings
    document.title = logoText 
      ? `${logoText} Traders — Premium Granite & Stone Exporters` 
      : 'FieryStone Traders — Premium Granite & Stone Exporters';

    const updateFavicon = () => {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        document.getElementsByTagName('head')[0].appendChild(link);
      }

      // Check for user-uploaded fev.png from components folder first, fallback to canvas icon
      const img = new Image();
      img.src = '/src/components/fev.png';
      
      img.onload = () => {
        if (link) link.href = '/src/components/fev.png';
      };

      img.onerror = () => {
        // Fallback: If no fev.png uploaded yet, check if custom logoUrl is available
        if (logoUrl) {
          if (link) link.href = logoUrl;
          return;
        }

        // Draw a pristine vector-like amber stone block canvas fallback favicon
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Sharp rounded stone background block
          ctx.fillStyle = '#1c1917'; // stone-800
          ctx.beginPath();
          ctx.roundRect(8, 8, 112, 112, 28);
          ctx.fill();

          // Smooth thick outer glowing amber margin
          ctx.strokeStyle = '#f59e0b'; // amber-500
          ctx.lineWidth = 6;
          ctx.stroke();

          // Elegant brand character center fill symbol 
          ctx.fillStyle = '#f59e0b'; // amber-500
          ctx.font = 'bold 64px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((logoText || 'FieryStone').charAt(0).toUpperCase(), 64, 66);

          if (link) link.href = canvas.toDataURL('image/png');
        }
      };
    };

    updateFavicon();
  }, [logoText, logoUrl]);

  // --- SUPABASE SYNCHRONIZATION ENGINES ---
  const prevProductsRef = useRef<Product[]>([]);
  const prevLeadsRef = useRef<Lead[]>([]);
  const isInitialLoadExecuted = useRef<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(() => {
    return getSupabaseStatus().isConfigured;
  });

  // Initial Load from Supabase (runs on mount)
  useEffect(() => {
    const initSupabaseData = async () => {
      try {
        const conn = await checkSupabaseConnection();
        if (conn.success) {
          console.log('Supabase connection verified. Loading live cloud states...');
          
          if (conn.productsTableExists) {
            const dbProds = await dbFetchProducts();
            if (dbProds && dbProds.length > 0) {
              setProducts(dbProds);
              prevProductsRef.current = dbProds;
              localStorage.setItem('fstone_products', JSON.stringify(dbProds));
            } else if (dbProds && dbProds.length === 0 && products.length > 0) {
              // Remote table exists but is empty, seed it with local state
              console.log('Products table empty. Seeding with active dataset...');
              for (const p of products) {
                await dbSaveProduct(p);
              }
              prevProductsRef.current = products;
              localStorage.setItem('fstone_products', JSON.stringify(products));
            }
          }

          if (conn.leadsTableExists) {
            const dbLeads = await dbFetchLeads();
            if (dbLeads) {
              const sorted = [...dbLeads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              setLeads(sorted);
              prevLeadsRef.current = sorted;
              localStorage.setItem('fstone_leads', JSON.stringify(sorted));
            }
          }

          if (conn.settingsTableExists) {
            const sz = await dbFetchSetting<SlabSize[] | null>('fstone_slab_sizes', null);
            if (sz) {
              setSlabSizes(sz);
              localStorage.setItem('fstone_slab_sizes', JSON.stringify(sz));
            }

            const gt = await dbFetchSetting<GraniteType[] | null>('fstone_granite_types', null);
            if (gt) {
              setGraniteTypes(gt);
              localStorage.setItem('fstone_granite_types', JSON.stringify(gt));
            }

            const th = await dbFetchSetting<Thickness[] | null>('fstone_thicknesses', null);
            if (th) {
              setThicknesses(th);
              localStorage.setItem('fstone_thicknesses', JSON.stringify(th));
            }

            const ft = await dbFetchSetting<FinishType[] | null>('fstone_finish_types', null);
            if (ft) {
              setFinishTypes(ft);
              localStorage.setItem('fstone_finish_types', JSON.stringify(ft));
            }

            const fp = await dbFetchSetting<FobPort[] | null>('fstone_fob_ports', null);
            if (fp) {
              setFobPorts(fp);
              localStorage.setItem('fstone_fob_ports', JSON.stringify(fp));
            }

            const ls = await dbFetchSetting<LocationServing[] | null>('fstone_locations_serving', null);
            if (ls) {
              setLocationsServing(ls);
              localStorage.setItem('fstone_locations_serving', JSON.stringify(ls));
            }

            const lstages = await dbFetchSetting<LeadStage[] | null>('fstone_lead_stages', null);
            if (lstages) {
              setLeadStages(lstages);
              localStorage.setItem('fstone_lead_stages', JSON.stringify(lstages));
            }

            const wps = await dbFetchSetting<WonProcessStep[] | null>('fstone_won_process_steps', null);
            if (wps) {
              setWonProcessSteps(wps);
              localStorage.setItem('fstone_won_process_steps', JSON.stringify(wps));
            }

            const fr = await dbFetchSetting<FollowUpSequenceRule[] | null>('fstone_followup_rules', null);
            if (fr) {
              setFollowUpRules(fr);
              localStorage.setItem('fstone_followup_rules', JSON.stringify(fr));
            }

            const gsettings = await dbFetchSetting<any>('fstone_global_settings', null);
            if (gsettings) {
              localStorage.setItem('fstone_global_settings', JSON.stringify(gsettings));
              if (gsettings.globalMinQuantity !== undefined) setGlobalMinQuantity(gsettings.globalMinQuantity);
              if (gsettings.privacyPolicy !== undefined) setPrivacyPolicy(gsettings.privacyPolicy);
              if (gsettings.termsConditions !== undefined) setTermsConditions(gsettings.termsConditions);
              if (gsettings.exportDisclaimer !== undefined) setExportDisclaimer(gsettings.exportDisclaimer);
              if (gsettings.instagramUrl !== undefined) setInstagramUrl(gsettings.instagramUrl);
              if (gsettings.facebookUrl !== undefined) setFacebookUrl(gsettings.facebookUrl);
              if (gsettings.youtubeUrl !== undefined) setYoutubeUrl(gsettings.youtubeUrl);
              if (gsettings.linkedinUrl !== undefined) setLinkedinUrl(gsettings.linkedinUrl);
              if (gsettings.logoUrl !== undefined) setLogoUrl(gsettings.logoUrl);
              if (gsettings.logoText !== undefined) setLogoText(gsettings.logoText);
            }
          }
        }
      } catch (err) {
        console.warn('Silent database exception handled:', err);
      } finally {
        isInitialLoadExecuted.current = true;
        setIsInitialLoading(false);
      }
    };
    initSupabaseData();
  }, []);

  // Poll for new leads/updates from Supabase periodically to ensure Admin sees new submissions
  useEffect(() => {
    let interval: number | null = null;
    
    const pollDatabase = async () => {
      try {
        const conn = await checkSupabaseConnection();
        if (conn.success && conn.leadsTableExists) {
          const dbLeads = await dbFetchLeads();
          if (dbLeads) {
            const sorted = dbLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            setLeads(prevLeads => {
              // Compare if the lists have different contents
              const hasChanged = JSON.stringify(prevLeads) !== JSON.stringify(sorted);
              if (hasChanged) {
                prevLeadsRef.current = sorted;
                return sorted;
              }
              return prevLeads;
            });
          }
        }
      } catch (err) {
        console.warn('Silent database poll exception handled:', err);
      }
    };

    if (isInitialLoadExecuted.current) {
      interval = window.setInterval(pollDatabase, 15000); // 15 seconds polling
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isInitialLoadExecuted.current]);

  // Sync products update to Supabase
  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    const syncProducts = async () => {
      const prev = prevProductsRef.current;
      // Check deleted
      for (const p of prev) {
        if (!products.some(c => c.id === p.id)) {
          await dbDeleteProduct(p.id);
        }
      }
      // Check updated or created
      for (const p of products) {
        const item = prev.find(c => c.id === p.id);
        if (!item || JSON.stringify(item) !== JSON.stringify(p)) {
          await dbSaveProduct(p);
        }
      }
      prevProductsRef.current = products;
    };
    syncProducts();
  }, [products]);

  // Sync leads update to Supabase
  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    const syncLeads = async () => {
      const prev = prevLeadsRef.current;
      // Check deleted
      for (const l of prev) {
        if (!leads.some(c => c.id === l.id)) {
          await dbDeleteLead(l.id);
        }
      }
      // Check updated or created
      for (const l of leads) {
        const item = prev.find(c => c.id === l.id);
        if (!item || JSON.stringify(item) !== JSON.stringify(l)) {
          await dbSaveLead(l);
        }
      }
      prevLeadsRef.current = leads;
    };
    syncLeads();
  }, [leads]);

  // Sync settings when configurations change
  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    localStorage.setItem('fstone_slab_sizes', JSON.stringify(slabSizes));
    dbSaveSetting('fstone_slab_sizes', slabSizes);
  }, [slabSizes]);

  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    localStorage.setItem('fstone_granite_types', JSON.stringify(graniteTypes));
    dbSaveSetting('fstone_granite_types', graniteTypes);
  }, [graniteTypes]);

  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    localStorage.setItem('fstone_thicknesses', JSON.stringify(thicknesses));
    dbSaveSetting('fstone_thicknesses', thicknesses);
  }, [thicknesses]);

  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    localStorage.setItem('fstone_finish_types', JSON.stringify(finishTypes));
    dbSaveSetting('fstone_finish_types', finishTypes);
  }, [finishTypes]);

  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    localStorage.setItem('fstone_fob_ports', JSON.stringify(fobPorts));
    dbSaveSetting('fstone_fob_ports', fobPorts);
  }, [fobPorts]);

  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    localStorage.setItem('fstone_locations_serving', JSON.stringify(locationsServing));
    dbSaveSetting('fstone_locations_serving', locationsServing);
  }, [locationsServing]);

  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    localStorage.setItem('fstone_lead_stages', JSON.stringify(leadStages));
    dbSaveSetting('fstone_lead_stages', leadStages);
  }, [leadStages]);

  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    localStorage.setItem('fstone_won_process_steps', JSON.stringify(wonProcessSteps));
    dbSaveSetting('fstone_won_process_steps', wonProcessSteps);
  }, [wonProcessSteps]);

  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    localStorage.setItem('fstone_followup_rules', JSON.stringify(followUpRules));
    dbSaveSetting('fstone_followup_rules', followUpRules);
  }, [followUpRules]);

  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    const gObj = {
      globalMinQuantity,
      privacyPolicy,
      termsConditions,
      exportDisclaimer,
      instagramUrl,
      facebookUrl,
      youtubeUrl,
      linkedinUrl,
      logoUrl,
      logoText
    };
    localStorage.setItem('fstone_global_settings', JSON.stringify(gObj));
    dbSaveSetting('fstone_global_settings', gObj);
  }, [
    globalMinQuantity,
    privacyPolicy,
    termsConditions,
    exportDisclaimer,
    instagramUrl,
    facebookUrl,
    youtubeUrl,
    linkedinUrl,
    logoUrl,
    logoText
  ]);



  // Lead Generation form pipeline connection (Triggered from Public lead form)
  const handleAddNewLead = (newLeadData: Omit<Lead, 'id' | 'createdAt' | 'history' | 'reminders' | 'emailLogs'>) => {
    const assignedId = `lead-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const hasItems = newLeadData.items && newLeadData.items.length > 0;
    const matchedProduct = products.find(p => p.id === newLeadData.productId) || products[0];
    const sizeVal = slabSizes.find(s => s.id === newLeadData.selectedSlabSizeId)?.name || 'Custom Specification';
    const emailSubject = `Inquiry Confirmed #FST-${assignedId.split('-')[1]} | FieryStone Traders`;

    let itemDetailsText = `"${matchedProduct?.title}" (${sizeVal} size, ${newLeadData.quantity} sqft requested)`;
    if (hasItems) {
      itemDetailsText = newLeadData.items!.map((it, idx) => {
        const pTitle = products.find(p => p.id === it.productId)?.title || 'Premium Granite Slab';
        const sName = slabSizes.find(s => s.id === it.selectedSlabSizeId)?.name || 'Custom size';
        return `${idx + 1}. ${pTitle} - ${it.quantity} SQFT (${sName})`;
      }).join('\n');
    }

    const emailBody = `Dear ${newLeadData.customerName},\n\nWe have received your interest in our premium Indian Granite offerings:\n\n${itemDetailsText}\n\nOur administrative export desk is validating container shipping parameters for direct port routing from Visakhapatnam Port. You will receive customized structural drawings and a formal FOB quote draft from our Sales director shortly.\n\nThank you for choosing FieryStone Traders.\n\nWarm regards,\nSales Representative\nFieryStone Traders (Visakhapatnam HQ, India)`;

    const initialAutoLog: EmailLog = {
      id: `elog-auto-${Date.now()}`,
      timestamp,
      recipient: newLeadData.customerEmail,
      subject: emailSubject,
      body: emailBody,
      type: 'auto-responder'
    };

    const coreLead: Lead = {
      ...newLeadData,
      id: assignedId,
      createdAt: timestamp,
      womTracking: {
        paymentReceived: false,
        graniteSourcedAndPacked: false,
        fobCompleted: false
      },
      history: [
        { date: timestamp, status: 'New', comment: 'Lead successfully captured via website web portal.' + (hasItems ? ` (Contains ${newLeadData.items?.length} different granite configuration items)` : '') },
        { date: timestamp, status: 'New', comment: `Server auto-responder email dispatched to: ${newLeadData.customerEmail}` }
      ],
      reminders: [
        {
          id: `rem-auto-1-${Date.now()}`,
          date: new Date(Date.now() + 86400000).toISOString(), // 24 hours later
          notes: `Logistics check: Compile packaging and wood-crate quote for ${newLeadData.customerName}.`,
          completed: false,
          sent: false
        }
      ],
      emailLogs: [initialAutoLog]
    };

    setLeads([coreLead, ...leads]);

    // Instantly save to Supabase database in general background thread
    dbSaveLead(coreLead).then((success) => {
      if (success) {
        console.log(`Lead ${coreLead.id} synced directly to Supabase sandbox.`);
      } else {
        console.warn(`Lead ${coreLead.id} failed direct sync, saved locally for automatic sync.`);
      }
    });

  };

  if (isInitialLoading) {
    return (
      <div id="loading-screen" className="flex flex-col items-center justify-center min-h-screen bg-stone-950 text-stone-200 selection:bg-amber-500">
        <div className="flex flex-col items-center max-w-sm px-6 text-center space-y-6">
          <div className="relative flex items-center justify-center">
            {logoUrl ? (
              <div className="relative flex items-center justify-center">
                <span className="absolute -inset-4 rounded-full bg-amber-500/5 animate-ping"></span>
                <img 
                  src={logoUrl} 
                  alt={logoText || "Logo"} 
                  className="h-16 w-auto object-contain max-h-20 drop-shadow-[0_0_15px_rgba(245,158,11,0.25)] relative z-10 animate-pulse" 
                />
              </div>
            ) : (
              <div className="relative flex items-center justify-center h-16 w-16">
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-500/10 animate-ping"></span>
                <div className="relative h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950 font-sans font-black text-xl shadow-lg border border-amber-400">
                  {(logoText || 'F').charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="font-sans font-bold tracking-wider uppercase text-xs text-stone-400">
              {logoText || 'FieryStone Traders'}
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="portal-root" className="min-h-screen bg-stone-950 text-stone-200 selection:bg-amber-500 selection:text-stone-950 relative">
      
      {/* NAVBAR */}
      {!( (view === 'cms' || view === 'crm') && !isAdminLoggedIn ) && (
        <Navbar 
          currentView={view} 
          setView={setView} 
          leadCount={leads.filter((l) => l.status === 'New').length} 
          activeWebTab={activeWebTab}
          setActiveWebTab={setActiveWebTab}
          products={products}
          onSelectProduct={(productId) => {
            setView('website');
            setActiveWebTab('products');
            setSearchSelectedProductId(productId);
            // Gently scroll to products catalog header
            setTimeout(() => {
              const el = document.getElementById('products-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          logoUrl={logoUrl}
          logoText={logoText}
          isAdminLoggedIn={isAdminLoggedIn}
          onLogout={() => {
            localStorage.removeItem('fstone_admin_session_active');
            setIsAdminLoggedIn(false);
            setView('website');
            setActiveWebTab('home');
          }}
        />
      )}

      {/* CORE DISPLAY DISPATCHER */}
      <main id="portal-main">
        {view === 'website' && (
          <WebsiteView
            products={products}
            slabSizes={slabSizes}
            graniteTypes={graniteTypes}
            thicknesses={thicknesses}
            finishTypes={finishTypes}
            fobPorts={fobPorts}
            locationsServing={locationsServing}
            onAddLead={handleAddNewLead}
            globalMinQuantity={globalMinQuantity}
            activeWebTab={activeWebTab}
            setActiveWebTab={setActiveWebTab}
            searchSelectedProductId={searchSelectedProductId}
            onClearSearchSelectedProduct={() => setSearchSelectedProductId(null)}
            privacyPolicy={privacyPolicy}
            termsConditions={termsConditions}
            exportDisclaimer={exportDisclaimer}
            instagramUrl={instagramUrl}
            facebookUrl={facebookUrl}
            youtubeUrl={youtubeUrl}
            linkedinUrl={linkedinUrl}
            logoUrl={logoUrl}
            logoText={logoText}
          />
        )}

        {view === 'cms' && (
          !isAdminLoggedIn ? (
            <AdminLogin onLoginSuccess={() => {
              setIsAdminLoggedIn(true);
              setView('crm');
            }} />
          ) : (
            <CmsView
              products={products}
              slabSizes={slabSizes}
              graniteTypes={graniteTypes}
              thicknesses={thicknesses}
              finishTypes={finishTypes}
              fobPorts={fobPorts}
              locationsServing={locationsServing}
              onUpdateProducts={setProducts}
              onUpdateSlabSizes={setSlabSizes}
              onUpdateGraniteTypes={setGraniteTypes}
              onUpdateThicknesses={setThicknesses}
              onUpdateFinishTypes={setFinishTypes}
              onUpdateFobPorts={setFobPorts}
              onUpdateLocationsServing={setLocationsServing}
              globalMinQuantity={globalMinQuantity}
              onUpdateGlobalMinQuantity={setGlobalMinQuantity}
              leadStages={leadStages}
              onUpdateLeadStages={setLeadStages}
              wonProcessSteps={wonProcessSteps}
              onUpdateWonProcessSteps={setWonProcessSteps}
              privacyPolicy={privacyPolicy}
              onUpdatePrivacyPolicy={handleUpdatePrivacyPolicy}
              termsConditions={termsConditions}
              onUpdateTermsConditions={handleUpdateTermsConditions}
              exportDisclaimer={exportDisclaimer}
              onUpdateExportDisclaimer={handleUpdateExportDisclaimer}
              instagramUrl={instagramUrl}
              onUpdateInstagramUrl={handleUpdateInstagramUrl}
              facebookUrl={facebookUrl}
              onUpdateFacebookUrl={handleUpdateFacebookUrl}
              youtubeUrl={youtubeUrl}
              onUpdateYoutubeUrl={handleUpdateYoutubeUrl}
              linkedinUrl={linkedinUrl}
              onUpdateLinkedinUrl={handleUpdateLinkedinUrl}
              logoUrl={logoUrl}
              onUpdateLogoUrl={handleUpdateLogoUrl}
              logoText={logoText}
              onUpdateLogoText={handleUpdateLogoText}
              leads={leads}
              onUpdateLeads={setLeads}
            />
          )
        )}

        {view === 'crm' && (
          !isAdminLoggedIn ? (
            <AdminLogin onLoginSuccess={() => {
              setIsAdminLoggedIn(true);
              setView('crm');
            }} />
          ) : (
            <CrmView
              leads={leads}
              products={products}
              slabSizes={slabSizes}
              thicknesses={thicknesses}
              finishTypes={finishTypes}
              followUpRules={followUpRules}
              onUpdateLeads={setLeads}
              onUpdateFollowUpRules={setFollowUpRules}
              leadStages={leadStages}
              wonProcessSteps={wonProcessSteps}
            />
          )
        )}
      </main>



    </div>
  );
}
