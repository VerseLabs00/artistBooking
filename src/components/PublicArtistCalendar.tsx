import { useCallback } from "react";
import ArtistCalendar, { useArtistCalendarFetch } from "./ArtistCalendar";
import { getArtistCalendar } from "../customer/services/discoveryService";

interface PublicArtistCalendarProps {
    artistId: string;
}

export function PublicArtistCalendar({ artistId }: PublicArtistCalendarProps) {
    const fetchEntries = useCallback(
        (month: string) => getArtistCalendar(artistId, month),
        [artistId],
    );
    const { entries, loading, handleMonthChange } = useArtistCalendarFetch(fetchEntries);

    return (
        <ArtistCalendar
            entries={entries}
            loading={loading}
            editable={false}
            onMonthChange={handleMonthChange}
        />
    );
}
