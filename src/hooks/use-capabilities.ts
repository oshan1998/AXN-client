"use client";

import { useQuery } from "@tanstack/react-query";
import { getCapabilities, getCustomMlModels } from "@/lib/data/capabilities";

const capabilitiesKey = ["capabilities"] as const;
const customMlModelsKey = ["custom-ml-models"] as const;

export function useCapabilities() {
  return useQuery({ queryKey: capabilitiesKey, queryFn: getCapabilities });
}

export function useCustomMlModels() {
  return useQuery({ queryKey: customMlModelsKey, queryFn: getCustomMlModels });
}
