import api from "../artist/api/axios";
import type { CalendarEntry } from "../components/ArtistCalendar";

export const getMyCalendar = async (month: string): Promise<CalendarEntry[]> => {
    const { data } = await api.get("/profile/calendar", { params: { month } });
    return data.entries ?? [];
};

export const addCalendarEntry = async (payload: {
    date: string;
    title: string;
    description?: string;
}): Promise<CalendarEntry> => {
    const { data } = await api.post("/profile/calendar", payload);
    return data.entry;
};

export const deleteCalendarEntry = async (id: string): Promise<void> => {
    await api.delete(`/profile/calendar/${id}`);
};
