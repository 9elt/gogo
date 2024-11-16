import { State, type MiniElement } from "@9elt/miniframe";
import { statusful, watching, watchingPage, type Watching } from "../global";
import { StateRef } from "../lib/states";
import { Card } from "./card";
import { Pagination } from "./pagination";

const WatchingPagination = State.use({ watchingPage, watching }).as((g) =>
    Pagination(
        g.watchingPage,
        g.watching.maxPage,
        (page) => { watchingPage.value = page; }
    )
);

const statusfulRef = new StateRef(statusful);

export function Watching(_watching: Watching): MiniElement {
    statusfulRef.clear();

    return {
        tagName: "div",
        children: [
            // @ts-ignore
            {
                tagName: "div",
                className: "section-header",
                children: [
                    {
                        tagName: "h3",
                        children: ["Watchlist"],
                    },
                    WatchingPagination,
                ],
            },
            // @ts-ignore
            {
                tagName: "div",
                className: "watching-list",
                children: _watching.data.map((_entry) => Card(_entry, statusfulRef)),
            },
            // @ts-ignore
            {
                tagName: "div",
                className: "section-footer",
                children: [
                    WatchingPagination,
                ],
            },
        ],
    };
}
