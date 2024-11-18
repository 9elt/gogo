import { createNode } from "@9elt/miniframe";
import { results, search, statusful } from "../global";
import { StateRef } from "../lib/state.ref";
import { debounce, isMobile } from "../util";
import { SearchResult } from "./search.result";

const statusfulRef = new StateRef(statusful);

const SearchInput = createNode(
    <input
        className="search-input"
        type="text"
        placeholder={isMobile ? "Search" : "Type '/' to search"}
        value={search.as((search) => search || "")}
        oninput={debounce((e: any) => {
            search.value = e.target.value.trim() || null;
        }, 1_000)}
    />
);

export const Search = createNode(
    <div className="search-container">
        <div className="search-input-container">
            {SearchInput}
            {search.as(
                (_search) =>
                    _search !== null && (
                        <span
                            className="search-input-adornment"
                            onclick={() => {
                                if (search.value !== null) {
                                    search.value = null;
                                }
                            }}
                        >
                            ✕
                        </span>
                    )
            )}
        </div>
        {results.as((results) => {
            statusfulRef.clear();

            return (
                results && (
                    <div tabIndex={-1} className="search-results">
                        {results.length === 0 ? (
                            <p className="no-search-results">no results</p>
                        ) : (
                            results.map((result) =>
                                SearchResult(result, statusfulRef)
                            )
                        )}
                    </div>
                )
            );
        })}
    </div>
);

window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (document.activeElement?.tagName !== "INPUT" && e.key === "/") {
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
    if (search.value !== null && !Search.contains(e.target as Node)) {
        search.value = null;
    }
});
