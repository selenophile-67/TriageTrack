import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { TRANSLATIONS, TranslationBundle } from '../data/i18n';
import { PRESET_LOCATIONS } from '../data/triageKnowledge';
import {
  HealthcareFacility,
  LanguageCode,
  PatientProfileMode,
  PreArrivalNotification,
  UserLocation,
  UserProfile,
} from '../types/triage';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface AppContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationBundle;
  largeText: boolean;
  setLargeText: (val: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  patientMode: PatientProfileMode;
  setPatientMode: (mode: PatientProfileMode) => void;
  location: UserLocation;
  setLocation: (loc: UserLocation) => void;
  requestGpsLocation: () => void;
  gpsLoading: boolean;
  facilities: HealthcareFacility[];
  facilitiesLoading: boolean;
  facilitiesError: string | null;
  refreshFacilities: () => Promise<void>;
  compareIds: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  user: UserProfile | null;
  authLoading: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
  toggleSaveFacility: (id: string) => Promise<void>;
  localPreArrivals: PreArrivalNotification[];
  addLocalPreArrival: (item: PreArrivalNotification) => void;
  updateLocalPreArrivalStatus: (id: string, status: PreArrivalNotification['status']) => void;
  toasts: ToastMessage[];
  notify: (text: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const OFFLINE_FACILITIES_KEY = 'triagetrack_cached_facilities_v1';
const LOCAL_PREARRIVAL_KEY = 'triagetrack_prearrivals_v1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('tt_lang');
    return saved === 'hi' || saved === 'or' ? saved : 'en';
  });
  const [largeText, setLargeTextState] = useState<boolean>(() => {
    return localStorage.getItem('tt_large_text') === 'true';
  });
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('tt_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });
  const [patientMode, setPatientMode] = useState<PatientProfileMode>('adult');
  const [location, setLocation] = useState<UserLocation>(PRESET_LOCATIONS[0]);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [facilitiesError, setFacilitiesError] = useState<string | null>(null);

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [localPreArrivals, setLocalPreArrivals] = useState<PreArrivalNotification[]>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_PREARRIVAL_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const notify = useCallback((text: string, type: ToastMessage['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('tt_lang', lang);
  }, []);

  const setLargeText = useCallback((val: boolean) => {
    setLargeTextState(val);
    localStorage.setItem('tt_large_text', String(val));
  }, []);

  const setTheme = useCallback((nextTheme: 'light' | 'dark') => {
    setThemeState(nextTheme);
    localStorage.setItem('tt_theme', nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('tt_theme', next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
  }, [largeText]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const refreshFacilities = useCallback(async () => {
    setFacilitiesLoading(true);
    setFacilitiesError(null);
    try {
      const res = await fetch('/api/facilities');
      if (!res.ok) throw new Error('Unable to load healthcare facilities.');
      const data = await res.json();
      setFacilities(data.facilities || []);
      try {
        localStorage.setItem(
          OFFLINE_FACILITIES_KEY,
          JSON.stringify({ savedAt: new Date().toISOString(), facilities: data.facilities || [] })
        );
      } catch {
        // Ignore storage quota errors
      }
    } catch (err) {
      // Offline fallback for emergency readiness (never presents cached wait times as current!)
      try {
        const cachedRaw = localStorage.getItem(OFFLINE_FACILITIES_KEY);
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw);
          const sanitized = (parsed.facilities || []).map((f: HealthcareFacility) => ({
            ...f,
            officialWaitMinutes: null,
            communityWaitMinutes: null,
            waitTimeSource: 'unavailable' as const,
          }));
          setFacilities(sanitized);
          setFacilitiesError('Showing offline-cached facility directory. Live wait times are unavailable.');
          return;
        }
      } catch {
        // Ignore cache parse error
      }
      setFacilitiesError(err instanceof Error ? err.message : 'Network error loading facilities.');
    } finally {
      setFacilitiesLoading(false);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
        if (data.user?.preferredLanguage) {
          setLanguageState(data.user.preferredLanguage);
        }
        if (data.user?.accessibilityPrefs?.largeText) {
          setLargeTextState(true);
        }
      }
    } catch {
      // Non-blocking
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFacilities();
    refreshAuth();
  }, [refreshFacilities, refreshAuth]);

  const requestGpsLocation = useCallback(() => {
    if (!navigator.geolocation) {
      notify('Browser geolocation is unavailable. Select a PIN code zone instead.', 'error');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          label: 'Current GPS Location',
          pinCode: 'GPS',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          source: 'gps',
        });
        setGpsLoading(false);
        notify('Updated distance calculations using your current location.', 'success');
      },
      () => {
        setGpsLoading(false);
        notify('Location permission denied. Using Bhubaneswar Central (751001).', 'info');
      },
      { timeout: 8000 }
    );
  }, [notify]);

  const toggleCompare = useCallback(
    (id: string) => {
      setCompareIds((prev) => {
        if (prev.includes(id)) return prev.filter((item) => item !== id);
        if (prev.length >= 3) {
          notify('You can compare up to 3 healthcare facilities at once.', 'info');
          return prev;
        }
        return [...prev, id];
      });
    },
    [notify]
  );

  const clearCompare = useCallback(() => setCompareIds([]), []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    notify('Signed out safely.', 'info');
  }, [notify]);

  const toggleSaveFacility = useCallback(
    async (id: string) => {
      if (!user) {
        notify('Sign in (optional) to save favourite facilities to your dashboard.', 'info');
        return;
      }
      try {
        const res = await fetch(`/api/auth/saved/${id}`, { method: 'POST' });
        if (!res.ok) throw new Error('Could not update saved facilities.');
        const data = await res.json();
        setUser((prev) => (prev ? { ...prev, savedFacilityIds: data.savedFacilityIds } : prev));
        notify(data.saved ? 'Facility saved to your dashboard.' : 'Removed from saved facilities.', 'success');
      } catch (err) {
        notify(err instanceof Error ? err.message : 'Unable to save facility.', 'error');
      }
    },
    [notify, user]
  );

  const addLocalPreArrival = useCallback((item: PreArrivalNotification) => {
    setLocalPreArrivals((prev) => {
      const next = [item, ...prev].slice(0, 10);
      localStorage.setItem(LOCAL_PREARRIVAL_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateLocalPreArrivalStatus = useCallback(
    (id: string, status: PreArrivalNotification['status']) => {
      setLocalPreArrivals((prev) => {
        const next = prev.map((item) => (item.id === id ? { ...item, status } : item));
        localStorage.setItem(LOCAL_PREARRIVAL_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t: TRANSLATIONS[language],
        largeText,
        setLargeText,
        theme,
        setTheme,
        toggleTheme,
        patientMode,
        setPatientMode,
        location,
        setLocation,
        requestGpsLocation,
        gpsLoading,
        facilities,
        facilitiesLoading,
        facilitiesError,
        refreshFacilities,
        compareIds,
        toggleCompare,
        clearCompare,
        user,
        authLoading,
        refreshAuth,
        logout,
        toggleSaveFacility,
        localPreArrivals,
        addLocalPreArrival,
        updateLocalPreArrivalStatus,
        toasts,
        notify,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
