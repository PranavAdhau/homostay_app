import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { CalendarDays, Search, Users, BedDouble, X } from "lucide-react";
import SharedCalendar from "./SharedCalendar";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  formatSearchDate,
  GUEST_OPTIONS,
  ROOM_OPTIONS,
  type SearchFilters,
  type SearchValidation,
} from "../lib/searchFilters";
import { cn } from "./ui/utils";

type MobileFilterDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: SearchFilters;
  validation: SearchValidation;
  onCheckInChange: (value: SearchFilters["checkIn"]) => void;
  onCheckOutChange: (value: SearchFilters["checkOut"]) => void;
  onGuestsChange: (value: string) => void;
  onRoomsChange: (value: string) => void;
  onClear: () => void;
  onSearch: () => void;
};

function MobileFieldShell({
  label,
  invalid = false,
  children,
}: {
  label: string;
  invalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#73867A]">
        {label}
      </label>
      <div
        className={cn(
          "rounded-xl border border-[#A1B2A4] bg-[#F8F8F8] transition-colors",
          invalid && "border-[#D07A6C] bg-[#FFF1EF]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default function MobileFilterDrawer({
  open,
  onOpenChange,
  filters,
  validation,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onRoomsChange,
  onClear,
  onSearch,
}: MobileFilterDrawerProps) {
  const initialFocusRef = useRef<HTMLButtonElement | null>(null);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setCheckInOpen(false);
      setCheckOutOpen(false);
      return;
    }

    const timer = window.setTimeout(() => {
      initialFocusRef.current?.focus();
    }, 50);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setCheckInOpen(false);
      setCheckOutOpen(false);
    }
  }, [open]);

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="bottom"
      modal
      dismissible
      autoFocus
    >
      <DrawerContent
        role="dialog"
        aria-modal="true"
        className="z-[1101] border-0 bg-white data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:h-[100dvh] data-[vaul-drawer-direction=bottom]:max-h-[100dvh] data-[vaul-drawer-direction=bottom]:rounded-none"
      >
        <DrawerHeader className="border-b border-[#E5ECE6] px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <DrawerTitle className="text-lg font-semibold text-[#1F3432]">
              Search your house
            </DrawerTitle>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClear}
                className="text-sm font-medium text-[#73867A] underline-offset-4 transition hover:text-[#1F8A84] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A84]/30"
              >
                Clear
              </button>
              <button
                type="button"
                aria-label="Close search filters"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#1F8A84] transition hover:bg-[#F1F5F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A84]/30"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex flex-1 flex-col overflow-y-auto px-5 py-5">
          <div className="space-y-4">
            <MobileFieldShell label="Check-in" invalid={validation.invalidFields.checkIn}>
              <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                <PopoverTrigger asChild>
                  <button
                    ref={initialFocusRef}
                    type="button"
                    aria-label="Choose check-in date"
                    aria-invalid={validation.invalidFields.checkIn}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-4 text-left text-[#1F3432] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A84]/30"
                  >
                    <CalendarDays className="h-4 w-4 shrink-0 text-[#1F8A84]" />
                    <span className={cn("text-sm font-medium", !filters.checkIn && "text-[#7C8B85] font-normal")}>
                      {formatSearchDate(filters.checkIn) || "Select check-in date"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="center"
                  sideOffset={10}
                  className="z-[1102] w-auto border-none bg-transparent p-0 shadow-none"
                >
                  <SharedCalendar
                    value={filters.checkIn}
                    onChange={onCheckInChange}
                    onClose={() => setCheckInOpen(false)}
                    minDate={dayjs()}
                    accentColor="#1F8A84"
                    hoverAccentColor="#264948"
                    todayBorderColor="#1F8A84"
                  />
                </PopoverContent>
              </Popover>
            </MobileFieldShell>

            <MobileFieldShell label="Check-out" invalid={validation.invalidFields.checkOut}>
              <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Choose check-out date"
                    aria-invalid={validation.invalidFields.checkOut}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-4 text-left text-[#1F3432] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A84]/30"
                  >
                    <CalendarDays className="h-4 w-4 shrink-0 text-[#1F8A84]" />
                    <span className={cn("text-sm font-medium", !filters.checkOut && "text-[#7C8B85] font-normal")}>
                      {formatSearchDate(filters.checkOut) || "Select check-out date"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="center"
                  sideOffset={10}
                  className="z-[1102] w-auto border-none bg-transparent p-0 shadow-none"
                >
                  <SharedCalendar
                    value={filters.checkOut}
                    onChange={onCheckOutChange}
                    onClose={() => setCheckOutOpen(false)}
                    minDate={filters.checkIn ? filters.checkIn.add(1, "day") : dayjs().add(1, "day")}
                    accentColor="#1F8A84"
                    hoverAccentColor="#264948"
                    todayBorderColor="#1F8A84"
                  />
                </PopoverContent>
              </Popover>
            </MobileFieldShell>

            <MobileFieldShell label="Guests">
              <Select value={filters.guests} onValueChange={onGuestsChange}>
                <SelectTrigger
                  aria-label="Choose number of guests"
                  className="h-14 w-full border-0 bg-transparent px-4 text-left shadow-none hover:bg-white focus-visible:ring-2 focus-visible:ring-[#1F8A84]/30"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 shrink-0 text-[#1F8A84]" />
                    <SelectValue placeholder="Select guests" />
                  </div>
                </SelectTrigger>
                <SelectContent className="z-[1102] border-[#A1B2A4]">
                  {GUEST_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option} {option === "1" ? "Guest" : "Guests"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </MobileFieldShell>

            <MobileFieldShell label="Rooms">
              <Select value={filters.rooms} onValueChange={onRoomsChange}>
                <SelectTrigger
                  aria-label="Choose number of rooms"
                  className="h-14 w-full border-0 bg-transparent px-4 text-left shadow-none hover:bg-white focus-visible:ring-2 focus-visible:ring-[#1F8A84]/30"
                >
                  <div className="flex items-center gap-3">
                    <BedDouble className="h-4 w-4 shrink-0 text-[#1F8A84]" />
                    <SelectValue placeholder="Select rooms" />
                  </div>
                </SelectTrigger>
                <SelectContent className="z-[1102] border-[#A1B2A4]">
                  {ROOM_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option} {option === "1" ? "Room" : "Rooms"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </MobileFieldShell>

            {validation.helperText ? (
              <p className="text-sm font-medium text-[#A65B4A]">{validation.helperText}</p>
            ) : null}
          </div>

          <div className="mt-auto pt-8">
            <Button
              type="button"
              disabled={!validation.canSearch}
              onClick={onSearch}
              className="h-12 w-full rounded-xl bg-[#1F8A84] text-white hover:bg-[#264948] disabled:bg-[#A1B2A4]"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
