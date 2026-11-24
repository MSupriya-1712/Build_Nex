import {
  Project,
  Task,
  Expense,
  Material,
  Customer,
  Booking,
  ProgressUpdate,
  NotificationItem,
  DashboardMetrics,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Realistic initial seed data for local storage fallback
const INITIAL_PROJECTS: Project[] = [
  {
    _id: 'proj-1',
    name: 'Skyline Heights Luxury Towers',
    code: 'PRJ-2024-001',
    location: 'Downtown Financial District, Sector 4',
    projectManager: 'Marcus Vance, PMP',
    startDate: '2024-01-15',
    expectedCompletionDate: '2025-08-30',
    budget: 4500000,
    spent: 2850000,
    completionPercentage: 68,
    status: 'In Progress',
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=1000&q=80',
    description: '32-story ultra-luxury twin towers with residential apartments, sky deck, infinity pool, and underground robotic parking.',
    milestones: [
      { id: 'm1', title: 'Deep Piling & Excavation', targetDate: '2024-03-30', completedDate: '2024-03-25', status: 'Completed', percentageWeight: 20 },
      { id: 'm2', title: 'Substructure & Basement Slabs', targetDate: '2024-06-15', completedDate: '2024-06-10', status: 'Completed', percentageWeight: 25 },
      { id: 'm3', title: 'Superstructure Structural Framing', targetDate: '2024-11-20', completedDate: '', status: 'In Progress', percentageWeight: 30 },
      { id: 'm4', title: 'MEP (Mechanical, Electrical, Plumbing)', targetDate: '2025-03-15', completedDate: '', status: 'Pending', percentageWeight: 15 },
      { id: 'm5', title: 'Facade Glazing & Interior Fit-outs', targetDate: '2025-08-30', completedDate: '', status: 'Pending', percentageWeight: 10 },
    ],
    team: [
      { name: 'Marcus Vance', role: 'Lead Project Director', phone: '+1 (555) 382-9910', email: 'marcus.v@buildnex.com' },
      { name: 'Elena Rostova', role: 'Structural Engineering Head', phone: '+1 (555) 491-0021', email: 'elena.r@buildnex.com' },
      { name: 'David Kim', role: 'Senior Safety Inspector', phone: '+1 (555) 782-3341', email: 'david.k@buildnex.com' },
      { name: 'Aisha Al-Mansoor', role: 'Site Architect', phone: '+1 (555) 902-1144', email: 'aisha.m@buildnex.com' },
    ],
  },
  {
    _id: 'proj-2',
    name: 'Horizon Tech Business Park',
    code: 'PRJ-2024-002',
    location: 'Cyber Valley Innovation Corridor, Phase 2',
    projectManager: 'Sarah Jenkins, PE',
    startDate: '2023-09-01',
    expectedCompletionDate: '2024-12-15',
    budget: 6800000,
    spent: 5920000,
    completionPercentage: 88,
    status: 'In Progress',
    category: 'Commercial',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    description: 'LEED Platinum certified grade-A corporate tech park featuring solar glass panels, green terraces, and smart building BMS.',
    milestones: [
      { id: 'm21', title: 'Site Prep & Geotechnical Piling', targetDate: '2023-11-30', completedDate: '2023-11-20', status: 'Completed', percentageWeight: 20 },
      { id: 'm22', title: 'Main Frame Construction (18 Floors)', targetDate: '2024-04-10', completedDate: '2024-04-05', status: 'Completed', percentageWeight: 35 },
      { id: 'm23', title: 'Double Glazed Curtain Wall', targetDate: '2024-08-30', completedDate: '2024-08-28', status: 'Completed', percentageWeight: 20 },
      { id: 'm24', title: 'HVAC & Solar Microgrid Setup', targetDate: '2024-11-15', completedDate: '', status: 'In Progress', percentageWeight: 15 },
    ],
    team: [
      { name: 'Sarah Jenkins', role: 'Chief Project Manager', phone: '+1 (555) 234-5678', email: 'sarah.j@buildnex.com' },
      { name: 'Raj Patel', role: 'Electrical Services Lead', phone: '+1 (555) 345-6789', email: 'raj.p@buildnex.com' },
    ],
  },
  {
    _id: 'proj-3',
    name: 'Emerald Bay Waterfront Villas',
    code: 'PRJ-2024-003',
    location: 'Marina Coastal Strip, Plot 18',
    projectManager: 'Liam Gallagher',
    startDate: '2024-04-01',
    expectedCompletionDate: '2025-11-30',
    budget: 3200000,
    spent: 980000,
    completionPercentage: 32,
    status: 'In Progress',
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    description: 'Exclusive enclave of 14 sea-facing private villas with private docks, infinity edge pools, and landscaped tropical gardens.',
    milestones: [
      { id: 'm31', title: 'Coastal Seawall & Foundation Piles', targetDate: '2024-07-15', completedDate: '2024-07-10', status: 'Completed', percentageWeight: 30 },
      { id: 'm32', title: 'Ground Floor & Cantilever Podiums', targetDate: '2024-11-30', completedDate: '', status: 'In Progress', percentageWeight: 30 },
      { id: 'm33', title: 'Roof Framing & Waterproofing', targetDate: '2025-04-15', completedDate: '', status: 'Pending', percentageWeight: 20 },
    ],
    team: [
      { name: 'Liam Gallagher', role: 'Villas Construction Lead', phone: '+1 (555) 678-1234', email: 'liam.g@buildnex.com' },
      { name: 'Chloe Dubois', role: 'Landscape Design Architect', phone: '+1 (555) 890-2345', email: 'chloe.d@buildnex.com' },
    ],
  },
  {
    _id: 'proj-4',
    name: 'Metro Line North Flyover Expansion',
    code: 'PRJ-2023-014',
    location: 'North Arterial Bypass Corridor',
    projectManager: 'Carlos Mendez, PE',
    startDate: '2023-02-15',
    expectedCompletionDate: '2024-06-30',
    budget: 8500000,
    spent: 8350000,
    completionPercentage: 100,
    status: 'Completed',
    category: 'Infrastructure',
    image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=1000&q=80',
    description: 'A 4.8 km 6-lane elevated viaduct connected to transit stations with anti-vibration damping spans.',
    milestones: [],
    team: [],
  },
  {
    _id: 'proj-5',
    name: 'Apex Logistics Mega Hub',
    code: 'PRJ-2024-008',
    location: 'Interstate Highway 95 Junction, Hub Zone',
    projectManager: 'Hannah Abbott',
    startDate: '2024-10-01',
    expectedCompletionDate: '2026-02-28',
    budget: 5400000,
    spent: 420000,
    completionPercentage: 12,
    status: 'Planning',
    category: 'Industrial',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80',
    description: 'Automated 500,000 sq.ft. cold-storage and distribution terminal with high-bay racking systems and 48 dock doors.',
    milestones: [],
    team: [],
  },
];

const INITIAL_TASKS: Task[] = [
  {
    _id: 'task-1',
    title: 'Reinforced concrete pour inspection for Floor 22 slab',
    description: 'Verify rebar spacing, cover blocks, and MEP conduit penetrations prior to pump delivery.',
    project: 'Skyline Heights Luxury Towers',
    assignedTo: 'Elena Rostova',
    priority: 'Urgent',
    dueDate: '2024-11-24',
    status: 'In Progress',
    category: 'Quality & Structural',
  },
  {
    _id: 'task-2',
    title: 'Review supplier bids for chillers and central AHU units',
    description: 'Compare thermal efficiency ratings and warranty agreements between Daikin and Trane.',
    project: 'Horizon Tech Business Park',
    assignedTo: 'Raj Patel',
    priority: 'High',
    dueDate: '2024-11-26',
    status: 'To Do',
    category: 'Procurement',
  },
  {
    _id: 'task-3',
    title: 'Finalize sea-wall waterproofing test documentation',
    description: 'Document water pressure resistance test results for maritime building authority signoff.',
    project: 'Emerald Bay Waterfront Villas',
    assignedTo: 'Liam Gallagher',
    priority: 'Medium',
    dueDate: '2024-11-28',
    status: 'Completed',
    category: 'Compliance',
  },
  {
    _id: 'task-4',
    title: 'Tower Crane #2 mandatory quarterly tension cable test',
    description: 'OSHA / Local safety bureau compliance check and brake inspection.',
    project: 'Skyline Heights Luxury Towers',
    assignedTo: 'David Kim',
    priority: 'Urgent',
    dueDate: '2024-11-23',
    status: 'In Progress',
    category: 'Safety',
  },
  {
    _id: 'task-5',
    title: 'Coordinate delivery of 50 Tons TMT Grade 550D Steel',
    description: 'Ensure gate pass and unloading crane availability at Gate 3.',
    project: 'Skyline Heights Luxury Towers',
    assignedTo: 'Marcus Vance',
    priority: 'High',
    dueDate: '2024-11-25',
    status: 'To Do',
    category: 'Logistics',
  },
  {
    _id: 'task-6',
    title: 'Architectural punch list review for Phase 1 handover',
    description: 'Check skirting, paint touch-ups, and silicone perimeter sealing.',
    project: 'Metro Line North Flyover Expansion',
    assignedTo: 'Carlos Mendez',
    priority: 'Low',
    dueDate: '2024-11-20',
    status: 'Completed',
    category: 'Punch List',
  },
  {
    _id: 'task-7',
    title: 'Geotechnical soil bearing capacity certification',
    description: 'Review core drill sample lab results for high-bay column footings.',
    project: 'Apex Logistics Mega Hub',
    assignedTo: 'Hannah Abbott',
    priority: 'High',
    dueDate: '2024-12-05',
    status: 'To Do',
    category: 'Engineering',
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    _id: 'exp-1',
    project: 'Skyline Heights Luxury Towers',
    title: 'Ready-mix Concrete (Grade M40 - 280 cu.m)',
    amount: 32500,
    category: 'Materials',
    date: '2024-11-18',
    vendor: 'Holcim ReadyMix Corp',
    status: 'Paid',
    invoiceNumber: 'INV-HL-9921',
    notes: 'Floor 21 slab and structural columns pour',
  },
  {
    _id: 'exp-2',
    project: 'Skyline Heights Luxury Towers',
    title: 'Subcontractor Structural Steel Labor (Bi-weekly)',
    amount: 48000,
    category: 'Labor',
    date: '2024-11-15',
    vendor: 'Apex Ironworkers Union Local 44',
    status: 'Paid',
    invoiceNumber: 'INV-APX-810',
    notes: '120 ironworkers for reinforcement fixing',
  },
  {
    _id: 'exp-3',
    project: 'Horizon Tech Business Park',
    title: 'Tower Crane & Concrete Pump Monthly Rental',
    amount: 19500,
    category: 'Equipment',
    date: '2024-11-10',
    vendor: 'Liebherr Heavy Equipment Hire',
    status: 'Approved',
    invoiceNumber: 'INV-LBR-4310',
    notes: '2x 60m tower cranes on active lease',
  },
  {
    _id: 'exp-4',
    project: 'Emerald Bay Waterfront Villas',
    title: 'Hydrophobic Crystalline Sealant & Additives',
    amount: 14200,
    category: 'Materials',
    date: '2024-11-08',
    vendor: 'Kryton Waterproofing Systems',
    status: 'Paid',
    invoiceNumber: 'INV-KRY-1102',
    notes: 'Water barrier treatment for coastal foundations',
  },
  {
    _id: 'exp-5',
    project: 'Apex Logistics Mega Hub',
    title: 'Heavy Earthmover & Bulldozer Fleet Fuel & Transport',
    amount: 8750,
    category: 'Transport',
    date: '2024-11-05',
    vendor: 'TransGlobal Hauling & Fuel',
    status: 'Pending',
    invoiceNumber: 'INV-TGH-741',
    notes: 'Site leveling and grading machinery diesel supply',
  },
  {
    _id: 'exp-6',
    project: 'Horizon Tech Business Park',
    title: 'Third-party Acoustical & Structural Vibration Testing',
    amount: 6400,
    category: 'Miscellaneous',
    date: '2024-10-28',
    vendor: 'Arup GeoConsulting Group',
    status: 'Paid',
    invoiceNumber: 'INV-ARP-552',
    notes: 'Laboratory compliance certification',
  },
];

const INITIAL_MATERIALS: Material[] = [
  {
    _id: 'mat-1',
    name: 'Portland Pozzolana Cement (50kg Bags)',
    category: 'Concrete & Masonry',
    quantity: 1450,
    unit: 'Bags',
    price: 9.5,
    supplier: 'UltraTech Cement Global',
    minThreshold: 400,
    status: 'In Stock',
    location: 'Warehouse Sector B',
    lastRestocked: '2024-11-14',
  },
  {
    _id: 'mat-2',
    name: 'TMT High-Yield Rebar Fe550D (16mm Dia)',
    category: 'Steel & Metals',
    quantity: 18,
    unit: 'Tons',
    price: 780.0,
    supplier: 'Tata Structural Steel Ltd',
    minThreshold: 25,
    status: 'Low Stock',
    location: 'Open Yard Bay 1',
    lastRestocked: '2024-10-25',
  },
  {
    _id: 'mat-3',
    name: 'Copper Armored Electrical Conduit (3C x 4 sq.mm)',
    category: 'Electrical',
    quantity: 2800,
    unit: 'Meters',
    price: 4.2,
    supplier: 'Schneider Electric Supplies',
    minThreshold: 600,
    status: 'In Stock',
    location: 'Electrical Storeroom A',
    lastRestocked: '2024-11-02',
  },
  {
    _id: 'mat-4',
    name: 'Structural Grade Coarse River Sand',
    category: 'Aggregates',
    quantity: 45,
    unit: 'Tons',
    price: 42.0,
    supplier: 'Delta River Quarry Partners',
    minThreshold: 50,
    status: 'Low Stock',
    location: 'Aggregates Silo 3',
    lastRestocked: '2024-11-01',
  },
  {
    _id: 'mat-5',
    name: 'CPVC Pressure Piping (1.5 inch x 10ft)',
    category: 'Plumbing',
    quantity: 650,
    unit: 'Units',
    price: 18.75,
    supplier: 'Astral Flow Systems',
    minThreshold: 150,
    status: 'In Stock',
    location: 'Plumbing Bay 2',
    lastRestocked: '2024-11-10',
  },
  {
    _id: 'mat-6',
    name: 'OSHA Approved High-Impact Hard Hats & Safety Harnesses',
    category: 'Safety',
    quantity: 8,
    unit: 'Sets',
    price: 95.0,
    supplier: '3M Industrial Safety Supply',
    minThreshold: 20,
    status: 'Low Stock',
    location: 'Safety Dispatch Office',
    lastRestocked: '2024-09-18',
  },
  {
    _id: 'mat-7',
    name: 'Vitrified Glazed Floor Tiles (600x600mm)',
    category: 'Finishes',
    quantity: 3200,
    unit: 'Boxes',
    price: 24.5,
    supplier: 'Kajaria Premium Ceramics',
    minThreshold: 500,
    status: 'In Stock',
    location: 'Finishes Depot 4',
    lastRestocked: '2024-11-09',
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    _id: 'cust-1',
    name: 'Dr. Arthur Sterling',
    email: 'arthur.sterling@mercyhealth.org',
    phone: '+1 (555) 412-8877',
    address: '445 Oakridge Boulevard, Suite 12',
    assignedProject: 'Skyline Heights Luxury Towers',
    propertyUnit: 'Tower A - Penthouse 3101',
    bookingStatus: 'Agreement Signed',
    paymentStatus: 'Partially Paid',
    totalAmount: 920000,
    paidAmount: 644000,
    notes: 'Requested customized marble flooring in master suite and smart automation wiring.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    _id: 'cust-2',
    name: 'Jonathan & Rachel Vance',
    email: 'j.vance@techventures.io',
    phone: '+1 (555) 679-0943',
    address: '882 Silicon Drive, Silicon Bay',
    assignedProject: 'Emerald Bay Waterfront Villas',
    propertyUnit: 'Villa Ocean 07',
    bookingStatus: 'Booked',
    paymentStatus: 'Partially Paid',
    totalAmount: 1450000,
    paidAmount: 435000,
    notes: 'Opted for upgraded heated infinity pool and private yacht berth mooring.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    _id: 'cust-3',
    name: 'Sophia Chen, Esq.',
    email: 'sophia.chen@chenpartners.law',
    phone: '+1 (555) 891-3421',
    address: '120 Wall St Financial Center',
    assignedProject: 'Skyline Heights Luxury Towers',
    propertyUnit: 'Tower B - Flat 1804 (3BHK)',
    bookingStatus: 'Handed Over',
    paymentStatus: 'Completed',
    totalAmount: 480000,
    paidAmount: 480000,
    notes: 'Full payment cleared via escrow. Key handover ceremony scheduled.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  },
  {
    _id: 'cust-4',
    name: 'Robert Montgomery',
    email: 'rmontgomery@capitalgroup.com',
    phone: '+1 (555) 302-6119',
    address: '94 Highland Park Court',
    assignedProject: 'Horizon Tech Business Park',
    propertyUnit: 'Floor 12 - Corporate Suite B',
    bookingStatus: 'Booked',
    paymentStatus: 'Pending',
    totalAmount: 1250000,
    paidAmount: 250000,
    notes: 'Corporate lease with option to purchase after 3 years.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    _id: 'book-1',
    propertyName: 'Skyline Heights Luxury Towers',
    unitNumber: 'Tower A - Unit 3101',
    propertyType: 'Penthouse',
    price: 920000,
    areaSqFt: 3450,
    floor: 31,
    bedrooms: 4,
    bathrooms: 4.5,
    customerName: 'Dr. Arthur Sterling',
    customerEmail: 'arthur.sterling@mercyhealth.org',
    customerPhone: '+1 (555) 412-8877',
    bookingDate: '2024-03-14',
    status: 'Sold',
    features: ['Panoramic Skyline Views', 'Private Elevator Foyer', 'Jacuzzi Terrace', 'Smart Home Hub'],
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: 'book-2',
    propertyName: 'Emerald Bay Waterfront Villas',
    unitNumber: 'Villa Ocean 07',
    propertyType: 'Villa',
    price: 1450000,
    areaSqFt: 4800,
    floor: 2,
    bedrooms: 5,
    bathrooms: 6,
    customerName: 'Jonathan & Rachel Vance',
    customerEmail: 'j.vance@techventures.io',
    customerPhone: '+1 (555) 679-0943',
    bookingDate: '2024-05-20',
    status: 'Reserved',
    features: ['Direct Beach Access', 'Private Dock', 'Infinity Pool', 'Staff Quarters'],
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: 'book-3',
    propertyName: 'Skyline Heights Luxury Towers',
    unitNumber: 'Tower B - Unit 2202',
    propertyType: 'Apartment',
    price: 540000,
    areaSqFt: 1850,
    floor: 22,
    bedrooms: 3,
    bathrooms: 3,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    bookingDate: '',
    status: 'Available',
    features: ['Balcony Sunset View', 'Designer Italian Kitchen', 'Double Carport', 'Walk-in Closets'],
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: 'book-4',
    propertyName: 'Skyline Heights Luxury Towers',
    unitNumber: 'Tower B - Unit 1405',
    propertyType: 'Apartment',
    price: 395000,
    areaSqFt: 1320,
    floor: 14,
    bedrooms: 2,
    bathrooms: 2,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    bookingDate: '',
    status: 'Available',
    features: ['Corner Unit', 'East-facing Sunlight', 'Modular Wardrobes'],
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: 'book-5',
    propertyName: 'Horizon Tech Business Park',
    unitNumber: 'Tower 1 - Floor 08',
    propertyType: 'Commercial',
    price: 890000,
    areaSqFt: 5200,
    floor: 8,
    bedrooms: 0,
    bathrooms: 4,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    bookingDate: '',
    status: 'Available',
    features: ['Open Floor Plan', 'High-Speed Fiber Riser', 'LEED Platinum Air Quality', 'Cafeteria Access'],
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: 'book-6',
    propertyName: 'Emerald Bay Waterfront Villas',
    unitNumber: 'Villa Palm 02',
    propertyType: 'Villa',
    price: 1320000,
    areaSqFt: 4200,
    floor: 2,
    bedrooms: 4,
    bathrooms: 5,
    customerName: 'Marcus & Diana Brody',
    customerEmail: 'mbrody@brodyinvestments.com',
    customerPhone: '+1 (555) 778-9012',
    bookingDate: '2024-08-11',
    status: 'Sold',
    features: ['Tropical Garden Pavilion', 'Solar Water Heating', 'Wine Cellar'],
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  },
];

const INITIAL_PROGRESS: ProgressUpdate[] = [
  {
    _id: 'prog-1',
    project: 'Skyline Heights Luxury Towers',
    workCompleted: 'Completion of 21st Floor Post-Tensioned Slab Casting',
    completionPercentage: 68,
    date: '2024-11-19',
    description: 'Poured 280 cu.m of M40 Grade self-compacting concrete over 14 hours. Cube compression tests verified at 98.4% strength at 7 days. Core post-tensioning stress application scheduled for Friday.',
    loggedBy: 'Elena Rostova (Structural Lead)',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80',
    milestoneStatus: 'On Track',
    weatherCondition: 'Clear & Dry, 24°C',
    laborCount: 48,
  },
  {
    _id: 'prog-2',
    project: 'Horizon Tech Business Park',
    workCompleted: 'Double-glazed Unitized Facade Installation (Floors 10-15)',
    completionPercentage: 88,
    date: '2024-11-16',
    description: 'Installed 140 glass curtain panels with thermal break gaskets. Water tightness test conducted with pressurized spray bar nozzles; zero leakage detected.',
    loggedBy: 'Sarah Jenkins (Project Manager)',
    photoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    milestoneStatus: 'Ahead of Schedule',
    weatherCondition: 'Overcast, 21°C',
    laborCount: 32,
  },
  {
    _id: 'prog-3',
    project: 'Emerald Bay Waterfront Villas',
    workCompleted: 'Cantilevered Upper Deck Formwork and Maritime Waterproofing',
    completionPercentage: 32,
    date: '2024-11-12',
    description: 'Marine-grade crystalline waterproofing slurry applied to sub-grade podiums of Villas 4 through 8. Geotechnical stability sensors showed zero displacement under tide surge.',
    loggedBy: 'Liam Gallagher (Site Lead)',
    photoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    milestoneStatus: 'On Track',
    weatherCondition: 'Sunny Coastal Breeze, 27°C',
    laborCount: 22,
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'warning',
    title: 'Low Material Alert: TMT Rebar (16mm)',
    description: 'Current stock is 18 Tons, which is below the minimum threshold of 25 Tons. Consider restocking.',
    timestamp: '15 minutes ago',
    unread: true,
    link: '/inventory',
  },
  {
    id: 'notif-2',
    type: 'deadline',
    title: 'Upcoming Milestone Deadline',
    description: 'Superstructure Structural Framing for Skyline Heights is due in 2 days (Nov 24).',
    timestamp: '1 hour ago',
    unread: true,
    link: '/projects/proj-1',
  },
  {
    id: 'notif-3',
    type: 'success',
    title: 'New Property Booking Confirmed',
    description: 'Dr. Arthur Sterling finalized agreement for Tower A - Unit 3101 ($920,000).',
    timestamp: '3 hours ago',
    unread: true,
    link: '/bookings',
  },
  {
    id: 'notif-4',
    type: 'budget',
    title: 'Budget Threshold Notice',
    description: 'Horizon Tech Business Park has utilized 87% of allocated budget ($5.92M / $6.8M).',
    timestamp: 'Yesterday',
    unread: false,
    link: '/finance',
  },
  {
    id: 'notif-5',
    type: 'info',
    title: 'Progress Logged for Skyline Heights',
    description: 'Floor 21 post-tensioned slab casting completed and logged by Elena Rostova.',
    timestamp: '2 days ago',
    unread: false,
    link: '/progress',
  },
];

// LocalStorage helpers
const loadStorage = <T>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(`buildnex_${key}`);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const saveStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`buildnex_${key}`, JSON.stringify(data));
  } catch (err) {
    console.error('Storage write error', err);
  }
};

// Check if backend is reachable
let isBackendLive: boolean | null = null;

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET', signal: AbortSignal.timeout(1500) });
    const data = await res.json();
    isBackendLive = data.status === 'online';
    return isBackendLive;
  } catch {
    isBackendLive = false;
    return false;
  }
};

// Generic Fetcher with transparent fallback to LocalStorage
const request = async <T>(
  endpoint: string,
  method = 'GET',
  body?: any,
  storageKey?: string,
  fallbackFn?: (items: any[]) => any
): Promise<T> => {
  // If backend health is unchecked or online, try network
  if (isBackendLive !== false) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(2500),
      });

      if (res.ok) {
        const json = await res.json();
        isBackendLive = true;
        return json.data !== undefined ? json.data : (json as unknown as T);
      }
    } catch {
      // Backend request failed or timed out, switch to localStorage fallback
      isBackendLive = false;
    }
  }

  // Fallback to local storage
  if (storageKey && fallbackFn) {
    const items = loadStorage(storageKey, getDefaultItems(storageKey));
    const result = fallbackFn(items);
    saveStorage(storageKey, items);
    return result as T;
  }

  throw new Error(`Fallback handler not configured for ${endpoint}`);
};

const getDefaultItems = (key: string): any[] => {
  switch (key) {
    case 'projects':
      return INITIAL_PROJECTS;
    case 'tasks':
      return INITIAL_TASKS;
    case 'expenses':
      return INITIAL_EXPENSES;
    case 'materials':
      return INITIAL_MATERIALS;
    case 'customers':
      return INITIAL_CUSTOMERS;
    case 'bookings':
      return INITIAL_BOOKINGS;
    case 'progress':
      return INITIAL_PROGRESS;
    case 'notifications':
      return INITIAL_NOTIFICATIONS;
    default:
      return [];
  }
};

export const api = {
  // Mode info
  getBackendStatus: () => isBackendLive,

  resetDemoData: async () => {
    try {
      await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
    } catch {
      // fallback
    }
    localStorage.removeItem('buildnex_projects');
    localStorage.removeItem('buildnex_tasks');
    localStorage.removeItem('buildnex_expenses');
    localStorage.removeItem('buildnex_materials');
    localStorage.removeItem('buildnex_customers');
    localStorage.removeItem('buildnex_bookings');
    localStorage.removeItem('buildnex_progress');
    localStorage.removeItem('buildnex_notifications');
    window.location.reload();
  },

  // Dashboard
  getDashboard: async (): Promise<DashboardMetrics> => {
    return request<DashboardMetrics>(
      '/analytics/dashboard',
      'GET',
      undefined,
      'projects',
      () => {
        const projects = loadStorage('projects', INITIAL_PROJECTS);
        const expenses = loadStorage('expenses', INITIAL_EXPENSES);
        const bookings = loadStorage('bookings', INITIAL_BOOKINGS);
        const tasks = loadStorage('tasks', INITIAL_TASKS);
        const materials = loadStorage('materials', INITIAL_MATERIALS);

        const totalActiveProjects = projects.filter((p) => p.status === 'In Progress' || p.status === 'Planning').length;
        const completedProjects = projects.filter((p) => p.status === 'Completed').length;
        const underConstruction = projects.filter((p) => p.status === 'In Progress').length;
        const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
        const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
        const totalRevenue = bookings
          .filter((b) => b.status === 'Sold' || b.status === 'Reserved')
          .reduce((acc, b) => acc + (b.price || 0), 0);
        const overallCompletion =
          projects.length > 0
            ? Math.round(projects.reduce((acc, p) => acc + (p.completionPercentage || 0), 0) / projects.length)
            : 0;

        return {
          totalActiveProjects,
          completedProjects,
          underConstruction,
          totalBudget,
          totalExpenses,
          totalRevenue,
          overallCompletion,
          monthlyExpenses: [
            { month: 'Jun', amount: 84000, budget: 110000 },
            { month: 'Jul', amount: 96000, budget: 110000 },
            { month: 'Aug', amount: 135000, budget: 125000 },
            { month: 'Sep', amount: 118000, budget: 125000 },
            { month: 'Oct', amount: 142000, budget: 130000 },
            { month: 'Nov', amount: 129350, budget: 130000 },
          ],
          projectProgress: projects.map((p) => ({
            name: p.name.length > 18 ? p.name.substring(0, 18) + '...' : p.name,
            fullName: p.name,
            completion: p.completionPercentage,
            budget: p.budget,
            spent: p.spent,
          })),
          projectStatusCounts: {
            Planning: projects.filter((p) => p.status === 'Planning').length,
            InProgress: projects.filter((p) => p.status === 'In Progress').length,
            OnHold: projects.filter((p) => p.status === 'On Hold').length,
            Completed: projects.filter((p) => p.status === 'Completed').length,
          },
          lowStockCount: materials.filter((m) => m.quantity <= m.minThreshold).length,
          upcomingDeadlines: tasks
            .filter((t) => t.status !== 'Completed')
            .slice(0, 4)
            .map((t) => ({
              id: t._id,
              title: t.title,
              project: t.project,
              dueDate: t.dueDate,
              priority: t.priority,
              assignedTo: t.assignedTo,
            })),
          recentActivities: [
            { id: 'act-1', text: 'Floor 21 slab pour completed on Skyline Towers', time: '2 hours ago', type: 'progress' },
            { id: 'act-2', text: 'ReadyMix Concrete payment $32,500 approved', time: '5 hours ago', type: 'finance' },
            { id: 'act-3', text: 'Unit 3101 booked by Dr. Arthur Sterling', time: '1 day ago', type: 'booking' },
            { id: 'act-4', text: 'Tower Crane quarterly inspection completed', time: '2 days ago', type: 'safety' },
            { id: 'act-5', text: 'Procured 1,450 bags of Portland Cement', time: '3 days ago', type: 'inventory' },
          ],
        };
      }
    );
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    return request<Project[]>('/projects', 'GET', undefined, 'projects', (items) => [...items]);
  },
  getProject: async (id: string): Promise<Project> => {
    return request<Project>(`/projects/${id}`, 'GET', undefined, 'projects', (items) => {
      const found = items.find((p) => p._id === id || p.code === id);
      if (!found) throw new Error('Project not found');
      return found;
    });
  },
  createProject: async (data: Partial<Project>): Promise<Project> => {
    return request<Project>('/projects', 'POST', data, 'projects', (items) => {
      const newProj: Project = {
        _id: `proj-${Date.now()}`,
        name: data.name || 'New Construction Project',
        code: `PRJ-2024-${Math.floor(100 + Math.random() * 900)}`,
        location: data.location || 'Site Location',
        projectManager: data.projectManager || 'Site Manager',
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        expectedCompletionDate: data.expectedCompletionDate || '2025-12-31',
        budget: Number(data.budget) || 1000000,
        spent: Number(data.spent) || 0,
        completionPercentage: Number(data.completionPercentage) || 0,
        status: data.status || 'Planning',
        category: data.category || 'Residential',
        image: data.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=1000&q=80',
        description: data.description || '',
        milestones: data.milestones || [
          { id: 'm1', title: 'Excavation & Foundations', targetDate: '2025-03-01', status: 'In Progress', percentageWeight: 30 },
          { id: 'm2', title: 'Structural Superstructure', targetDate: '2025-07-01', status: 'Pending', percentageWeight: 40 },
          { id: 'm3', title: 'Finishes & Handover', targetDate: '2025-12-01', status: 'Pending', percentageWeight: 30 },
        ],
        team: data.team || [{ name: data.projectManager || 'Lead Manager', role: 'Project Director', phone: '+1 (555) 000-1122', email: 'pm@buildnex.com' }],
      };
      items.unshift(newProj);
      return newProj;
    });
  },
  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    return request<Project>(`/projects/${id}`, 'PUT', data, 'projects', (items) => {
      const idx = items.findIndex((p) => p._id === id);
      if (idx === -1) throw new Error('Project not found');
      items[idx] = { ...items[idx], ...data };
      return items[idx];
    });
  },
  deleteProject: async (id: string): Promise<void> => {
    return request<void>(`/projects/${id}`, 'DELETE', undefined, 'projects', (items) => {
      const idx = items.findIndex((p) => p._id === id);
      if (idx !== -1) items.splice(idx, 1);
    });
  },

  // Tasks
  getTasks: async (): Promise<Task[]> => {
    return request<Task[]>('/tasks', 'GET', undefined, 'tasks', (items) => [...items]);
  },
  createTask: async (data: Partial<Task>): Promise<Task> => {
    return request<Task>('/tasks', 'POST', data, 'tasks', (items) => {
      const newTask: Task = {
        _id: `task-${Date.now()}`,
        title: data.title || '',
        description: data.description || '',
        project: data.project || 'General Project',
        assignedTo: data.assignedTo || 'Unassigned',
        priority: data.priority || 'Medium',
        dueDate: data.dueDate || new Date().toISOString().split('T')[0],
        status: data.status || 'To Do',
        category: data.category || 'General',
      };
      items.unshift(newTask);
      return newTask;
    });
  },
  updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    return request<Task>(`/tasks/${id}`, 'PUT', data, 'tasks', (items) => {
      const idx = items.findIndex((t) => t._id === id);
      if (idx === -1) throw new Error('Task not found');
      items[idx] = { ...items[idx], ...data };
      return items[idx];
    });
  },
  deleteTask: async (id: string): Promise<void> => {
    return request<void>(`/tasks/${id}`, 'DELETE', undefined, 'tasks', (items) => {
      const idx = items.findIndex((t) => t._id === id);
      if (idx !== -1) items.splice(idx, 1);
    });
  },

  // Expenses
  getExpenses: async (): Promise<Expense[]> => {
    return request<Expense[]>('/expenses', 'GET', undefined, 'expenses', (items) => [...items]);
  },
  createExpense: async (data: Partial<Expense>): Promise<Expense> => {
    return request<Expense>('/expenses', 'POST', data, 'expenses', (items) => {
      const newExp: Expense = {
        _id: `exp-${Date.now()}`,
        project: data.project || 'Skyline Heights Luxury Towers',
        title: data.title || '',
        amount: Number(data.amount) || 0,
        category: data.category || 'Materials',
        date: data.date || new Date().toISOString().split('T')[0],
        vendor: data.vendor || 'Direct Vendor',
        status: data.status || 'Approved',
        notes: data.notes || '',
        invoiceNumber: data.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      items.unshift(newExp);
      return newExp;
    });
  },
  updateExpense: async (id: string, data: Partial<Expense>): Promise<Expense> => {
    return request<Expense>(`/expenses/${id}`, 'PUT', data, 'expenses', (items) => {
      const idx = items.findIndex((e) => e._id === id);
      if (idx === -1) throw new Error('Expense not found');
      items[idx] = { ...items[idx], ...data };
      return items[idx];
    });
  },
  deleteExpense: async (id: string): Promise<void> => {
    return request<void>(`/expenses/${id}`, 'DELETE', undefined, 'expenses', (items) => {
      const idx = items.findIndex((e) => e._id === id);
      if (idx !== -1) items.splice(idx, 1);
    });
  },

  // Materials
  getMaterials: async (): Promise<Material[]> => {
    return request<Material[]>('/materials', 'GET', undefined, 'materials', (items) => [...items]);
  },
  createMaterial: async (data: Partial<Material>): Promise<Material> => {
    return request<Material>('/materials', 'POST', data, 'materials', (items) => {
      const qty = Number(data.quantity) || 0;
      const threshold = Number(data.minThreshold) || 10;
      const status = qty <= 0 ? 'Out of Stock' : qty <= threshold ? 'Low Stock' : 'In Stock';
      const newMat: Material = {
        _id: `mat-${Date.now()}`,
        name: data.name || '',
        category: data.category || 'Concrete & Masonry',
        quantity: qty,
        unit: data.unit || 'Units',
        price: Number(data.price) || 0,
        supplier: data.supplier || 'General Supplier',
        minThreshold: threshold,
        status,
        location: data.location || 'Central Depot',
        lastRestocked: new Date().toISOString().split('T')[0],
      };
      items.unshift(newMat);
      return newMat;
    });
  },
  updateMaterial: async (id: string, data: Partial<Material>): Promise<Material> => {
    return request<Material>(`/materials/${id}`, 'PUT', data, 'materials', (items) => {
      const idx = items.findIndex((m) => m._id === id);
      if (idx === -1) throw new Error('Material not found');
      let updated = { ...items[idx], ...data };
      if (data.quantity !== undefined || data.minThreshold !== undefined) {
        const q = Number(updated.quantity);
        const t = Number(updated.minThreshold);
        updated.status = q <= 0 ? 'Out of Stock' : q <= t ? 'Low Stock' : 'In Stock';
      }
      items[idx] = updated;
      return items[idx];
    });
  },
  deleteMaterial: async (id: string): Promise<void> => {
    return request<void>(`/materials/${id}`, 'DELETE', undefined, 'materials', (items) => {
      const idx = items.findIndex((m) => m._id === id);
      if (idx !== -1) items.splice(idx, 1);
    });
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    return request<Customer[]>('/customers', 'GET', undefined, 'customers', (items) => [...items]);
  },
  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    return request<Customer>('/customers', 'POST', data, 'customers', (items) => {
      const newCust: Customer = {
        _id: `cust-${Date.now()}`,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        assignedProject: data.assignedProject || 'Skyline Heights Luxury Towers',
        propertyUnit: data.propertyUnit || 'Unit 101',
        bookingStatus: data.bookingStatus || 'Booked',
        paymentStatus: data.paymentStatus || 'Pending',
        totalAmount: Number(data.totalAmount) || 0,
        paidAmount: Number(data.paidAmount) || 0,
        notes: data.notes || '',
        avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      };
      items.unshift(newCust);
      return newCust;
    });
  },
  updateCustomer: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    return request<Customer>(`/customers/${id}`, 'PUT', data, 'customers', (items) => {
      const idx = items.findIndex((c) => c._id === id);
      if (idx === -1) throw new Error('Customer not found');
      items[idx] = { ...items[idx], ...data };
      return items[idx];
    });
  },
  deleteCustomer: async (id: string): Promise<void> => {
    return request<void>(`/customers/${id}`, 'DELETE', undefined, 'customers', (items) => {
      const idx = items.findIndex((c) => c._id === id);
      if (idx !== -1) items.splice(idx, 1);
    });
  },

  // Bookings
  getBookings: async (): Promise<Booking[]> => {
    return request<Booking[]>('/bookings', 'GET', undefined, 'bookings', (items) => [...items]);
  },
  createBooking: async (data: Partial<Booking>): Promise<Booking> => {
    return request<Booking>('/bookings', 'POST', data, 'bookings', (items) => {
      const newBook: Booking = {
        _id: `book-${Date.now()}`,
        propertyName: data.propertyName || 'Skyline Heights Luxury Towers',
        unitNumber: data.unitNumber || 'Unit 101',
        propertyType: data.propertyType || 'Apartment',
        price: Number(data.price) || 250000,
        areaSqFt: Number(data.areaSqFt) || 1200,
        floor: Number(data.floor) || 1,
        bedrooms: Number(data.bedrooms) || 2,
        bathrooms: Number(data.bathrooms) || 2,
        customerName: data.customerName || '',
        customerEmail: data.customerEmail || '',
        customerPhone: data.customerPhone || '',
        bookingDate: data.bookingDate || '',
        status: data.status || 'Available',
        features: data.features || ['Modern Balcony', 'Central AC', 'Covered Parking'],
        imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      };
      items.unshift(newBook);
      return newBook;
    });
  },
  updateBooking: async (id: string, data: Partial<Booking>): Promise<Booking> => {
    return request<Booking>(`/bookings/${id}`, 'PUT', data, 'bookings', (items) => {
      const idx = items.findIndex((b) => b._id === id);
      if (idx === -1) throw new Error('Booking not found');
      items[idx] = { ...items[idx], ...data };
      return items[idx];
    });
  },
  deleteBooking: async (id: string): Promise<void> => {
    return request<void>(`/bookings/${id}`, 'DELETE', undefined, 'bookings', (items) => {
      const idx = items.findIndex((b) => b._id === id);
      if (idx !== -1) items.splice(idx, 1);
    });
  },

  // Progress Updates
  getProgressUpdates: async (): Promise<ProgressUpdate[]> => {
    return request<ProgressUpdate[]>('/progress', 'GET', undefined, 'progress', (items) => [...items]);
  },
  createProgressUpdate: async (data: Partial<ProgressUpdate>): Promise<ProgressUpdate> => {
    return request<ProgressUpdate>('/progress', 'POST', data, 'progress', (items) => {
      const newUp: ProgressUpdate = {
        _id: `prog-${Date.now()}`,
        project: data.project || 'Skyline Heights Luxury Towers',
        workCompleted: data.workCompleted || '',
        completionPercentage: Number(data.completionPercentage) || 0,
        date: data.date || new Date().toISOString().split('T')[0],
        description: data.description || '',
        loggedBy: data.loggedBy || 'Site Engineer',
        photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80',
        milestoneStatus: data.milestoneStatus || 'On Track',
        weatherCondition: data.weatherCondition || 'Clear',
        laborCount: Number(data.laborCount) || 25,
      };
      items.unshift(newUp);

      // also update projects list in localStorage
      const projects = loadStorage('projects', INITIAL_PROJECTS);
      const target = projects.find((p) => p.name === data.project || p._id === data.project);
      if (target) {
        target.completionPercentage = Math.max(target.completionPercentage, newUp.completionPercentage);
        saveStorage('projects', projects);
      }

      return newUp;
    });
  },
  deleteProgressUpdate: async (id: string): Promise<void> => {
    return request<void>(`/progress/${id}`, 'DELETE', undefined, 'progress', (items) => {
      const idx = items.findIndex((p) => p._id === id);
      if (idx !== -1) items.splice(idx, 1);
    });
  },

  // Notifications
  getNotifications: async (): Promise<NotificationItem[]> => {
    return request<NotificationItem[]>('/notifications', 'GET', undefined, 'notifications', (items) => [...items]);
  },
  markNotificationRead: async (id: string): Promise<void> => {
    return request<void>(`/notifications/${id}/read`, 'PATCH', undefined, 'notifications', (items) => {
      const notif = items.find((n) => n.id === id);
      if (notif) notif.unread = false;
    });
  },

  // BuildNex AI
  askAi: async (message: string, history: any[] = []): Promise<{ reply: string; mode: string }> => {
    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversationHistory: history }),
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        return { reply: data.reply, mode: data.mode };
      }
    } catch {
      // client-side rule engine fallback
    }

    const q = message.toLowerCase();
    if (q.includes('budget') || q.includes('cost') || q.includes('spent')) {
      return {
        reply: `### 💰 Financial & Budget Summary
- **Total Portfolio Budget:** $28,400,000 across 5 active projects
- **Total Incurred Expenses:** $18,520,000 (65.2% commitment)
- **Top Consumer:** *Horizon Tech Business Park* ($5.92M spent / $6.8M budget)
- **Status:** All project contingencies remain healthy with no cost overrun alerts on current active phases.`,
        mode: 'client-ai-engine',
      };
    } else if (q.includes('material') || q.includes('stock') || q.includes('inventory')) {
      return {
        reply: `### 📦 Material & Inventory Intelligence
Active warnings detected:
- **TMT High-Yield Rebar (16mm):** 18 Tons on site (below threshold of 25 Tons). Immediate replenishment advised.
- **River Sand:** 45 Tons in Silo 3 (threshold is 50 Tons).
- **Safety Equipment:** 8 sets remaining in storage office.`,
        mode: 'client-ai-engine',
      };
    } else if (q.includes('skyline') || q.includes('progress') || q.includes('milestone')) {
      return {
        reply: `### 🏗️ Construction Progress Update
- **Skyline Heights Luxury Towers:** 68% complete. Poured Floor 21 post-tensioned slab with 98.4% 7-day strength rating.
- **Horizon Tech Business Park:** 88% complete. Facade installation is running 4 days ahead of scheduled timeline.
- **Emerald Bay Waterfront Villas:** 32% complete. Cantilever deck marine waterproofing passed sea-surge pressure tests.`,
        mode: 'client-ai-engine',
      };
    }

    return {
      reply: `### 🤖 BuildNex Construction Assistant
I can assist with real-time portfolio analytics, material inventory checks, milestone scheduling, and job site safety compliance. 

Try asking:
- *"What is our total budget and spending status?"*
- *"Which materials need urgent restocking?"*
- *"Give me a progress breakdown for Skyline Heights Towers"*
- *"Draft a weekly executive project report"*`,
      mode: 'client-ai-engine',
    };
  },
};
