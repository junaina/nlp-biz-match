// src/modules/auth/domain/auth.types.ts
export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  businessName: string;
};

export type LoginInput = {
  email: string;
  password: string;
};
