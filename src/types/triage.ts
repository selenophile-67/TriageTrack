export type LanguageCode = 'en' | 'hi' | 'or';

export type PatientProfileMode = 'adult' | 'child' | 'senior' | 'maternity' | 'disability';

export type FacilityCategory =
  | 'hospital'
  | 'emergency_department'
  | 'urgent_care'
  | 'clinic'
  | 'primary_health_centre'
  | 'diagnostic_centre'
  | 'pharmacy';

export type WaitTimeSource =
  | 'facility_confirmed'
  | 'community_reported'
  | 'estimated'
  | 'unavailable';

export type UrgencyLevel = 'RED' | 'YELLOW' | 'GREEN';

export interface AccessibilityFeatures {
  wheelchairAccessible: boolean;
  ramps: boolean;
  elevators: boolean;
  accessibleToilets: boolean;
  signLanguageSupport: boolean;
  hearingVisualAid: boolean;
}

export interface HealthcareFacility {
  id: string;
  name: string;
  category: FacilityCategory;
  address: string;
  city: string;
  pinCode: string;
  lat: number;
  lng: number;
  phone: string;
  operatingHours: string;
  isOpen24x7: boolean;
  openHour: number;
  closeHour: number;
  hasEmergencyDept: boolean;
  services: string[];
  specialties: string[];
  pediatricServices: boolean;
  maternityServices: boolean;
  geriatricCare: boolean;
  mentalHealthServices: boolean;
  chronicCareSupport: string[];
  diagnosticFacilities: string[];
  accessibility: AccessibilityFeatures;
  officialWaitMinutes: number | null;
  communityWaitMinutes: number | null;
  waitTimeSource: WaitTimeSource;
  lastUpdatedAt: string;
  recentReportCount: number;
  waitTrend: 'rising' | 'steady' | 'falling' | 'unknown';
  checkInInstructions: string;
  imageUrl: string;
  isDemoData: boolean;
}

export interface CommunityReport {
  id: string;
  facilityId: string;
  stillWaiting: boolean;
  crowded: boolean;
  waitedMinutes: number;
  queueMoving: boolean;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'flagged' | 'verified' | 'expired';
  flagReason: string | null;
  inaccurateFlags: number;
}

export interface PreArrivalNotification {
  id: string;
  referenceCode: string;
  userId: string | null;
  facilityId: string;
  facilityName: string;
  displayInitials: string;
  ageGroup: 'child' | 'adult' | 'senior';
  visitReason: string;
  arrivalWindowMinutes: number;
  status: 'active' | 'cancelled' | 'arrived';
  checkInInstructions: string;
  isOfficialIntegration: boolean;
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  facilityId: string | null;
  facilityName?: string;
  category: 'accuracy' | 'wait_time' | 'accessibility' | 'ux' | 'listing';
  message: string;
  status: 'open' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  role: 'user' | 'admin';
  ageGroup: 'child' | 'adult' | 'senior';
  preferredLanguage: LanguageCode;
  accessibilityPrefs: {
    largeText: boolean;
    wheelchairNeeded: boolean;
    signLanguageNeeded: boolean;
  };
  emergencyContact: string;
  preferredLocation: string;
  consentGiven: boolean;
  createdAt: string;
  savedFacilityIds: string[];
  recentlyViewedIds: string[];
  searchHistory: string[];
}

export interface UserLocation {
  label: string;
  pinCode: string;
  lat: number;
  lng: number;
  source: 'gps' | 'pincode' | 'default';
}

export interface FacilityWithMetrics extends HealthcareFacility {
  distanceKm: number;
  travelMinutes: number;
  effectiveWaitMinutes: number | null;
  combinedAssessmentMinutes: number | null;
  waitTier: 'GREEN' | 'YELLOW' | 'RED' | 'UNAVAILABLE';
  suitabilityScore?: number;
  suitabilityReason?: string;
}

export interface AdminOverviewStats {
  totalUsers: number;
  totalFacilities: number;
  totalActiveReports: number;
  flaggedReportsCount: number;
  totalPreArrivals: number;
  openFeedbackCount: number;
  mostSearchedSymptoms: { symptom: string; count: number }[];
  mostVisitedFacilities: { name: string; views: number; avgWait: number }[];
  waitTrendsByCategory: { category: string; avgWait: number; facilities: number }[];
  recentCommunityReports: (CommunityReport & { facilityName: string })[];
}
