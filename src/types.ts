/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SlabSize {
  id: string;
  name: string; // e.g. "3200 x 1600 mm (Jumbo)"
  active: boolean;
}

export interface GraniteType {
  id: string;
  name: string; // e.g. "Pegmatite Granite", "Premium Quartzite"
  active: boolean;
}

export interface Thickness {
  id: string;
  name: string; // e.g. "20 mm", "30 mm"
  active: boolean;
}

export interface FinishType {
  id: string;
  name: string; // e.g. "Mirror Polished", "Leathered Satin"
  active: boolean;
}

export interface FobPort {
  id: string;
  name: string; // e.g. "Visakhapatnam Port (Andhra Pradesh)"
  active: boolean;
}

export interface LocationServing {
  id: string;
  name: string; // e.g. "United States", "European Union"
  active: boolean;
}

export interface Product {
  id: string;
  title: string;
  image: string;
  images?: string[]; // Optional array for multiple product images
  description: string;
  slabSizeIds: string[]; // Linked master relation
  graniteTypeIds: string[]; // Linked master relation
  thicknessIds: string[]; // Linked master relation
  finishTypeIds: string[]; // Linked master relation
  active: boolean;
  featured: boolean;
  minQuantity: number; // e.g. 450 sqft
  fobPortIds: string[];
  locationsServingIds: string[];
}

export interface LeadHistoryItem {
  date: string;
  status: string;
  comment: string;
}

export interface LeadReminder {
  id: string;
  date: string;
  notes: string;
  completed: boolean;
  sent: boolean;
}

export interface EmailLog {
  id: string;
  timestamp: string;
  recipient: string;
  subject: string;
  body: string;
  type: 'auto-responder' | 'follow-up' | 'manual';
}

export interface LeadItem {
  id: string;
  productId: string;
  selectedSlabSizeId: string;
  selectedThicknessId: string;
  selectedFinishTypeId: string;
  quantity: number;
}

export interface WorkOrderTracking {
  paymentReceived: boolean;
  paymentReceivedDate?: string;
  graniteSourcedAndPacked: boolean;
  graniteSourcedAndPackedDate?: string;
  fobCompleted: boolean;
  fobCompletedDate?: string;
}

export interface LeadStage {
  id: string;
  name: string; // e.g. "New", "Contacted", "In Discussion", "Proposal Sent", "Closed Won", "Closed Lost"
  active: boolean;
}

export interface WonProcessStep {
  id: string;
  name: string; // e.g. "Payment Received", "Granite Sourced & Packed", "Export FOB customs Cleared"
  active: boolean;
}

export interface LedStatusProgress {
  completed: boolean;
  date?: string;
}

export interface Lead {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string;
  customerCountry: string; // e.g. "USA" or "India" or "Other"
  productId: string;
  selectedSlabSizeId: string;
  selectedThicknessId: string;
  selectedFinishTypeId: string;
  quantity: number; // Requested quantity in square feet/meters
  notes: string;
  status: string; // e.g. "New" | "Contacted" | "In Discussion" | "Proposal Sent" | "Closed Won" | "Closed Lost" or custom dynamic ones
  history: LeadHistoryItem[];
  reminders: LeadReminder[];
  emailLogs: EmailLog[];
  items?: LeadItem[]; // Support multiple customized items in single enquiry
  womTracking?: WorkOrderTracking; // Deprecated - replaced by modular wonProgress
  wonProgress?: Record<string, LedStatusProgress>; // Dynamic Won process steps completion tracking
}

export interface FollowUpSequenceRule {
  id: string;
  daysAfterLead: number;
  subjectTemplate: string;
  bodyTemplate: string;
  active: boolean;
}

export interface ExpenseAttachment {
  path: string; // Storage object path inside the private expense-attachments bucket
  name: string; // Original file name, for display
}

export interface Expense {
  id: string;
  date: string; // yyyy-mm-dd
  purpose: string;
  paidTo: string;
  paidBy: string;
  amount: number;
  attachments: ExpenseAttachment[];
  addedByEmail: string;
  addedByName: string;
  createdAt: string;
}
