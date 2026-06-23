import { useCallback } from "react";
import ArtistCalendar, { useArtistCalendarFetch } from "./ArtistCalendar";
import { addCalendarEntry, deleteCalendarEntry, getMyCalendar } from "../services/calendarService";

export default function ArtistOwnCalendar() {
    const fetchEntries = useCallback((month: string) => getMyCalendar(month), []);
    const { entries, loading, handleMonthChange, refresh } = useArtistCalendarFetch(fetchEntries);

    const handleAdd = async (payload: { date: string; title: string; description?: string }) => {
        try {
            await addCalendarEntry(payload);
            await refresh();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
            const errors = axiosErr.response?.data?.errors;
            const message = errors
                ? Object.values(errors).flat().join(" ")
                : axiosErr.response?.data?.message || "Failed to add calendar entry.";
            throw new Error(message);
        }
    };

    const handleDelete = async (id: string) => {
        await deleteCalendarEntry(id);
        await refresh();
    };

    return (
        <ArtistCalendar
            entries={entries}
            loading={loading}
            editable
            onMonthChange={handleMonthChange}
            onAddEntry={handleAdd}
            onDeleteEntry={handleDelete}
        />
    );
}
