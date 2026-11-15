import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  CommunityReport,
  FeedbackItem,
  HealthcareFacility,
  PreArrivalNotification,
  UserProfile,
} from '../src/types/triage';

export interface StoredUser extends UserProfile {
  passwordHash: string;
}

export interface OfficialWaitUpdate {
  id: string;
  facilityId: string;
  adminId: string;
  waitMinutes: number | null;
  statusNote: string;
  updatedAt: string;
}

export interface StoreData {
  users: StoredUser[];
  facilities: HealthcareFacility[];
  communityReports: CommunityReport[];
  officialWaitUpdates: OfficialWaitUpdate[];
  preArrivals: PreArrivalNotification[];
  feedback: FeedbackItem[];
  analytics: {
    symptomSearchCounts: Record<string, number>;
    facilityViewCounts: Record<string, number>;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'triage-store.json');

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, originalHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const original = Buffer.from(originalHex, 'hex');
  if (derived.length !== original.length) return false;
  return crypto.timingSafeEqual(derived, original);
}

function createSeedData(): StoreData {
  const now = Date.now();
  const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();
  const hoursAhead = (h: number) => new Date(now + h * 3600_000).toISOString();

  const facilities: HealthcareFacility[] = [
    {
      id: 'fac-capital-ed',
      name: 'Capital General Hospital & Emergency Centre',
      category: 'emergency_department',
      address: 'Unit 6, Ekamra Marg, Bhubaneswar, Odisha',
      city: 'Bhubaneswar',
      pinCode: '751001',
      lat: 20.2644,
      lng: 85.8266,
      phone: '+91-674-2391983',
      operatingHours: 'Open 24 Hours (Emergency & Trauma)',
      isOpen24x7: true,
      openHour: 0,
      closeHour: 24,
      hasEmergencyDept: true,
      services: ['Emergency Medicine', 'Trauma Care', 'Cardiology', 'Neurology', 'General Medicine', 'Fever Clinic', 'IV Hydration'],
      specialties: ['Emergency Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Internal Medicine', 'Pediatrics'],
      pediatricServices: true,
      maternityServices: true,
      geriatricCare: true,
      mentalHealthServices: true,
      chronicCareSupport: ['Diabetes', 'Hypertension', 'Asthma', 'Heart Conditions', 'Kidney Care'],
      diagnosticFacilities: ['CT Scan', 'X-Ray', 'ECG', '24x7 Pathology Lab', 'Ultrasound'],
      accessibility: {
        wheelchairAccessible: true,
        ramps: true,
        elevators: true,
        accessibleToilets: true,
        signLanguageSupport: true,
        hearingVisualAid: true,
      },
      officialWaitMinutes: 145,
      communityWaitMinutes: 150,
      waitTimeSource: 'facility_confirmed',
      lastUpdatedAt: minutesAgo(8),
      recentReportCount: 6,
      waitTrend: 'rising',
      checkInInstructions: 'Enter via Gate 2 Emergency Triage Desk. Keep photo ID and symptom summary ready.',
      imageUrl: '/src/assets/images/facility_hospital_general_1794655608091.jpg',
      isDemoData: true,
    },
    {
      id: 'fac-aiims-trauma',
      name: 'AIIMS Regional Emergency & Tertiary Hospital',
      category: 'hospital',
      address: 'Sijua, Patrapada, Bhubaneswar, Odisha',
      city: 'Bhubaneswar',
      pinCode: '751019',
      lat: 20.2314,
      lng: 85.7751,
      phone: '+91-674-2476789',
      operatingHours: 'Open 24 Hours (Tertiary Emergency)',
      isOpen24x7: true,
      openHour: 0,
      closeHour: 24,
      hasEmergencyDept: true,
      services: ['Emergency Medicine', 'Trauma Care', 'Cardiology', 'Neurology', 'Respiratory Support', 'Critical Care'],
      specialties: ['Cardiology', 'Neurology', 'Nephrology', 'Pediatrics', 'Obstetrics & Gynecology', 'Psychiatry'],
      pediatricServices: true,
      maternityServices: true,
      geriatricCare: true,
      mentalHealthServices: true,
      chronicCareSupport: ['Diabetes', 'Hypertension', 'Asthma', 'Heart Conditions', 'Kidney Care'],
      diagnosticFacilities: ['MRI', 'CT Scan', 'X-Ray', 'ECG', 'Blood Bank', '24x7 Lab'],
      accessibility: {
        wheelchairAccessible: true,
        ramps: true,
        elevators: true,
        accessibleToilets: true,
        signLanguageSupport: true,
        hearingVisualAid: true,
      },
      officialWaitMinutes: 180,
      communityWaitMinutes: 170,
      waitTimeSource: 'facility_confirmed',
      lastUpdatedAt: minutesAgo(12),
      recentReportCount: 9,
      waitTrend: 'steady',
      checkInInstructions: 'Proceed directly to Trauma & Emergency Reception Block A for triage registration.',
      imageUrl: '/src/assets/images/facility_hospital_general_1794655608091.jpg',
      isDemoData: true,
    },
    {
      id: 'fac-sunrise-urgent',
      name: 'Sunrise Urgent Care & Minor Trauma Clinic',
      category: 'urgent_care',
      address: 'Janpath Road, Saheed Nagar, Bhubaneswar, Odisha',
      city: 'Bhubaneswar',
      pinCode: '751007',
      lat: 20.2896,
      lng: 85.8442,
      phone: '+91-674-2548810',
      operatingHours: '07:00 – 23:00 Daily',
      isOpen24x7: false,
      openHour: 7,
      closeHour: 23,
      hasEmergencyDept: false,
      services: ['Urgent Care', 'Wound Care', 'X-Ray', 'Orthopedics', 'Fever Clinic', 'IV Hydration', 'General Medicine'],
      specialties: ['Urgent Care', 'Family Medicine', 'Orthopedic Urgent Care', 'ENT'],
      pediatricServices: true,
      maternityServices: false,
      geriatricCare: true,
      mentalHealthServices: false,
      chronicCareSupport: ['Diabetes', 'Hypertension', 'Asthma'],
      diagnosticFacilities: ['Digital X-Ray', 'ECG', 'Rapid Blood & Dengue Panel'],
      accessibility: {
        wheelchairAccessible: true,
        ramps: true,
        elevators: false,
        accessibleToilets: true,
        signLanguageSupport: false,
        hearingVisualAid: true,
      },
      officialWaitMinutes: null,
      communityWaitMinutes: 15,
      waitTimeSource: 'community_reported',
      lastUpdatedAt: minutesAgo(14),
      recentReportCount: 4,
      waitTrend: 'falling',
      checkInInstructions: 'Check in at the ground-floor Urgent Care desk. Suitable for sprains, minor burns, fevers, and cuts.',
      imageUrl: '/src/assets/images/facility_urgent_care_1794655608824.jpg',
      isDemoData: true,
    },
    {
      id: 'fac-kalinga-multi',
      name: 'Kalinga Heart & Multi-Specialty Hospital',
      category: 'hospital',
      address: 'Chandrasekharpur, Jayadev Vihar, Bhubaneswar, Odisha',
      city: 'Bhubaneswar',
      pinCode: '751013',
      lat: 20.3039,
      lng: 85.8195,
      phone: '+91-674-6665200',
      operatingHours: 'Open 24 Hours',
      isOpen24x7: true,
      openHour: 0,
      closeHour: 24,
      hasEmergencyDept: true,
      services: ['Emergency Medicine', 'Cardiology', 'Respiratory Support', 'General Medicine', 'Orthopedics', 'Neurology'],
      specialties: ['Cardiology', 'Pulmonology', 'Internal Medicine', 'Orthopedics', 'Geriatrics'],
      pediatricServices: true,
      maternityServices: true,
      geriatricCare: true,
      mentalHealthServices: false,
      chronicCareSupport: ['Heart Conditions', 'Hypertension', 'Diabetes', 'Asthma', 'Kidney Care'],
      diagnosticFacilities: ['Cath Lab', 'CT Scan', 'X-Ray', 'ECG', 'Echocardiography'],
      accessibility: {
        wheelchairAccessible: true,
        ramps: true,
        elevators: true,
        accessibleToilets: true,
        signLanguageSupport: false,
        hearingVisualAid: true,
      },
      officialWaitMinutes: 60,
      communityWaitMinutes: 55,
      waitTimeSource: 'facility_confirmed',
      lastUpdatedAt: minutesAgo(18),
      recentReportCount: 5,
      waitTrend: 'steady',
      checkInInstructions: 'Use North Entrance for Emergency Cardiac Triage; West Lobby for Urgent Outpatient.',
      imageUrl: '/src/assets/images/facility_hospital_general_1794655608091.jpg',
      isDemoData: true,
    },
    {
      id: 'fac-vatsalya-maternity',
      name: 'Vatsalya Maternal & Pediatric Care Centre',
      category: 'hospital',
      address: 'Kharvela Nagar, Unit 3, Bhubaneswar, Odisha',
      city: 'Bhubaneswar',
      pinCode: '751001',
      lat: 20.2752,
      lng: 85.8414,
      phone: '+91-674-2531400',
      operatingHours: 'Open 24 Hours (Obstetric & Pediatric)',
      isOpen24x7: true,
      openHour: 0,
      closeHour: 24,
      hasEmergencyDept: true,
      services: ['Maternity & Obstetrics', 'Pediatrics', 'Emergency Medicine', 'NICU', 'Gynecology'],
      specialties: ['Obstetrics & Gynecology', 'Pediatrics', 'Neonatology'],
      pediatricServices: true,
      maternityServices: true,
      geriatricCare: false,
      mentalHealthServices: false,
      chronicCareSupport: ['Diabetes', 'Hypertension'],
      diagnosticFacilities: ['Obstetric Ultrasound', 'Fetal Monitoring', 'Pathology Lab'],
      accessibility: {
        wheelchairAccessible: true,
        ramps: true,
        elevators: true,
        accessibleToilets: true,
        signLanguageSupport: true,
        hearingVisualAid: false,
      },
      officialWaitMinutes: 35,
      communityWaitMinutes: 38,
      waitTimeSource: 'facility_confirmed',
      lastUpdatedAt: minutesAgo(10),
      recentReportCount: 3,
      waitTrend: 'steady',
      checkInInstructions: 'Dedicated Maternal & Pediatric Triage Desk immediately inside the main glass lobby.',
      imageUrl: '/src/assets/images/facility_maternity_pediatric_1794655610144.jpg',
      isDemoData: true,
    },
    {
      id: 'fac-patia-clinic',
      name: 'Patia Family & Pediatric Clinic',
      category: 'clinic',
      address: 'KIIT Square, Patia, Bhubaneswar, Odisha',
      city: 'Bhubaneswar',
      pinCode: '751024',
      lat: 20.3512,
      lng: 85.8238,
      phone: '+91-674-2740112',
      operatingHours: '08:00 – 21:00 Daily',
      isOpen24x7: false,
      openHour: 8,
      closeHour: 21,
      hasEmergencyDept: false,
      services: ['General Medicine', 'Pediatrics', 'Dermatology', 'Fever Clinic', 'Wound Care'],
      specialties: ['Family Medicine', 'Pediatrics', 'Dermatology'],
      pediatricServices: true,
      maternityServices: false,
      geriatricCare: true,
      mentalHealthServices: false,
      chronicCareSupport: ['Diabetes', 'Hypertension', 'Asthma'],
      diagnosticFacilities: ['Point-of-care Glucose', 'Nebulizer Station', 'Basic Urine & Blood Draw'],
      accessibility: {
        wheelchairAccessible: true,
        ramps: true,
        elevators: false,
        accessibleToilets: true,
        signLanguageSupport: false,
        hearingVisualAid: false,
      },
      officialWaitMinutes: null,
      communityWaitMinutes: 20,
      waitTimeSource: 'community_reported',
      lastUpdatedAt: minutesAgo(22),
      recentReportCount: 3,
      waitTrend: 'steady',
      checkInInstructions: 'Ground floor walk-in clinic. Show your TriageTrack pre-arrival code at Reception.',
      imageUrl: '/src/assets/images/facility_urgent_care_1794655608824.jpg',
      isDemoData: true,
    },
    {
      id: 'fac-saheed-phc',
      name: 'Saheed Nagar Urban Primary Health Centre',
      category: 'primary_health_centre',
      address: 'Block A, Saheed Nagar, Bhubaneswar, Odisha',
      city: 'Bhubaneswar',
      pinCode: '751007',
      lat: 20.2855,
      lng: 85.8495,
      phone: '+91-674-2541099',
      operatingHours: '08:00 – 20:00 (Mon–Sun)',
      isOpen24x7: false,
      openHour: 8,
      closeHour: 20,
      hasEmergencyDept: false,
      services: ['General Medicine', 'Fever Clinic', 'Immunization', 'Wound Care', 'ORS Hydration'],
      specialties: ['Primary Care', 'Community Medicine'],
      pediatricServices: true,
      maternityServices: true,
      geriatricCare: true,
      mentalHealthServices: false,
      chronicCareSupport: ['Diabetes', 'Hypertension'],
      diagnosticFacilities: ['Malaria/Dengue Rapid Test', 'Blood Sugar', 'Hemoglobin'],
      accessibility: {
        wheelchairAccessible: true,
        ramps: true,
        elevators: false,
        accessibleToilets: true,
        signLanguageSupport: false,
        hearingVisualAid: false,
      },
      officialWaitMinutes: null,
      communityWaitMinutes: 25,
      waitTimeSource: 'estimated',
      lastUpdatedAt: minutesAgo(35),
      recentReportCount: 2,
      waitTrend: 'steady',
      checkInInstructions: 'Register at the OPD token counter near the wheelchair ramp entrance.',
      imageUrl: '/src/assets/images/facility_urgent_care_1794655608824.jpg',
      isDemoData: true,
    },
    {
      id: 'fac-manas-wellness',
      name: 'Manas Mind Health & Counselling Centre',
      category: 'clinic',
      address: 'Bapuji Nagar Main Road, Bhubaneswar, Odisha',
      city: 'Bhubaneswar',
      pinCode: '751009',
      lat: 20.2581,
      lng: 85.8392,
      phone: '+91-674-2593300',
      operatingHours: '09:00 – 20:00 (Mon–Sat)',
      isOpen24x7: false,
      openHour: 9,
      closeHour: 20,
      hasEmergencyDept: false,
      services: ['Mental Health & Counselling', 'Psychiatry', 'Crisis Support'],
      specialties: ['Psychiatry', 'Clinical Psychology', 'Geriatric Mental Health'],
      pediatricServices: true,
      maternityServices: false,
      geriatricCare: true,
      mentalHealthServices: true,
      chronicCareSupport: [],
      diagnosticFacilities: [],
      accessibility: {
        wheelchairAccessible: true,
        ramps: true,
        elevators: true,
        accessibleToilets: true,
        signLanguageSupport: true,
        hearingVisualAid: true,
      },
      officialWaitMinutes: null,
      communityWaitMinutes: null,
      waitTimeSource: 'unavailable',
      lastUpdatedAt: minutesAgo(120),
      recentReportCount: 0,
      waitTrend: 'unknown',
      checkInInstructions: 'Private confidential check-in on Floor 1 (elevator access available). For urgent crisis, call 14416.',
      imageUrl: '/src/assets/images/facility_maternity_pediatric_1794655610144.jpg',
      isDemoData: true,
    },
    {
      id: 'fac-metro-diag',
      name: 'Metro Diagnostic & Rapid Imaging Hub',
      category: 'diagnostic_centre',
      address: 'Master Canteen Square, Station Road, Bhubaneswar, Odisha',
      city: 'Bhubaneswar',
      pinCode: '751001',
      lat: 20.2683,
      lng: 85.8435,
      phone: '+91-674-2534455',
      operatingHours: '06:30 – 21:30 Daily',
      isOpen24x7: false,
      openHour: 6,
      closeHour: 22,
      hasEmergencyDept: false,
      services: ['X-Ray', 'ECG', 'Pathology Lab', 'Ultrasound'],
      specialties: ['Radiology', 'Pathology'],
      pediatricServices: true,
      maternityServices: true,
      geriatricCare: true,
      mentalHealthServices: false,
      chronicCareSupport: ['Diabetes', 'Kidney Care', 'Heart Conditions'],
      diagnosticFacilities: ['Digital X-Ray', 'Ultrasound', 'ECG', 'Full Hematology & Biochemistry'],
      accessibility: {
        wheelchairAccessible: true,
        ramps: true,
        elevators: true,
        accessibleToilets: true,
        signLanguageSupport: false,
        hearingVisualAid: false,
      },
      officialWaitMinutes: null,
      communityWaitMinutes: 18,
      waitTimeSource: 'estimated',
      lastUpdatedAt: minutesAgo(28),
      recentReportCount: 2,
      waitTrend: 'steady',
      checkInInstructions: 'Bring clinician prescription if requesting imaging; walk-in blood panels available.',
      imageUrl: '/src/assets/images/facility_urgent_care_1794655608824.jpg',
      isDemoData: true,
    },
    {
      id: 'fac-janata-pharmacy',
      name: 'Jan Aushadhi 24x7 Care Pharmacy',
      category: 'pharmacy',
      address: 'Nayapalli Nuasahi, Bhubaneswar, Odisha',
      city: 'Bhubaneswar',
      pinCode: '751012',
      lat: 20.2899,
      lng: 85.8112,
      phone: '+91-674-2561188',
      operatingHours: 'Open 24 Hours',
      isOpen24x7: true,
      openHour: 0,
      closeHour: 24,
      hasEmergencyDept: false,
      services: ['24x7 Pharmacy', 'First Aid Supplies', 'ORS & Hydration', 'Blood Pressure Check'],
      specialties: ['Pharmacy'],
      pediatricServices: false,
      maternityServices: false,
      geriatricCare: true,
      mentalHealthServices: false,
      chronicCareSupport: ['Diabetes', 'Hypertension', 'Asthma'],
      diagnosticFacilities: ['Blood Pressure & Glucometer Check'],
      accessibility: {
        wheelchairAccessible: true,
        ramps: true,
        elevators: false,
        accessibleToilets: false,
        signLanguageSupport: false,
        hearingVisualAid: false,
      },
      officialWaitMinutes: 10,
      communityWaitMinutes: 8,
      waitTimeSource: 'estimated',
      lastUpdatedAt: minutesAgo(19),
      recentReportCount: 1,
      waitTrend: 'steady',
      checkInInstructions: 'Walk-up counter with wheelchair-height service window.',
      imageUrl: '/src/assets/images/facility_urgent_care_1794655608824.jpg',
      isDemoData: true,
    },
  ];

  const users: StoredUser[] = [
    {
      id: 'user-demo-patient',
      displayName: 'Aarav Mohanty',
      email: 'patient@triagetrack.demo',
      passwordHash: hashPassword('PatientDemo!2026'),
      role: 'user',
      ageGroup: 'adult',
      preferredLanguage: 'en',
      accessibilityPrefs: {
        largeText: false,
        wheelchairNeeded: false,
        signLanguageNeeded: false,
      },
      emergencyContact: '+91-98610-00112',
      preferredLocation: '751001',
      consentGiven: true,
      createdAt: minutesAgo(1440),
      savedFacilityIds: ['fac-sunrise-urgent', 'fac-capital-ed'],
      recentlyViewedIds: ['fac-sunrise-urgent'],
      searchHistory: ['Fever', '751001'],
    },
    {
      id: 'user-demo-admin',
      displayName: 'Dr. Meera Das (Demo Admin)',
      email: 'admin@triagetrack.demo',
      passwordHash: hashPassword('AdminDemo!2026'),
      role: 'admin',
      ageGroup: 'adult',
      preferredLanguage: 'en',
      accessibilityPrefs: {
        largeText: false,
        wheelchairNeeded: false,
        signLanguageNeeded: false,
      },
      emergencyContact: '',
      preferredLocation: '751001',
      consentGiven: true,
      createdAt: minutesAgo(2880),
      savedFacilityIds: [],
      recentlyViewedIds: [],
      searchHistory: [],
    },
  ];

  const communityReports: CommunityReport[] = [
    {
      id: 'rep-1',
      facilityId: 'fac-sunrise-urgent',
      stillWaiting: true,
      crowded: false,
      waitedMinutes: 15,
      queueMoving: true,
      createdAt: minutesAgo(14),
      expiresAt: hoursAhead(2),
      status: 'verified',
      flagReason: null,
      inaccurateFlags: 0,
    },
    {
      id: 'rep-2',
      facilityId: 'fac-capital-ed',
      stillWaiting: true,
      crowded: true,
      waitedMinutes: 150,
      queueMoving: true,
      createdAt: minutesAgo(18),
      expiresAt: hoursAhead(2),
      status: 'active',
      flagReason: null,
      inaccurateFlags: 0,
    },
    {
      id: 'rep-3',
      facilityId: 'fac-patia-clinic',
      stillWaiting: false,
      crowded: false,
      waitedMinutes: 20,
      queueMoving: true,
      createdAt: minutesAgo(22),
      expiresAt: hoursAhead(2),
      status: 'active',
      flagReason: null,
      inaccurateFlags: 0,
    },
    {
      id: 'rep-4',
      facilityId: 'fac-aiims-trauma',
      stillWaiting: true,
      crowded: true,
      waitedMinutes: 10,
      queueMoving: false,
      createdAt: minutesAgo(25),
      expiresAt: hoursAhead(2),
      status: 'flagged',
      flagReason: 'Outlier report: conflicts sharply with confirmed 180 min ER wait time.',
      inaccurateFlags: 1,
    },
  ];

  const preArrivals: PreArrivalNotification[] = [
    {
      id: 'pre-demo-1',
      referenceCode: 'TT-482910',
      userId: 'user-demo-patient',
      facilityId: 'fac-sunrise-urgent',
      facilityName: 'Sunrise Urgent Care & Minor Trauma Clinic',
      displayInitials: 'A.M.',
      ageGroup: 'adult',
      visitReason: 'Minor ankle sprain assessment',
      arrivalWindowMinutes: 20,
      status: 'active',
      checkInInstructions: 'Check in at the ground-floor Urgent Care desk. Suitable for sprains, minor burns, fevers, and cuts.',
      isOfficialIntegration: false,
      createdAt: minutesAgo(12),
    },
  ];

  const feedback: FeedbackItem[] = [
    {
      id: 'fb-1',
      facilityId: 'fac-sunrise-urgent',
      facilityName: 'Sunrise Urgent Care & Minor Trauma Clinic',
      category: 'accessibility',
      message: 'Wheelchair ramp at the front entrance is clear and easy to navigate.',
      status: 'reviewed',
      createdAt: minutesAgo(360),
    },
    {
      id: 'fb-2',
      facilityId: 'fac-capital-ed',
      facilityName: 'Capital General Hospital & Emergency Centre',
      category: 'wait_time',
      message: 'Waiting room was busy around 8 PM; triage nurse prioritized chest pain cases quickly.',
      status: 'open',
      createdAt: minutesAgo(95),
    },
  ];

  return {
    users,
    facilities,
    communityReports,
    officialWaitUpdates: [
      {
        id: 'off-1',
        facilityId: 'fac-capital-ed',
        adminId: 'user-demo-admin',
        waitMinutes: 145,
        statusNote: 'Confirmed by ED Triage Coordinator (Demo)',
        updatedAt: minutesAgo(8),
      },
    ],
    preArrivals,
    feedback,
    analytics: {
      symptomSearchCounts: {
        Fever: 48,
        'Chest pain or tightness': 21,
        'Cough and cold': 39,
        'Sprains or joint strain': 27,
        'Stomach / abdominal pain': 24,
        'Pregnancy-related concerns': 16,
      },
      facilityViewCounts: {
        'fac-sunrise-urgent': 84,
        'fac-capital-ed': 72,
        'fac-kalinga-multi': 58,
        'fac-vatsalya-maternity': 43,
        'fac-patia-clinic': 39,
        'fac-aiims-trauma': 64,
      },
    },
  };
}

export function loadStore(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      const seed = createSeedData();
      fs.writeFileSync(STORE_FILE, JSON.stringify(seed, null, 2), 'utf8');
      return seed;
    }
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as StoreData;
    // Expire old community reports on load
    const nowIso = new Date().toISOString();
    parsed.communityReports = parsed.communityReports.map((r) =>
      r.status === 'active' && r.expiresAt < nowIso ? { ...r, status: 'expired' } : r
    );
    return parsed;
  } catch {
    const seed = createSeedData();
    return seed;
  }
}

export function saveStore(data: StoreData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${STORE_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpFile, STORE_FILE);
}
