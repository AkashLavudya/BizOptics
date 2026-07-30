import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ScanState {
  country: string;
  state: string;
  city: string;
  stateInput: string;
  results: any[];
  scanDone: boolean;
  usingRealData: boolean;

  setScanResults: (params: {
    results: any[];
    country?: string;
    state?: string;
    city?: string;
    usingRealData?: boolean;
  }) => void;
  setLocation: (country: string, state: string, city: string) => void;
  setCountry: (country: string) => void;
  setStateInput: (stateInput: string) => void;
  setCity: (city: string) => void;
  setScanDone: (done: boolean) => void;
  clearResults: () => void;
}

export const useScanStore = create<ScanState>()(
  persist(
    (set) => ({
      country: 'United States',
      state: '',
      city: '',
      stateInput: '',
      results: [],
      scanDone: false,
      usingRealData: false,

      setScanResults: ({ results, country, state, city, usingRealData }) =>
        set((s) => ({
          results,
          country: country ?? s.country,
          state: state ?? s.state,
          stateInput: state ?? s.stateInput ?? state,
          city: city ?? s.city,
          usingRealData: usingRealData ?? s.usingRealData,
          scanDone: true,
        })),

      setLocation: (country, state, city) =>
        set({
          country,
          state,
          stateInput: state,
          city,
        }),

      setCountry: (country) =>
        set({
          country,
          state: '',
          stateInput: '',
          city: '',
        }),

      setStateInput: (stateInput) =>
        set((s) => ({
          stateInput,
          state: s.state,
        })),

      setCity: (city) => set({ city }),

      setScanDone: (scanDone) => set({ scanDone }),

      clearResults: () => set({ results: [], scanDone: false }),
    }),
    {
      name: 'bizoptics-scan-storage',
      partialize: (s) => ({
        country: s.country,
        state: s.state,
        city: s.city,
        stateInput: s.stateInput,
        results: s.results,
        scanDone: s.scanDone,
        usingRealData: s.usingRealData,
      }),
    },
  ),
);
