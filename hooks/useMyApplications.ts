import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyApplicationsQuery } from "@services/queries";
import type { ApplicationFilters } from "@/types/opportunity";

export const useMyApplications = (filters?: ApplicationFilters, enabled = true) => {
  const queryClient = useQueryClient();

  const queryKey = ["my-applications", filters || "all"];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey,
    queryFn: () => getMyApplicationsQuery(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });

  const applications = (data?.data as any)?.applications || data?.data || [];
  
  const refreshApplications = () => {
    queryClient.invalidateQueries({ queryKey: ["my-applications"] });
  };

  return {
    applications,
    pagination: {
      totalItems: (data as any)?.totalItems || 0,
      totalPages: (data as any)?.totalPage || 0,
      itemsPerPage: (data as any)?.itemsPerPage || 10,
    },
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    refreshApplications,
  };
};
