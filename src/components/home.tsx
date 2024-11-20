import { ReleasesList, ReleasesLoading } from "../components/releases.list";
import { releases, watching } from "../global";
import { WatchingList } from "./watching.list";

export const Home = (<>
    {watching.as(
        (watching) => watching.data.length > 0 && WatchingList(watching)
    )}
    {releases.as((_releases) =>
        _releases ? ReleasesList(_releases) : ReleasesLoading
    )}
</>);
