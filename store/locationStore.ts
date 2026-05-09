import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LocationItem, CityItem } from "@/types/auth";
import { getCountries, getStates, getCities } from "@/services/location";

interface LocationStore {
  countries: LocationItem[];
  statesByCountry: Record<string, LocationItem[]>;
  citiesByState: Record<string, CityItem[]>;
  
  fetchCountries: () => Promise<void>;
  fetchStates: (countryIso: string) => Promise<void>;
  fetchCities: (countryIso: string, stateIso: string) => Promise<void>;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      countries: [],
      statesByCountry: {},
      citiesByState: {},

      fetchCountries: async () => {
        const { countries } = get();
        if (countries.length > 0) return;
        try {
          const res = await getCountries();
          if (res?.data?.countryList) {
            set({ countries: res.data.countryList });
          }
        } catch (error) {
          console.error("Failed to fetch countries", error);
        }
      },

      fetchStates: async (countryIso: string) => {
        if (!countryIso) return;
        const { statesByCountry } = get();
        if (statesByCountry[countryIso] && statesByCountry[countryIso].length > 0) return;
        try {
          const res = await getStates(countryIso);
          if (res?.data?.stateList) {
            set((state) => ({
              statesByCountry: { ...state.statesByCountry, [countryIso]: res.data.stateList },
            }));
          }
        } catch (error) {
          console.error("Failed to fetch states", error);
        }
      },

      fetchCities: async (countryIso: string, stateIso: string) => {
        if (!countryIso || !stateIso) return;
        const cacheKey = `${countryIso}_${stateIso}`;
        const { citiesByState } = get();
        if (citiesByState[cacheKey] && citiesByState[cacheKey].length > 0) return;
        try {
          const res = await getCities(countryIso, stateIso);
          if (res?.data?.cityList) {
            set((state) => ({
              citiesByState: { ...state.citiesByState, [cacheKey]: res.data.cityList },
            }));
          }
        } catch (error) {
          console.error("Failed to fetch cities", error);
        }
      },
    }),
    {
      name: "camaroo-location-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
