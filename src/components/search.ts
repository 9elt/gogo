import type { MiniElement } from "@9elt/miniframe";
import { Status, episodeNumber, results, search, statusful, urlTitle } from "../global";

export const Search: MiniElement = {
    tagName: "div",
    children: [
        // @ts-ignore
        {
            tagName: "input",
            type: "search",
            placeholder: "search",
            value: search.as((search) => search || ""),
            oninput: debounce((e: any) => {
                search.value = e.target.value.trim() || null;
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
                ] : results.map((result) => {
                    const status = statusful.as((statusful) =>
                        statusful.find((s) => s.urlTitle === result.urlTitle)?.status
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
                                src: result.image,
                            },
                            {
                                tagName: "p",
                                style: {
                                    cursor: "pointer",
                                },
                                children: [result.title],
                                onclick: () => {
                                    episodeNumber.value = null;
                                    urlTitle.value = result.urlTitle;
                                    search.value = null;
                                },
                            },
                        ]
                    };
                })
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
