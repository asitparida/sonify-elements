import type { SoundKey } from 'sonify-elements';

export interface InteractionSound {
  label: string;
  soundKey: SoundKey;
  description: string;
}

export interface Interaction {
  id: string;
  label: string;
  group: string;
  description: string;
  sounds: InteractionSound[];
}

export const INTERACTION_GROUPS: { heading: string; items: Interaction[] }[] = [
  {
    heading: 'Notifications',
    items: [
      {
        id: 'toasts-alerts',
        label: 'Toasts & Alerts',
        group: 'Notifications',
        description: 'Banner notifications that appear and dismiss. Each type needs a distinct sonic identity so users know severity without reading.',
        sounds: [
          { label: 'Success', soundKey: 'toastSuccess', description: 'Ascending two-note. Positive resolution.' },
          { label: 'Warning', soundKey: 'toastWarning', description: 'Triangle wave two-note. Rougher timbre signals caution.' },
          { label: 'Error', soundKey: 'toastError', description: 'Double-tap at low frequency. Unmistakable.' },
          { label: 'Info', soundKey: 'toastInfo', description: 'Single neutral tick. Informational, not urgent.' },
        ],
      },
    ],
  },
  {
    heading: 'Elevation & Layers',
    items: [
      {
        id: 'modal',
        label: 'Modal',
        group: 'Elevation & Layers',
        description: 'A dialog that overlays the entire page. The heaviest surface, so it gets the deepest sound.',
        sounds: [
          { label: 'Open', soundKey: 'modalOpen', description: 'Deep ascending pair. Low register conveys weight.' },
          { label: 'Close', soundKey: 'modalClose', description: 'Descending pair. Paired inverse, slightly softer.' },
        ],
      },
      {
        id: 'drawer',
        label: 'Drawer',
        group: 'Elevation & Layers',
        description: 'A panel that slides from the edge. Lighter than a modal but still an overlay.',
        sounds: [
          { label: 'Open', soundKey: 'drawerOpen', description: 'Mid-range tick with slow attack. Feels like sliding.' },
          { label: 'Close', soundKey: 'drawerClose', description: 'Lower tick. Shorter than open.' },
        ],
      },
      {
        id: 'popover-tooltip',
        label: 'Popover & Tooltip',
        group: 'Elevation & Layers',
        description: 'Small surfaces that appear near a trigger. Popovers are click-triggered, tooltips are hover-triggered.',
        sounds: [
          { label: 'Popover show', soundKey: 'popoverShow', description: 'Light pop. A small surface appearing.' },
          { label: 'Popover hide', soundKey: 'popoverHide', description: 'Softer, lower. The pop settling back.' },
          { label: 'Tooltip show', soundKey: 'tooltipShow', description: 'Near-silent. Fires on hover, must be ambient.' },
        ],
      },
    ],
  },
  {
    heading: 'Navigation',
    items: [
      {
        id: 'page-nav',
        label: 'Page Navigation',
        group: 'Navigation',
        description: 'Moving between views. Forward motion ascends, backward descends.',
        sounds: [
          { label: 'Forward', soundKey: 'pageForward', description: 'Ascending pair. Moving deeper.' },
          { label: 'Back', soundKey: 'pageBack', description: 'Descending pair. Returning.' },
          { label: 'Tab switch', soundKey: 'tabSwitch', description: 'Lateral tick. No hierarchy change.' },
          { label: 'Breadcrumb', soundKey: 'breadcrumb', description: 'Softer tick. Secondary navigation.' },
        ],
      },
    ],
  },
  {
    heading: 'Data & State',
    items: [
      {
        id: 'async',
        label: 'Loading & Refresh',
        group: 'Data & State',
        description: 'Async operations. Loading builds anticipation. Completion resolves it.',
        sounds: [
          { label: 'Loading start', soundKey: 'loadingStart', description: 'Soft tick. Something is beginning.' },
          { label: 'Loading done', soundKey: 'loadingDone', description: 'Ascending pair. Resolution after wait.' },
          { label: 'Refresh', soundKey: 'refresh', description: 'Three-note ascending. Build and release tension.' },
        ],
      },
      {
        id: 'manipulation',
        label: 'Undo, Drag & Copy',
        group: 'Data & State',
        description: 'Data manipulation actions. Undo and redo are paired. Drag and drop mirror grab and release.',
        sounds: [
          { label: 'Undo', soundKey: 'undo', description: 'Descending pair. Going back.' },
          { label: 'Redo', soundKey: 'redo', description: 'Ascending pair. Going forward again.' },
          { label: 'Drag start', soundKey: 'dragStart', description: 'Grab tick. Object picked up.' },
          { label: 'Drop', soundKey: 'drop', description: 'Settle tick. Object landed.' },
          { label: 'Copy', soundKey: 'copy', description: 'Light tick. Content captured.' },
        ],
      },
    ],
  },
];

export function findInteraction(id: string): Interaction | undefined {
  for (const group of INTERACTION_GROUPS) {
    const found = group.items.find((i) => i.id === id);
    if (found) return found;
  }
  return undefined;
}
