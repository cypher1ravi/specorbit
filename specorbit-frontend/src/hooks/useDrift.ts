import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectDrift, getDriftDetail, resolveDrift } from '../lib/api';

export function useDriftList(projectId: string, page: number, q: string) {
  const limit = 12;
  return useQuery(
    ['drift', projectId, page, q],
    async () => {
      const res = await getProjectDrift(projectId, { page, limit, q: q || undefined });
      return res.data as { items: any[]; total: number; page: number; limit: number };
    },
    { placeholderData: { items: [], total: 0, page, limit }, keepPreviousData: true }
  );
}

export function useDriftDetail(projectId: string, detectionId?: string) {
  return useQuery(
    ['driftDetail', projectId, detectionId],
    async () => {
      const res = await getDriftDetail(projectId, detectionId!);
      return res.data;
    },
    { enabled: !!detectionId }
  );
}

export function useResolveDrift(projectId: string) {
  const qc = useQueryClient();
  return useMutation(
    (payload: { detectionId: string; resolved: boolean }) =>
      resolveDrift(projectId, payload.detectionId, payload.resolved),
    {
      onSuccess: () => qc.invalidateQueries(['drift', projectId])
    }
  );
}