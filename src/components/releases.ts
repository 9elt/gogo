import { type MiniElement } from "@9elt/miniframe";
import { page, urlTitle } from "../global";
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

export function Releases(_releases: Release[] | null): MiniElement {
    return {
        tagName: "div",
        children: [
            Pagination,
            {
                tagName: "div",
                children: (_releases || []).map((rel) => ({
                    tagName: "div",
                    children: [
                        {
                            tagName: "p",
                            children: [rel.title, " ", {
                                tagName: "small",
                                children: ["ep ", rel.episode],
                            }],
                        },
                        {
                            tagName: "button",
                            children: ["watch"],
                            onclick: () => {
                                urlTitle.value = rel.urlTitle;
                            },
                        },
                    ],
                })),
            },
            Pagination,
        ],
    };
}
