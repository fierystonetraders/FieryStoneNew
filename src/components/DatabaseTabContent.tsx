import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Play,
  Heart,
  Server,
  CloudLightning,
  Workflow
} from 'lucide-react';
import {
  Product,
  Lead,
  SlabSize,
  GraniteType,
  Thickness,
  FinishType,
  FobPort,
  LocationServing,
  LeadStage,
  WonProcessStep
} from '../types';
import {
  getSupabaseStatus,
  checkSupabaseConnection,
  SUPABASE_SQL_SETUP,
  dbSaveProduct,
  dbSaveLead,
  dbSaveSetting
} from '../supabaseService';

interface DatabaseTabContentProps {
  products: Product[];
  leads: Lead[];
  slabSizes: SlabSize[];
  graniteTypes: GraniteType[];
  thicknesses: Thickness[];
  finishTypes: FinishType[];
  fobPorts: FobPort[];
  locationsServing: LocationServing[];
  leadStages: LeadStage[];
  wonProcessSteps: WonProcessStep[];
  privacyPolicy: string;
  termsConditions: string;
  exportDisclaimer: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  logoUrl: string;
  logoText: string;
  globalMinQuantity?: number;
  onUpdateProducts?: (products: Product[]) => void;
  onUpdateLeads?: (leads: Lead[]) => void;
}

export default function DatabaseTabContent({
  products,
  leads,
  slabSizes,
  graniteTypes,
  thicknesses,
  finishTypes,
  fobPorts,
  locationsServing,
  leadStages,
  wonProcessSteps,
  privacyPolicy,
  termsConditions,
  exportDisclaimer,
  instagramUrl,
  facebookUrl,
  youtubeUrl,
  linkedinUrl,
  logoUrl,
  logoText,
  globalMinQuantity = 500,
  onUpdateProducts,
  onUpdateLeads
}: DatabaseTabContentProps) {
  const [testing, setTesting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  
  // Connection statuses
  const [status, setStatus] = useState<any>({
    isConfigured: false,
    urlConfigured: false,
    anonKeyConfigured: false,
    connectionSuccess: false,
    productsTableExists: false,
    leadsTableExists: false,
    settingsTableExists: false,
    error: null
  });

  // Action status logs
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadLogs, setUploadLogs] = useState<string[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const runConnectionDiagnostics = async () => {
    setTesting(true);
    setUploadLogs([]);
    try {
      const basicStatus = getSupabaseStatus();
      const conn = await checkSupabaseConnection();
      
      setStatus({
        isConfigured: basicStatus.isConfigured,
        urlConfigured: basicStatus.urlConfigured,
        anonKeyConfigured: basicStatus.anonKeyConfigured,
        connectionSuccess: conn.success,
        productsTableExists: conn.productsTableExists,
        leadsTableExists: conn.leadsTableExists,
        settingsTableExists: conn.settingsTableExists,
        error: conn.error
      });
    } catch (err: any) {
      setStatus((prev: any) => ({
        ...prev,
        connectionSuccess: false,
        error: err.message || 'Failure executing Diagnostics lookup.'
      }));
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    runConnectionDiagnostics();
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUploadLocalCache = async () => {
    if (uploading) return;
    setUploading(true);
    setUploadSuccess(null);
    const logs: string[] = [];
    const addLog = (msg: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setUploadLogs([...logs]);
    };

    try {
      addLog('Initiating bulk state serialization transfer payload...');
      
      // 1. Sync Products
      addLog(`Found ${products.length} local catalog product definitions. Initiating transfer...`);
      for (const p of products) {
        addLog(`Syncing Product ID "${p.id}": ${p.title}...`);
        const ok = await dbSaveProduct(p);
        if (!ok) throw new Error(`Product sync failed on item ID: ${p.id}`);
      }
      addLog('✅ All raw product listings successfully injected into fstone_products table.');

      // 2. Sync Leads
      addLog(`Found ${leads.length} logistics inquiry lead sheets. Initiating transfer...`);
      for (const l of leads) {
        addLog(`Syncing Lead ID "${l.id}": ${l.customerName} (${l.customerEmail})...`);
        const ok = await dbSaveLead(l);
        if (!ok) throw new Error(`Lead sync failed on lead ID: ${l.id}`);
      }
      addLog('✅ All lead entries successfully written to fstone_leads table.');

      // 3. Sync Settings Master lists
      addLog('Syncing master specs and legal compliance drafts...');
      await dbSaveSetting('fstone_slab_sizes', slabSizes);
      await dbSaveSetting('fstone_granite_types', graniteTypes);
      await dbSaveSetting('fstone_thicknesses', thicknesses);
      await dbSaveSetting('fstone_finish_types', finishTypes);
      await dbSaveSetting('fstone_fob_ports', fobPorts);
      await dbSaveSetting('fstone_locations_serving', locationsServing);
      await dbSaveSetting('fstone_lead_stages', leadStages);
      await dbSaveSetting('fstone_won_process_steps', wonProcessSteps);
      
      // Global single-key setting
      await dbSaveSetting('fstone_global_settings', {
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
      });
      addLog('✅ Configurations and enterprise legal setting parameters written successfully.');

      addLog('🎉 BULK CACHE SYNC COMPLETE! Your Supabase database is now in sync.');
      setUploadSuccess('Successfully synchronized all offline-device workspace records into your remote Supabase cloud backend! Every user visiting this site can now submit enquiries that appear live in your CRM central desk.');
      
      // Refresh diagnostics
      await runConnectionDiagnostics();
    } catch (err: any) {
      addLog(`❌ ABORTED TRANSITION: ${err.message}`);
      setUploadSuccess(null);
    } finally {
      setUploading(false);
    }
  };

  const hasMissingTables = status.isConfigured && (!status.productsTableExists || !status.leadsTableExists || !status.settingsTableExists);

  return (
    <div className="space-y-6">
      
      {/* CONNECTION DIAGNOSTIC CARD */}
      <div className="bg-stone-900 border border-stone-850 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl border ${
              status.connectionSuccess && !hasMissingTables 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : hasMissingTables
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            }`}>
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">Supabase Connection Diagnostics</h3>
              <p className="text-xs text-stone-500">Live configuration parameters & status lookup.</p>
            </div>
          </div>

          <button
            onClick={runConnectionDiagnostics}
            disabled={testing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-xs font-mono font-bold text-stone-200 uppercase transition"
          >
            <RefreshCw className={`h-3 w-3 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing...' : 'Test Status'}
          </button>
        </div>

        {/* STATUS BAR PILLS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-stone-950/80 rounded-lg p-3 border border-stone-850 space-y-1">
            <span className="text-[10px] text-stone-500 font-mono block uppercase">Credentials Set</span>
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <span className={`h-2 w-2 rounded-full ${status.isConfigured ? 'bg-emerald-500' : 'bg-rose-400'}`} />
              {status.isConfigured ? 'VITE_ Keys Loaded' : 'Keys Missing'}
            </div>
          </div>

          <div className="bg-stone-950/80 rounded-lg p-3 border border-stone-850 space-y-1">
            <span className="text-[10px] text-stone-500 font-mono block uppercase">Base Schema (Products)</span>
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <span className={`h-2 w-2 rounded-full ${status.productsTableExists ? 'bg-emerald-500' : 'bg-rose-400'}`} />
              {status.productsTableExists ? 'fstone_products OK' : 'Table Missing'}
            </div>
          </div>

          <div className="bg-stone-950/80 rounded-lg p-3 border border-stone-850 space-y-1">
            <span className="text-[10px] text-stone-500 font-mono block uppercase">Active Inquiries table</span>
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <span className={`h-2 w-2 rounded-full ${status.leadsTableExists ? 'bg-emerald-500' : 'bg-rose-400'}`} />
              {status.leadsTableExists ? 'fstone_leads OK' : 'Table Missing'}
            </div>
          </div>

          <div className="bg-stone-950/80 rounded-lg p-3 border border-stone-850 space-y-1">
            <span className="text-[10px] text-stone-500 font-mono block uppercase">Settings Repository</span>
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <span className={`h-2 w-2 rounded-full ${status.settingsTableExists ? 'bg-emerald-500' : 'bg-rose-400'}`} />
              {status.settingsTableExists ? 'fstone_settings OK' : 'Table Missing'}
            </div>
          </div>
        </div>

        {/* VERIFICATION FEEDBACK */}
        <div>
          {status.connectionSuccess && !hasMissingTables && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex gap-3 text-xs text-stone-300">
              <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-white text-emerald-400">Excellent! Your Supabase workspace is fully connected and ready.</p>
                <p>All tables are active (`fstone_products`, `fstone_leads`, and `fstone_settings`). Data entered by visitors via lead forms saves directly to Supabase and is instantly visible to administrators.</p>
              </div>
            </div>
          )}

          {status.isConfigured && hasMissingTables && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex gap-3 text-xs text-stone-300">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <p className="font-bold text-white text-amber-400">Database Tables Missing!</p>
                <p>Your Supabase API keys are correctly configured, but one or more critical tables are missing inside your database. Run the SQL schema script below in your Supabase SQL Editor to instantly generate them.</p>
              </div>
            </div>
          )}

          {!status.isConfigured && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 flex gap-3 text-xs text-stone-300 text-left">
              <Server className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-white text-rose-400">Environment Verification Failed</p>
                <p>No active API keys found for Supabase. To establish persistent storage that syncs between computers:</p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-stone-400 pt-1">
                  <li>Open your <strong>Settings / Secrets</strong> menu inside AI Studio.</li>
                  <li>Declare two environment variables: <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong>.</li>
                  <li>Assign your variables the unique Project URL and Anon API key found inside your Supabase Settings panel under <strong>API</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {status.error && (
            <div className="rounded-lg border border-rose-500/25 bg-rose-500/10 p-3 mt-3 text-xs font-mono text-rose-400">
              <strong>Error Trace:</strong> {status.error}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* MANUAL UPLOAD CONTAINER */}
        <div className="bg-stone-900 border border-stone-850 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
            <CloudLightning className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Upload / Synchronize Cached Data</h3>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed">
            Because this application initializes using offline local-device storage when first loaded, your existing Granite catalogs and Lead mock logs might still be trapped on your current device browser. 
            Click below to package and push all active setup profiles, layouts, and contact sheets into your remote Supabase database.
          </p>

          <div className="pt-2">
            <button
              onClick={handleUploadLocalCache}
              disabled={uploading || !status.connectionSuccess || hasMissingTables}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition ${
                !status.connectionSuccess || hasMissingTables
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-450 text-stone-950 cursor-pointer shadow-md'
              }`}
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running cloud serialisation...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  Sync & Push offline Cache to Supabase
                </>
              )}
            </button>
            {(!status.connectionSuccess || hasMissingTables) && (
              <span className="text-[10px] text-stone-500 mt-1.5 block text-center italic">
                * Available only when database credentials and matching tables are verified.
              </span>
            )}
          </div>

          {/* UPLOAD PROGRESS LOG MONITOR */}
          {uploadLogs.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] text-stone-400 font-mono uppercase block">Real-time Transmission Logs:</span>
              <div className="h-48 rounded bg-stone-950 p-3 font-mono text-[10px] text-stone-300 border border-stone-850 overflow-y-auto space-y-1 scrollbar-thin">
                {uploadLogs.map((log, index) => (
                  <div key={index} className="leading-snug">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-emerald-400 leading-relaxed pt-2">
              {uploadSuccess}
            </div>
          )}
        </div>

        {/* SQL SCHEMA GENERATION COPY-PASTE */}
        <div className="bg-stone-900 border border-stone-850 rounded-xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">SQL Schema Script</h3>
              </div>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-950/60 hover:bg-stone-950 border border-stone-800 hover:border-amber-500/30 text-[10.5px] font-mono text-stone-300 transition"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-stone-400" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              Open your <strong>Supabase Dashboard</strong>, select your project, open the <strong>SQL Editor</strong> tab, click <strong>New Query</strong>, paste the query below, then click <strong>Run</strong>.
            </p>

            <div className="rounded-lg bg-stone-950 p-3.5 border border-stone-850 h-56 overflow-y-auto">
              <pre className="font-mono text-[10px] text-amber-500/80 leading-normal select-all">
                {SUPABASE_SQL_SETUP}
              </pre>
            </div>
          </div>

          <div className="text-[10px] text-stone-500 italic text-left pt-2 border-t border-stone-850/60 flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-amber-500/50 fill-current flex-shrink-0" />
            <span>Establishing schemas correctly bridges raw website submissions with your centralized administrative desktop.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
