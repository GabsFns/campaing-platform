export type VariableSource = 'contact' | 'seller' | 'custom';

export type ResolveContext = {
  contact?: Record<string, any>;
  seller?: Record<string, any>;
  custom?: Record<string, any>;
};

export type ResolveOptions = {
  fallback?: string;
};
