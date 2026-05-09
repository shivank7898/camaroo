import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOpportunityByIdQuery, getOpportunityApplicationsQuery } from "@services/queries";
import type { ApplicationFilters } from "@/types/opportunity";
import { useUserStore } from "@/store/userStore";

export const useOpportunityDetail = (
  opportunityId: string | null | undefined,
  appFilters?: ApplicationFilters
) => {
  const currentUserId = useUserStore((s) => s.userData?.user?._id);
  const queryClient = useQueryClient();

  // Query 1: The Opportunity Detail
  const opportunityQuery = useQuery({
    queryKey: ["opportunity", opportunityId],
    queryFn: () => getOpportunityByIdQuery(opportunityId as string),
    enabled: !!opportunityId, 
    staleTime: 1000 * 60 * 5, 
  });

  const creatorId = opportunityQuery.data?.userData?._id || 
                    opportunityQuery.data?.userId?._id || 
                    (typeof opportunityQuery.data?.createdBy === 'object' 
                      ? opportunityQuery.data?.createdBy._id 
                      : opportunityQuery.data?.createdBy);
                      
  const isOwner = Boolean(
    opportunityQuery.data && currentUserId && creatorId === currentUserId
  );

  // Query 2: Applications to this opportunity (ONLY if owner)
  const applicationsQuery = useQuery({
    queryKey: ["opportunity-applications", opportunityId, appFilters || "all"],
    queryFn: () => getOpportunityApplicationsQuery(opportunityId as string, appFilters),
    enabled: !!opportunityId && isOwner, 
    staleTime: 1000 * 60 * 2, 
  });

  // Aggregate states for clean consumption
  const isLoading = opportunityQuery.isLoading || applicationsQuery.isLoading;
  const isError = opportunityQuery.isError || applicationsQuery.isError;
  const error = opportunityQuery.error || applicationsQuery.error;
  
  const refetchAll = () => {
    // Rely on invalidation so that disabled queries are not forcefully executed
    queryClient.invalidateQueries({ queryKey: ["opportunity", opportunityId] });
    if (isOwner) {
      queryClient.invalidateQueries({ queryKey: ["opportunity-applications", opportunityId] });
    }
  };

  return {
    opportunity: opportunityQuery.data,
    applications: (applicationsQuery.data?.data as any)?.applications || [],
    applicationsPagination: {
      totalItems: applicationsQuery.data?.totalItems || 0,
      totalPages: applicationsQuery.data?.totalPage || 0,
    },
    isLoading,
    isError,
    error,
    refetchAll,
  };
};
