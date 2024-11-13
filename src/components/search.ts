import type { MiniElement } from "@9elt/miniframe";
import { results, search, urlTitle } from "../global";

export const Search: MiniElement = {
    tagName: "div",
    children: [
        // @ts-ignore
        {
            tagName: "input",
            type: "search",
            placeholder: "search",
            value: search,
            oninput: debounce((e: any) => {
                search.value = e.target.value.trim();
            }, 1_000),
        },
        // @ts-ignore
        {
            tagName: "div",
            style: { backgroundColor: "#6662" },
            children: results.as((results) => results && (
                results.length === 0 ? [
                    {
                        tagName: "p",
                        children: ["no results"],
                    }
                ] : results.map((result) => ({
                    tagName: "div",
                    children: [
                        {
                            tagName: "p",
                            children: [result.title],
                        },
                        {
                            tagName: "button",
                            children: ["watch"],
                            onclick: () => {
                                urlTitle.value = result.urlTitle;
                                search.value = null;
                            },
                        },
                    ]
                }))
            )),
        }
    ],
};

function debounce<F extends (...args: any[]) => any>(f: F, ms: number): F {
    let timeout: number | null = null;

    return function (...args: any[]) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            f(...args);
            timeout = null;
        }, ms);
    } as unknown as F;
}
