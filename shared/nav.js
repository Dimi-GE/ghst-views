// Single source of truth for navigation. Sidebar builds from it; header reads
// labels from it. Add a view = add one entry (and a views/<view>/ folder).
export const NAV_ITEMS = [
  { icon: 'ti-message-2',    label: 'Reviews',       view: 'reviews' },
  { icon: 'ti-clock-hour-4', label: 'Hours Reports', view: 'time-tracking' },
];
