/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WebsiteView from './components/WebsiteView';
import CmsView from './components/CmsView';
import CrmView from './components/CrmView';
import AdminLogin from './components/AdminLogin';
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
        setView('cms');
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

  const [globalMinQuantity, setGlobalMinQuantity] = useState<number>(() => {
    const data = localStorage.getItem('fstone_global_min_quantity');
    return data ? Number(data) : 500;
  });

  const [privacyPolicy, setPrivacyPolicy] = useState<string>(() => {
    const data = localStorage.getItem('fstone_privacy_policy');
    return data || `FieryStone respects client confidentiality under state export protocols. When you submit customized slab requests via our website lead forms, we store your contact configurations, company demographics, and requested stone sizes securely in our logistics CRM database.\n\nWe under no circumstances share client logistics criteria or destination port details with unauthorized competitors or third-party marketing networks.\n\n1. Information We Log\nIncluded: Sourcing names, emails, direct phones, port configurations, and desired slab quantities. We route these statistics selectively to our Visakhapatnam, India HQ sales desk and our St. Charles, MO, USA sales queue.\n\n2. Auto-responder logs\nOur automation engine operates via server-authenticated scripts to send transactional specification confirmations. We store follow-up reminder metrics solely for sales dispatch efficiency.`;
  });

  const [termsConditions, setTermsConditions] = useState<string>(() => {
    const data = localStorage.getItem('fstone_terms_conditions');
    return data || `Welcome to FieryStone. Sourcing and exporting raw mineral blocks or slice-gangsaw slabs implies acceptance of our standard container terms:\n\n1. Minimum Order Rule (CMS Bounds)\nAll items configured in our Supplier Catalog carry minimum order thresholds (ranging between 300 to 600 square feet) to absorb wood-crating and crane-handling labor overhead. Submissions below these quantities fail compliance approval inside the CRM portal.\n\n2. Shipping & Freight Port Delivery\nAll pricing values are quoted FOB (Free on Board) at Vizag Port, Chennai Port or Mundra Port. Title transfers completely once wooden crates are loaded onto designated ocean container ships. Risk pass-through is subject to international maritime terms.`;
  });

  const [exportDisclaimer, setExportDisclaimer] = useState<string>(() => {
    const data = localStorage.getItem('fstone_export_disclaimer');
    return data || `Please examine our standard mineral processing guidelines carefully prior to closing transactional proposals:\n\n1. Natural Mineral Variation:\nGranite, Quartzite, and Basalt are geological materials mined across deep reserves. Natural hairline cracks, quartz clusters, shade variations, and mica grouping formations are authentic details of igneous origin. Slabs will never exhibit identical, repetitive computer-designed patterns.\n\n2. Calibrated Dimensions:\nWhile gangsaw blades slice block structures at high accuracy, dimensional thickness tolerance remains standard at +/- 1.5mm.\n\n3. Port Delays:\nExport times may fluctuate based on customs queue clearance and ocean cargo space schedules at Visakhapatnam (VPT), Chennai (MAA), or Mundra (MUN) ports.`;
  });

  const handleUpdatePrivacyPolicy = (val: string) => {
    setPrivacyPolicy(val);
    localStorage.setItem('fstone_privacy_policy', val);
  };

  const handleUpdateTermsConditions = (val: string) => {
    setTermsConditions(val);
    localStorage.setItem('fstone_terms_conditions', val);
  };

  const handleUpdateExportDisclaimer = (val: string) => {
    setExportDisclaimer(val);
    localStorage.setItem('fstone_export_disclaimer', val);
  };

  const [instagramUrl, setInstagramUrl] = useState<string>(() => {
    return localStorage.getItem('fstone_instagram_url') || 'https://instagram.com/fierystone_traders';
  });

  const [logoUrl, setLogoUrl] = useState<string>(() => {
    return localStorage.getItem('fstone_logo_url') || '';
  });

  const [logoText, setLogoText] = useState<string>(() => {
    return localStorage.getItem('fstone_logo_text') || 'FieryStone';
  });

  const handleUpdateLogoUrl = (val: string) => {
    setLogoUrl(val);
    localStorage.setItem('fstone_logo_url', val);
  };

  const handleUpdateLogoText = (val: string) => {
    setLogoText(val);
    localStorage.setItem('fstone_logo_text', val);
  };

  const [facebookUrl, setFacebookUrl] = useState<string>(() => {
    return localStorage.getItem('fstone_facebook_url') || 'https://facebook.com/fierystone_traders';
  });

  const [youtubeUrl, setYoutubeUrl] = useState<string>(() => {
    return localStorage.getItem('fstone_youtube_url') || 'https://youtube.com/c/fierystone_traders';
  });

  const [linkedinUrl, setLinkedinUrl] = useState<string>(() => {
    return localStorage.getItem('fstone_linkedin_url') || 'https://linkedin.com/company/fierystone_traders';
  });

  const handleUpdateInstagramUrl = (val: string) => {
    setInstagramUrl(val);
    localStorage.setItem('fstone_instagram_url', val);
  };

  const handleUpdateFacebookUrl = (val: string) => {
    setFacebookUrl(val);
    localStorage.setItem('fstone_facebook_url', val);
  };

  const handleUpdateYoutubeUrl = (val: string) => {
    setYoutubeUrl(val);
    localStorage.setItem('fstone_youtube_url', val);
  };

  const handleUpdateLinkedinUrl = (val: string) => {
    setLinkedinUrl(val);
    localStorage.setItem('fstone_linkedin_url', val);
  };

  const [products, setProducts] = useState<Product[]>(() => {
    const data = localStorage.getItem('fstone_products');
    return data ? JSON.parse(data) : initialProducts;
  });

  const [slabSizes, setSlabSizes] = useState<SlabSize[]>(() => {
    const data = localStorage.getItem('fstone_slab_sizes');
    return data ? JSON.parse(data) : initialSlabSizes;
  });

  const [graniteTypes, setGraniteTypes] = useState<GraniteType[]>(() => {
    const data = localStorage.getItem('fstone_granite_types');
    return data ? JSON.parse(data) : initialGraniteTypes;
  });

  const [thicknesses, setThicknesses] = useState<Thickness[]>(() => {
    const data = localStorage.getItem('fstone_thicknesses');
    return data ? JSON.parse(data) : initialThicknesses;
  });

  const [finishTypes, setFinishTypes] = useState<FinishType[]>(() => {
    const data = localStorage.getItem('fstone_finish_types');
    return data ? JSON.parse(data) : initialFinishTypes;
  });

  const [fobPorts, setFobPorts] = useState<FobPort[]>(() => {
    const data = localStorage.getItem('fstone_fob_ports');
    return data ? JSON.parse(data) : initialFobPorts;
  });

  const [locationsServing, setLocationsServing] = useState<LocationServing[]>(() => {
    const data = localStorage.getItem('fstone_locations_serving');
    return data ? JSON.parse(data) : initialLocationsServing;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const data = localStorage.getItem('fstone_leads');
    return data ? JSON.parse(data) : initialLeads;
  });

  const [followUpRules, setFollowUpRules] = useState<FollowUpSequenceRule[]>(() => {
    const data = localStorage.getItem('fstone_followup_rules');
    return data ? JSON.parse(data) : initialFollowUpRules;
  });

  const [leadStages, setLeadStages] = useState<LeadStage[]>(() => {
    const data = localStorage.getItem('fstone_lead_stages');
    return data ? JSON.parse(data) : initialLeadStages;
  });

  const [wonProcessSteps, setWonProcessSteps] = useState<WonProcessStep[]>(() => {
    const data = localStorage.getItem('fstone_won_process_steps');
    return data ? JSON.parse(data) : initialWonProcessSteps;
  });

  // Floating live-feed notifications triggers
  const [toastNotification, setToastNotification] = useState<{
    id: string;
    title: string;
    message: string;
  } | null>(null);

  // Sync to local storage when state objects change (separately to bypass coupling)
  useEffect(() => {
    localStorage.setItem('fstone_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('fstone_slab_sizes', JSON.stringify(slabSizes));
  }, [slabSizes]);

  useEffect(() => {
    localStorage.setItem('fstone_granite_types', JSON.stringify(graniteTypes));
  }, [graniteTypes]);

  useEffect(() => {
    localStorage.setItem('fstone_thicknesses', JSON.stringify(thicknesses));
  }, [thicknesses]);

  useEffect(() => {
    localStorage.setItem('fstone_finish_types', JSON.stringify(finishTypes));
  }, [finishTypes]);

  useEffect(() => {
    localStorage.setItem('fstone_fob_ports', JSON.stringify(fobPorts));
  }, [fobPorts]);

  useEffect(() => {
    localStorage.setItem('fstone_locations_serving', JSON.stringify(locationsServing));
  }, [locationsServing]);

  useEffect(() => {
    localStorage.setItem('fstone_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('fstone_followup_rules', JSON.stringify(followUpRules));
  }, [followUpRules]);

  useEffect(() => {
    localStorage.setItem('fstone_lead_stages', JSON.stringify(leadStages));
  }, [leadStages]);

  useEffect(() => {
    localStorage.setItem('fstone_won_process_steps', JSON.stringify(wonProcessSteps));
  }, [wonProcessSteps]);

  useEffect(() => {
    localStorage.setItem('fstone_global_min_quantity', String(globalMinQuantity));
  }, [globalMinQuantity]);

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

    // Push smart toast notification
    setToastNotification({
      id: assignedId,
      title: 'Incoming CRM Sourcing Lead!',
      message: hasItems 
        ? `Client ${newLeadData.customerName} requested bulk pricing for ${newLeadData.items?.length} granite styles. Welcome sequence initialized.`
        : `Client ${newLeadData.customerName} requested ${newLeadData.quantity} sqft of "${matchedProduct?.title}". Welcome sequence initialized.`
    });
  };

  // Auto clean toaster
  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

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
            <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />
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
            />
          )
        )}

        {view === 'crm' && (
          !isAdminLoggedIn ? (
            <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />
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

      {/* FLOATING TOASTS NOTIFIER */}
      {toastNotification && (
        <div id="toast-banner-wrapper" className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div id="toast-banner" className="flex items-start gap-3 w-80 max-w-sm rounded-xl border border-amber-500/30 bg-stone-900 p-4 shadow-2xl shadow-stone-950/80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-550 flex-shrink-0">
              <Bell className="h-4.5 w-4.5 text-amber-550 animate-bounce" />
            </div>
            <div className="flex-1 font-sans">
              <h5 className="text-xs font-bold text-white uppercase font-mono tracking-widest">{toastNotification.title}</h5>
              <p className="text-[11px] text-stone-400 mt-1 leading-normal">{toastNotification.message}</p>
              
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setView('crm');
                    setToastNotification(null);
                  }}
                  className="rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-2.5 py-1 text-[9px] uppercase tracking-wider transition"
                >
                  Manage lead
                </button>
                <button
                  onClick={() => setToastNotification(null)}
                  className="rounded bg-stone-800 hover:bg-stone-750 text-stone-300 font-mono px-2 py-1 text-[9px] uppercase"
                >
                  Acknowledge
                </button>
              </div>
            </div>
            <button onClick={() => setToastNotification(null)} className="text-stone-500 hover:text-stone-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
