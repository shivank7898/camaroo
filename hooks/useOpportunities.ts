import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOpportunitiesQuery } from "@services/queries";
import type { OpportunityFilters } from "@/types/opportunity";

export const useOpportunities = (filters?: OpportunityFilters) => {
  const queryClient = useQueryClient();

  // Create highly specialized query key to automatically refetch when filters change
  const queryKey = ["opportunities", filters || "all"];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey,
    queryFn: () => getOpportunitiesQuery(filters),
    staleTime: 1000 * 60 * 5, // 5 mins cache defaults per RULES
  });

  // Extract flat data for list consumption immediately
  const opportunities = data?.data || [];
  
  // Manual un-paginated refresh mechanism 
  const refreshOpportunities = () => {
    queryClient.invalidateQueries({ queryKey: ["opportunities"] });
  };

  return {
    opportunities,
    pagination: {
      totalItems: data?.totalItems || 0,
      totalPages: data?.totalPage || 0,
      itemsPerPage: data?.itemsPerPage || 10,
    },
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    refreshOpportunities,
  };
};
