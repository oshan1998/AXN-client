"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createNetwork,
  deleteNetwork,
  getNetwork,
  listNetworks,
  updateNetwork,
} from "@/lib/data/networks";
import type {
  CreateNetworkInput,
  UpdateNetworkInput,
} from "@/types/network";

const networksKey = ["networks"] as const;
const networkKey = (id: string) => ["networks", id] as const;

export function useNetworks() {
  return useQuery({ queryKey: networksKey, queryFn: listNetworks });
}

export function useNetwork(id: string) {
  return useQuery({ queryKey: networkKey(id), queryFn: () => getNetwork(id) });
}

export function useCreateNetwork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNetworkInput) => createNetwork(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: networksKey }),
  });
}

export function useUpdateNetwork(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateNetworkInput) => updateNetwork(id, input),
    onSuccess: (network) => {
      queryClient.setQueryData(networkKey(id), network);
      queryClient.invalidateQueries({ queryKey: networksKey });
    },
  });
}

export function useDeleteNetwork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNetwork(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: networksKey }),
  });
}
