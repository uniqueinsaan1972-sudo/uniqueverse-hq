export interface ImageValue {
  src: string;
  name: string;
  size?: number;
  type?: string;
  isDefault?: boolean;
}

export interface NamesValue {
  main: string;
  nickname: string;
  sender: string;
  /** true = the main name is used everywhere; false = each slot below can differ */
  useEverywhere: boolean;
  slots: Record<string, string>;
}

/** Everything a user can change. Always a clone of the template defaults. */
export interface TemplateContent {
  names: NamesValue;
  wish: string;
  image: ImageValue | null;
  gallery: ImageValue[];
}

export interface NameSlot {
  id: string;
  label: string;
}

/** Each template declares what it supports, so the editor never hardcodes one template. */
export interface ContentConfig {
  defaults: TemplateContent;
  nameSlots: NameSlot[];
  fields: { names: boolean; nickname: boolean; sender: boolean; wish: boolean; image: boolean; gallery: boolean };
  wishLabel?: string;
  gallery?: { min: number; max: number };
}
