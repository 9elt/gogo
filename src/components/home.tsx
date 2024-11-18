import type { MiniElement } from "@9elt/miniframe";
import { ReleasesList, ReleasesLoading } from "../components/releases.list";
import { releases, watching } from "../global";
import { WatchingList } from "./watching.list";

export const Home: MiniElement[] = [
    // @ts-ignore
    watching.as(
        (watching) => watching.data.length > 0 && WatchingList(watching)
    ),
    // @ts-ignore
    releases.as((_releases) =>
        _releases ? ReleasesList(_releases) : ReleasesLoading
    ),
];
