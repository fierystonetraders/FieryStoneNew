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
import AccountBookLogin from './components/AccountBookLogin';
import AccountBookView from './components/AccountBookView';
// @ts-ignore
import brandFavicon from './components/Fev.png';
// @ts-ignore
import brandLogo from './components/logo.png';
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
import { safeGetItem, safeSetItem, safeRemoveItem } from './utils/safeStorage';

export default function App() {
  const [view, setView] = useState<'website' | 'cms' | 'crm' | 'secure'>('website');
  const [activeWebTab, setActiveWebTab] = useState<'home' | 'products' | 'bulk-order' | 'contact'>('home');
  const [searchSelectedProductId, setSearchSelectedProductId] = useState<string | null>(null);

  // Guard for internal admin apps (CMS & CRM)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return safeGetItem('fstone_admin_session_active') === 'true';
  });

  // Guard for the /secure Account Book — separate whitelist & session from the CMS/CRM admin login
  const [isSecureLoggedIn, setIsSecureLoggedIn] = useState<boolean>(() => {
    return safeGetItem('fstone_secure_session_active') === 'true';
  });
  const [secureUserEmail, setSecureUserEmail] = useState<string>(() => safeGetItem('fstone_secure_user_email') || '');
  const [secureUserName, setSecureUserName] = useState<string>(() => safeGetItem('fstone_secure_user_name') || '');

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
      } else if (
        path === '/secure' ||
        path === '/secure/' ||
        path.endsWith('/secure') ||
        path.endsWith('/secure/') ||
        search.includes('secure=true') ||
        hash === '#secure' ||
        hash === '#/secure'
      ) {
        setView('secure');
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

  // --- LOCAL CACHING ENGINE FOR INSTANT LOADS ---
  // Cache-first, stale-while-revalidate: read is synchronous (state initializes
  // straight from cache, so the first render already shows real data instead of
  // an empty/mock catalog), and the Supabase fetch effect below still runs on
  // every load to refresh both state and cache in the background. A version tag
  // guards against serving cache from a stale/incompatible shape, and a TTL
  // caps how old data we're willing to show before preferring the empty default.
  // Lead data is deliberately excluded — it's customer PII, only relevant to a
  // logged-in admin, and has no business sitting in every anonymous visitor's
  // browser storage.
  const LOCAL_CACHE_VERSION = 1;
  const LOCAL_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  const getLocalItem = <T,>(key: string, defaultValue: T): T => {
    if (key === 'fstone_leads') return defaultValue;
    try {
      const raw = localStorage.getItem(`${key}_cache`);
      if (!raw) return defaultValue;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.v !== LOCAL_CACHE_VERSION || !parsed.t) return defaultValue;
      if (Date.now() - parsed.t > LOCAL_CACHE_TTL) return defaultValue;
      return parsed.d as T;
    } catch {
      return defaultValue;
    }
  };

  const getLocalGlobalSetting = <T,>(settingKey: string, defaultValue: T): T => {
    const bundle = getLocalItem<any>('fstone_global_settings', null);
    if (bundle && bundle[settingKey] !== undefined) return bundle[settingKey] as T;
    return defaultValue;
  };

  const setLocalItem = (key: string, value: any) => {
    if (key === 'fstone_leads') return;
    try {
      localStorage.setItem(`${key}_cache`, JSON.stringify({ v: LOCAL_CACHE_VERSION, t: Date.now(), d: value }));
    } catch {
      // localStorage full, disabled, or unavailable (private browsing) — no-op
    }
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
    setLocalItem('fstone_privacy_policy', val);
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
      ? `${logoText} Traders — Premium Granite Exporters` 
      : 'FieryStone Traders — Premium Granite Exporters';

    const updateFavicon = () => {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        document.getElementsByTagName('head')[0].appendChild(link);
      }

      // Check for user-uploaded Fev.png from components folder first, fallback to canvas icon
      const img = new Image();
      img.src = brandFavicon;
      
      img.onload = () => {
        if (link) link.href = brandFavicon;
      };

      img.onerror = () => {
        // Fallback: If no Fev.png uploaded yet, check if custom logoUrl is available
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
    if (!getSupabaseStatus().isConfigured) return false;
    // Already have a usable product cache to paint immediately — no need to
    // block the splash screen; the background fetch will refresh it shortly.
    const cachedProducts = getLocalItem<Product[] | null>('fstone_products', null);
    return !(cachedProducts && cachedProducts.length > 0);
  });
  // Surfaces cloud-save failures instead of letting them fail silently in the background —
  // a save can look "done" in the UI while the write to Supabase actually errored out.
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);

  // Initial Load from Supabase (runs on mount)
  useEffect(() => {
    const initSupabaseData = async () => {
      try {
        const conn = await checkSupabaseConnection();
        if (conn.success) {
          console.log('Supabase connection verified. Loading live cloud states...');

          // Fire all reads concurrently instead of one-by-one — cuts initial load
          // from ~12 sequential round trips down to a single parallel batch.
          const tasks: Promise<void>[] = [];

          if (conn.productsTableExists) {
            tasks.push(dbFetchProducts().then((dbProds) => {
              if (dbProds) {
                setProducts(dbProds);
                prevProductsRef.current = dbProds;
                setLocalItem('fstone_products', dbProds);
              }
            }));
          }

          if (conn.leadsTableExists) {
            tasks.push(dbFetchLeads().then((dbLeads) => {
              if (dbLeads) {
                const sorted = [...dbLeads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setLeads(sorted);
                prevLeadsRef.current = sorted;
                setLocalItem('fstone_leads', sorted);
              }
            }));
          }

          if (conn.settingsTableExists) {
            tasks.push(
              dbFetchSetting<SlabSize[] | null>('fstone_slab_sizes', null).then((sz) => {
                if (sz) {
                  setSlabSizes(sz);
                  setLocalItem('fstone_slab_sizes', sz);
                }
              }),
              dbFetchSetting<GraniteType[] | null>('fstone_granite_types', null).then((gt) => {
                if (gt) {
                  setGraniteTypes(gt);
                  setLocalItem('fstone_granite_types', gt);
                }
              }),
              dbFetchSetting<Thickness[] | null>('fstone_thicknesses', null).then((th) => {
                if (th) {
                  setThicknesses(th);
                  setLocalItem('fstone_thicknesses', th);
                }
              }),
              dbFetchSetting<FinishType[] | null>('fstone_finish_types', null).then((ft) => {
                if (ft) {
                  setFinishTypes(ft);
                  setLocalItem('fstone_finish_types', ft);
                }
              }),
              dbFetchSetting<FobPort[] | null>('fstone_fob_ports', null).then((fp) => {
                if (fp) {
                  setFobPorts(fp);
                  setLocalItem('fstone_fob_ports', fp);
                }
              }),
              dbFetchSetting<LocationServing[] | null>('fstone_locations_serving', null).then((ls) => {
                if (ls) {
                  setLocationsServing(ls);
                  setLocalItem('fstone_locations_serving', ls);
                }
              }),
              dbFetchSetting<LeadStage[] | null>('fstone_lead_stages', null).then((lstages) => {
                if (lstages) {
                  setLeadStages(lstages);
                  setLocalItem('fstone_lead_stages', lstages);
                }
              }),
              dbFetchSetting<WonProcessStep[] | null>('fstone_won_process_steps', null).then((wps) => {
                if (wps) {
                  setWonProcessSteps(wps);
                  setLocalItem('fstone_won_process_steps', wps);
                }
              }),
              dbFetchSetting<FollowUpSequenceRule[] | null>('fstone_followup_rules', null).then((fr) => {
                if (fr) {
                  setFollowUpRules(fr);
                  setLocalItem('fstone_followup_rules', fr);
                }
              }),
              dbFetchSetting<any>('fstone_global_settings', null).then((gsettings) => {
                if (gsettings) {
                  setLocalItem('fstone_global_settings', gsettings);
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
              })
            );
          }

          await Promise.all(tasks);
        }
      } catch (err) {
        console.warn('Silent database exception handled:', err);
      } finally {
        isInitialLoadExecuted.current = true;
        setIsInitialLoading(false);
      }
    };
    initSupabaseData();

    // Don't let a slow or degraded backend keep the storefront blank — reveal
    // the site after a short grace period even if the initial Supabase fetch
    // hasn't finished yet. Already-fetched data still hydrates in via setState
    // whenever it lands; this only affects how long the splash screen blocks.
    const revealTimer = window.setTimeout(() => setIsInitialLoading(false), 2000);
    return () => window.clearTimeout(revealTimer);
  }, []);

  // Poll for new leads/updates from Supabase periodically to ensure Admin sees new submissions
  useEffect(() => {
    let interval: number | null = null;
    
    const pollDatabase = async () => {
      try {
        // Fetch leads directly instead of re-running the 3-table connection
        // check every tick — dbFetchLeads already resolves to null on failure.
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
    setLocalItem('fstone_products', products);
    const syncProducts = async () => {
      const prev = prevProductsRef.current;
      let hadFailure = false;
      // Check deleted
      for (const p of prev) {
        if (!products.some(c => c.id === p.id)) {
          const ok = await dbDeleteProduct(p.id);
          if (!ok) hadFailure = true;
        }
      }
      // Check updated or created
      for (const p of products) {
        const item = prev.find(c => c.id === p.id);
        if (!item || JSON.stringify(item) !== JSON.stringify(p)) {
          const ok = await dbSaveProduct(p);
          if (!ok) hadFailure = true;
        }
      }
      prevProductsRef.current = products;
      if (hadFailure) {
        setCloudSyncError('One or more product changes failed to save to the cloud database. Your changes may only exist in this browser tab. Go to CMS → Database tab and click "Sync & Push offline Cache to Supabase" to retry.');
      }
    };
    syncProducts();
  }, [products]);

  // Sync leads update to Supabase
  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    setLocalItem('fstone_leads', leads);
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
    setLocalItem('fstone_slab_sizes', slabSizes);
    dbSaveSetting('fstone_slab_sizes', slabSizes);
  }, [slabSizes]);

  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    setLocalItem('fstone_granite_types', graniteTypes);
    dbSaveSetting('fstone_granite_types', graniteTypes);
  }, [graniteTypes]);

  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    setLocalItem('fstone_thicknesses', thicknesses);
    dbSaveSetting('fstone_thicknesses', thicknesses);
  }, [thicknesses]);

  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    setLocalItem('fstone_finish_types', finishTypes);
    dbSaveSetting('fstone_finish_types', finishTypes);
  }, [finishTypes]);

  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    setLocalItem('fstone_fob_ports', fobPorts);
    dbSaveSetting('fstone_fob_ports', fobPorts);
  }, [fobPorts]);

  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    setLocalItem('fstone_locations_serving', locationsServing);
    dbSaveSetting('fstone_locations_serving', locationsServing);
  }, [locationsServing]);

  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    setLocalItem('fstone_lead_stages', leadStages);
    dbSaveSetting('fstone_lead_stages', leadStages);
  }, [leadStages]);

  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    setLocalItem('fstone_won_process_steps', wonProcessSteps);
    dbSaveSetting('fstone_won_process_steps', wonProcessSteps);
  }, [wonProcessSteps]);

  useEffect(() => {
    if (!isInitialLoadExecuted.current) return;
    setLocalItem('fstone_followup_rules', followUpRules);
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
    setLocalItem('fstone_global_settings', gObj);
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
      reminders: [],
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
            {(logoUrl || brandLogo) ? (
              <div className="relative flex items-center justify-center">
                <span className="absolute -inset-4 rounded-full bg-amber-500/5 animate-ping"></span>
                <img 
                  src={logoUrl || brandLogo} 
                  alt={logoText || "Logo"} 
                  className="h-16 w-auto object-contain max-h-20 drop-shadow-[0_0_15px_rgba(245,158,11,0.25)] relative z-10 animate-pulse" 
                  referrerPolicy="no-referrer"
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
          {/* Title removed under loading image as requested */}
        </div>
      </div>
    );
  }

  return (
    <div id="portal-root" className="min-h-screen bg-stone-950 text-stone-200 selection:bg-amber-500 selection:text-stone-950 relative">

      {/* CLOUD SYNC FAILURE BANNER */}
      {cloudSyncError && (
        <div id="cloud-sync-error-banner" className="sticky top-0 z-[60] bg-rose-600 text-white">
          <div className="mx-auto max-w-7xl px-4 py-2.5 flex items-center gap-3 text-xs sm:text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="flex-1 font-medium leading-snug">{cloudSyncError}</p>
            <button
              onClick={() => setCloudSyncError(null)}
              className="flex-shrink-0 p-1 rounded hover:bg-rose-700 transition"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* NAVBAR — hidden entirely for the /secure Account Book, which has its own header */}
      {view !== 'secure' && !( (view === 'cms' || view === 'crm') && !isAdminLoggedIn ) && (
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
          logoUrl={logoUrl || brandLogo}
          logoText={logoText}
          isAdminLoggedIn={isAdminLoggedIn}
          onLogout={() => {
            safeRemoveItem('fstone_admin_session_active');
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
            logoUrl={logoUrl || brandLogo}
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
              logoUrl={logoUrl || brandLogo}
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

        {view === 'secure' && (
          !isSecureLoggedIn ? (
            <AccountBookLogin onLoginSuccess={(email, name) => {
              setSecureUserEmail(email);
              setSecureUserName(name);
              setIsSecureLoggedIn(true);
            }} />
          ) : (
            <AccountBookView
              currentUserEmail={secureUserEmail}
              currentUserName={secureUserName}
              onLogout={() => {
                setIsSecureLoggedIn(false);
                setSecureUserEmail('');
                setSecureUserName('');
                setView('website');
              }}
            />
          )
        )}
      </main>



    </div>
  );
}
