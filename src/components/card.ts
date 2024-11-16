import { type MiniElement } from "@9elt/miniframe";
import { Status, episodeNumber, urlTitle } from "../global";
import { prefetcher } from "../lib/cache";
import { getDetails, getDetailsCacheId } from "../lib/gogo";
import type { StateRef } from "../lib/states";
import type { Statusful } from "../lib/statusful";

export function Card(
    entry: {
        title: string;
        urlTitle: string;
        image?: string;
        episode?: number;
    },
    statusful: StateRef<Statusful[]>
): MiniElement {
    const status = statusful.as(
        (_statusful) =>
            _statusful.find((s) => s.urlTitle === entry.urlTitle)?.status
    );

    let fetched = false;
    let tId: ReturnType<typeof setTimeout> | null = null;
    const prefetch = () => {
        if (!fetched) {
            tId = setTimeout(() => {
                if (!fetched) {
                    const id = getDetailsCacheId(entry.urlTitle);
                    const result = getDetails(entry.urlTitle);

                    prefetcher.add(id, result);
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

        urlTitle.value = entry.urlTitle;
        if (entry.episode !== undefined) {
            episodeNumber.value = entry.episode;
        }
    };

    // @ts-ignore
    return {
        tagName: "div",
        tabIndex: 0,
        className: status.as((status) =>
            status === Status.Watching ? "card watching" : "card"
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
            // @ts-ignore
            {
                tagName: "div",
                className: "image",
                style: {
                    backgroundImage:
                        entry.image && "url(" + encodeURI(entry.image) + ")",
                },
            },
            // @ts-ignore
            {
                tagName: "p",
                children: [entry.title],
            },
            // @ts-ignore
            entry.episode !== undefined && {
                tagName: "small",
                children: ["ep ", entry.episode],
            },
            // @ts-ignore
            status.as(
                (status) =>
                    status === Status.Watching && {
                        tagName: "div",
                        className: "status",
                        children: [
                            {
                                tagName: "span",
                                children: ["★"],
                            },
                        ],
                    }
            ),
            // @ts-ignore
            {
                tagName: "div",
                className: "status-bar",
            },
        ],
    };
}
