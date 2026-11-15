import { LanguageCode } from '../types/triage';

export interface TranslationBundle {
  brandName: string;
  tagline: string;
  navHome: string;
  navFindCare: string;
  navSymptomChecker: string;
  navResources: string;
  navEmergency: string;
  navAbout: string;
  navAccount: string;
  navAdmin: string;
  emergencyCta: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaCheckSymptoms: string;
  ctaFindCare: string;
  searchPlaceholder: string;
  searchButton: string;
  demoNotice: string;
  overviewTitle: string;
  overviewSubtitle: string;
  call112Title: string;
  call112Body: string;
  emergencyDisclaimer: string;
  disclaimerBanner: string;
  languageLabel: string;
  largeTextLabel: string;
  familyModeLabel: string;
  standardText: string;
  largeText: string;
  minutesShort: string;
  unavailableLabel: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationBundle> = {
  en: {
    brandName: 'TriageTrack',
    tagline: 'The Right Care. At the Right Place. At the Right Time.',
    navHome: 'Home',
    navFindCare: 'Find Healthcare',
    navSymptomChecker: 'Symptom Checker',
    navResources: 'Health Resources',
    navEmergency: 'Emergency Help',
    navAbout: 'About Us',
    navAccount: 'Account',
    navAdmin: 'Admin Console',
    emergencyCta: 'Emergency 112',
    heroTitle: 'Not Every Emergency Needs an Emergency Room.',
    heroSubtitle:
      'Find the right healthcare facility, compare waiting times, and get the care you need without unnecessary delays.',
    ctaCheckSymptoms: 'Check My Symptoms',
    ctaFindCare: 'Find Nearby Healthcare',
    searchPlaceholder: 'Search symptoms (fever, chest pain), facility name, or PIN code (751019)...',
    searchButton: 'Search Care',
    demoNotice:
      'DEMO DATA: Facility listings, waiting times, and crowd updates shown here are realistic demonstration samples and do not represent live hospital feeds.',
    overviewTitle: 'Live Healthcare Overview',
    overviewSubtitle: 'Facility availability and wait-time reliability across your selected zone.',
    call112Title: 'Emergency Assistance — Call 112',
    call112Body:
      'Seek emergency medical help immediately. Do not delay care to compare waiting times. Call your local emergency number or proceed to the nearest appropriate emergency department.',
    emergencyDisclaimer:
      'TriageTrack does not dispatch ambulances directly. Calling 112 connects you to national emergency response services.',
    disclaimerBanner:
      'Informational Navigation Only: TriageTrack does not provide medical diagnoses, prescriptions, or replace qualified clinicians.',
    languageLabel: 'Language',
    largeTextLabel: 'Text Size',
    familyModeLabel: 'Care Profile',
    standardText: 'Standard',
    largeText: 'Large',
    minutesShort: 'min',
    unavailableLabel: 'Live waiting-time data is currently unavailable.',
  },
  hi: {
    brandName: 'TriageTrack',
    tagline: 'सही देखभाल। सही स्थान पर। सही समय पर।',
    navHome: 'होम',
    navFindCare: 'स्वास्थ्य केंद्र खोजें',
    navSymptomChecker: 'लक्षण जांच',
    navResources: 'स्वास्थ्य जानकारी',
    navEmergency: 'आपातकालीन मदद',
    navAbout: 'हमारे बारे में',
    navAccount: 'खाता',
    navAdmin: 'एडमिन पैनल',
    emergencyCta: 'आपातकाल 112',
    heroTitle: 'हर स्वास्थ्य समस्या के लिए इमरजेंसी रूम ज़रूरी नहीं है।',
    heroSubtitle:
      'सही स्वास्थ्य केंद्र खोजें, प्रतीक्षा समय की तुलना करें और बिना अनावश्यक देरी के उचित देखभाल प्राप्त करें।',
    ctaCheckSymptoms: 'मेरे लक्षण जांचें',
    ctaFindCare: 'नज़दीकी स्वास्थ्य केंद्र खोजें',
    searchPlaceholder: 'लक्षण (बुखार, सीने में दर्द), अस्पताल का नाम या पिन कोड (751019) दर्ज करें...',
    searchButton: 'खोजें',
    demoNotice:
      'डेमो डेटा: यहाँ दिखाए गए अस्पताल, प्रतीक्षा समय और सामुदायिक अपडेट केवल प्रदर्शन के लिए हैं और वास्तविक अस्पताल डेटा नहीं हैं।',
    overviewTitle: 'स्वास्थ्य केंद्र अवलोकन',
    overviewSubtitle: 'आपके चयनित क्षेत्र में उपलब्ध अस्पताल, क्लिनिक और प्रतीक्षा समय की स्थिति।',
    call112Title: 'आपातकालीन सहायता — 112 पर कॉल करें',
    call112Body:
      'तुरंत आपातकालीन चिकित्सा सहायता लें। प्रतीक्षा समय की तुलना करने में देरी न करें। 112 पर कॉल करें या नज़दीकी इमरजेंसी विभाग में जाएं।',
    emergencyDisclaimer:
      'TriageTrack सीधे एम्बुलेंस नहीं भेजता है। 112 पर कॉल करने से आप राष्ट्रीय आपातकालीन सेवा से जुड़ते हैं।',
    disclaimerBanner:
      'केवल मार्गदर्शन के लिए: TriageTrack कोई चिकित्सीय निदान नहीं करता और डॉक्टर की सलाह का विकल्प नहीं है।',
    languageLabel: 'भाषा',
    largeTextLabel: 'फ़ॉन्ट आकार',
    familyModeLabel: 'रोगी श्रेणी',
    standardText: 'सामान्य',
    largeText: 'बड़ा',
    minutesShort: 'मिनट',
    unavailableLabel: 'लाइव प्रतीक्षा समय डेटा अभी उपलब्ध नहीं है।',
  },
  or: {
    brandName: 'TriageTrack',
    tagline: 'ସଠିକ୍ ଚିକିତ୍ସା। ସଠିକ୍ ସ୍ଥାନ। ସଠିକ୍ ସମୟ।',
    navHome: 'ମୂଳ ପୃଷ୍ଠା',
    navFindCare: 'ଚିକିତ୍ସାଳୟ ଖୋଜନ୍ତୁ',
    navSymptomChecker: 'ଲକ୍ଷଣ ଯାଞ୍ଚ',
    navResources: 'ସ୍ୱାସ୍ଥ୍ୟ ସୂଚନା',
    navEmergency: 'ଜରୁରୀକାଳୀନ ସହାୟତା',
    navAbout: 'ଆମ ବିଷୟରେ',
    navAccount: 'ଆକାଉଣ୍ଟ',
    navAdmin: 'ଆଡମିନ୍ ପ୍ୟାନେଲ୍',
    emergencyCta: 'ଜରୁରୀ ୧୧୨',
    heroTitle: 'ପ୍ରତ୍ୟେକ ସ୍ୱାସ୍ଥ୍ୟ ସମସ୍ୟା ପାଇଁ ଏମରଜେନ୍ସି ରୁମ୍ ଆବଶ୍ୟକ ନୁହେଁ।',
    heroSubtitle:
      'ସଠିକ୍ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର ଖୋଜନ୍ତୁ, ଅପେକ୍ଷା ସମୟ ତୁଳନା କରନ୍ତୁ ଏବଂ ବିନା ବିଳମ୍ବରେ ଉପଯୁକ୍ତ ଚିକିତ୍ସା ପାଆନ୍ତୁ।',
    ctaCheckSymptoms: 'ମୋର ଲକ୍ଷଣ ଯାଞ୍ଚ କରନ୍ତୁ',
    ctaFindCare: 'ନିକଟସ୍ଥ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର ଖୋଜନ୍ତୁ',
    searchPlaceholder: 'ଲକ୍ଷଣ (ଜ୍ୱର, ଛାତି ଯନ୍ତ୍ରଣା), ଡାକ୍ତରଖାନା ନାମ କିମ୍ବା ପିନ୍ କୋଡ୍ (751019) ଲେଖନ୍ତୁ...',
    searchButton: 'ଖୋଜନ୍ତୁ',
    demoNotice:
      'ଡେମୋ ଡାଟା: ଏଠାରେ ପ୍ରଦର୍ଶିତ ଡାକ୍ତରଖାନା ଏବଂ ଅପେକ୍ଷା ସମୟ କେବଳ ପ୍ରଦର୍ଶନ ପାଇଁ ଉଦ୍ଦିଷ୍ଟ, ଏହା ବାସ୍ତବ ଡାକ୍ତରଖାନା ତଥ୍ୟ ନୁହେଁ।',
    overviewTitle: 'ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର ସ୍ଥିତି',
    overviewSubtitle: 'ଆପଣଙ୍କ ଅଞ୍ଚଳରେ ଥିବା ଡାକ୍ତରଖାନା ଏବଂ ଅପେକ୍ଷା ସମୟର ସୂଚନା।',
    call112Title: 'ଜରୁରୀକାଳୀନ ସହାୟତା — ୧୧୨ କୁ କଲ୍ କରନ୍ତୁ',
    call112Body:
      'ତୁରନ୍ତ ଜରୁରୀକାଳୀନ ଚିକିତ୍ସା ସହାୟତା ନିଅନ୍ତୁ। ଅପେକ୍ଷା ସମୟ ତୁଳନା କରିବାରେ ବିଳମ୍ବ କରନ୍ତୁ ନାହିଁ। ୧୧୨ କୁ କଲ୍ କରନ୍ତୁ।',
    emergencyDisclaimer:
      'TriageTrack ସିଧାସଳଖ ଆମ୍ବୁଲାନ୍ସ ପଠାଏ ନାହିଁ। ୧୧୨ କୁ କଲ୍ କଲେ ଆପଣ ଜାତୀୟ ଜରୁରୀକାଳୀନ ସେବା ସହ ଯୋଡ଼ି ହେବେ।',
    disclaimerBanner:
      'କେବଳ ସୂଚନା ପାଇଁ: TriageTrack କୌଣସି ରୋଗ ନିର୍ଣ୍ଣୟ କରେ ନାହିଁ କିମ୍ବା ଡାକ୍ତରଙ୍କ ପରାମର୍ଶର ବିକଳ୍ପ ନୁହେଁ।',
    languageLabel: 'ଭାଷା',
    largeTextLabel: 'ଅକ୍ଷର ଆକାର',
    familyModeLabel: 'ରୋଗୀ ପ୍ରକାର',
    standardText: 'ସାଧାରଣ',
    largeText: 'ବଡ଼',
    minutesShort: 'ମିନିଟ୍',
    unavailableLabel: 'ଲାଇଭ୍ ଅପେକ୍ଷା ସମୟ ତଥ୍ୟ ବର୍ତ୍ତମାନ ଉପଲବ୍ଧ ନାହିଁ।',
  },
};

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'हिन्दी',
  or: 'ଓଡ଼ିଆ',
};
