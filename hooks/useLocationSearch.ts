import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useDebounce } from "./useDebounce";
import { searchLocationSuggestions, reverseGeocodeLocation } from "@/services/location";
import { useGlobalStore } from "@/store/globalStore";
import type { LocationSuggestion, PickedLocation } from "@/types/auth";

export function useLocationSearch(
  onSelect: (loc: PickedLocation) => void,
  onClear?: () => void
) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const { showToast } = useGlobalStore();

  const { data: suggestions = [], isFetching: isSearching } = useQuery({
    queryKey: ["locationSuggestions", debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 3) return [];
      try {
        const response = await searchLocationSuggestions(debouncedQuery);
        // Assuming response is { data: [...] } based on apiRequest
        return response?.data || [];
      } catch (error) {
        console.error("Error fetching location suggestions", error);
        return [];
      }
    },
    enabled: debouncedQuery.length >= 3,
  });

  const getCurrentLocation = useCallback(async () => {
    try {
      setIsLoadingGPS(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        showToast("Permission to access location was denied", "error");
        setIsLoadingGPS(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const reverseRes = await reverseGeocodeLocation(latitude, longitude);
      const addressString = reverseRes?.data?.address || "Unknown Location";

      const pickedLoc: PickedLocation = {
        lat: latitude,
        lng: longitude,
        place: addressString
      };

      onSelect(pickedLoc);
      setQuery("");
    } catch (error) {
      console.error("Error getting current location", error);
      showToast("Could not get current location", "error");
    } finally {
      setIsLoadingGPS(false);
    }
  }, [onSelect, showToast]);

  const selectSuggestion = useCallback((suggestion: LocationSuggestion) => {
    const pickedLoc: PickedLocation = {
      lat: suggestion.lat || 0, // Should be populated by the API, fallback to 0
      lng: suggestion.lng || 0,
      place: suggestion.description
    };
    onSelect(pickedLoc);
    setQuery("");
  }, [onSelect]);

  const clearSelection = useCallback(() => {
    setQuery("");
    if (onClear) onClear();
  }, [onClear]);

  return {
    query,
    setQuery,
    suggestions,
    isSearching,
    isLoadingGPS,
    selectSuggestion,
    clearSelection,
    getCurrentLocation,
  };
}
