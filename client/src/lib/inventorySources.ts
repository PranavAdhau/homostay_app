export type InventorySourceKey = 'booking' | 'airbnb_sync' | 'manual_lock';

type InventorySourceMeta = {
  label: string;
  badgeClassName: string;
  dotClassName: string;
  tooltip: string;
};

export const INVENTORY_SOURCE_META: Record<InventorySourceKey, InventorySourceMeta> = {
  booking: {
    label: 'Website Booking',
    badgeClassName: 'bg-primary/10 text-primary border-primary/20',
    dotClassName: 'bg-primary',
    tooltip: 'Dates blocked by an approved booking.',
  },
  airbnb_sync: {
    label: 'Airbnb Reservation',
    badgeClassName: 'bg-warning/10 text-warning border-warning/20',
    dotClassName: 'bg-warning',
    tooltip: 'Dates blocked by the latest Airbnb calendar import.',
  },
  manual_lock: {
    label: 'Manual Lock',
    badgeClassName: 'bg-destructive/10 text-destructive border-destructive/20',
    dotClassName: 'bg-destructive',
    tooltip: 'Dates blocked manually by an admin.',
  },
};
