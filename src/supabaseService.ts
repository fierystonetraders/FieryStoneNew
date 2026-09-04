import { getSupabase } from './supabaseClient';
import { Product, Lead, Expense } from './types';

export const EXPENSE_ATTACHMENTS_BUCKET = 'expense-attachments';

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

-- 4. Product Images Storage Bucket
-- Product photos are uploaded to Supabase Storage (not embedded as base64 in the
-- database) so product records stay small and fast to load. Create the bucket:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 10485760, ARRAY['image/png','image/jpeg','image/webp','image/gif','image/avif'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow open write product images" ON storage.objects;
CREATE POLICY "Allow public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Allow open write product images" ON storage.objects FOR ALL USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

-- 5. Account Book (/secure) — Expense Ledger Table
-- Restricted to signed-in users only (the 3 whitelisted /secure OTP accounts),
-- unlike the wide-open tables above, since this holds financial records.
CREATE TABLE IF NOT EXISTS public.fstone_expenses (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  purpose TEXT NOT NULL,
  "paidTo" TEXT,
  "paidBy" TEXT,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  attachments JSONB DEFAULT '[]',
  "addedByEmail" TEXT,
  "addedByName" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.fstone_expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read expenses" ON public.fstone_expenses;
DROP POLICY IF EXISTS "Allow authenticated write expenses" ON public.fstone_expenses;
CREATE POLICY "Allow authenticated read expenses" ON public.fstone_expenses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated write expenses" ON public.fstone_expenses FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 6. Account Book Attachments Storage Bucket (private — served via signed URLs only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('expense-attachments', 'expense-attachments', false, 10485760, ARRAY['image/png','image/jpeg','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow authenticated access expense attachments" ON storage.objects;
CREATE POLICY "Allow authenticated access expense attachments" ON storage.objects FOR ALL
  USING (bucket_id = 'expense-attachments' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'expense-attachments' AND auth.role() = 'authenticated');
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
    // Run all table probes concurrently instead of one-by-one to cut connection-check latency
    const [productsExist, leadsExist, settingsExist] = await Promise.all([
      testTableConnection('fstone_products'),
      testTableConnection('fstone_leads'),
      testTableConnection('fstone_settings')
    ]);

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

/**
 * ACCOUNT BOOK (/secure) — EXPENSE LEDGER APIs
 */
export const dbFetchExpenses = async (): Promise<Expense[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('fstone_expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.warn('Error fetching expenses from Supabase:', error);
      return null;
    }
    return data as Expense[];
  } catch (err) {
    console.warn('Failed to connect to Supabase expenses table:', err);
    return null;
  }
};

export const dbSaveExpense = async (expense: Expense): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('fstone_expenses')
      .upsert({
        id: expense.id,
        date: expense.date,
        purpose: expense.purpose,
        paidTo: expense.paidTo,
        paidBy: expense.paidBy,
        amount: expense.amount,
        attachments: expense.attachments || [],
        addedByEmail: expense.addedByEmail,
        addedByName: expense.addedByName
      });

    if (error) {
      console.error('Error saving expense to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to upsert expense in Supabase:', err);
    return false;
  }
};

export const dbDeleteExpense = async (id: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('fstone_expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete expense from Supabase:', err);
    return false;
  }
};

/**
 * Uploads a single attachment file into the private expense-attachments bucket
 * under a per-expense folder, returning its storage path (not a public URL —
 * the bucket is private, so viewing requires a short-lived signed URL).
 */
export const dbUploadExpenseAttachment = async (
  expenseId: string,
  file: File
): Promise<{ path: string; name: string } | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${expenseId}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from(EXPENSE_ATTACHMENTS_BUCKET)
      .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false });

    if (error) {
      console.error('Error uploading expense attachment:', error);
      return null;
    }
    return { path, name: file.name };
  } catch (err) {
    console.error('Failed to upload expense attachment:', err);
    return null;
  }
};

/**
 * Resolves storage paths to temporary signed URLs for viewing attachments
 * (the bucket is private, so paths alone aren't downloadable).
 */
export const dbGetExpenseAttachmentUrls = async (
  paths: string[]
): Promise<Record<string, string>> => {
  const supabase = getSupabase();
  if (!supabase || paths.length === 0) return {};
  try {
    const { data, error } = await supabase.storage
      .from(EXPENSE_ATTACHMENTS_BUCKET)
      .createSignedUrls(paths, 3600);

    if (error || !data) {
      console.warn('Error creating signed URLs for expense attachments:', error);
      return {};
    }

    const map: Record<string, string> = {};
    data.forEach((item) => {
      if (item.path && item.signedUrl) {
        map[item.path] = item.signedUrl;
      }
    });
    return map;
  } catch (err) {
    console.warn('Failed to create signed URLs for expense attachments:', err);
    return {};
  }
};
