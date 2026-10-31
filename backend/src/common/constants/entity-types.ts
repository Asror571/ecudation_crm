export const EntityType = {
  DEAL: 'deal',
  CONTACT: 'contact',
  COMPANY: 'company',
} as const;

export type EntityTypeType = (typeof EntityType)[keyof typeof EntityType];
