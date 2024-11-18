import { State, type MiniElement } from "@9elt/miniframe";
import { statusful, watching, watchingPage, type Watching } from "../global";
import { StateRef } from "../lib/state.ref";
import { Card } from "./card";
import { ListPagination } from "./list.pagination";

const statusfulRef = new StateRef(statusful);

const WatchingPagination = State.use({
    watchingPage,
    watching,
}).as((g) => (
    <ListPagination
        page={g.watchingPage}
        max={g.watching.maxPage}
        onclick={(page) => {
            watchingPage.value = page;
        }}
    />
));

export function WatchingList(_watching: Watching): MiniElement {
    statusfulRef.clear();

    return (
        <div className="watching-list">
            <div className="list-header">
                <h3>Your Watchlist</h3>
                {WatchingPagination}
            </div>
            <div className="card-list">
                {_watching.data.map((_entry) => (
                    <Card entry={_entry} statusful={statusfulRef} />
                ))}
            </div>
            <div className="list-footer">{WatchingPagination}</div>
        </div>
    );
}
