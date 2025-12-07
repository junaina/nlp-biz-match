// src/modules/provider/domain/provider.types.ts
export type BusinessProfileInput = {
  name: string;
  logoUrl?: string | null;
  locationCity?: string | null;
  locationCountry?: string | null;
  website?: string | null;
  bio?: string | null;
  isBuyer?: boolean;
  isProvider?: boolean;
};

export type CreateServiceInput = {
  title: string;
  description: string;
  category: string;
  industry?: string | null;
  skills: string[];
  minBudget?: number | null;
  maxBudget?: number | null;
};
