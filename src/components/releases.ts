import { type MiniElement } from "@9elt/miniframe";
import { Status, episodeNumber, page, statusful, urlTitle } from "../global";
import type { Release } from "../lib/gogo";

const Pagination: MiniElement = {
    tagName: "div",
    children: [
        // @ts-ignore
        {
            tagName: "button",
            children: ["<"],
            onclick: () => {
                page.value && page.value--;
            },
        },
        // @ts-ignore
        {
            tagName: "span",
            children: [" ", page, " "],
        },
        // @ts-ignore
        {
            tagName: "button",
            children: [">"],
            onclick: () => {
                page.value !== null && page.value++;
            },
        },
    ],
};

export function Releases(_releases: Release[]): MiniElement {
    return {
        tagName: "div",
        children: [
            // @ts-ignore
            Pagination,
            // @ts-ignore
            {
                tagName: "div",
                children: _releases.map((rel) => {
                    const status = statusful.as((statusful) =>
                        statusful.find((s) => s.urlTitle === rel.urlTitle)?.status
                    );

                    return {
                        tagName: "div",
                        style: {
                            display: "flex",
                            alignItems: "center",
                            border: status.as((status) =>
                                status === Status.Watching ? "2px solid #17a" :
                                    "none"
                            ),
                        },
                        children: [
                            {
                                tagName: "img",
                                style: {
                                    width: "100px",
                                },
                                src: rel.image,
                            },
                            {
                                tagName: "p",
                                style: {
                                    cursor: "pointer",
                                },
                                children: [rel.title, " ", {
                                    tagName: "small",
                                    children: ["ep ", rel.episode],
                                }],
                                onclick: () => {
                                    urlTitle.value = rel.urlTitle;
                                    episodeNumber.value = rel.episode;
                                },
                            },
                        ],
                    };
                }),
            },
            // @ts-ignore
            Pagination,
        ],
    };
}
