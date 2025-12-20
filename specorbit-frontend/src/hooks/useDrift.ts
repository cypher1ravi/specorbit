import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getProjectDrift, getDriftDetail, driftApi } from '../lib/api';

/**
 * Hook to fetch paginated list of drift detections
 */
export function useDriftList(projectId: string, page: number, q: string) {
  const limit = 12;
  
  return useQuery({
    // In v5, the queryKey must be the first property of the object
    queryKey: ['drift', projectId, page, q],
    queryFn: async () => {
      const res = await getProjectDrift(projectId, { 
        page, 
        limit, 
        q: q || undefined 
      });
      return res.data as { 
        items: any[]; 
        total: number; 
        page: number; 
        limit: number;
        hasMore?: boolean; // Useful for pagination UI
      };
    },
    // v5 uses 'placeholderData' with 'keepPreviousData' utility function 
    // to prevent the UI from flickering back to loading between pages
    placeholderData: keepPreviousData,
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch specific drift discrepancy details
 */
export function useDriftDetail(projectId: string, detectionId?: string) {
  return useQuery({
    queryKey: ['driftDetail', projectId, detectionId],
    queryFn: async () => {
      if (!detectionId) throw new Error("Detection ID is required");
      const res = await getDriftDetail(projectId, detectionId);
      return res.data;
    },
    enabled: !!detectionId && !!projectId,
  });
}

/**
 * Mutation to mark a drift as resolved or open
 */
export const useResolveDrift = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    // MutationFn was already correctly using object syntax in your snippet,
    // but we ensure it matches the latest API interface.
    mutationFn: ({ detectionId, resolved }: { detectionId: string, resolved: boolean }) => 
      driftApi.resolve(projectId, detectionId, resolved),
    
    onSuccess: () => {
      // Ensure cache invalidation uses the object syntax
      queryClient.invalidateQueries({ 
        queryKey: ['drift', projectId] 
      });
    }
  });
};