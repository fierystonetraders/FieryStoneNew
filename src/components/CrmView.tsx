/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Lead,
  Product,
  SlabSize,
  Thickness,
  FinishType,
  FollowUpSequenceRule,
  EmailLog,
  LeadReminder,
  LeadStage,
  WonProcessStep
} from '../types';
import {
  Plus,
  Mail,
  Calendar,
  Clock,
  CheckSquare,
  Square,
  MessageSquare,
  TrendingUp,
  User,
  Building,
  Briefcase,
  Layers,
  MapPin,
  CheckCircle2,
  Trash2,
  BellRing,
  Send,
  Sparkles,
  AlertCircle,
  Phone,
  X
} from 'lucide-react';

interface CrmViewProps {
  leads: Lead[];
  products: Product[];
  slabSizes: SlabSize[];
  thicknesses: Thickness[];
  finishTypes: FinishType[];
  followUpRules: FollowUpSequenceRule[];
  onUpdateLeads: (leads: Lead[]) => void;
  onUpdateFollowUpRules: (rules: FollowUpSequenceRule[]) => void;
  leadStages?: LeadStage[];
  wonProcessSteps?: WonProcessStep[];
}

export default function CrmView({
  leads,
  products,
  slabSizes,
  thicknesses,
  finishTypes,
  followUpRules,
  onUpdateLeads,
  onUpdateFollowUpRules,
  leadStages = [],
  wonProcessSteps = []
}: CrmViewProps) {
  const activeLeadStages = leadStages && leadStages.length > 0 
    ? leadStages.filter(s => s.active) 
    : [
        { id: 'stage-new', name: 'New', active: true },
        { id: 'stage-contacted', name: 'Contacted', active: true },
        { id: 'stage-discussion', name: 'In Discussion', active: true },
        { id: 'stage-proposal', name: 'Proposal Sent', active: true },
        { id: 'stage-won', name: 'Closed Won', active: true },
        { id: 'stage-lost', name: 'Closed Lost', active: true }
      ];

  const activeWonSteps = wonProcessSteps && wonProcessSteps.length > 0
    ? wonProcessSteps.filter(s => s.active)
    : [
        { id: 'step-payment', name: 'Payment Received & Escrow Vaulted', active: true },
        { id: 'step-sourcing', name: 'Premium Quarry Slabs Sourced & Crates Sealed', active: true },
        { id: 'step-customs', name: 'Port FOB Clearance & Ocean Vessel Loaded', active: true }
      ];

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leads[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Mobile CRM navigation state ('list' matches leads list view; 'detail' matches specific lead specifications view)
  const [mobileActiveMode, setMobileActiveMode] = useState<'list' | 'detail'>('list');
  
  // Custom reminder form state
  const [newReminderNotes, setNewReminderNotes] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('2026-06-18T12:00');

  // Manual Email composer state
  const [emailComposerSubject, setEmailComposerSubject] = useState('');
  const [emailComposerBody, setEmailComposerBody] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  
  // Follow Up Rules Config tab
  const [crmSubTab, setCrmSubTab] = useState<'pipeline' | 'sequences'>('pipeline');

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    if (statusFilter === 'all') return true;
    return l.status === statusFilter;
  });

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  // Pipeline Metric Computations
  const pipelineMetrics = {
    total: leads.length,
    potentialValue: leads.reduce((acc, current) => {
      // Approximate $25 per sqft for estimation display
      return acc + (current.quantity * 25);
    }, 0)
  };

  // UPDATE LEAD STATUS
  const handleUpdateLeadStatus = (leadId: string, nextStatus: Lead['status']) => {
    const updatedLeads = leads.map((l) => {
      if (l.id === leadId) {
        const prevStatus = l.status;
        const logEntry = {
          date: new Date().toISOString(),
          status: nextStatus,
          comment: `Manual status transition from "${prevStatus}" to "${nextStatus}".`
        };

        // If shifting to Contacted, simulate emailing standard welcome if not exists
        return {
          ...l,
          status: nextStatus,
          history: [...l.history, logEntry]
        };
      }
      return l;
    });

    onUpdateLeads(updatedLeads);
  };

  // TOGGLE WORK ORDER TRACKING (WOM STATUS) DYNAMICALLY BY STEP ID
  const handleToggleWonProgressStep = (leadId: string, stepId: string) => {
    onUpdateLeads(
      leads.map((l) => {
        if (l.id === leadId) {
          const currentProgress = l.wonProgress || {};
          const currentStep = currentProgress[stepId] || { completed: false };
          const nextCompleted = !currentStep.completed;
          const updatedProgress = {
            ...currentProgress,
            [stepId]: {
              completed: nextCompleted,
              date: nextCompleted ? new Date().toISOString().split('T')[0] : undefined
            }
          };

          const matchedStep = activeWonSteps.find(s => s.id === stepId);
          const stepName = matchedStep ? matchedStep.name : stepId;

          const historyLog = {
            date: new Date().toISOString(),
            status: l.status,
            comment: `Fulfillment Stage updated: "${stepName}" set to [${nextCompleted ? 'COMPLETED' : 'INCOMPLETE'}].`
          };

          return {
            ...l,
            wonProgress: updatedProgress,
            history: [...l.history, historyLog]
          };
        }
        return l;
      })
    );
  };

  // ADD MOCK HISTORY / LOG NOTE
  const [customComment, setCustomComment] = useState('');
  const handleAddNewActivityNote = (leadId: string) => {
    if (!customComment.trim()) return;

    onUpdateLeads(
      leads.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            history: [
              ...l.history,
              {
                date: new Date().toISOString(),
                status: l.status,
                comment: customComment.trim()
              }
            ]
          };
        }
        return l;
      })
    );
    setCustomComment('');
  };

  // TOGGLE REMINDER COMPLETE
  const handleToggleReminder = (leadId: string, reminderId: string) => {
    onUpdateLeads(
      leads.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            reminders: l.reminders.map((rem) =>
              rem.id === reminderId ? { ...rem, completed: !rem.completed } : rem
            )
          };
        }
        return l;
      })
    );
  };

  // ADD CUSTOM REMINDER
  const handleAddReminder = (e: React.FormEvent, leadId: string) => {
    e.preventDefault();
    if (!newReminderNotes.trim()) return;

    const newRem: LeadReminder = {
      id: `rem-custom-${Date.now()}`,
      date: new Date(newReminderDate).toISOString(),
      notes: newReminderNotes.trim(),
      completed: false,
      sent: false
    };

    onUpdateLeads(
      leads.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            reminders: [...l.reminders, newRem]
          };
        }
        return l;
      })
    );

    setNewReminderNotes('');
  };

  // DELETING A LEAD
  const handleDeleteLeadFromCrm = (leadId: string) => {
    if (confirm('Are you sure you want to completely purge this lead card from the CRM? This is irreversible.')) {
      const purgedList = leads.filter(l => l.id !== leadId);
      onUpdateLeads(purgedList);
      if (selectedLeadId === leadId) {
        setSelectedLeadId(purgedList[0]?.id || null);
      }
    }
  };

  // MANUAL EMAIL DISPATCH SIMULATOR
  const handleSendManualEmail = (e: React.FormEvent, lead: Lead) => {
    e.preventDefault();
    if (!emailComposerSubject.trim() || !emailComposerBody.trim()) return;

    const newLog: EmailLog = {
      id: `elog-manual-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipient: lead.customerEmail,
      subject: emailComposerSubject.trim(),
      body: emailComposerBody.trim(),
      type: 'manual'
    };

    onUpdateLeads(
      leads.map((l) => {
        if (l.id === lead.id) {
          return {
            ...l,
            emailLogs: [...l.emailLogs, newLog],
            history: [
              ...l.history,
              {
                date: new Date().toISOString(),
                status: l.status,
                comment: `Manual email dispatched: "Subject: ${emailComposerSubject.trim()}"`
              }
            ]
          };
        }
        return l;
      })
    );

    setEmailComposerSubject('');
    setEmailComposerBody('');
    setIsComposerOpen(false);
    alert(`Virtual email dispatched successfully to ${lead.customerName}! View confirmation logged inside communications tab.`);
  };

  // AUTOMATED FOLLOW-UP TRIGGER (Simulates running daily cron worker immediately)
  const handleTriggerAutomatedFollowUpSequence = (lead: Lead) => {
    // Collect active rules
    const activeRules = followUpRules.filter(r => r.active);
    if (activeRules.length === 0) {
      alert('There are no active automated sequence rules. Please activate them inside the "Sequence Rules Config" panel.');
      return;
    }

    const linkedProduct = products.find(p => p.id === lead.productId) || products[0];
    const sizeName = slabSizes.find(s => s.id === lead.selectedSlabSizeId)?.name || 'Custom Slab Spec';
    const specLabel = `${linkedProduct?.title} (${sizeName})`;

    // Simulate appending new logs for each rule that hasn't run yet
    const newLogs: EmailLog[] = [];
    const newHistory: any[] = [];
    const newReminders: LeadReminder[] = [];

    activeRules.forEach((rule, idx) => {
      // Check if this rule has already been sent to avoid duplicate logs in the simulator
      const alreadySent = lead.emailLogs.some(
        log => log.type === 'follow-up' && log.subject.includes(rule.daysAfterLead === 0 ? 'Confirmation' : 'Technical Data')
      );
      if (alreadySent && rule.daysAfterLead === 0) return; // welcome responders already run

      // Format Templates
      let formattedSubject = rule.subjectTemplate
        .replace('[ProductDetail]', specLabel)
        .replace('[CustomerName]', lead.customerName);
      
      let formattedBody = rule.bodyTemplate
        .replaceAll('[CustomerName]', lead.customerName)
        .replaceAll('[ProductDetail]', specLabel)
        .replaceAll('[Quantity]', String(lead.quantity))
        .replaceAll('[MinQuantity]', String(linkedProduct?.minQuantity || 500))
        .replaceAll('[AllPorts]', 'Vizag, Chennai, Mundra Ports');

      const logId = `elog-auto-${rule.id}-${Date.now()}`;
      newLogs.push({
        id: logId,
        timestamp: new Date(Date.now() + (idx * 1000)).toISOString(),
        recipient: lead.customerEmail,
        subject: formattedSubject,
        body: formattedBody,
        type: rule.daysAfterLead === 0 ? 'auto-responder' : 'follow-up'
      });

      newHistory.push({
        date: new Date(Date.now() + (idx * 1050)).toISOString(),
        status: lead.status,
        comment: `Automated Rule triggered (Day ${rule.daysAfterLead} sequence): "${formattedSubject}"`
      });

      // Add corresponding automated check reminders
      newReminders.push({
        id: `rem-auto-${rule.id}-${Date.now()}`,
        date: new Date(Date.now() + 86400000 * Math.max(rule.daysAfterLead, 1)).toISOString(),
        notes: `Automated schedule: Quality check and pricing callback for rule ${rule.id}.`,
        completed: false,
        sent: true
      });
    });

    if (newLogs.length === 0) {
      alert('All auto-sequencing communications has already been fully dispatched for this client card.');
      return;
    }

    onUpdateLeads(
      leads.map((l) => {
        if (l.id === lead.id) {
          return {
            ...l,
            emailLogs: [...l.emailLogs, ...newLogs],
            history: [...l.history, ...newHistory],
            reminders: [...l.reminders, ...newReminders]
          };
        }
        return l;
      })
    );

    alert(`Automated Scheduler Executed! Simulating continuous days lapse. Dispatched ${newLogs.length} follow-up email transmissions based on CMS parameters.`);
  };

  return (
    <div id="crm-view-root" className="min-h-screen bg-stone-950 text-stone-300 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        
        {/* Upper portal status bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-stone-900 pb-6 mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-wide uppercase">CRM Panel</h2>
            <p className="text-xs text-stone-500 mt-1">Direct pipeline routing, CRM logs, and email follow-up automation sequencing rules.</p>
          </div>

          <div className="flex rounded-lg bg-stone-900 p-1 border border-stone-800 text-xs font-sans">
            <button
              onClick={() => setCrmSubTab('pipeline')}
              className={`rounded px-4 py-1.5 font-semibold transition ${
                crmSubTab === 'pipeline' ? 'bg-amber-500 text-stone-950 slot' : 'text-stone-400 hover:text-stone-100'
              }`}
            >
              Pipeline Desk
            </button>
            
          </div>
        </div>

        {crmSubTab === 'pipeline' ? (
          <>
            {/* PIPELINE KANBAN/METRICS DISPLAY */}
            <div className="flex flex-wrap items-stretch justify-start gap-4 mb-8">
              <div className="flex-1 min-w-[140px] rounded-xl border border-stone-800 bg-stone-900/30 p-4 text-center">
                <span className="text-[10px] text-stone-500 font-bold uppercase font-mono">TOTAL INQUIRIES</span>
                <p className="text-2xl font-black text-white mt-1">{pipelineMetrics.total}</p>
              </div>
              {activeLeadStages.map(stage => {
                const count = leads.filter(l => l.status === stage.name).length;
                let borderStyle = "border-stone-800";
                if (stage.name.toLowerCase().includes("new")) borderStyle = "border-amber-500/40 border-t-4";
                else if (stage.name.toLowerCase().includes("won")) borderStyle = "border-emerald-500/40 border-t-4";
                else if (stage.name.toLowerCase().includes("lost")) borderStyle = "border-rose-500/30 border-t-4";
                else if (stage.name.toLowerCase().includes("discussion") || stage.name.toLowerCase().includes("proposal")) borderStyle = "border-sky-500/40 border-t-4";
                
                return (
                  <div key={stage.id} className={`flex-1 min-w-[140px] rounded-xl border bg-stone-900/30 p-4 text-center ${borderStyle}`}>
                    <span className="text-[10px] text-stone-500 font-bold uppercase font-mono truncate block" title={stage.name}>{stage.name}</span>
                    <p className="text-2xl font-black text-white mt-1">{count}</p>
                  </div>
                );
              })}
            </div>

            {/* Mobile View Toggle */}
            <div className="flex lg:hidden rounded-lg bg-stone-900 border border-stone-800 p-1 mb-6 text-xs font-sans w-full">
              <button
                type="button"
                onClick={() => setMobileActiveMode('list')}
                className={`flex-1 text-center py-2.5 rounded font-semibold transition cursor-pointer select-none ${
                  mobileActiveMode === 'list' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Inquiries List ({filteredLeads.length})
              </button>
              <button
                type="button"
                onClick={() => setMobileActiveMode('detail')}
                className={`flex-1 text-center py-2.5 rounded font-semibold transition cursor-pointer select-none ${
                  mobileActiveMode === 'detail' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
                }`}
                disabled={!selectedLead}
              >
                Active Lead Details
              </button>
            </div>

            {/* MAIN CRM MULTI-PANEL VIEW */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* PANEL 1: CLIENT CARDS LIST */}
              <div className={`lg:col-span-1 space-y-4 ${mobileActiveMode === 'list' ? 'block' : 'hidden lg:block'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest font-mono">Inquiry Cards</h3>

                  {/* Quick Client filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-stone-900 border border-stone-805 rounded px-2.5 py-1 text-[11px] font-mono font-semibold"
                  >
                    <option value="all">Display All Statuses</option>
                    {activeLeadStages.map((stage) => (
                      <option key={stage.id} value={stage.name}>
                        Status: {stage.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-1">
                  {filteredLeads.length === 0 ? (
                    <div className="rounded-xl border border-stone-850 p-12 text-center text-stone-550 text-xs">
                      No matching leads in queue.
                    </div>
                  ) : (
                    filteredLeads.map((lead) => {
                      const lProd = products.find(p => p.id === lead.productId);
                      const isSelected = selectedLead?.id === lead.id;

                      let statusBadgeColor = 'bg-stone-900 text-stone-400 border-stone-800';
                      const lowerStatus = lead.status.toLowerCase();
                      if (lowerStatus.includes('new')) statusBadgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                      else if (lowerStatus.includes('discussion') || lowerStatus.includes('proposal')) statusBadgeColor = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
                      else if (lowerStatus.includes('won')) statusBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                      else if (lowerStatus.includes('lost')) statusBadgeColor = 'bg-red-500/10 text-red-500 border-red-500/20';

                      return (
                        <div
                          key={lead.id}
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setMobileActiveMode('detail');
                          }}
                          className={`rounded-xl p-4 border text-left cursor-pointer transition ${
                            isSelected 
                              ? 'border-amber-500 bg-stone-900/60 shadow shadow-amber-500/5' 
                              : 'border-stone-850 bg-stone-900/10 hover:border-stone-700'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-white">{lead.customerName}</h4>
                              <p className="text-[10px] text-stone-450 font-mono mt-0.5 truncate max-w-[150px]">
                                {lead.customerCompany || 'Direct Consumer'}
                              </p>
                            </div>
                            <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold font-mono tracking-wider border ${statusBadgeColor}`}>
                              {lead.status}
                            </span>
                          </div>

                          <div className="mt-3 border-t border-stone-900 pt-2 text-[10px] font-mono text-stone-500 flex justify-between items-center">
                            <span>{lProd?.title.split(' ')[0] || 'Granite'} • {lead.quantity} sqft</span>
                            <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* PANEL 2 & 3: DETAIL, ACTIONS & AUTOMATION logs (Right) */}
              <div className={`lg:col-span-2 ${mobileActiveMode === 'detail' ? 'block' : 'hidden lg:block'}`}>
                {selectedLead ? (
                  <div className="rounded-2xl border border-stone-800 bg-stone-900/15 p-6 space-y-6">
                    
                    {/* Upper title layout bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-stone-850 pb-5">
                      <div className="w-full">
                        {/* Mobile Back Button */}
                        <button
                          type="button"
                          onClick={() => setMobileActiveMode('list')}
                          className="lg:hidden mb-4 flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-bold tracking-wider uppercase bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-lg select-none cursor-pointer"
                        >
                          &larr; Back to Inquiries List
                        </button>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white tracking-wide">{selectedLead.customerName}</h3>
                          <span className="text-xs font-mono text-stone-500 bg-stone-950 px-2 py-0.5 rounded">ID: {selectedLead.id}</span>
                        </div>
                        <p className="text-xs text-stone-450 font-mono mt-1">Registered: {new Date(selectedLead.createdAt).toLocaleString()}</p>
                      </div>

                      {/* Transition Operations dropdown & delete */}
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <select
                          id="lead-status-transition"
                          value={selectedLead.status}
                          onChange={(e) => handleUpdateLeadStatus(selectedLead.id, e.target.value as Lead['status'])}
                          className="bg-stone-950 border border-stone-805 rounded px-3 py-1.5 text-stone-200"
                        >
                          {activeLeadStages.map((stage) => (
                            <option key={stage.id} value={stage.name}>
                              Set Status: {stage.name}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleDeleteLeadFromCrm(selectedLead.id)}
                          className="p-1.5 rounded bg-stone-950 border border-stone-800 hover:bg-rose-950 hover:border-rose-900 hover:text-rose-400 text-stone-500 transition"
                          title="Purge lead from records"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* METRIC DEMOGRAPHICS TABLE */}
                    <div className="grid sm:grid-cols-2 gap-6 text-xs font-mono">
                      {/* Left: Contact Info */}
                      <div className="space-y-2.5 p-3 rounded-xl border border-stone-850/60 bg-stone-950/20">
                        <p className="text-[9px] text-amber-500 font-bold uppercase mb-1.5">Direct Demographics</p>
                        
                        <div className="flex items-center gap-2.5">
                          <User className="h-3.5 w-3.5 text-stone-550 flex-shrink-0" />
                          <span className="text-stone-300 truncate">{selectedLead.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Mail className="h-3.5 w-3.5 text-stone-550 flex-shrink-0" />
                          <a href={`mailto:${selectedLead.customerEmail}`} className="text-stone-300 hover:text-amber-500 transition truncate">{selectedLead.customerEmail}</a>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Phone className="h-3.5 w-3.5 text-stone-550 flex-shrink-0" />
                          <a href={`tel:${selectedLead.customerPhone}`} className="text-stone-300 hover:text-amber-500 transition">{selectedLead.customerPhone}</a>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Building className="h-3.5 w-3.5 text-stone-550 flex-shrink-0" />
                          <span className="text-stone-300 truncate">{selectedLead.customerCompany || 'N/A (Individual Consumer)'}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <MapPin className="h-3.5 w-3.5 text-stone-550 flex-shrink-0" />
                          <span className="text-stone-300 uppercase">{selectedLead.customerCountry} Office</span>
                        </div>
                      </div>                      {/* Right: Sourcing material specs */}
                      <div className="space-y-2.5 p-3 rounded-xl border border-stone-850/60 bg-stone-950/20">
                        <p className="text-[9px] text-amber-500 font-bold uppercase mb-1.5 font-mono">Material Specifications</p>
                        
                        {selectedLead.items && selectedLead.items.length > 0 ? (
                          <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
                            {selectedLead.items.map((item, idx) => {
                              const pObj = products.find(p => p.id === item.productId);
                              const sObj = slabSizes.find(s => s.id === item.selectedSlabSizeId);
                              const tObj = thicknesses.find(t => t.id === item.selectedThicknessId);
                              const fObj = finishTypes.find(f => f.id === item.selectedFinishTypeId);
                              return (
                                <div key={item.id || idx} className="p-2 bg-stone-950/80 rounded border border-stone-850 leading-normal text-[11px] font-sans">
                                  <div className="flex justify-between font-bold text-stone-200">
                                    <span className="uppercase tracking-tight">{pObj?.title || 'Granite Style'}</span>
                                    <span className="text-amber-500 font-mono">{item.quantity.toLocaleString()} SQFT</span>
                                  </div>
                                  <div className="text-[10px] text-stone-400 mt-1 flex flex-wrap gap-x-2 gap-y-0.5 uppercase font-mono">
                                    <span>Sz: {sObj?.name || 'Custom'}</span>
                                    <span>•</span>
                                    <span>Th: {tObj?.name?.split(' (')[0]}</span>
                                    <span>•</span>
                                    <span>Fn: {fObj?.name}</span>
                                  </div>
                                </div>
                              );
                            })}
                            <div className="pt-2 border-t border-stone-800 justify-between flex text-[10px] font-mono">
                              <span>Consolidated Items:</span>
                              <strong className="text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">{selectedLead.items.length} granite styles</strong>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5">
                              <Briefcase className="h-3.5 w-3.5 text-stone-550 flex-shrink-0" />
                              <span className="text-stone-200 font-extrabold">{products.find(p => p.id === selectedLead.productId)?.title || selectedLead.productId}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <Layers className="h-3.5 w-3.5 text-stone-550 flex-shrink-0" />
                              <span className="text-stone-300">{slabSizes.find(s => s.id === selectedLead.selectedSlabSizeId)?.name?.split(' ')[0] || selectedLead.selectedSlabSizeId} size</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <Clock className="h-3.5 w-3.5 text-stone-550 flex-shrink-0" />
                              <span className="text-stone-300">{thicknesses.find(t => t.id === selectedLead.selectedThicknessId)?.name || selectedLead.selectedThicknessId} thickness</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <TrendingUp className="h-3.5 w-3.5 text-stone-550 flex-shrink-0" />
                              <span className="text-stone-300">{finishTypes.find(f => f.id === selectedLead.selectedFinishTypeId)?.name || selectedLead.selectedFinishTypeId} surface</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-stone-550 flex-shrink-0" />
                              <span className="text-stone-200">Volume Required: <strong className="text-amber-500">{selectedLead.quantity} sqft</strong></span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Client Raw messages notes */}
                    <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-850 text-xs text-stone-300 font-mono">
                      <p className="text-[9px] text-stone-500 uppercase font-mono font-bold mb-1">Customer Logistics details notes:</p>
                      <p className="italic font-sans text-stone-300">"{selectedLead.notes || 'No custom special instructions specified.'}"</p>
                    </div>

                    {/* WOM (WORK ORDER MANAGEMENT) SOURCE & DISPATCH TRACKING SYSTEM */}
                    <div className="p-4 rounded-xl border border-stone-800 bg-stone-950/40 text-xs font-mono space-y-3.5">
                      <div className="flex justify-between items-center border-b border-stone-850 pb-2">
                        <span className="text-stone-200 font-bold uppercase tracking-wider text-[10px] flex items-center gap-2">
                          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                          WOM Sourcing & Production pipeline
                        </span>
                        <span className="text-[9px] text-stone-500 uppercase font-mono">Tracking Desk</span>
                      </div>

                      {/* Timeline graphic representation */}
                      <div className="grid gap-4 relative" style={{ gridTemplateColumns: `repeat(${activeWonSteps.length || 1}, minmax(0, 1fr))` }}>
                        {/* Connecting track line */}
                        {activeWonSteps.length > 1 && (
                          <div className="absolute top-[14px] left-[10%] right-[10%] h-0.5 bg-stone-800 z-0" />
                        )}

                        {activeWonSteps.map((step, idx) => {
                          const stepProgress = selectedLead.wonProgress?.[step.id] || { completed: false };
                          // Backward compatibility fallback to pre-existing leads with old static tracker
                          let isStepCompleted = stepProgress.completed;
                          let completedDate = stepProgress.date;

                          if (step.id === 'step-payment' && selectedLead.womTracking?.paymentReceived) {
                            isStepCompleted = true;
                            completedDate = selectedLead.womTracking.paymentReceivedDate;
                          } else if (step.id === 'step-sourcing' && selectedLead.womTracking?.graniteSourcedAndPacked) {
                            isStepCompleted = true;
                            completedDate = selectedLead.womTracking.graniteSourcedAndPackedDate;
                          } else if (step.id === 'step-customs' && selectedLead.womTracking?.fobCompleted) {
                            isStepCompleted = true;
                            completedDate = selectedLead.womTracking.fobCompletedDate;
                          }

                          return (
                            <button
                              key={step.id}
                              type="button"
                              onClick={() => handleToggleWonProgressStep(selectedLead.id, step.id)}
                              className="flex flex-col items-center text-center z-10 group focus:outline-none bg-transparent border-none cursor-pointer"
                            >
                              <div className={`h-7 w-7 rounded-full flex items-center justify-center border transition ${
                                isStepCompleted
                                  ? 'bg-amber-500 border-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20'
                                  : 'bg-stone-900 border-stone-800 text-stone-400 group-hover:border-stone-600'
                              }`}>
                                {isStepCompleted ? '✓' : idx + 1}
                              </div>
                              <span className="text-[9px] font-bold text-stone-300 mt-2 uppercase tracking-tighter truncate max-w-full block px-1" title={step.name}>
                                {step.name.split(' & ')[0]}
                              </span>
                              <span className="text-[8px] text-stone-500 mt-0.5 truncate max-w-full font-mono">
                                {completedDate || 'Pending'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                      {/* TWO COLUMN GRID: REMINDERS & COMMUNICATIONS logs */}
                      <div className="grid sm:grid-cols-1 gap-6 pt-2">
                        
                        {/* ACTIVE REMINDERS COLUMN */}
                        <div className="space-y-3">
                          <p className="text-[10px] text-stone-500 uppercase font-mono font-bold border-b border-stone-900 pb-1 flex items-center justify-between">
                            <span>RECALL / LEAD REMINDERS</span>
                            <span className="text-[9px] bg-stone-950 text-amber-500 px-1 py-0.2 rounded border border-stone-850">
                              {selectedLead.reminders.filter(r => !r.completed).length} active
                            </span>
                          </p>

                          <div className="space-y-1.5 max-h-48 overflow-y-auto bg-stone-950/20 p-2.5 rounded-xl border border-stone-900">
                            {selectedLead.reminders.length === 0 ? (
                              <p className="text-[10px] text-stone-605 text-center py-4">No scheduled follow-up reminders.</p>
                            ) : (
                              selectedLead.reminders.map((rem) => (
                                <div key={rem.id} className="flex gap-2 text-[10px] p-2 bg-stone-900/40 rounded border border-stone-900/60 items-start justify-between">
                                  <div className="flex gap-2">
                                    <button
                                      _id={`toggle-rem-${rem.id}`}
                                      onClick={() => handleToggleReminder(selectedLead.id, rem.id)}
                                      className="text-stone-500 hover:text-amber-500 mt-0.5 flex-shrink-0"
                                    >
                                      {rem.completed ? (
                                        <CheckSquare className="h-4 w-4 text-emerald-400" />
                                      ) : (
                                        <Square className="h-4 w-4 text-stone-600 hover:text-amber-500" />
                                      )}
                                    </button>

                                    <div className="font-sans">
                                      <p className={`text-stone-300 font-medium ${rem.completed ? 'line-through text-stone-500' : ''}`}>
                                        {rem.notes}
                                      </p>
                                      <p className="text-[9px] text-stone-500 font-mono mt-0.5 flex items-center gap-1">
                                        <Clock className="h-2.5 w-2.5" /> {new Date(rem.date).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Quick Reminder Form */}
                          <form onSubmit={(e) => handleAddReminder(e, selectedLead.id)} className="flex gap-1">
                            <input
                              type="text"
                              required
                              value={newReminderNotes}
                              onChange={(e) => setNewReminderNotes(e.target.value)}
                              placeholder="New helper reminder note..."
                              className="flex-1 bg-stone-950 border border-stone-900 rounded px-2.5 py-1 text-[11px] text-stone-350"
                            />
                            <button
                              type="submit"
                              className="rounded bg-stone-850 hover:bg-stone-750 text-stone-350 px-2.5 border border-stone-800 text-[11px] font-bold"
                            >
                              Add
                            </button>
                          </form>
                        </div>

                        {/* OUTGOING MAIL COMMUNICATIONS LOG */}
                        

                      </div>

                      {/* DETAILED REGISTRY HISTORY TRACK */}
                      <div className="space-y-2 pt-2 border-t border-stone-900">
                        <p className="text-[10px] text-stone-500 uppercase font-mono font-bold flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" /> Registry Activity Logs & Notes
                        </p>

                        <div className="space-y-1.5 max-h-40 overflow-y-auto bg-stone-950/30 p-2.5 rounded-xl border border-stone-900 font-sans">
                          {selectedLead.history.map((hist, idx) => (
                            <div key={idx} className="text-[10px] leading-relaxed flex items-start gap-2 border-b border-stone-900/30 pb-1.5 last:border-0 last:pb-0">
                              <span className="text-stone-550 font-mono text-[9px] flex-shrink-0 mt-0.5">{new Date(hist.date).toLocaleDateString()} {new Date(hist.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              <span className="bg-stone-900 text-amber-500 font-mono text-[8px] font-bold px-1 rounded flex-shrink-0 mt-0.5">{hist.status}</span>
                              <span className="text-stone-300">{hist.comment}</span>
                            </div>
                          ))}
                        </div>

                        {/* Add manual comment note log */}
                        <div className="flex gap-1.5 text-xs font-mono pt-1">
                          <input
                            type="text"
                            value={customComment}
                            onChange={(e) => setCustomComment(e.target.value)}
                            placeholder="Add administrative consultation note to activity log..."
                            className="flex-1 bg-stone-950 border border-stone-900 rounded px-2.5 py-1.5 text-[11px] text-stone-300"
                          />
                          <button
                            _id="add-history-note-btn"
                            onClick={() => handleAddNewActivityNote(selectedLead.id)}
                            className="rounded bg-stone-905 border border-stone-800 hover:bg-stone-800 px-4 py-1.5 text-stone-200 text-[11px] font-bold"
                          >
                            Log Note
                          </button>
                        </div>
                      </div>

                    </div>
                  ) : (
                  <div className="rounded-2xl border border-stone-850 p-20 text-center text-stone-605">
                    No leads listed in CRM queue. Use Modern Portal website to generate test lead entries.
                  </div>
                )}
              </div>

            </div>
          </>
        ) : (
          
          <div className="space-y-6">
            
          </div>
        )}

      </div>
    </div>
  );
}
