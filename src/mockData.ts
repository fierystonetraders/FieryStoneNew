/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SlabSize,
  GraniteType,
  Thickness,
  FinishType,
  FobPort,
  LocationServing,
  Product,
  Lead,
  FollowUpSequenceRule,
  LeadStage,
  WonProcessStep
} from './types';

export const initialSlabSizes: SlabSize[] = [
  { id: 'size-jumbo', name: 'Jumbo Large (3200 x 1600 mm)', active: true },
  { id: 'size-standard', name: 'Commercial Standard (3000 x 1400 mm)', active: true },
  { id: 'size-classical', name: 'Classical Gangsaw (2800 x 1300 mm)', active: true },
  { id: 'size-half', name: 'Half Slabs (1500 x 1400 mm)', active: true }
];

export const initialGraniteTypes: GraniteType[] = [
  { id: 'type-black', name: 'Absolute Dark Granite', active: true },
  { id: 'type-coarse', name: 'Coarse-Grain Igneous Granite', active: true },
  { id: 'type-white', name: 'Kashmir Ice & White Granite', active: true },
  { id: 'type-multicolor', name: 'Multicolor Gneissic Granite', active: true }
];

export const initialThicknesses: Thickness[] = [
  { id: 'thick-20', name: '20 mm (Standard Countertop)', active: true },
  { id: 'thick-30', name: '30 mm (Premium Structural)', active: true },
  { id: 'thick-40', name: '40 mm (Custom Double Edge)', active: true }
];

export const initialFinishTypes: FinishType[] = [
  { id: 'fin-mirror', name: 'Mirror-Polished High-Glow', active: true },
  { id: 'fin-honed', name: 'Matte Honed Velvet', active: true },
  { id: 'fin-leather', name: 'Leathered Antique Textured', active: true },
  { id: 'fin-flamed', name: 'Thermal Flamed Architectural', active: true }
];

export const initialFobPorts: FobPort[] = [
  { id: 'port-vizag', name: 'Visakhapatnam Port, India (VPT)', active: true },
  { id: 'port-chennai', name: 'Chennai Port, India (MAA)', active: true },
  { id: 'port-mundra', name: 'Mundra Port, India (MUN)', active: true },
  { id: 'port-houston', name: 'Port of Houston, USA', active: true }
];

export const initialLocationsServing: LocationServing[] = [
  { id: 'loc-na', name: 'North America (USA & Canada)', active: true },
  { id: 'loc-eu', name: 'European Union Regions', active: true },
  { id: 'loc-gcc', name: 'GCC & Middle East Nations', active: true },
  { id: 'loc-india', name: 'Domestic Market (India)', active: true }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-sunset-fire',
    title: 'Sunset Fire Imperial Granite',
    description: 'A breathtakingly dense igneous granite rock shot through with beautiful veins of molten coppery orange, gold quartz crystals, and deep dark charcoal background structures. Mined in southern India, and polished to a flawless mirror sheen. Perfect for signature kitchen islands and luxury hotel wall cladding panels.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
    slabSizeIds: ['size-jumbo', 'size-standard'],
    graniteTypeIds: ['type-coarse'],
    thicknessIds: ['thick-20', 'thick-30'],
    finishTypeIds: ['fin-mirror', 'fin-leather'],
    active: true,
    featured: true,
    minQuantity: 400, // square feet
    fobPortIds: ['port-vizag', 'port-chennai'],
    locationsServingIds: ['loc-na', 'loc-eu', 'loc-gcc']
  },
  {
    id: 'prod-volcanic-obsidian',
    title: 'Golden River Obsidian Granite',
    description: 'An elite dark black granite capturing rivers of deep bronze silt and shimmering amber ribbons flowing statefully on an obsidian-black backdrop field. Possesses an incredible Mohs hardness rating of 7. It resists scratching, heat and food acids flawlessly while delivering unmatched visual gravity.',
    image: 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=1000&auto=format&fit=crop&q=80',
    slabSizeIds: ['size-jumbo', 'size-standard', 'size-classical'],
    graniteTypeIds: ['type-black'],
    thicknessIds: ['thick-30', 'thick-40'],
    finishTypeIds: ['fin-mirror', 'fin-honed'],
    active: true,
    featured: true,
    minQuantity: 600,
    fobPortIds: ['port-vizag', 'port-mundra'],
    locationsServingIds: ['loc-na', 'loc-gcc']
  },
  {
    id: 'prod-alaska-ice',
    title: 'Alaska Ice Pearl Granite',
    description: 'A cool, crisp white granite reflecting frozen white tundras. Interleaved with silver muscovite mica scales, warm honey quartz modules, and occasional deep burgundy mineral spots that lend a distinct personality to every single gangsaw slab cut. Highly versatile and durable under drastic temperature drops.',
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1000&auto=format&fit=crop&q=80',
    slabSizeIds: ['size-standard', 'size-classical', 'size-half'],
    graniteTypeIds: ['type-white'],
    thicknessIds: ['thick-20', 'thick-30'],
    finishTypeIds: ['fin-mirror', 'fin-honed', 'fin-leather'],
    active: true,
    featured: false,
    minQuantity: 300,
    fobPortIds: ['port-chennai', 'port-mundra'],
    locationsServingIds: ['loc-india', 'loc-eu', 'loc-gcc']
  },
  {
    id: 'prod-absolute-nero',
    title: 'Absolute Nero Indian Granite',
    description: 'The pinnacle of dark minimal granite materials. This fine-grain deep crystalline absolute black granite presents a uniformly black matrix devoid of colored veins or spotty clutter. Under specular high-polished light, it exhibits a shimmering carbon fabric weave. Extremely popular among high-concept minimalist designers.',
    image: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1000&auto=format&fit=crop&q=80',
    slabSizeIds: ['size-jumbo', 'size-standard'],
    graniteTypeIds: ['type-black'],
    thicknessIds: ['thick-20', 'thick-30', 'thick-40'],
    finishTypeIds: ['fin-mirror', 'fin-honed', 'fin-flamed'],
    active: true,
    featured: true,
    minQuantity: 500,
    fobPortIds: ['port-vizag', 'port-chennai', 'port-mundra'],
    locationsServingIds: ['loc-na', 'loc-eu']
  }
];

export const initialLeads: Lead[] = [
  {
    id: 'lead-1',
    createdAt: '2026-06-15T09:12:00.000Z',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus@vancedesign.com',
    customerPhone: '+1 (512) 589-3221',
    customerCompany: 'Vance Premium Design Group',
    customerCountry: 'USA',
    productId: 'prod-sunset-fire',
    selectedSlabSizeId: 'size-jumbo',
    selectedThicknessId: 'thick-30',
    selectedFinishTypeId: 'fin-mirror',
    quantity: 1200, // square feet
    notes: 'We are sourcing materials for a hotel lobby remodel in Austin, Texas. Need premium quality slabs with continuous orange veins. Requesting immediate FOB Port pricing terms.',
    status: 'In Discussion',
    history: [
      { date: '2026-06-15T09:12:00.000Z', status: 'New', comment: 'Lead submitted via main website inquiry form.' },
      { date: '2026-06-15T09:15:00.000Z', status: 'New', comment: 'Automated welcome responder and brochure delivered.' },
      { date: '2026-06-16T13:40:00.000Z', status: 'In Discussion', comment: 'Phone consultation complete. Explained slab bundling limits and port freight parameters.' }
    ],
    reminders: [],
    emailLogs: [
      {
        id: 'elog-1-1',
        timestamp: '2026-06-15T09:15:00.000Z',
        recipient: 'marcus@vancedesign.com',
        subject: 'Inquiry Received - FieryStone Traders | Sunset Fire Imperial',
        body: 'Dear Marcus Vance,\n\nThank you for reaching out to FieryStone Traders. This email confirms receipt of your interest in our signature "Sunset Fire Imperial Granite" in Jumbo Large (3200 x 1600 mm) / 30 mm specification. Our commercial desk is reviewing your project requirement of 1,200 sqft. We will be in touch with a customized FOB quote shortly.\n\nWarm regards,\nExports Desk - FieryStone Traders',
        type: 'auto-responder'
      }
    ]
  },
  {
    id: 'lead-2',
    createdAt: '2026-06-16T15:30:00.000Z',
    customerName: 'Anand Sharma',
    customerEmail: 'asharma@sharmastonehouse.in',
    customerPhone: '+91 94440 21544',
    customerCompany: 'Sharma Stone House',
    customerCountry: 'India',
    productId: 'prod-alaska-ice',
    selectedSlabSizeId: 'size-standard',
    selectedThicknessId: 'thick-20',
    selectedFinishTypeId: 'fin-leather',
    quantity: 800,
    notes: 'Inquiry for high-end residential kitchen fitments. Requesting ex-works price and layout configuration assistance.',
    status: 'New',
    history: [
      { date: '2026-06-16T15:30:00.000Z', status: 'New', comment: 'Lead registered from product listing portal.' },
      { date: '2026-06-16T15:30:01.000Z', status: 'New', comment: 'Automated introductory dispatch issued to client.' }
    ],
    reminders: [],
    emailLogs: [
      {
        id: 'elog-2-1',
        timestamp: '2026-06-16T15:30:01.000Z',
        recipient: 'asharma@sharmastonehouse.in',
        subject: 'Inquiry Confirmation - Alaska Ice Pearl Granite',
        body: 'Dear Anand Sharma,\n\nWe appreciate your inquiry regarding the Alaska Ice Pearl Granite (Commercial Standard (3000 x 1400 mm), 20 mm size). Our South India distribution team has logged your interest for 800 sqft and will schedule an inspection visit if needed.\n\nWarm regards,\nSales India - FieryStone Traders',
        type: 'auto-responder'
      }
    ]
  }
];

export const initialFollowUpRules: FollowUpSequenceRule[] = [
  {
    id: 'rule-welcome',
    daysAfterLead: 0,
    subjectTemplate: 'Thank you for choosing FieryStone Traders - [ProductDetail]',
    bodyTemplate: 'Dear [CustomerName],\n\nWe have received your detailed specifications for [ProductDetail] with a requested volume of [Quantity] sqft. \n\nWe serve major developers globally from Visakhapatnam Port via premium wood-crated containers. A dedicated stone logistics officer will send your technical drawing sheet and raw quarry block test metrics within 24 hours.\n\nFOB Ports Serviced: [AllPorts]\n\nWarm regards,\nCommercial Estimations Desk\nFieryStone Traders (India & United States)',
    active: true
  },
  {
    id: 'rule-followup-spec',
    daysAfterLead: 1,
    subjectTemplate: 'Technical Data & Petrograhic Certifications for [ProductDetail]',
    bodyTemplate: 'Dear [CustomerName],\n\nWe are following up on your request. Below are the standard petrographic laboratory test benchmarks for our [ProductDetail]:\n\n- Compressive Strength: 185 MPa\n- Water Absorption index: < 0.12%\n- Density: 2.85 g/cm³\n- Flexural Strength: 15.2 MPa\n\nWe verify that we can fulfill the minimum project limit of [MinQuantity] sqft perfectly to your FOB destination. Let us know if you require customized slab bundling photos.\n\nWarm regards,\nFieryStone Traders Quality Assurance',
    active: true
  }
];

export const initialLeadStages: LeadStage[] = [
  { id: 'stage-new', name: 'New', active: true },
  { id: 'stage-contacted', name: 'Contacted', active: true },
  { id: 'stage-discussion', name: 'In Discussion', active: true },
  { id: 'stage-proposal', name: 'Proposal Sent', active: true },
  { id: 'stage-won', name: 'Closed Won', active: true },
  { id: 'stage-lost', name: 'Closed Lost', active: true }
];

export const initialWonProcessSteps: WonProcessStep[] = [
  { id: 'step-payment', name: 'Payment Received & Escrow Vaulted', active: true },
  { id: 'step-sourcing', name: 'Premium Quarry Slabs Sourced & Crates Sealed', active: true },
  { id: 'step-customs', name: 'Port FOB Clearance & Ocean Vessel Loaded', active: true }
];
