import { create } from 'zustand';

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
  setScanDone: (done: boolean) => void;
  clearResults: () => void;
}

export const useScanStore = create<ScanState>((set) => ({
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
      stateInput: state ?? s.stateInput,
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

  setScanDone: (scanDone) => set({ scanDone }),

  clearResults: () => set({ results: [], scanDone: false }),
}));
