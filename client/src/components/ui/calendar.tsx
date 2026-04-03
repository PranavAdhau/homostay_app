import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, setMonth, setYear } from "date-fns";

import { cn } from "./utils";
import { buttonVariants } from "./button";

type NavMode = "days" | "months" | "years";

interface CustomCaptionLabelProps {
  displayMonth: Date;
  navMode: NavMode;
  setNavMode: (mode: NavMode) => void;
}

function CustomCaptionLabel({
  displayMonth,
  navMode,
  setNavMode,
}: CustomCaptionLabelProps) {
  return (
    <div className="flex items-center justify-center pointer-events-auto">
      <div className="flex space-x-2 font-semibold text-sm">
        <button
          type="button"
          onClick={() => setNavMode(navMode === "months" ? "days" : "months")}
          className="hover:text-[#1F8A84] transition-colors"
        >
          {format(displayMonth, "MMMM")}
        </button>
        <button
          type="button"
          onClick={() => setNavMode(navMode === "years" ? "days" : "years")}
          className="hover:text-[#1F8A84] transition-colors"
        >
          {format(displayMonth, "yyyy")}
        </button>
      </div>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const [navMode, setNavMode] = React.useState<NavMode>("days");

  // Track the visible month so month/year selectors can update it.
  const initialMonth =
    (props as any).month || (props as any).defaultMonth || new Date();
  const [currentMonth, setCurrentMonth] = React.useState<Date>(initialMonth);

  const rootClassName = cn(
    "p-3 bg-white rdp-rounded-md",
    navMode !== "days" && "rdp-nav-list",
    className,
  );

  return (
    <div className="relative">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={rootClassName}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        classNames={{
          months: "flex flex-col sm:flex-row gap-2",
          month: "flex flex-col gap-4",
          caption: "flex justify-center pt-1 items-center w-full",
          caption_label: "text-sm font-medium hidden sm:block",
          caption_dropdowns: "flex justify-center gap-2 font-medium text-sm",
          dropdown:
            "rdp-dropdown bg-background border border-border rounded-md px-1 py-0.5",
          dropdown_icon: "hidden",
          vhidden: "sr-only",
          nav: "flex items-center gap-1",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-x-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
            props.mode === "range"
              ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
              : "[&:has([aria-selected])]:rounded-md",
          ),
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "size-8 p-0 font-normal aria-selected:opacity-100",
          ),
          day_range_start:
            "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
          day_range_end:
            "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground aria-selected:text-muted-foreground",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          CaptionLabel: ({ displayMonth }: { displayMonth: Date }) => (
            <CustomCaptionLabel
              displayMonth={displayMonth}
              navMode={navMode}
              setNavMode={setNavMode}
            />
          ),
          IconLeft: ({ className, ...iconProps }) => (
            <ChevronLeft className={cn("size-4", className)} {...iconProps} />
          ),
          IconRight: ({ className, ...iconProps }) => (
            <ChevronRight className={cn("size-4", className)} {...iconProps} />
          ),
        }}
        {...props}
      />

      {navMode !== "days" && (
        <div className="px-3 pb-3 pt-0">
          {navMode === "months" ? (
            <div className="mt-2 max-h-60 overflow-y-auto rounded-md border bg-white shadow-md">
              {Array.from({ length: 12 }).map((_, i) => {
                const monthDate = setMonth(currentMonth, i);
                const monthLabel = format(monthDate, "MMMM");
                const isActive = currentMonth.getMonth() === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCurrentMonth(monthDate);
                      setNavMode("days");
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-[#1F8A84] text-white"
                        : "text-[#4F5F5B] hover:bg-[#F8F8F8]",
                    )}
                  >
                    {monthLabel}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-2 max-h-60 overflow-y-auto rounded-md border bg-white shadow-md">
              {Array.from({ length: 21 }).map((_, i) => {
                const currentYear = new Date().getFullYear();
                const y = currentYear + i;
                const yearDate = setYear(currentMonth, y);
                const isActive = currentMonth.getFullYear() === y;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setCurrentMonth(yearDate);
                      setNavMode("days");
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#1F8A84] text-white"
                        : "text-[#4F5F5B] hover:bg-[#F8F8F8]",
                    )}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { Calendar };
