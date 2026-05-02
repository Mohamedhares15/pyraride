"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-lg font-bold text-[#D4AF37]",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-8 w-8 bg-transparent p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                    "text-[#D4AF37]/80 uppercase tracking-wider rounded-md w-9 font-bold text-[0.7rem] pb-2 pt-1",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 flex items-center justify-center relative [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-outside)]:bg-transparent [&:has([aria-selected])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20",
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-normal text-white hover:bg-white/10 hover:text-[#D4AF37] rounded-full transition-all aria-selected:opacity-100"
                ),
                day_range_end: "day-range-end",
                day_selected:
                    "!bg-[#D4AF37] !text-black hover:!bg-[#D4AF37] hover:!text-black focus:!bg-[#D4AF37] focus:!text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]",
                day_today: "bg-white/5 text-[#D4AF37] border border-[#D4AF37]/30",
                day_outside:
                    "day-outside text-white/30 opacity-50 aria-selected:bg-transparent aria-selected:text-white/30 aria-selected:opacity-30",
                day_disabled: "text-white/20 opacity-30 cursor-not-allowed line-through",
                day_range_middle:
                    "aria-selected:bg-transparent aria-selected:text-[#D4AF37]",
                day_hidden: "invisible",
                ...classNames,
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
