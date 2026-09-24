import type { Component } from 'vue';

export interface ShellNavItem {
  to: string;
  /** i18n key of the label; the sidebar shows it in both languages. */
  key: string;
  icon: Component | string;
}

export interface ShellNavSection {
  /** i18n key under `navSection.*`. */
  key: string;
  items: ShellNavItem[];
  /** Long, rarely used groups fold away; they open by themselves when they hold the current page. */
  collapsible?: boolean;
}
