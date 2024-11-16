import { type MiniElement } from "@9elt/miniframe";
import { releasesPage, statusful } from "../global";
import type { Release } from "../lib/gogo";
import { StateRef } from "../lib/states";
import { Card } from "./card";
import { Pagination } from "./pagination";
import { randomDelay } from "../util";

const ReleasesPagination = releasesPage.as((_page) =>
    Pagination(_page, 99, (page) => { releasesPage.value = page; })
);

const statusfulRef = new StateRef(statusful);

export function Releases(_releases: Release[]): MiniElement {
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
                        children: ["Recent Releases"],
                    },
                    ReleasesPagination,
                ],
            },
            // @ts-ignore
            {
                tagName: "div",
                className: "releases-list",
                children: _releases.map((_entry) => Card(_entry, statusfulRef)),
            },
            // @ts-ignore
            {
                tagName: "div",
                className: "section-footer",
                children: [
                    ReleasesPagination,
                ],
            },
        ],
    };
}

const LoadingPagination = Pagination(1, 6, () => { });

export const ReleasesLoading: MiniElement = {
    tagName: "div",
    className: "loading",
    children: [
        // @ts-ignore
        {
            tagName: "div",
            className: "section-header",
            children: [
                {
                    tagName: "h3",
                    children: ["Recent Releases"],
                },
                LoadingPagination,
            ],
        },
        ,
        // @ts-ignore
        {
            tagName: "div",
            className: "releases-list",
            children: new Array(8).fill(0).map(() => ({
                // @ts-ignore
                tagName: "div",
                className: "card loading",
                style: {
                    animationDelay: randomDelay(),
                }
            })),
        },
        // @ts-ignore
        {
            tagName: "div",
            className: "section-footer",
            children: [
                LoadingPagination,
            ],
        },
    ],
};
