import type { CapabilitiesResponse, CustomMlModelsResponse } from "@/types/capabilities";
import { apiFetch } from "./api-client";

export function getCapabilities(): Promise<CapabilitiesResponse> {
  return apiFetch<CapabilitiesResponse>("/capabilities");
}

export function getCustomMlModels(): Promise<CustomMlModelsResponse> {
  return apiFetch<CustomMlModelsResponse>("/capabilities/custom-ml-models");
}
