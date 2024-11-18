import { type MiniElement } from "@9elt/miniframe";
import { episodeNumber, urlTitle } from "../global";
import { prefetcher } from "../lib/cache";
import { getDetails, getDetailsCacheId } from "../lib/gogo";
import type { StateRef } from "../lib/state.ref";
import { Status, type Statusful } from "../lib/statusful";

export function Card({
    entry,
    statusful,
}: {
    entry: {
        title: string;
        urlTitle: string;
        image?: string;
        episode?: number;
    };
    statusful: StateRef<Statusful[]>;
}): MiniElement {
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

    return (
        <div
            tabIndex={0}
            className={status.as((status) =>
                status === Status.Watching ? "card watching" : "card"
            )}
            onmouseenter={prefetch}
            onmouseleave={cancel}
            onfocus={prefetch}
            onblur={cancel}
            onclick={onclick}
            onkeydown={(e: KeyboardEvent) => {
                e.key === "Enter" && onclick();
            }}
        >
            <div
                className="image"
                style={{
                    backgroundImage:
                        entry.image && "url(" + encodeURI(entry.image) + ")",
                }}
            />
            <p>{entry.title}</p>
            {entry.episode !== undefined && <small>ep {entry.episode}</small>}
            {status.as(
                (status) =>
                    status === Status.Watching && (
                        <div className="status">
                            <span>★</span>
                        </div>
                    )
            )}
            <div className="status-bar" />
        </div>
    );
}
