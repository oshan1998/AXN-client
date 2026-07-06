import type {
  CreateNetworkInput,
  Network,
  UpdateNetworkInput,
} from "@/types/network";
import { apiFetch } from "./api-client";

export function listNetworks(): Promise<Network[]> {
  return apiFetch<Network[]>("/networks");
}

export function getNetwork(id: string): Promise<Network> {
  return apiFetch<Network>(`/networks/${id}`);
}

export function createNetwork(input: CreateNetworkInput): Promise<Network> {
  return apiFetch<Network>("/networks", { method: "POST", body: input });
}

export function updateNetwork(id: string, input: UpdateNetworkInput): Promise<Network> {
  return apiFetch<Network>(`/networks/${id}`, { method: "PATCH", body: input });
}

export function deleteNetwork(id: string): Promise<void> {
  return apiFetch<void>(`/networks/${id}`, { method: "DELETE" });
}
