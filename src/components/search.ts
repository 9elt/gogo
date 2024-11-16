import { createNode } from "@9elt/miniframe";
import { Status, episodeNumber, results, search, statusful, urlTitle } from "../global";
import { prefetcher } from "../lib/cache";
import { getDetails, getDetailsCacheId, type SearchResult } from "../lib/gogo";
import { StateRef } from "../lib/states";
import type { Statusful } from "../lib/statusful";
import { isMobile } from "../util";

const statusfulRef = new StateRef(statusful);

const SearchInput = createNode({
    tagName: "input",
    type: "search",
    placeholder: isMobile ? "Search" : "Type '/' to search",
    value: search.as((search) => search || ""),
    oninput: debounce((e: any) => {
        search.value = e.target.value.trim() || null;
    }, 1_000),
});

window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (
        document.activeElement !== SearchInput &&
        document.activeElement?.tagName !== "INPUT" &&
        e.key === "/"
    ) {
        e.preventDefault();
        SearchInput.focus();
    }
});

export const Search = createNode({
    // @ts-ignore
    tagName: "div",
    className: "search-container",
    children: [
        {
            tagName: "div",
            className: "input-container",
            children: [
                SearchInput,
                search.as((_search) => _search !== null && {
                    tagName: "span",
                    className: "input-adornment",
                    children: ["✕"],
                    onclick: () => {
                        if (search.value !== null) {
                            search.value = null;
                        }
                    },
                }),
            ],
        },
        // @ts-ignore
        results.as((results) => {
            statusfulRef.clear();

            return results && {
                tagName: "div",
                tabIndex: -1,
                className: "search-results",
                children: (
                    results.length === 0
                        ? [
                            {
                                tagName: "p",
                                className: "no-results",
                                children: ["no results"],
                            }
                        ]
                        : results.map((result) =>
                            Result(result, statusfulRef)
                        )
                )
            }
        }),
    ],
});

window.addEventListener("keydown", (e) => {
    if (search.value !== null && e.key === "Escape") {
        search.value = null;
    }
});

window.addEventListener("click", (e) => {
    if (search.value !== null && !Search.contains(e.target as Node)) {
        search.value = null;
    }
});

function Result(result: SearchResult, statusful: StateRef<Statusful[]>) {
    const status = statusful.as((statusful) =>
        statusful.find((s) => s.urlTitle === result.urlTitle)?.status
    );

    let fetched = false;
    let tId: number;
    const prefetch = () => {
        if (!fetched) {
            tId = setTimeout(() => {
                if (!fetched) {
                    const id = getDetailsCacheId(result.urlTitle);
                    const _result = getDetails(result.urlTitle);

                    prefetcher.add(id, _result);
                    fetched = true;
                }
            }, 500);
        }
    }

    const cancel = () => {
        tId && clearTimeout(tId);
    }

    const onclick = () => {
        cancel();
        fetched = true;

        episodeNumber.value = null;
        urlTitle.value = result.urlTitle;
        search.value = null;
    };

    return {
        tagName: "div",
        tabIndex: 0,
        className: status.as((status) =>
            status === Status.Watching ? "result watching" :
                "result"
        ),
        onmouseenter: prefetch,
        onmouseleave: cancel,
        onfocus: prefetch,
        onblur: cancel,
        onclick,
        onkeydown: (e: KeyboardEvent) => {
            e.key === "Enter" && onclick();
        },
        children: [
            {
                tagName: "div",
                className: "image",
                style: {
                    backgroundImage: "url(" + encodeURI(result.image) + ")",
                },
                children: [
                    {
                        tagName: "div",
                        className: "status-bar",
                    },
                ],
            },
            {
                tagName: "p",
                children: [result.title],
            },
        ]
    };
}

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
