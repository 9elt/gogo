import { episodeNumber, search, urlTitle } from "../global";
import { prefetcher } from "../lib/cache";
import { getDetails, getDetailsCacheId, type SearchResult } from "../lib/gogo";
import { StateRef } from "../lib/state.ref";
import { Status, type Statusful } from "../lib/statusful";

export function SearchResult(
    result: SearchResult,
    statusful: StateRef<Statusful[]>
) {
    const status = statusful.as(
        (statusful) =>
            statusful.find((s) => s.urlTitle === result.urlTitle)?.status
    );

    let fetched = false;
    let tId: ReturnType<typeof setTimeout> | null = null;
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
    };

    const cancel = () => {
        tId && clearTimeout(tId);
    };

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
            status === Status.Watching
                ? "search-result watching"
                : "search-result"
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
        ],
    };
}
