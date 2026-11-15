import {
  FacilityCategory,
  FacilityWithMetrics,
  HealthcareFacility,
  PatientProfileMode,
  UrgencyLevel,
  UserLocation,
} from '../types/triage';

export type SymptomGroup = 'emergency' | 'common' | 'additional';

export interface SymptomOption {
  id: string;
  label: string;
  group: SymptomGroup;
  keywords: string[];
  baseUrgency: UrgencyLevel;
  requiredCapabilities: string[];
  preferredCategories: FacilityCategory[];
  redFlagChecks: { id: string; label: string; escalatesTo: UrgencyLevel }[];
  defaultGuidance: string;
  specialMode?: 'mental_health' | 'maternity' | 'pediatric' | 'chronic';
}

export const SYMPTOM_CATALOG: SymptomOption[] = [
  // Emergency-related symptoms
  {
    id: 'chest_pain',
    label: 'Chest pain or tightness',
    group: 'emergency',
    keywords: ['chest', 'heart', 'angina', 'pressure', 'pain'],
    baseUrgency: 'RED',
    requiredCapabilities: ['Emergency Medicine', 'Cardiology'],
    preferredCategories: ['emergency_department', 'hospital'],
    redFlagChecks: [
      { id: 'radiating', label: 'Pain spreading to arm, jaw, neck, or back', escalatesTo: 'RED' },
      { id: 'sweating', label: 'Cold sweats, dizziness, or shortness of breath', escalatesTo: 'RED' },
    ],
    defaultGuidance: 'Chest pain can indicate a heart or lung emergency and requires immediate emergency department evaluation.',
  },
  {
    id: 'difficulty_breathing',
    label: 'Difficulty breathing',
    group: 'emergency',
    keywords: ['breathing', 'shortness of breath', 'asthma', 'choking', 'wheezing'],
    baseUrgency: 'RED',
    requiredCapabilities: ['Emergency Medicine', 'Respiratory Support'],
    preferredCategories: ['emergency_department', 'hospital'],
    redFlagChecks: [
      { id: 'blue_lips', label: 'Bluish lips/face or inability to speak full sentences', escalatesTo: 'RED' },
      { id: 'stridor', label: 'Severe wheezing or gasping at rest', escalatesTo: 'RED' },
    ],
    defaultGuidance: 'Breathing distress can worsen rapidly. Seek emergency care immediately.',
  },
  {
    id: 'severe_bleeding',
    label: 'Severe bleeding',
    group: 'emergency',
    keywords: ['bleeding', 'blood', 'hemorrhage', 'deep wound'],
    baseUrgency: 'RED',
    requiredCapabilities: ['Emergency Medicine', 'Trauma Care'],
    preferredCategories: ['emergency_department', 'hospital'],
    redFlagChecks: [
      { id: 'uncontrolled', label: 'Bleeding does not slow after 10 minutes of firm direct pressure', escalatesTo: 'RED' },
      { id: 'faint', label: 'Feeling faint, pale, or confused', escalatesTo: 'RED' },
    ],
    defaultGuidance: 'Apply firm, continuous pressure with a clean cloth while calling 112 or travelling to an emergency department.',
  },
  {
    id: 'loss_consciousness',
    label: 'Loss of consciousness / fainting',
    group: 'emergency',
    keywords: ['faint', 'unconscious', 'passed out', 'unresponsive'],
    baseUrgency: 'RED',
    requiredCapabilities: ['Emergency Medicine', 'Critical Care'],
    preferredCategories: ['emergency_department', 'hospital'],
    redFlagChecks: [
      { id: 'unresponsive', label: 'Person is currently hard to wake or unresponsive', escalatesTo: 'RED' },
    ],
    defaultGuidance: 'Unexplained fainting or unresponsiveness requires immediate emergency evaluation.',
  },
  {
    id: 'stroke_signs',
    label: 'Stroke-like symptoms',
    group: 'emergency',
    keywords: ['stroke', 'face droop', 'slurred speech', 'arm weakness', 'numbness'],
    baseUrgency: 'RED',
    requiredCapabilities: ['Emergency Medicine', 'Neurology'],
    preferredCategories: ['emergency_department', 'hospital'],
    redFlagChecks: [
      { id: 'fast', label: 'Sudden face drooping, arm weakness, or slurred speech', escalatesTo: 'RED' },
    ],
    defaultGuidance: 'Every minute counts for suspected stroke. Call 112 immediately and proceed to an emergency department.',
  },
  {
    id: 'severe_allergy',
    label: 'Severe allergic reaction',
    group: 'emergency',
    keywords: ['allergy', 'anaphylaxis', 'swelling', 'throat', 'hives'],
    baseUrgency: 'RED',
    requiredCapabilities: ['Emergency Medicine'],
    preferredCategories: ['emergency_department', 'hospital'],
    redFlagChecks: [
      { id: 'throat_swell', label: 'Swelling of lips, tongue, or throat, or hoarse voice', escalatesTo: 'RED' },
    ],
    defaultGuidance: 'Severe allergic reactions (anaphylaxis) require immediate emergency treatment.',
  },
  {
    id: 'seizures',
    label: 'Seizures / convulsions',
    group: 'emergency',
    keywords: ['seizure', 'fits', 'convulsion', 'epilepsy'],
    baseUrgency: 'RED',
    requiredCapabilities: ['Emergency Medicine', 'Neurology'],
    preferredCategories: ['emergency_department', 'hospital'],
    redFlagChecks: [
      { id: 'prolonged', label: 'Seizure lasting more than 5 minutes or repeated seizures', escalatesTo: 'RED' },
    ],
    defaultGuidance: 'Keep the person safe on their side and call 112 immediately.',
  },
  {
    id: 'major_injuries',
    label: 'Major injuries / trauma',
    group: 'emergency',
    keywords: ['accident', 'fracture', 'head injury', 'trauma', 'fall'],
    baseUrgency: 'RED',
    requiredCapabilities: ['Emergency Medicine', 'Trauma Care', 'Orthopedics'],
    preferredCategories: ['emergency_department', 'hospital'],
    redFlagChecks: [
      { id: 'head_neck', label: 'Head/neck trauma, visible bone, or inability to move limb', escalatesTo: 'RED' },
    ],
    defaultGuidance: 'Major trauma and suspected severe fractures require emergency department trauma capabilities.',
  },

  // Common health concerns (MUST always verify warning signs!)
  {
    id: 'fever',
    label: 'Fever',
    group: 'common',
    keywords: ['fever', 'temperature', 'chills', 'pyrexia'],
    baseUrgency: 'GREEN',
    requiredCapabilities: ['General Medicine', 'Fever Clinic'],
    preferredCategories: ['urgent_care', 'clinic', 'primary_health_centre', 'hospital'],
    redFlagChecks: [
      { id: 'stiff_neck_confusion', label: 'Stiff neck, confusion, purple rash, or breathing trouble', escalatesTo: 'RED' },
      { id: 'infant_or_very_high', label: 'Infant under 3 months, or fever above 103°F (39.4°C) lasting > 48h', escalatesTo: 'YELLOW' },
    ],
    defaultGuidance: 'Mild fevers without warning signs can be evaluated at a clinic, PHC, or urgent care centre.',
  },
  {
    id: 'cough_cold',
    label: 'Cough and cold',
    group: 'common',
    keywords: ['cough', 'cold', 'sore throat', 'runny nose', 'flu'],
    baseUrgency: 'GREEN',
    requiredCapabilities: ['General Medicine'],
    preferredCategories: ['clinic', 'primary_health_centre', 'urgent_care'],
    redFlagChecks: [
      { id: 'chest_breath', label: 'Difficulty breathing, chest pain, or coughing up blood', escalatesTo: 'RED' },
      { id: 'persistent_wheeze', label: 'High fever or wheezing lasting more than 3 days', escalatesTo: 'YELLOW' },
    ],
    defaultGuidance: 'Uncomplicated cold or cough symptoms are suited for primary clinics or urgent care.',
  },
  {
    id: 'headache',
    label: 'Headache',
    group: 'common',
    keywords: ['headache', 'migraine', 'head pain'],
    baseUrgency: 'GREEN',
    requiredCapabilities: ['General Medicine'],
    preferredCategories: ['clinic', 'urgent_care', 'primary_health_centre'],
    redFlagChecks: [
      { id: 'thunderclap', label: 'Sudden "worst-ever" headache, vision loss, weakness, or fever + stiff neck', escalatesTo: 'RED' },
      { id: 'recent_head_bump', label: 'Started after a head injury or worsening over days', escalatesTo: 'YELLOW' },
    ],
    defaultGuidance: 'Routine headaches without neurological warning signs can be seen at a clinic or urgent care.',
  },
  {
    id: 'stomach_pain',
    label: 'Stomach / abdominal pain',
    group: 'common',
    keywords: ['stomach', 'abdomen', 'belly', 'gastric', 'cramp'],
    baseUrgency: 'YELLOW',
    requiredCapabilities: ['General Medicine', 'Urgent Care'],
    preferredCategories: ['urgent_care', 'hospital', 'clinic'],
    redFlagChecks: [
      { id: 'rigid_faint', label: 'Hard/rigid belly, vomiting blood, black stools, or severe sudden pain', escalatesTo: 'RED' },
      { id: 'lower_right', label: 'Persistent pain in lower-right abdomen or unable to keep fluids down', escalatesTo: 'YELLOW' },
    ],
    defaultGuidance: 'Abdominal pain often needs prompt assessment to rule out urgent causes.',
  },
  {
    id: 'minor_cuts',
    label: 'Minor cuts or scrapes',
    group: 'common',
    keywords: ['cut', 'scrape', 'wound', 'laceration'],
    baseUrgency: 'GREEN',
    requiredCapabilities: ['Wound Care', 'Urgent Care'],
    preferredCategories: ['urgent_care', 'clinic', 'primary_health_centre'],
    redFlagChecks: [
      { id: 'spurting', label: 'Deep gaping wound or bleeding that will not stop with pressure', escalatesTo: 'RED' },
      { id: 'stitches_tetanus', label: 'May need stitches, caused by rusty metal, or showing spreading redness/pus', escalatesTo: 'YELLOW' },
    ],
    defaultGuidance: 'Clean minor cuts can be dressed or evaluated at an urgent care clinic or PHC.',
  },
  {
    id: 'sprains',
    label: 'Sprains or joint strain',
    group: 'common',
    keywords: ['sprain', 'ankle', 'wrist', 'twist', 'joint'],
    baseUrgency: 'GREEN',
    requiredCapabilities: ['Orthopedics', 'Urgent Care', 'X-Ray'],
    preferredCategories: ['urgent_care', 'hospital', 'clinic'],
    redFlagChecks: [
      { id: 'deformity', label: 'Visible limb deformity, numbness, or cold/pale foot or hand', escalatesTo: 'RED' },
      { id: 'no_weight', label: 'Unable to bear any weight or severe swelling (needs X-ray to rule out fracture)', escalatesTo: 'YELLOW' },
    ],
    defaultGuidance: 'Mild sprains can be checked at urgent care centres equipped with basic X-ray and splinting.',
  },
  {
    id: 'minor_burns',
    label: 'Minor burns',
    group: 'common',
    keywords: ['burn', 'scald', 'heat'],
    baseUrgency: 'GREEN',
    requiredCapabilities: ['Wound Care', 'Urgent Care'],
    preferredCategories: ['urgent_care', 'clinic', 'primary_health_centre'],
    redFlagChecks: [
      { id: 'large_face_airway', label: 'Burn larger than palm, on face/hands/groin, chemical/electrical burn, or smoke inhalation', escalatesTo: 'RED' },
      { id: 'blisters', label: 'Blistering burn or signs of wound infection', escalatesTo: 'YELLOW' },
    ],
    defaultGuidance: 'Cool minor burns under cool running water for 20 minutes; visit urgent care for blistering burns.',
  },
  {
    id: 'vomiting_diarrhoea',
    label: 'Vomiting or diarrhoea',
    group: 'common',
    keywords: ['vomiting', 'diarrhoea', 'diarrhea', 'nausea', 'dehydration'],
    baseUrgency: 'GREEN',
    requiredCapabilities: ['General Medicine', 'IV Hydration'],
    preferredCategories: ['urgent_care', 'clinic', 'primary_health_centre', 'hospital'],
    redFlagChecks: [
      { id: 'severe_dehydration', label: 'Blood in vomit/stool, confusion, no urination for 8+ hours, or sunken eyes', escalatesTo: 'RED' },
      { id: 'cant_keep_fluids', label: 'Unable to hold down oral fluids (ORS) for more than 12 hours', escalatesTo: 'YELLOW' },
    ],
    defaultGuidance: 'Start ORS hydration; seek urgent medical care if fluids cannot be kept down.',
  },
  {
    id: 'skin_problems',
    label: 'Skin rash or irritation',
    group: 'common',
    keywords: ['skin', 'rash', 'itch', 'allergy', 'dermatology'],
    baseUrgency: 'GREEN',
    requiredCapabilities: ['General Medicine', 'Dermatology'],
    preferredCategories: ['clinic', 'primary_health_centre', 'urgent_care'],
    redFlagChecks: [
      { id: 'anaphylaxis_rash', label: 'Hives with facial/throat swelling or breathing difficulty', escalatesTo: 'RED' },
      { id: 'fever_blister_rash', label: 'Rapidly spreading rash with fever or painful blistering', escalatesTo: 'YELLOW' },
    ],
    defaultGuidance: 'Localized skin rashes without fever or swelling are suitable for primary clinics.',
  },
  {
    id: 'ear_pain',
    label: 'Ear pain',
    group: 'common',
    keywords: ['ear', 'earache', 'hearing'],
    baseUrgency: 'GREEN',
    requiredCapabilities: ['General Medicine', 'ENT'],
    preferredCategories: ['clinic', 'urgent_care', 'primary_health_centre'],
    redFlagChecks: [
      { id: 'mastoid_neuro', label: 'Swelling behind ear, high fever, dizziness, or facial weakness', escalatesTo: 'RED' },
      { id: 'fluid_discharge', label: 'Severe ear pain or fluid/pus discharge', escalatesTo: 'YELLOW' },
    ],
    defaultGuidance: 'Uncomplicated ear pain can be assessed at a local clinic or urgent care.',
  },

  // Additional categories
  {
    id: 'pregnancy_concerns',
    label: 'Pregnancy-related concerns',
    group: 'additional',
    keywords: ['pregnancy', 'maternity', 'obstetric', 'pregnant', 'labor'],
    baseUrgency: 'YELLOW',
    specialMode: 'maternity',
    requiredCapabilities: ['Maternity & Obstetrics', 'Gynecology'],
    preferredCategories: ['hospital', 'emergency_department'],
    redFlagChecks: [
      { id: 'obstetric_emergency', label: 'Vaginal bleeding, severe abdominal pain, reduced baby movement, blurred vision, or severe headache', escalatesTo: 'RED' },
      { id: 'contractions_fluid', label: 'Regular contractions, leaking fluid, or persistent fever during pregnancy', escalatesTo: 'YELLOW' },
    ],
    defaultGuidance: 'Pregnancy-related symptoms should always be evaluated at a maternity-capable hospital or obstetric facility.',
  },
  {
    id: 'childrens_health',
    label: "Children's health concern",
    group: 'additional',
    keywords: ['child', 'baby', 'infant', 'pediatric', 'kid'],
    baseUrgency: 'YELLOW',
    specialMode: 'pediatric',
    requiredCapabilities: ['Pediatrics', 'General Medicine'],
    preferredCategories: ['hospital', 'urgent_care', 'clinic'],
    redFlagChecks: [
      { id: 'ped_emergency', label: 'Difficulty breathing, unusual drowsiness, non-blanching rash, seizure, or infant < 3 months with fever', escalatesTo: 'RED' },
      { id: 'ped_urgent', label: 'Refusing feeds/fluids, persistent vomiting, or dry diapers for 6+ hours', escalatesTo: 'YELLOW' },
    ],
    defaultGuidance: 'Children can deteriorate quickly; choose a facility with verified pediatric services.',
  },
  {
    id: 'elderly_care',
    label: 'Elderly care / geriatric concern',
    group: 'additional',
    keywords: ['elderly', 'senior', 'geriatric', 'fall', 'confusion'],
    baseUrgency: 'YELLOW',
    requiredCapabilities: ['Geriatric Care', 'General Medicine'],
    preferredCategories: ['hospital', 'urgent_care'],
    redFlagChecks: [
      { id: 'delirium_fall', label: 'Sudden confusion/delirium, fall with head hit, chest pain, or breathing trouble', escalatesTo: 'RED' },
      { id: 'mobility_drop', label: 'Sudden weakness, dehydration, or worsening chronic illness', escalatesTo: 'YELLOW' },
    ],
    defaultGuidance: 'Older adults benefit from accessible facilities with geriatric and multi-specialty evaluation.',
  },
  {
    id: 'mental_health',
    label: 'Mental health & emotional distress',
    group: 'additional',
    keywords: ['mental health', 'anxiety', 'depression', 'panic', 'crisis', 'suicide'],
    baseUrgency: 'YELLOW',
    specialMode: 'mental_health',
    requiredCapabilities: ['Mental Health & Counselling', 'Psychiatry'],
    preferredCategories: ['hospital', 'clinic'],
    redFlagChecks: [
      { id: 'self_harm_risk', label: 'Thoughts of self-harm, harming others, or feeling unable to stay safe right now', escalatesTo: 'RED' },
    ],
    defaultGuidance: 'Confidential crisis support is free 24/7 via Tele-MANAS (14416 / 1800-891-4416).',
  },
  {
    id: 'chronic_complication',
    label: 'Chronic disease flare-up (Diabetes, BP, Asthma, Heart, Kidney)',
    group: 'additional',
    keywords: ['diabetes', 'sugar', 'hypertension', 'bp', 'asthma', 'kidney', 'chronic'],
    baseUrgency: 'YELLOW',
    specialMode: 'chronic',
    requiredCapabilities: ['Internal Medicine', 'Emergency Medicine'],
    preferredCategories: ['hospital', 'urgent_care'],
    redFlagChecks: [
      { id: 'chronic_emergency', label: 'Very low/high blood sugar with confusion, chest pain, severe breathlessness, or no urine output', escalatesTo: 'RED' },
      { id: 'chronic_worsening', label: 'Blood pressure > 180/120 without severe symptoms, or worsening asthma inhaler need', escalatesTo: 'YELLOW' },
    ],
    defaultGuidance: 'Sudden worsening of chronic diabetes, heart, kidney, or respiratory conditions needs prompt physician review.',
  },
  {
    id: 'other_symptoms',
    label: 'Other health symptoms',
    group: 'additional',
    keywords: ['other', 'general', 'checkup', 'pain', 'weakness'],
    baseUrgency: 'GREEN',
    requiredCapabilities: ['General Medicine'],
    preferredCategories: ['urgent_care', 'clinic', 'primary_health_centre', 'hospital'],
    redFlagChecks: [
      { id: 'general_red', label: 'Severe sudden pain, chest discomfort, breathing difficulty, or fainting', escalatesTo: 'RED' },
      { id: 'general_yellow', label: 'Symptoms steadily worsening over 24–48 hours or interfering with daily function', escalatesTo: 'YELLOW' },
    ],
    defaultGuidance: 'If symptoms are mild and stable, a local clinic or urgent care centre is typically appropriate.',
  },
];

export function computeDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function isFacilityOpenNow(facility: HealthcareFacility, now = new Date()): boolean {
  if (facility.isOpen24x7) return true;
  const hour = now.getHours();
  if (facility.closeHour > facility.openHour) {
    return hour >= facility.openHour && hour < facility.closeHour;
  }
  return hour >= facility.openHour || hour < facility.closeHour;
}

export function getEffectiveWait(facility: HealthcareFacility): number | null {
  if (facility.waitTimeSource === 'unavailable') return null;
  if (facility.officialWaitMinutes !== null) return facility.officialWaitMinutes;
  if (facility.communityWaitMinutes !== null) return facility.communityWaitMinutes;
  return null;
}

export function getWaitTier(waitMinutes: number | null): 'GREEN' | 'YELLOW' | 'RED' | 'UNAVAILABLE' {
  if (waitMinutes === null) return 'UNAVAILABLE';
  if (waitMinutes <= 30) return 'GREEN';
  if (waitMinutes <= 90) return 'YELLOW';
  return 'RED';
}

export function enrichFacilityMetrics(
  facility: HealthcareFacility,
  location: UserLocation
): FacilityWithMetrics {
  const distanceKm = computeDistanceKm(location.lat, location.lng, facility.lat, facility.lng);
  const travelMinutes = Math.max(4, Math.round(distanceKm * 3.1 + 3));
  const effectiveWaitMinutes = getEffectiveWait(facility);
  const combinedAssessmentMinutes =
    effectiveWaitMinutes !== null ? travelMinutes + effectiveWaitMinutes : null;

  return {
    ...facility,
    distanceKm,
    travelMinutes,
    effectiveWaitMinutes,
    combinedAssessmentMinutes,
    waitTier: getWaitTier(effectiveWaitMinutes),
  };
}

/**
 * Smart Facility Recommendation Engine
 * Prioritizes clinical safety, urgency, and required medical services over low wait times.
 */
export function recommendFacilities(
  facilities: HealthcareFacility[],
  location: UserLocation,
  options: {
    urgency: UrgencyLevel;
    requiredCapabilities: string[];
    patientMode: PatientProfileMode;
    needWheelchair?: boolean;
    needSignLanguage?: boolean;
  }
): FacilityWithMetrics[] {
  const enriched = facilities.map((f) => enrichFacilityMetrics(f, location));

  const filtered = enriched.filter((f) => {
    // CRITICAL SAFETY RULE: RED urgency ONLY returns emergency-capable facilities.
    // Never recommend an urgent care or clinic just because wait time is short!
    if (options.urgency === 'RED') {
      return f.hasEmergencyDept;
    }

    // YELLOW urgency excludes standalone pharmacies and diagnostic centres
    if (options.urgency === 'YELLOW') {
      if (f.category === 'pharmacy' || f.category === 'diagnostic_centre') return false;
    }

    // Pediatric filter for child mode when urgent
    if (options.patientMode === 'child' && options.urgency !== 'GREEN' && !f.pediatricServices) {
      return false;
    }

    // Maternity filter
    if (options.patientMode === 'maternity' && !f.maternityServices) {
      return false;
    }

    return true;
  });

  const scored = filtered.map((f) => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Capability match
    const matchedCaps = options.requiredCapabilities.filter((cap) =>
      [...f.services, ...f.specialties, ...f.chronicCareSupport].some((s) =>
        s.toLowerCase().includes(cap.toLowerCase())
      )
    );
    score += matchedCaps.length * 35;
    if (matchedCaps.length > 0) {
      reasons.push(`Provides ${matchedCaps.slice(0, 2).join(', ')}`);
    }

    // 2. Urgency-appropriateness
    if (options.urgency === 'RED') {
      score += f.hasEmergencyDept ? 100 : -500;
      reasons.push('24/7 Emergency Department');
    } else if (options.urgency === 'YELLOW') {
      if (f.category === 'urgent_care' || f.category === 'hospital') score += 45;
      if (f.diagnosticFacilities.length > 0) score += 15;
    } else {
      if (f.category === 'urgent_care' || f.category === 'clinic' || f.category === 'primary_health_centre') {
        score += 40;
        reasons.push('Appropriate for routine/non-emergency care');
      }
    }

    // 3. Patient profile match
    if (options.patientMode === 'child' && f.pediatricServices) {
      score += 30;
      reasons.push('Pediatric services available');
    }
    if (options.patientMode === 'senior' && f.geriatricCare) {
      score += 25;
      reasons.push('Geriatric care support');
    }
    if (options.patientMode === 'maternity' && f.maternityServices) {
      score += 45;
      reasons.push('Maternity & obstetric care');
    }
    if (options.needWheelchair && f.accessibility.wheelchairAccessible) {
      score += 25;
      reasons.push('Wheelchair accessible');
    }
    if (options.needSignLanguage && f.accessibility.signLanguageSupport) {
      score += 20;
      reasons.push('Sign language support');
    }

    // 4. Open status
    if (isFacilityOpenNow(f)) {
      score += 30;
    } else {
      score -= 80;
    }

    // 5. Travel + Wait (NEVER dominates over RED emergency distance)
    if (options.urgency === 'RED') {
      // For emergencies, closest ED matters most, never queue-shopping
      score -= f.distanceKm * 8;
    } else {
      const totalMins = f.combinedAssessmentMinutes ?? f.travelMinutes + 45;
      score -= totalMins * 0.45;
    }

    return {
      ...f,
      suitabilityScore: Math.round(score),
      suitabilityReason: reasons.slice(0, 2).join(' · ') || 'Nearby medical facility',
    };
  });

  return scored.sort((a, b) => (b.suitabilityScore ?? 0) - (a.suitabilityScore ?? 0));
}

export const HEALTH_EDUCATION_GUIDES = [
  {
    id: 'when-emergency',
    title: 'When to Seek Emergency Care Immediately',
    category: 'Emergency Readiness',
    summary: 'Recognize life-threatening warning signs where calling 112 or going straight to an Emergency Department is critical.',
    points: [
      'Chest pain, pressure, or pain spreading to the jaw, neck, or left arm.',
      'Sudden trouble breathing, choking, or bluish lips.',
      'FAST stroke signs: Face drooping, Arm weakness, Speech slurring — Time to call 112.',
      'Uncontrolled bleeding, severe head injury, seizures, or sudden unresponsiveness.',
    ],
  },
  {
    id: 'fever-management',
    title: 'Fever Management for Children and Adults',
    category: 'Home & Urgent Care',
    summary: 'How to monitor fever safely and identify when an urgent clinic visit or emergency evaluation is needed.',
    points: [
      'Keep the person hydrated with water, clear broths, or oral rehydration solution (ORS).',
      'Seek urgent care if fever exceeds 103°F (39.4°C) or lasts longer than 48–72 hours.',
      'Infants under 3 months with any fever (100.4°F / 38°C or higher) need immediate medical evaluation.',
      'Seek emergency help immediately if fever comes with stiff neck, confusion, breathing difficulty, or a rash that does not fade when pressed.',
    ],
  },
  {
    id: 'dehydration-signs',
    title: 'Dehydration Warning Signs & ORS Care',
    category: 'Hydration & GI Care',
    summary: 'Vomiting and diarrhoea can cause rapid fluid loss, especially in young children and older adults.',
    points: [
      'Take small, frequent sips of WHO-formula ORS rather than large gulps.',
      'Watch for dry mouth, dizziness on standing, dark urine, or no urination for 6–8 hours.',
      'In children, crying without tears, sunken eyes, or unusual drowsiness requires prompt medical care.',
    ],
  },
  {
    id: 'first-aid-injuries',
    title: 'First Aid for Cuts, Sprains, and Minor Burns',
    category: 'First Aid',
    summary: 'Immediate safe steps before reaching an urgent care clinic or primary health centre.',
    points: [
      'Bleeding cuts: Apply firm, continuous pressure with a clean cloth for at least 10 minutes.',
      'Minor burns: Cool under cool (not ice-cold) running water for 20 minutes; do not apply toothpaste or butter.',
      'Sprains: Rest, apply a cold pack wrapped in cloth, and seek an X-ray if unable to bear weight.',
    ],
  },
  {
    id: 'chronic-flareups',
    title: 'Managing Chronic Condition Flare-Ups',
    category: 'Chronic Care',
    summary: 'Guidance for diabetes, hypertension, asthma, heart, and kidney conditions.',
    points: [
      'Carry an updated list of daily medications and dosages when visiting any clinic or hospital.',
      'Sudden vision changes, chest tightness, severe wheezing not relieved by a rescue inhaler, or very low blood sugar with confusion are emergencies.',
      'Keep follow-up appointments at primary clinics to prevent avoidable ER visits.',
    ],
  },
  {
    id: 'mental-health-support',
    title: 'Mental Health & Crisis Support Directory',
    category: 'Mental Health',
    summary: 'Confidential 24/7 helplines and when to seek immediate safety support.',
    points: [
      'Tele-MANAS (Govt. of India 24/7 Mental Health Helpline): Call 14416 or 1800-891-4416.',
      'Kiran Mental Health Helpline: 1800-599-0019 (multilingual support).',
      'If someone is at immediate risk of self-harm or harm to others, call 112 or go to the nearest hospital emergency department.',
    ],
  },
];

export const PRESET_LOCATIONS: UserLocation[] = [
  { label: 'Bhubaneswar Central (751001)', pinCode: '751001', lat: 20.2706, lng: 85.8334, source: 'default' },
  { label: 'Patia / KIIT Zone (751024)', pinCode: '751024', lat: 20.3533, lng: 85.8266, source: 'pincode' },
  { label: 'Khandagiri / AIIMS Zone (751019)', pinCode: '751019', lat: 20.2367, lng: 85.7755, source: 'pincode' },
  { label: 'Saheed Nagar / Vani Vihar (751007)', pinCode: '751007', lat: 20.2912, lng: 85.8458, source: 'pincode' },
  { label: 'Cuttack SCB Zone (753007)', pinCode: '753007', lat: 20.4689, lng: 85.8872, source: 'pincode' },
];
