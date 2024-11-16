import { State, type MiniElement } from "@9elt/miniframe";
import { statusful, watching, watchingPage, type Watching } from "../global";
import { StateRef } from "../lib/states";
import { Card } from "./card";
import { ListFooter } from "./list.footer";
import { ListHeader } from "./list.header";
import { ListPagination } from "./list.pagination";

const statusfulRef = new StateRef(statusful);

const WatchingPagination = State.use({
    watchingPage,
    watching,
}).as((g) =>
    ListPagination(g.watchingPage, g.watching.maxPage, (page) => {
        watchingPage.value = page;
    })
);

export function WatchingList(_watching: Watching): MiniElement {
    statusfulRef.clear();

    return {
        tagName: "div",
        className: "watching-list",
        children: [
            // @ts-ignore
            ListHeader("Your Watchlist", WatchingPagination),
            // @ts-ignore
            {
                tagName: "div",
                className: "card-list",
                children: _watching.data.map((_entry) =>
                    Card(_entry, statusfulRef)
                ),
            },
            // @ts-ignore
            ListFooter(WatchingPagination),
        ],
    };
}
