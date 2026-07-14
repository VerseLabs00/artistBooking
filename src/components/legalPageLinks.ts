export type LegalPageSource = "landing" | "artist" | "customer";

export function getLegalPageSource(pathname: string): LegalPageSource {
    if (pathname === "/artistHome") return "artist";
    if (pathname === "/home") return "customer";
    return "landing";
}

export function legalPagePath(path: string, source: LegalPageSource): string {
    return `${path}?from=${source}`;
}
