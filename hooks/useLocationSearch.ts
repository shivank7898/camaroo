import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useDebounce } from "./useDebounce";
import { searchLocationSuggestions, reverseGeocodeLocation, getPlaceCoordinates } from "@/services/location";
import { useGlobalStore } from "@/store/globalStore";
import type { LocationSuggestion, PickedLocation } from "@/types/auth";

export const useLocationSearch = (value: PickedLocation | null, onSelect: (loc: PickedLocation) => void, onClear?: () => void) => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const { showToast } = useGlobalStore();

  const { data: suggestions = [], isFetching: isSearching } = useQuery({
    queryKey: ["locationSearch", debouncedQuery],
    enabled: debouncedQuery.length >= 3 && !value,
    queryFn: async () => {
      if (debouncedQuery.length < 3 || value) return [];
      try {
        const response = await searchLocationSuggestions(debouncedQuery);
        if (response?.data?.predictions && Array.isArray(response.data.predictions)) {
          return response.data.predictions.map((p: any) => ({
            placeId: p.place_id,
            description: p.description,
            lat: 0, // Not provided by autocomplete API, needs Details API call if required
            lng: 0,
          }));
        }
        return [];
      } catch (error) {
        console.error("Error fetching location suggestions", error);
        return [];
      }
    },
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

  const selectSuggestion = useCallback(async (suggestion: LocationSuggestion) => {
    try {
      setIsLoadingGPS(true);
      const coordsRes = await getPlaceCoordinates(suggestion.placeId);
      const location = coordsRes?.data?.result?.geometry?.location || { lat: 0, lng: 0 };
      
      const pickedLoc: PickedLocation = {
        lat: location.lat,
        lng: location.lng,
        place: suggestion.description
      };
      onSelect(pickedLoc);
      setQuery(suggestion.description);
    } catch (err) {
      console.error("Error fetching place coordinates", err);
      showToast("Could not fetch location coordinates", "error");
    } finally {
      setIsLoadingGPS(false);
    }
  }, [onSelect, showToast]);

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
