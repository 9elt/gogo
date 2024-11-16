import { createNode } from "@9elt/miniframe";
import { results, search, statusful } from "../global";
import { StateRef } from "../lib/states";
import { debounce, isMobile } from "../util";
import { SearchResult } from "./search.result";

const statusfulRef = new StateRef(statusful);

const SearchInput = createNode({
    tagName: "input",
    className: "search-input",
    type: "search",
    placeholder: isMobile ? "Search" : "Type '/' to search",
    value: search.as((search) => search || ""),
    oninput: debounce((e: any) => {
        search.value = e.target.value.trim() || null;
    }, 1_000),
});

export const Search = createNode({
    // @ts-ignore
    tagName: "div",
    className: "search-container",
    children: [
        {
            tagName: "div",
            className: "search-input-container",
            children: [
                SearchInput,
                search.as(
                    (_search) =>
                        _search !== null && {
                            tagName: "span",
                            className: "search-input-adornment",
                            children: ["✕"],
                            onclick: () => {
                                if (search.value !== null) {
                                    search.value = null;
                                }
                            },
                        }
                ),
            ],
        },
        results.as((results) => {
            statusfulRef.clear();

            return (
                results && {
                    tagName: "div",
                    tabIndex: -1,
                    className: "search-results",
                    children:
                        results.length === 0
                            ? [
                                  {
                                      tagName: "p",
                                      className:
                                          "no-search-results",
                                      children: ["no results"],
                                  },
                              ]
                            : results.map((result) =>
                                  SearchResult(
                                      result,
                                      statusfulRef
                                  )
                              ),
                }
            );
        }),
    ],
});

window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (
        document.activeElement?.tagName !== "INPUT" &&
        e.key === "/"
    ) {
        e.preventDefault();
        SearchInput.focus();
    }
});

window.addEventListener("keydown", (e) => {
    if (search.value !== null && e.key === "Escape") {
        search.value = null;
    }
});

window.addEventListener("click", (e) => {
    if (
        search.value !== null &&
        !Search.contains(e.target as Node)
    ) {
        search.value = null;
    }
});
