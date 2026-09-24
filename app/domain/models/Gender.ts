// Matches the backend's GenderEnum. Labels come from i18n: $t(`gender.${code}`).
export const GENDERS = ['male', 'female', 'other'] as const;
export type Gender = (typeof GENDERS)[number];
