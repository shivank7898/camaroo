import { useEffect, useMemo, useState } from "react";
import type { LocationItem, CityItem, PickerOption } from "@/types/auth";
import { useLocationStore } from "@/store/locationStore";

/**
 * useLocationPicker
 * Encapsulates all location dropdown queries (Countries, States, Cities)
 * and returns properly typed picker items for SearchablePicker using a persistant store.
 */
export function useLocationPicker(selectedCountry: string, selectedState: string) {
  const { countries, statesByCountry, citiesByState, fetchCountries, fetchStates, fetchCities } = useLocationStore();
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);

  useEffect(() => {
    const initCountries = async () => {
      setCountriesLoading(true);
      await fetchCountries();
      setCountriesLoading(false);
    };
    initCountries();
  }, [fetchCountries]);

  useEffect(() => {
    const initStates = async () => {
      if (!selectedCountry) return;
      setStatesLoading(true);
      await fetchStates(selectedCountry);
      setStatesLoading(false);
    };
    initStates();
  }, [selectedCountry, fetchStates]);

  useEffect(() => {
    const initCities = async () => {
      if (!selectedCountry || !selectedState) return;
      setCitiesLoading(true);
      await fetchCities(selectedCountry, selectedState);
      setCitiesLoading(false);
    };
    initCities();
  }, [selectedCountry, selectedState, fetchCities]);

  const countryItems: PickerOption[] = useMemo(() => {
    return countries.map((c: LocationItem) => ({ label: c.name, value: c.isoCode }));
  }, [countries]);

  const stateItems: PickerOption[] = useMemo(() => {
    const lists = statesByCountry[selectedCountry] || [];
    return lists.map((s: LocationItem) => ({ label: s.name, value: s.isoCode }));
  }, [statesByCountry, selectedCountry]);

  const cityItems: PickerOption[] = useMemo(() => {
    const cacheKey = `${selectedCountry}_${selectedState}`;
    const lists = citiesByState[cacheKey] || [];
    return lists.map((c: CityItem) => ({ label: c.name, value: c.name }));
  }, [citiesByState, selectedCountry, selectedState]);

  return {
    countryItems,
    stateItems,
    cityItems,
    countriesLoading,
    statesLoading,
    citiesLoading,
  };
}
