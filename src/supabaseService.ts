import { getSupabase } from './supabaseClient';
import { Product, Lead } from './types';

// Let's define the status of Supabase configuration
export interface SupabaseConfigStatus {
  isConfigured: boolean;
  urlConfigured: boolean;
  anonKeyConfigured: boolean;
  connectionTesting: boolean;
  connectionSuccess: boolean;
  errorMessage: string | null;
}

export const getSupabaseStatus = (): SupabaseConfigStatus => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  return {
    isConfigured: !!(url && key),
    urlConfigured: !!url,
    anonKeyConfigured: !!key,
    connectionTesting: false,
    connectionSuccess: false,
    errorMessage: null
  };
};

/**
 * SQL template to help developers initialize tables in their Supabase console.
 */
export const SUPABASE_SQL_SETUP = `-- Copy and run this in your Supabase SQL Editor:

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.fstone_products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT,
  images JSONB,
  description TEXT,
  "slabSizeIds" JSONB,
  "graniteTypeIds" JSONB,
  "thicknessIds" JSONB,
  "finishTypeIds" JSONB,
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  "minQuantity" INTEGER DEFAULT 500,
  "fobPortIds" JSONB,
  "locationsServingIds" JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Add standard open policy for developers
ALTER TABLE public.fstone_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read products" ON public.fstone_products;
DROP POLICY IF EXISTS "Allow open all products" ON public.fstone_products;
CREATE POLICY "Allow public read products" ON public.fstone_products FOR SELECT USING (true);
CREATE POLICY "Allow open all products" ON public.fstone_products FOR ALL USING (true) WITH CHECK (true);

-- 2. Create Leads/Inquiries Table
CREATE TABLE IF NOT EXISTS public.fstone_leads (
  id TEXT PRIMARY KEY,
  "createdAt" TEXT,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "customerPhone" TEXT,
  "customerCompany" TEXT,
  "customerCountry" TEXT,
  "productId" TEXT,
  "selectedSlabSizeId" TEXT,
  "selectedThicknessId" TEXT,
  "selectedFinishTypeId" TEXT,
  quantity INTEGER,
  notes TEXT,
  status TEXT,
  history JSONB,
  reminders JSONB,
  "emailLogs" JSONB,
  items JSONB,
  "womTracking" JSONB,
  "wonProgress" JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.fstone_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert leads" ON public.fstone_leads;
DROP POLICY IF EXISTS "Allow open all leads" ON public.fstone_leads;
CREATE POLICY "Allow public insert leads" ON public.fstone_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow open all leads" ON public.fstone_leads FOR ALL USING (true) WITH CHECK (true);

-- 3. Create Settings & Master Configuration Table
CREATE TABLE IF NOT EXISTS public.fstone_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.fstone_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read settings" ON public.fstone_settings;
DROP POLICY IF EXISTS "Allow open all settings" ON public.fstone_settings;
CREATE POLICY "Allow public read settings" ON public.fstone_settings FOR SELECT USING (true);
CREATE POLICY "Allow open all settings" ON public.fstone_settings FOR ALL USING (true) WITH CHECK (true);
`;

/**
 * Helper to check if a table exists by fetching 1 row
 */
async function testTableConnection(tableName: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from(tableName).select('*').limit(1);
    // If table doesn't exist, we usually get a PG error code '42P01' (undefined_table)
    if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export const checkSupabaseConnection = async (): Promise<{
  success: boolean;
  productsTableExists: boolean;
  leadsTableExists: boolean;
  settingsTableExists: boolean;
  error: string | null;
}> => {
  const status = getSupabaseStatus();
  const supabase = getSupabase();
  if (!status.isConfigured || !supabase) {
    return {
      success: false,
      productsTableExists: false,
      leadsTableExists: false,
      settingsTableExists: false,
      error: 'Supabase credentials are not set in the environment variables.'
    };
  }

  try {
    // Try listing any settings or products as validation
    const { data, error } = await supabase.from('fstone_settings').select('key').limit(1);
    
    const productsExist = await testTableConnection('fstone_products');
    const leadsExist = await testTableConnection('fstone_leads');
    const settingsExist = await testTableConnection('fstone_settings');

    if (error && error.code !== '42P01') {
      return {
        success: false,
        productsTableExists: productsExist,
        leadsTableExists: leadsExist,
        settingsTableExists: settingsExist,
        error: error.message
      };
    }

    return {
      success: productsExist || leadsExist || settingsExist,
      productsTableExists: productsExist,
      leadsTableExists: leadsExist,
      settingsTableExists: settingsExist,
      error: null
    };
  } catch (err: any) {
    return {
      success: false,
      productsTableExists: false,
      leadsTableExists: false,
      settingsTableExists: false,
      error: err.message || 'Unknown network error'
    };
  }
};

/**
 * PRODUCTS SYNC APIs
 */
export const dbFetchProducts = async (): Promise<Product[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('fstone_products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Error fetching products from Supabase:', error);
      return null;
    }
    return data as Product[];
  } catch (err) {
    console.warn('Failed to connect to Supabase products table:', err);
    return null;
  }
};

export const dbSaveProduct = async (product: Product): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('fstone_products')
      .upsert({
        id: product.id,
        title: product.title,
        image: product.image,
        images: product.images || [],
        description: product.description,
        slabSizeIds: product.slabSizeIds,
        graniteTypeIds: product.graniteTypeIds,
        thicknessIds: product.thicknessIds,
        finishTypeIds: product.finishTypeIds,
        active: product.active,
        featured: product.featured,
        minQuantity: product.minQuantity,
        fobPortIds: product.fobPortIds,
        locationsServingIds: product.locationsServingIds
      });

    if (error) {
      console.error('Error saving product to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to upsert product in Supabase:', err);
    return false;
  }
};

export const dbDeleteProduct = async (id: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('fstone_products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete product from Supabase:', err);
    return false;
  }
};

/**
 * LEADS SYNC APIs
 */
export const dbFetchLeads = async (): Promise<Lead[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('fstone_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching leads from Supabase:', error);
      return null;
    }
    return data as Lead[];
  } catch (err) {
    console.warn('Failed to connect to Supabase leads table:', err);
    return null;
  }
};

export const dbSaveLead = async (lead: Lead): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('fstone_leads')
      .upsert({
        id: lead.id,
        createdAt: lead.createdAt,
        customerName: lead.customerName,
        customerEmail: lead.customerEmail,
        customerPhone: lead.customerPhone,
        customerCompany: lead.customerCompany,
        customerCountry: lead.customerCountry,
        productId: lead.productId,
        selectedSlabSizeId: lead.selectedSlabSizeId,
        selectedThicknessId: lead.selectedThicknessId,
        selectedFinishTypeId: lead.selectedFinishTypeId,
        quantity: lead.quantity,
        notes: lead.notes,
        status: lead.status,
        history: lead.history,
        reminders: lead.reminders,
        emailLogs: lead.emailLogs,
        items: lead.items || [],
        womTracking: lead.womTracking || {},
        wonProgress: lead.wonProgress || {}
      });

    if (error) {
      console.error('Error saving lead to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to upsert lead in Supabase:', err);
    return false;
  }
};

export const dbDeleteLead = async (id: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('fstone_leads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting lead from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete lead from Supabase:', err);
    return false;
  }
};

/**
 * GENERAL CONFIG / SETTINGS SYNC APIs
 */
export const dbFetchSetting = async <T>(key: string, defaultValue: T): Promise<T> => {
  const supabase = getSupabase();
  if (!supabase) return defaultValue;
  try {
    const { data, error } = await supabase
      .from('fstone_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) {
      return defaultValue;
    }
    return data.value as T;
  } catch (err) {
    return defaultValue;
  }
};

export const dbSaveSetting = async <T>(key: string, value: T): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('fstone_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error(`Error saving setting ${key} to Supabase:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Failed to upsert settings for ${key}:`, err);
    return false;
  }
};
