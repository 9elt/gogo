import { type MiniElement } from "@9elt/miniframe";
import { releasesPage, statusful } from "../global";
import type { Release } from "../lib/gogo";
import { StateRef } from "../lib/states";
import { randomDelay } from "../util";
import { Card } from "./card";
import { ListFooter } from "./list.footer";
import { ListHeader } from "./list.header";
import { ListPagination } from "./list.pagination";

const statusfulRef = new StateRef(statusful);

const ReleasesPagination = releasesPage.as((_page) =>
    ListPagination(_page, 99, (page) => {
        releasesPage.value = page;
    })
);

export function ReleasesList(
    _releases: Release[]
): MiniElement {
    statusfulRef.clear();

    return {
        tagName: "div",
        className: "releases-list",
        children: [
            // @ts-ignore
            ListHeader("Recent Releases", ReleasesPagination),
            // @ts-ignore
            {
                tagName: "div",
                className: "card-list",
                children: _releases.map((_entry) =>
                    Card(_entry, statusfulRef)
                ),
            },
            // @ts-ignore
            ListFooter(ReleasesPagination),
        ],
    };
}

const LoadingPagination = ListPagination(1, 6, () => {});

export const ReleasesLoading: MiniElement = {
    tagName: "div",
    className: "loading",
    children: [
        // @ts-ignore
        ListHeader("Recent Releases", LoadingPagination),
        // @ts-ignore
        {
            tagName: "div",
            className: "card-list",
            children: new Array(8).fill(0).map(() => ({
                // @ts-ignore
                tagName: "div",
                className: "card loading",
                style: {
                    animationDelay: randomDelay(),
                },
            })),
        },
        // @ts-ignore
        ListFooter(LoadingPagination),
    ],
};
