import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Lock, RefreshCcw, X } from 'lucide-react';
import api from '../../lib/adminAxios';
import { INVENTORY_SOURCE_META, type InventorySourceKey } from '../../lib/inventorySources';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '../ui/drawer';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { useIsMobile } from '../ui/use-mobile';

// ─── Types (unchanged from original) ────────────────────────────────────────

type BlockingSource = {
  id: number;
  source: InventorySourceKey | 'reservation_hold';
  label: string;
  reason?: string | null;
};

type CalendarEvent = {
  id: string;
  source: InventorySourceKey;
  title: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  reason_label: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string | null;
  unlockable: boolean;
  booking_reference: number | null;
  blocking_sources: BlockingSource[];
};

type CalendarPayload = {
  homestay: {
    id: number;
    name: string;
    slug: string;
    sync_enabled: boolean;
  };
  visible_range: {
    start_date: string;
    end_date: string;
  };
  events: CalendarEvent[];
};

// ─── Recurring types (new, frontend-only) ───────────────────────────────────

type RecurringRepeat = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
type RecurringEndCondition = 'never' | 'until' | 'count';
type RecurringEditScope = 'current' | 'following' | 'all';

type RecurringRule = {
  repeat: RecurringRepeat;
  interval: number;
  weekDays?: string[]; // ['MO','TU',...]
  monthDay?: number;
  month?: number;
  endCondition: RecurringEndCondition;
  untilDate?: string;
  count?: number;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const DAY_LABELS_DESKTOP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LABELS_MOBILE = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const LOCK_REASONS = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'owner_stay', label: 'Owner Stay' },
  { value: 'offline_booking', label: 'Offline Booking' },
  { value: 'emergency_closure', label: 'Emergency Closure' },
  { value: 'other', label: 'Other' },
];

const WEEK_DAY_OPTIONS = [
  { short: 'SU', label: 'Sun' },
  { short: 'MO', label: 'Mon' },
  { short: 'TU', label: 'Tue' },
  { short: 'WE', label: 'Wed' },
  { short: 'TH', label: 'Thu' },
  { short: 'FR', label: 'Fri' },
  { short: 'SA', label: 'Sat' },
];

const TODAY = dayjs().startOf('day');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isEventOnDate(event: CalendarEvent, date: Dayjs): boolean {
  const start = dayjs(event.start_date);
  const endExclusive = dayjs(event.end_date);
  return (
    (date.isSame(start, 'day') || date.isAfter(start, 'day')) &&
    date.isBefore(endExclusive, 'day')
  );
}

function isPastDate(date: Dayjs): boolean {
  return date.isBefore(TODAY, 'day');
}

function defaultRecurring(): RecurringRule {
  return {
    repeat: 'none',
    interval: 1,
    weekDays: ['MO'],
    monthDay: 1,
    month: 1,
    endCondition: 'never',
    untilDate: TODAY.add(30, 'day').format('YYYY-MM-DD'),
    count: 10,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Compact dot indicators for a calendar cell */
function EventDots({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) return null;
  // Show up to 3 dots, one per unique source
  const sources = [...new Set(events.map((e) => e.source))].slice(0, 3);
  return (
    <div className="flex items-center justify-center gap-0.5 mt-0.5">
      {sources.map((src) => (
        <span
          key={src}
          className={`h-1.5 w-1.5 rounded-full ${INVENTORY_SOURCE_META[src].dotClassName}`}
        />
      ))}
      {events.length > 3 && (
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
      )}
    </div>
  );
}

/** Recurring rule form — rendered inside create dialog/drawer */
function RecurringRuleEditor({
  rule,
  onChange,
  startDate,
}: {
  rule: RecurringRule;
  onChange: (r: RecurringRule) => void;
  startDate: string;
}) {
  const set = useCallback(
    (patch: Partial<RecurringRule>) => onChange({ ...rule, ...patch }),
    [rule, onChange],
  );

  return (
    <div className="space-y-3">
      {/* Repeat type */}
      <div>
        <Label>Repeats</Label>
        <Select
          value={rule.repeat}
          onValueChange={(v) => set({ repeat: v as RecurringRepeat })}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Does not repeat</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {rule.repeat !== 'none' && (
        <>
          {/* Interval */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Repeat every</span>
            <Input
              type="number"
              min={1}
              max={99}
              value={rule.interval}
              onChange={(e) => set({ interval: Math.max(1, Number(e.target.value)) })}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">
              {rule.repeat === 'daily' && 'day(s)'}
              {rule.repeat === 'weekly' && 'week(s)'}
              {rule.repeat === 'monthly' && 'month(s)'}
              {rule.repeat === 'yearly' && 'year(s)'}
            </span>
          </div>

          {/* Weekly — day picker */}
          {rule.repeat === 'weekly' && (
            <div>
              <Label className="text-xs text-muted-foreground">On days</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {WEEK_DAY_OPTIONS.map((d) => {
                  const active = rule.weekDays?.includes(d.short);
                  return (
                    <button
                      key={d.short}
                      type="button"
                      onClick={() => {
                        const current = rule.weekDays || [];
                        const next = active
                          ? current.filter((x) => x !== d.short)
                          : [...current, d.short];
                        set({ weekDays: next.length ? next : [d.short] });
                      }}
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Monthly — day of month */}
          {rule.repeat === 'monthly' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">On day</span>
              <Input
                type="number"
                min={1}
                max={31}
                value={rule.monthDay}
                onChange={(e) => set({ monthDay: Math.min(31, Math.max(1, Number(e.target.value))) })}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">of the month</span>
            </div>
          )}

          {/* Yearly — month + day */}
          {rule.repeat === 'yearly' && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">On</span>
              <Select
                value={String(rule.month ?? 1)}
                onValueChange={(v) => set({ month: Number(v) })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                    <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                max={31}
                value={rule.monthDay}
                onChange={(e) => set({ monthDay: Math.min(31, Math.max(1, Number(e.target.value))) })}
                className="w-20"
              />
            </div>
          )}

          {/* End condition */}
          <div>
            <Label>Ends</Label>
            <Select
              value={rule.endCondition}
              onValueChange={(v) => set({ endCondition: v as RecurringEndCondition })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="until">On date</SelectItem>
                <SelectItem value="count">After occurrences</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {rule.endCondition === 'until' && (
            <div>
              <Label htmlFor="recurring-until">End date</Label>
              <Input
                id="recurring-until"
                type="date"
                value={rule.untilDate}
                min={startDate}
                onChange={(e) => set({ untilDate: e.target.value })}
                className="mt-1.5"
              />
            </div>
          )}

          {rule.endCondition === 'count' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">After</span>
              <Input
                type="number"
                min={1}
                max={365}
                value={rule.count}
                onChange={(e) => set({ count: Math.max(1, Number(e.target.value)) })}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">occurrence(s)</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Lock Form Fields (shared between Dialog and Drawer) ─────────────────────

type LockFormState = {
  starts_on: string;
  ends_on: string;
  reason: string;
  notes: string;
};

function LockFormFields({
  form,
  onChange,
  recurring,
  onRecurringChange,
  idPrefix,
}: {
  form: LockFormState;
  onChange: (patch: Partial<LockFormState>) => void;
  recurring: RecurringRule;
  onRecurringChange: (r: RecurringRule) => void;
  idPrefix: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${idPrefix}-start`}>Start Date</Label>
          <Input
            id={`${idPrefix}-start`}
            type="date"
            value={form.starts_on}
            min={TODAY.format('YYYY-MM-DD')}
            onChange={(e) => onChange({ starts_on: e.target.value })}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-end`}>End Date</Label>
          <Input
            id={`${idPrefix}-end`}
            type="date"
            value={form.ends_on}
            min={form.starts_on || TODAY.format('YYYY-MM-DD')}
            onChange={(e) => onChange({ ends_on: e.target.value })}
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-muted-foreground">Exclusive checkout-style end date.</p>
        </div>
      </div>
      <div>
        <Label>Reason</Label>
        <Select
          value={form.reason}
          onValueChange={(v) => onChange({ reason: v })}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {LOCK_REASONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-notes`}>Notes</Label>
        <Textarea
          id={`${idPrefix}-notes`}
          rows={3}
          value={form.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          className="mt-1.5"
          placeholder="Optional context for the team"
        />
      </div>
      <div className="border-t border-border pt-4">
        <RecurringRuleEditor
          rule={recurring}
          onChange={onRecurringChange}
          startDate={form.starts_on}
        />
      </div>
    </div>
  );
}

// ─── Event Detail Fields (shared) ────────────────────────────────────────────

function EventDetailContent({
  event,
  onUnlock,
}: {
  event: CalendarEvent;
  onUnlock: () => void;
}) {
  return (
    <div className="space-y-4 text-sm">
      <div
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${INVENTORY_SOURCE_META[event.source].badgeClassName}`}
      >
        {INVENTORY_SOURCE_META[event.source].label}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date Range</p>
          <p className="mt-1 text-foreground">
            {dayjs(event.start_date).format('DD MMM YYYY')} –{' '}
            {dayjs(event.end_date).subtract(1, 'day').format('DD MMM YYYY')}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Created At</p>
          <p className="mt-1 text-foreground">
            {event.created_at
              ? dayjs(event.created_at).format('DD MMM YYYY, hh:mm A')
              : 'Not available'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reason</p>
          <p className="mt-1 text-foreground">{event.reason_label || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Created By</p>
          <p className="mt-1 text-foreground">{event.created_by || 'Not available'}</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</p>
        <div className="mt-1 rounded-lg border border-border bg-muted/20 px-3 py-2 text-foreground break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
          {event.notes || 'No notes provided.'}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Blocked By</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {event.blocking_sources.map((src) => (
            <span
              key={`${src.source}-${src.id}`}
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                src.source === 'reservation_hold'
                  ? 'bg-muted text-muted-foreground border-border'
                  : INVENTORY_SOURCE_META[src.source as InventorySourceKey].badgeClassName
              }`}
            >
              {src.label}
            </span>
          ))}
        </div>
      </div>
      {event.unlockable && (
        <div className="pt-1">
          <Button variant="destructive" size="sm" onClick={onUnlock}>
            Remove Manual Lock
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomestayCalendarPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isMobile = useIsMobile();

  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [payload, setPayload] = useState<CalendarPayload | null>(null);
  const [loading, setLoading] = useState(true);

  // Selection state (for date-range picking)
  const [selectionStart, setSelectionStart] = useState<Dayjs | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Dayjs | null>(null);

  // Detail drawer/dialog
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Mobile: when a day has multiple events, show a picker first
  const [mobileDayEvents, setMobileDayEvents] = useState<CalendarEvent[]>([]);

  // Create lock dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [lockForm, setLockForm] = useState<LockFormState>({
    starts_on: '',
    ends_on: '',
    reason: 'maintenance',
    notes: '',
  });
  const [recurring, setRecurring] = useState<RecurringRule>(defaultRecurring());
  const [savingLock, setSavingLock] = useState(false);

  // Unlock confirm
  const [unlockEvent, setUnlockEvent] = useState<CalendarEvent | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  // Recurring edit scope (for future edit-scope dialog)
  const [recurringEditScope, setRecurringEditScope] = useState<RecurringEditScope>('current');
  const [recurringEditOpen, setRecurringEditOpen] = useState(false);

  // ── Derived calendar grid ────────────────────────────────────────────────

  const visibleRange = useMemo(() => {
    const start = currentMonth.startOf('month').startOf('week');
    const end = currentMonth.endOf('month').endOf('week').add(1, 'day');
    return { start, end };
  }, [currentMonth]);

  const calendarDays = useMemo(() => {
    const days: Dayjs[] = [];
    let cursor = visibleRange.start;
    while (cursor.isBefore(visibleRange.end, 'day')) {
      days.push(cursor);
      cursor = cursor.add(1, 'day');
    }
    return days;
  }, [visibleRange]);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchInventory = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.get(`/homestays/${id}/calendar_inventory`, {
        params: {
          start_date: visibleRange.start.format('YYYY-MM-DD'),
          end_date: visibleRange.end.format('YYYY-MM-DD'),
        },
      });
      if (response.data.success) {
        setPayload(response.data.data);
      }
    } catch (error) {
      console.error('Error loading calendar inventory:', error);
      toast.error('Failed to load calendar inventory');
    } finally {
      setLoading(false);
    }
  }, [id, visibleRange]);

  useEffect(() => {
    void fetchInventory();
  }, [fetchInventory]);

  // ── Date selection logic ─────────────────────────────────────────────────

  const handleDateClick = useCallback(
    (date: Dayjs) => {
      if (isPastDate(date)) {
        toast.warning('Cannot select past dates');
        return;
      }

      if (!selectionStart || (selectionStart && selectionEnd)) {
        setSelectionStart(date);
        setSelectionEnd(null);
        return;
      }

      const ordered = [selectionStart, date].sort((a, b) => a.valueOf() - b.valueOf());
      setSelectionStart(ordered[0]);
      setSelectionEnd(ordered[1]);
      setLockForm((curr) => ({
        ...curr,
        starts_on: ordered[0].format('YYYY-MM-DD'),
        ends_on: ordered[1].add(1, 'day').format('YYYY-MM-DD'),
      }));
      setRecurring(defaultRecurring());
      setCreateDialogOpen(true);
    },
    [selectionStart, selectionEnd],
  );

  const openCreateDialog = () => {
    setLockForm((curr) => ({
      ...curr,
      starts_on: selectionStart?.format('YYYY-MM-DD') || '',
      ends_on: selectionEnd?.add(1, 'day').format('YYYY-MM-DD') || '',
    }));
    setRecurring(defaultRecurring());
    setCreateDialogOpen(true);
  };

  const resetSelection = () => {
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const isInSelection = (day: Dayjs): boolean => {
    if (!selectionStart) return false;
    if (day.isSame(selectionStart, 'day')) return true;
    if (selectionEnd) {
      return (
        (day.isAfter(selectionStart, 'day') || day.isSame(selectionStart, 'day')) &&
        (day.isBefore(selectionEnd, 'day') || day.isSame(selectionEnd, 'day'))
      );
    }
    return false;
  };

  // ── Create lock ──────────────────────────────────────────────────────────

  const handleCreateLock = async () => {
    if (!id) return;

    // Past-date guard
    if (lockForm.starts_on && isPastDate(dayjs(lockForm.starts_on))) {
      toast.error('Cannot create a lock starting in the past');
      return;
    }

    setSavingLock(true);
    try {
      // Build payload — include recurring rule if not 'none'
      const payload: Record<string, unknown> = { ...lockForm };
      if (recurring.repeat !== 'none') {
        payload.recurring = {
          repeat: recurring.repeat,
          interval: recurring.interval,
          ...(recurring.repeat === 'weekly' && { week_days: recurring.weekDays?.join(',') }),
          ...(recurring.repeat === 'monthly' && { month_day: recurring.monthDay }),
          ...(recurring.repeat === 'yearly' && { month: recurring.month, month_day: recurring.monthDay }),
          ...(recurring.endCondition === 'until' && { until: recurring.untilDate }),
          ...(recurring.endCondition === 'count' && { count: recurring.count }),
        };
      }

      const response = await api.post(`/homestays/${id}/manual_inventory_blocks`, {
        manual_inventory_block: payload,
      });
      if (response.data.success) {
        toast.success(response.data.message || 'Manual lock created successfully');
        (response.data.data?.warnings || []).forEach((w: string) => toast(w));
        setCreateDialogOpen(false);
        setLockForm({ starts_on: '', ends_on: '', reason: 'maintenance', notes: '' });
        setRecurring(defaultRecurring());
        resetSelection();
        await fetchInventory();
      }
    } catch (error: any) {
      console.error('Error creating manual lock:', error);
      toast.error(
        error.response?.data?.errors?.join(', ') ||
          error.response?.data?.message ||
          'Unable to create manual lock',
      );
    } finally {
      setSavingLock(false);
    }
  };

  // ── Unlock ───────────────────────────────────────────────────────────────

  const handleUnlock = async () => {
    if (!id || !unlockEvent) return;
    setUnlocking(true);
    try {
      const eventId = unlockEvent.id.replace('manual_lock-', '');
      const response = await api.patch(
        `/homestays/${id}/manual_inventory_blocks/${eventId}/unlock`,
        {},
      );
      toast.success(response.data.message || 'Manual lock removed');
      setUnlockEvent(null);
      setSelectedEvent(null);
      await fetchInventory();
    } catch (error: any) {
      console.error('Error unlocking manual lock:', error);
      toast.error(error.response?.data?.message || 'Unable to remove this manual lock');
    } finally {
      setUnlocking(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────

  if (loading && !payload) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // ── Calendar cell renderer ───────────────────────────────────────────────

  const renderDesktopCell = (day: Dayjs) => {
    const dayEvents = (payload?.events || []).filter((e) => isEventOnDate(e, day));
    const isCurrentMonth = day.month() === currentMonth.month();
    const isToday = day.isSame(TODAY, 'day');
    const isPast = isPastDate(day);
    const selected = isInSelection(day);

    return (
      <button
        key={day.toISOString()}
        type="button"
        onClick={() => {
          if (dayEvents.length > 0) {
            setSelectedEvent(dayEvents[0]);
          } else {
            handleDateClick(day);
          }
        }}
        className={[
          'relative min-h-[80px] rounded-lg border p-1.5 text-left align-top transition-colors group',
          selected
            ? 'border-primary bg-primary/5'
            : isPast
            ? 'border-border/50 bg-muted/10 cursor-not-allowed'
            : 'border-border hover:bg-muted/30 cursor-pointer',
          !isCurrentMonth && 'opacity-40',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Day number */}
        <div className="flex items-center justify-between mb-1">
          <span
            className={[
              'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
              isToday
                ? 'bg-primary text-primary-foreground'
                : isPast
                ? 'text-muted-foreground/60'
                : 'text-foreground group-hover:bg-muted',
            ].join(' ')}
          >
            {day.date()}
          </span>
          {dayEvents.length > 2 && (
            <span className="text-[10px] text-muted-foreground font-medium">
              +{dayEvents.length - 2}
            </span>
          )}
        </div>

        {/* Event bars — up to 2 */}
        <div className="space-y-0.5">
          {dayEvents.slice(0, 2).map((event) => (
            <button
              key={`${event.id}-${day.format('YYYY-MM-DD')}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEvent(event);
              }}
              className={[
                'w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium leading-tight transition-opacity hover:opacity-80',
                INVENTORY_SOURCE_META[event.source].badgeClassName,
              ].join(' ')}
              title={event.title}
            >
              {event.title}
            </button>
          ))}
        </div>
      </button>
    );
  };

  const renderMobileCell = (day: Dayjs) => {
    const dayEvents = (payload?.events || []).filter((e) => isEventOnDate(e, day));
    const isCurrentMonth = day.month() === currentMonth.month();
    const isToday = day.isSame(TODAY, 'day');
    const isPast = isPastDate(day);
    const selected = isInSelection(day);
    const hasEvents = dayEvents.length > 0;

    // Pick the "dominant" event source for the background tint
    // Priority: manual_lock > airbnb_sync > booking
    const dominantSource = dayEvents.find((e) => e.source === 'manual_lock')?.source
      || dayEvents.find((e) => e.source === 'airbnb_sync')?.source
      || dayEvents[0]?.source;

    // Subtle tint classes per source (transparent fill around the number)
    const sourceTintClass: Record<InventorySourceKey, string> = {
      booking: 'bg-primary/15 text-primary',
      airbnb_sync: 'bg-warning/15 text-warning',
      manual_lock: 'bg-destructive/15 text-destructive',
    };

    // Determine circle style
    let circleClass = '';
    if (isToday) {
      circleClass = 'bg-primary text-primary-foreground font-bold shadow-sm';
    } else if (selected && !hasEvents) {
      circleClass = 'bg-primary/20 text-primary font-semibold ring-1 ring-primary/40';
    } else if (hasEvents && dominantSource) {
      circleClass = sourceTintClass[dominantSource] + ' font-semibold';
    } else if (isPast) {
      circleClass = 'text-muted-foreground/40';
    } else {
      circleClass = 'text-foreground';
    }

    // Multi-source indicator: small colored ring if more than one source type
    const uniqueSources = [...new Set(dayEvents.map((e) => e.source))];
    const hasMultipleSources = uniqueSources.length > 1;

    const handleMobileCellTap = () => {
      if (hasEvents) {
        if (dayEvents.length === 1) {
          // Single event — open detail directly
          setSelectedEvent(dayEvents[0]);
        } else {
          // Multiple events — show picker drawer
          setMobileDayEvents(dayEvents);
        }
      } else {
        handleDateClick(day);
      }
    };

    return (
      <button
        key={`mob-${day.toISOString()}`}
        type="button"
        onClick={handleMobileCellTap}
        className={[
          'relative flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors min-h-[44px]',
          hasEvents ? 'active:opacity-70' : !isPast ? 'active:bg-muted/50' : '',
          !isCurrentMonth ? 'opacity-30' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Date number with coloured circle background */}
        <span
          className={[
            'flex h-8 w-8 items-center justify-center rounded-full text-[13px] transition-colors',
            circleClass,
          ].join(' ')}
        >
          {day.date()}
        </span>

        {/* Multi-source dot row — only shown when multiple source types exist on same day */}
        {hasMultipleSources && (
          <div className="flex items-center gap-0.5 mt-0.5">
            {uniqueSources.slice(0, 3).map((src) => (
              <span
                key={src}
                className={`h-1 w-1 rounded-full ${INVENTORY_SOURCE_META[src].dotClassName}`}
              />
            ))}
          </div>
        )}
      </button>
    );
  };

  // ─── Mobile selected-date detail strip ───────────────────────────────────

  const selectedDateForDetail = selectionStart;
  const selectedDateEvents = selectedDateForDetail
    ? (payload?.events || []).filter((e) => isEventOnDate(e, selectedDateForDetail))
    : [];

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground leading-tight md:text-2xl">
            {payload?.homestay.name || 'Inventory Calendar'}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Track website bookings, Airbnb imports, and manual locks in one place.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-nowrap">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/homestays')} className="whitespace-nowrap">
            <span className="hidden sm:inline">Back to Homestays</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => void fetchInventory()} disabled={loading} className="whitespace-nowrap">
            <RefreshCcw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreateDialog} className="whitespace-nowrap">
            <Lock className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Add Manual Lock</span>
            <span className="sm:hidden">Add Lock</span>
          </Button>
        </div>
      </div>

      {/* Calendar card */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          {/* Mobile: stacked with centered month nav */}
          <div className="flex items-center justify-between md:hidden">
            <CardTitle className="text-base font-semibold">Calendar Overview</CardTitle>
          </div>
          <div className="flex items-center justify-between md:hidden mt-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth((m) => m.subtract(1, 'month'))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold text-foreground">
              {currentMonth.format('MMMM YYYY')}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth((m) => m.add(1, 'month'))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {/* Desktop: side-by-side */}
          <div className="hidden md:flex md:items-center md:justify-between">
            <CardTitle className="text-base font-semibold">Calendar Overview</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth((m) => m.subtract(1, 'month'))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-36 text-center text-sm font-semibold text-foreground">
                {currentMonth.format('MMMM YYYY')}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth((m) => m.add(1, 'month'))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {/* Legend — short labels on mobile so all 3 fit on one line */}
          {(() => {
            const mobileLabels: Record<InventorySourceKey, string> = {
              booking: 'Website',
              airbnb_sync: 'Airbnb',
              manual_lock: 'Manual Lock',
            };
            return (
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
                {(Object.keys(INVENTORY_SOURCE_META) as InventorySourceKey[]).map((src) => (
                  <div
                    key={src}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${INVENTORY_SOURCE_META[src].badgeClassName}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${INVENTORY_SOURCE_META[src].dotClassName}`} />
                    <span className="md:hidden">{mobileLabels[src]}</span>
                    <span className="hidden md:inline">{INVENTORY_SOURCE_META[src].label}</span>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Selection status bar */}
          {(selectionStart || selectionEnd) && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
              <span className="font-medium">Selected:</span>{' '}
              <span>
                {selectionStart?.format('DD MMM YYYY')}
                {selectionEnd ? ` – ${selectionEnd.format('DD MMM YYYY')}` : ' — tap end date'}
              </span>
              <button
                type="button"
                onClick={resetSelection}
                className="ml-auto flex h-5 w-5 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* ─── DESKTOP GRID ─── */}
          <div className="hidden md:block">
            {/* Day header row */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_LABELS_DESKTOP.map((d) => (
                <div
                  key={d}
                  className="px-1.5 py-1 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => renderDesktopCell(day))}
            </div>
          </div>

          {/* ─── MOBILE GRID (compact, Google Calendar-style) ─── */}
          <div className="md:hidden">
            {/* Day header row */}
            <div className="grid grid-cols-7 mb-0.5">
              {DAY_LABELS_MOBILE.map((d, i) => (
                <div
                  key={i}
                  className="py-1 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70"
                >
                  {d}
                </div>
              ))}
            </div>
            {/* Day cells — compact month grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day) => renderMobileCell(day))}
            </div>

            {/* Add lock prompt — only for empty selected future dates */}
            {selectedDateForDetail && !isPastDate(selectedDateForDetail) && selectedDateEvents.length === 0 && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  {selectedDateForDetail.format('dddd, DD MMMM YYYY')}
                </p>
                <button
                  type="button"
                  onClick={openCreateDialog}
                  className="w-full rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors text-left"
                >
                  + Add manual lock for this date
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── CREATE LOCK — Mobile Drawer ─── */}
      {isMobile ? (
        <Drawer open={createDialogOpen} onOpenChange={setCreateDialogOpen} modal={false}>
          <DrawerContent className="max-h-[92vh] rounded-t-3xl" style={{ zIndex: 50 }}>
            <DrawerHeader>
              <DrawerTitle>Create Manual Lock</DrawerTitle>
              <DrawerDescription>
                Block dates for offline bookings, maintenance, or owner stays.
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-2">
              <LockFormFields
                form={lockForm}
                onChange={(patch) => setLockForm((c) => ({ ...c, ...patch }))}
                recurring={recurring}
                onRecurringChange={setRecurring}
                idPrefix="mob-create"
              />
            </div>
            <DrawerFooter className="pt-2">
              <Button variant="outline" size="lg" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button size="lg" onClick={() => void handleCreateLock()} disabled={savingLock}>
                {savingLock ? 'Saving…' : 'Save Lock'}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Manual Lock</DialogTitle>
              <DialogDescription>
                Block dates for offline bookings, maintenance, owner stays, or emergency closures.
              </DialogDescription>
            </DialogHeader>
            <LockFormFields
              form={lockForm}
              onChange={(patch) => setLockForm((c) => ({ ...c, ...patch }))}
              recurring={recurring}
              onRecurringChange={setRecurring}
              idPrefix="desk-create"
            />
            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => void handleCreateLock()} disabled={savingLock}>
                {savingLock ? 'Saving…' : 'Save Lock'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── EVENT DETAIL — Mobile Drawer ─── */}
      {isMobile ? (
        <Drawer open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)} modal={false}>
          <DrawerContent className="max-h-[88vh] rounded-t-3xl" style={{ zIndex: 50 }}>
            <DrawerHeader>
              <DrawerTitle>{selectedEvent?.title}</DrawerTitle>
              <DrawerDescription>
                Review inventory ownership and audit details before making changes.
              </DrawerDescription>
            </DrawerHeader>
            {selectedEvent && (
              <div className="overflow-y-auto px-4 pb-4">
                <EventDetailContent
                  event={selectedEvent}
                  onUnlock={() => {
                    // Close the detail drawer first, then open confirm — so AlertDialog renders on top
                    const ev = selectedEvent;
                    setSelectedEvent(null);
                    setTimeout(() => setUnlockEvent(ev), 150);
                  }}
                />
              </div>
            )}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
              <DialogDescription>
                Review inventory ownership and audit details before making changes.
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <EventDetailContent
                event={selectedEvent}
                onUnlock={() => setUnlockEvent(selectedEvent)}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* ─── MOBILE MULTI-EVENT PICKER — shown when a day has >1 event ─── */}
      <Drawer open={mobileDayEvents.length > 0} onOpenChange={(open) => !open && setMobileDayEvents([])} modal={false}>
        <DrawerContent className="rounded-t-3xl" style={{ zIndex: 50 }}>
          <DrawerHeader>
            <DrawerTitle>Blocked dates on this day</DrawerTitle>
            <DrawerDescription>Tap an entry to view details or remove a lock.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-2">
            {mobileDayEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => {
                  setMobileDayEvents([]);
                  setTimeout(() => setSelectedEvent(event), 100);
                }}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-colors active:opacity-70 ${INVENTORY_SOURCE_META[event.source].badgeClassName}`}
              >
                <p className="text-sm font-semibold">{event.title}</p>
                <p className="mt-0.5 text-xs opacity-75">
                  {dayjs(event.start_date).format('DD MMM')} –{' '}
                  {dayjs(event.end_date).subtract(1, 'day').format('DD MMM YYYY')}
                </p>
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* ─── UNLOCK CONFIRM ─── */}
      <AlertDialog open={!!unlockEvent} onOpenChange={(open) => !open && setUnlockEvent(null)}>
        <AlertDialogContent style={{ zIndex: 9999 }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Manual Lock?</AlertDialogTitle>
            <AlertDialogDescription>
              This only removes the manual lock source. Dates will remain unavailable if another
              inventory source still blocks them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unlocking}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleUnlock()} disabled={unlocking}>
              {unlocking ? 'Removing…' : 'Remove Lock'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── RECURRING EDIT SCOPE DIALOG (shown when editing a recurring event) ─── */}
      <AlertDialog open={recurringEditOpen} onOpenChange={setRecurringEditOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Recurring Lock</AlertDialogTitle>
            <AlertDialogDescription>
              Which occurrences of this recurring block would you like to edit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            {(
              [
                { value: 'current', label: 'This occurrence only' },
                { value: 'following', label: 'This and following occurrences' },
                { value: 'all', label: 'All occurrences' },
              ] as { value: RecurringEditScope; label: string }[]
            ).map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <input
                  type="radio"
                  name="recurringScope"
                  value={opt.value}
                  checked={recurringEditScope === opt.value}
                  onChange={() => setRecurringEditScope(opt.value)}
                  className="accent-primary"
                />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRecurringEditOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setRecurringEditOpen(false)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
