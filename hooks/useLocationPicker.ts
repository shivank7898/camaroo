import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCountries, getStates, getCities } from "@services/location";
import type { LocationItem, CityItem, PickerOption } from "@/types/auth";

/**
 * useLocationPicker
 * Encapsulates all location dropdown queries (Countries, States, Cities)
 * and returns properly typed picker items for SearchablePicker.
 */
export function useLocationPicker(selectedCountry: string, selectedState: string) {
  const { data: countriesRes, isLoading: countriesLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: getCountries
  });

  const { data: statesRes, isLoading: statesLoading } = useQuery({
    queryKey: ["states", selectedCountry],
    queryFn: () => getStates(selectedCountry),
    enabled: !!selectedCountry
  });

  const { data: citiesRes, isLoading: citiesLoading } = useQuery({
    queryKey: ["cities", selectedCountry, selectedState],
    queryFn: () => getCities(selectedCountry, selectedState),
    enabled: !!selectedCountry && !!selectedState
  });

  const countryItems: PickerOption[] = useMemo(() => {
    return (countriesRes?.data?.countryList || []).map((c: LocationItem) => ({ label: c.name, value: c.isoCode }));
  }, [countriesRes?.data?.countryList]);

  const stateItems: PickerOption[] = useMemo(() => {
    return (statesRes?.data?.stateList || []).map((s: LocationItem) => ({ label: s.name, value: s.isoCode }));
  }, [statesRes?.data?.stateList]);

  const cityItems: PickerOption[] = useMemo(() => {
    return (citiesRes?.data?.cityList || []).map((c: CityItem) => ({ label: c.name, value: c.name }));
  }, [citiesRes?.data?.cityList]);

  return {
    countryItems,
    stateItems,
    cityItems,
    countriesLoading,
    statesLoading,
    citiesLoading,
  };
}
