import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Plus, Trash2, X } from "lucide-react";

export interface CalendarEntry {
    id: string;
    date: string;
    title: string;
    description?: string | null;
    source: "booking" | "manual";
    status?: string;
    editable?: boolean;
    event_type?: string;
    venue?: string;
    customer_name?: string;
}

interface ArtistCalendarProps {
    entries: CalendarEntry[];
    loading?: boolean;
    editable?: boolean;
    onMonthChange?: (month: string) => void;
    onAddEntry?: (payload: { date: string; title: string; description?: string }) => Promise<void>;
    onDeleteEntry?: (id: string) => Promise<void>;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function parseDateKey(key: string): Date {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
}

export default function ArtistCalendar({
    entries,
    loading = false,
    editable = false,
    onMonthChange,
    onAddEntry,
    onDeleteEntry,
}: ArtistCalendarProps) {
    const [viewDate, setViewDate] = useState(() => new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formTitle, setFormTitle] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const monthKey = toMonthKey(viewDate);

    useEffect(() => {
        onMonthChange?.(monthKey);
    }, [monthKey, onMonthChange]);

    const entriesByDate = useMemo(() => {
        const map = new Map<string, CalendarEntry[]>();
        for (const entry of entries) {
            const list = map.get(entry.date) ?? [];
            list.push(entry);
            map.set(entry.date, list);
        }
        return map;
    }, [entries]);

    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startOffset = firstDay.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const cells: Array<{ date: string | null; day: number | null }> = [];
        for (let i = 0; i < startOffset; i++) cells.push({ date: null, day: null });
        for (let d = 1; d <= daysInMonth; d++) {
            const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            cells.push({ date, day: d });
        }
        return cells;
    }, [viewDate]);

    const selectedEntries = selectedDate ? entriesByDate.get(selectedDate) ?? [] : [];

    const goMonth = (delta: number) => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
        setSelectedDate(null);
        setShowAddForm(false);
    };

    const handleAdd = async () => {
        if (!selectedDate || !onAddEntry) return;
        if (!formTitle.trim()) {
            setFormError("Please enter a title for this day.");
            return;
        }
        setSaving(true);
        setFormError("");
        try {
            await onAddEntry({
                date: selectedDate,
                title: formTitle.trim(),
                description: formDescription.trim() || undefined,
            });
            setFormTitle("");
            setFormDescription("");
            setShowAddForm(false);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to add calendar entry.";
            setFormError(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!onDeleteEntry) return;
        setSaving(true);
        try {
            await onDeleteEntry(id);
        } finally {
            setSaving(false);
        }
    };

    const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const todayKey = toMonthKey(new Date()) === monthKey
        ? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`
        : null;

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CalendarDays size={18} className="text-[#FF2B6B]" />
                    <h3 className="text-[18px] font-semibold text-gray-800">Availability</h3>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => goMonth(-1)}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        aria-label="Previous month"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-medium min-w-[120px] text-center">{monthLabel}</span>
                    <button
                        type="button"
                        onClick={() => goMonth(1)}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        aria-label="Next month"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="text-sm text-gray-400 text-center py-8">Loading calendar...</p>
            ) : (
                <>
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {WEEKDAYS.map(day => (
                            <div key={day} className="text-[10px] font-semibold text-gray-400 text-center py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((cell, idx) => {
                            if (!cell.date || cell.day === null) {
                                return <div key={`empty-${idx}`} className="aspect-square" />;
                            }

                            const dayEntries = entriesByDate.get(cell.date) ?? [];
                            const isBooked = dayEntries.length > 0;
                            const isSelected = selectedDate === cell.date;
                            const isToday = todayKey === cell.date;

                            return (
                                <button
                                    key={cell.date}
                                    type="button"
                                    onClick={() => {
                                        setSelectedDate(cell.date);
                                        setShowAddForm(false);
                                        setFormError("");
                                    }}
                                    className={`aspect-square rounded-lg text-xs font-medium relative transition
                                        ${isSelected ? "bg-[#FF2B6B] text-white" : isBooked ? "bg-red-50 text-red-700 hover:bg-red-100" : "hover:bg-gray-50 text-gray-700"}
                                        ${isToday && !isSelected ? "ring-2 ring-[#FF2B6B]/40" : ""}`}
                                >
                                    {cell.day}
                                    {isBooked && (
                                        <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-[#FF2B6B]"}`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 min-h-[80px]">
                        {!selectedDate ? (
                            <p className="text-xs text-gray-400 text-center py-2">Select a day to view booking details</p>
                        ) : (
                            <div>
                                <p className="text-xs font-semibold text-gray-500 mb-2">
                                    {parseDateKey(selectedDate).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>

                                {selectedEntries.length === 0 ? (
                                    <p className="text-xs text-gray-400">No bookings on this day — available.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedEntries.map(entry => (
                                            <div key={entry.id} className="bg-gray-50 rounded-xl p-3 text-xs">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{entry.title}</p>
                                                        {entry.description && (
                                                            <p className="text-gray-500 mt-1">{entry.description}</p>
                                                        )}
                                                        {entry.customer_name && (
                                                            <p className="text-gray-400 mt-1">Client: {entry.customer_name}</p>
                                                        )}
                                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                                                            ${entry.source === "booking" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                                                            {entry.source === "booking" ? "Platform booking" : "Manual entry"}
                                                        </span>
                                                    </div>
                                                    {editable && entry.editable && onDeleteEntry && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(entry.id)}
                                                            disabled={saving}
                                                            className="text-red-400 hover:text-red-600 shrink-0"
                                                            aria-label="Remove entry"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {editable && onAddEntry && (
                                    <div className="mt-3">
                                        {!showAddForm ? (
                                            <button
                                                type="button"
                                                onClick={() => setShowAddForm(true)}
                                                className="flex items-center gap-1 text-xs font-medium text-[#FF2B6B] hover:underline"
                                            >
                                                <Plus size={14} /> Mark day as booked
                                            </button>
                                        ) : (
                                            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-semibold text-gray-700">Add booking note</p>
                                                    <button type="button" onClick={() => setShowAddForm(false)} className="text-gray-400">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                                <input
                                                    value={formTitle}
                                                    onChange={e => setFormTitle(e.target.value)}
                                                    placeholder="e.g. Private wedding event"
                                                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#FF2B6B]"
                                                />
                                                <textarea
                                                    value={formDescription}
                                                    onChange={e => setFormDescription(e.target.value)}
                                                    placeholder="Optional details (venue, time, etc.)"
                                                    rows={2}
                                                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#FF2B6B] resize-none"
                                                />
                                                {formError && <p className="text-[11px] text-red-500">{formError}</p>}
                                                <button
                                                    type="button"
                                                    onClick={handleAdd}
                                                    disabled={saving}
                                                    className="w-full bg-[#FF2B6B] text-white text-xs py-2 rounded-lg font-medium disabled:opacity-60"
                                                >
                                                    {saving ? "Saving..." : "Save entry"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export function useArtistCalendarFetch(
    fetchEntries: (month: string) => Promise<CalendarEntry[]>,
) {
    const [entries, setEntries] = useState<CalendarEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(() => toMonthKey(new Date()));

    const load = useCallback(async (m: string) => {
        setLoading(true);
        try {
            const data = await fetchEntries(m);
            setEntries(data);
        } catch {
            setEntries([]);
        } finally {
            setLoading(false);
        }
    }, [fetchEntries]);

    useEffect(() => {
        load(month);
    }, [month, load]);

    const handleMonthChange = useCallback((m: string) => {
        setMonth(m);
    }, []);

    const refresh = useCallback(() => load(month), [load, month]);

    return { entries, loading, handleMonthChange, refresh, setEntries };
}
