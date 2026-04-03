import { useState } from "react";
import dayjs from "dayjs";
import { CalendarDays, Search, Users, BedDouble } from "lucide-react";
import SharedCalendar from "./SharedCalendar";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "./ui/select";
import {
  formatSearchDate,
  GUEST_OPTIONS,
  ROOM_OPTIONS,
  type SearchFilters,
  type SearchValidation,
} from "../lib/searchFilters";
import { cn } from "./ui/utils";

type DesktopSearchBarProps = {
  filters: SearchFilters;
  validation: SearchValidation;
  onCheckInChange: (value: SearchFilters["checkIn"]) => void;
  onCheckOutChange: (value: SearchFilters["checkOut"]) => void;
  onGuestsChange: (value: string) => void;
  onRoomsChange: (value: string) => void;
  onSearch: () => void;
};

function DesktopSearchField({
  label,
  value,
  placeholder,
  icon: Icon,
  invalid = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon: typeof CalendarDays;
  invalid?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-full px-4 py-2 transition-colors",
        invalid && "bg-[#FFF1EF] ring-1 ring-[#D07A6C]",
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-[#1F8A84]" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#73867A]">
          {label}
        </p>
        <div className="truncate text-sm font-medium text-[#1F3432]">
          {value || (
            <span className="font-normal text-[#7C8B85]">{placeholder}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DesktopSearchBar({
  filters,
  validation,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onRoomsChange,
  onSearch,
}: DesktopSearchBarProps) {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const desktopFieldClassName =
    "min-w-0 w-full rounded-full text-left outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#1F8A84]/30";

  return (
    <div className="relative w-full min-w-0 max-w-full">
      <div className="flex w-full min-w-0 max-w-full items-center gap-1 rounded-full border border-[#A1B2A4] bg-[#F8F8F8] p-1 shadow-sm">
        <div className="min-w-0 flex-[1.2_1_0%]">
          <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Choose check-in date"
              aria-invalid={validation.invalidFields.checkIn}
              className={desktopFieldClassName}
            >
              <DesktopSearchField
                label="Check-in"
                value={formatSearchDate(filters.checkIn)}
                placeholder="Select date"
                icon={CalendarDays}
                invalid={validation.invalidFields.checkIn}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={10}
            className="z-[1100] w-auto border-none bg-transparent p-0 shadow-none"
          >
            <SharedCalendar
              value={filters.checkIn}
              onChange={(value) => onCheckInChange(value)}
              onClose={() => setCheckInOpen(false)}
              minDate={dayjs()}
              accentColor="#1F8A84"
              hoverAccentColor="#264948"
              todayBorderColor="#1F8A84"
            />
          </PopoverContent>
          </Popover>
        </div>

        <div className="h-8 w-px shrink-0 bg-[#D4DDD5]" />

        <div className="min-w-0 flex-[1.2_1_0%]">
          <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Choose check-out date"
              aria-invalid={validation.invalidFields.checkOut}
              className={desktopFieldClassName}
            >
              <DesktopSearchField
                label="Check-out"
                value={formatSearchDate(filters.checkOut)}
                placeholder="Select date"
                icon={CalendarDays}
                invalid={validation.invalidFields.checkOut}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={10}
            className="z-[1100] w-auto border-none bg-transparent p-0 shadow-none"
          >
            <SharedCalendar
              value={filters.checkOut}
              onChange={(value) => onCheckOutChange(value)}
              onClose={() => setCheckOutOpen(false)}
              minDate={filters.checkIn ? filters.checkIn.add(1, "day") : dayjs().add(1, "day")}
              accentColor="#1F8A84"
              hoverAccentColor="#264948"
              todayBorderColor="#1F8A84"
            />
          </PopoverContent>
          </Popover>
        </div>

        <div className="h-8 w-px shrink-0 bg-[#D4DDD5]" />

        <div className="min-w-0 flex-[0.9_1_0%]">
          <Select value={filters.guests} onValueChange={onGuestsChange}>
            <SelectTrigger
              aria-label="Choose number of guests"
              className="h-auto min-w-0 w-full rounded-full border-0 bg-transparent px-4 py-2 text-left shadow-none hover:bg-white focus-visible:ring-2 focus-visible:ring-[#1F8A84]/30"
            >
              <DesktopSearchField
                label="Guests"
                value={filters.guests ? `${filters.guests} Guests` : ""}
                placeholder="Guests"
                icon={Users}
              />
            </SelectTrigger>
            <SelectContent className="z-[1100] border-[#A1B2A4]">
              {GUEST_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option} {option === "1" ? "Guest" : "Guests"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-8 w-px shrink-0 bg-[#D4DDD5]" />

        <div className="min-w-0 flex-[0.9_1_0%]">
          <Select value={filters.rooms} onValueChange={onRoomsChange}>
            <SelectTrigger
              aria-label="Choose number of rooms"
              className="h-auto min-w-0 w-full rounded-full border-0 bg-transparent px-4 py-2 text-left shadow-none hover:bg-white focus-visible:ring-2 focus-visible:ring-[#1F8A84]/30"
            >
              <DesktopSearchField
                label="Rooms"
                value={filters.rooms ? `${filters.rooms} Rooms` : ""}
                placeholder="Rooms"
                icon={BedDouble}
              />
            </SelectTrigger>
            <SelectContent className="z-[1100] border-[#A1B2A4]">
              {ROOM_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option} {option === "1" ? "Room" : "Rooms"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          size="icon"
          aria-label="Search stays"
          disabled={!validation.canSearch}
          onClick={onSearch}
          className="size-11 rounded-full bg-[#1F8A84] text-white hover:bg-[#264948] disabled:bg-[#A1B2A4]"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {validation.helperText ? (
        <p className="absolute left-5 top-full mt-1 text-[11px] font-medium text-[#A65B4A]">
          {validation.helperText}
        </p>
      ) : null}
    </div>
  );
}
