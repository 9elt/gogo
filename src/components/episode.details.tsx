import { createNode } from "@9elt/miniframe";
import { statusful } from "../global";
import type { EpisodeDetails } from "../lib/gogo";
import { StateRef } from "../lib/state.ref";
import { Status, type Statusful } from "../lib/statusful";
import { isMobile, randomDelay } from "../util";
import { ArrowLeft } from "./arrow.left";
import { ArrowRight } from "./arrow.right";
import { ExpandableText } from "./expandable.text";

export function EpisodeDetails(
    _details: EpisodeDetails,
    _statusful: StateRef<Statusful[]>,
    episodeNumber: StateRef<number | null>
) {
    const status = _statusful.as(
        (_statusful) =>
            _statusful.find((s) => s.urlTitle === _details.urlTitle)?.status
    );

    const next = episodeNumber.as(
        (episodeNumber) =>
            _details.episodes[
            _details.episodes.indexOf(episodeNumber || 0) - 1
            ] || null
    );

    const previous = episodeNumber.as(
        (episodeNumber) =>
            _details.episodes[
            _details.episodes.indexOf(episodeNumber || 0) + 1
            ] || null
    );

    const scrollToEpisode = _details.episodes.length > 25;

    const buttonsElements: {
        [key: number]: HTMLButtonElement;
    } = {};

    if (scrollToEpisode) {
        episodeNumber.sub(
            (episodeNumber) => {
                episodeNumber !== null &&
                    buttonsElements[episodeNumber]?.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "nearest",
                    });
            }
        );
    }

    return (
        <div
            className={status.as((status) =>
                status === Status.Watching
                    ? "episode-header watching"
                    : "episode-header"
            )}
        >
            <div className="data">
                <div
                    className="image"
                    style={{
                        backgroundImage:
                            "url(" + encodeURI(_details.image) + ")",
                    }}
                >
                    <div className="status-bar" />
                </div>
                <div className="info">
                    <button
                        onclick={status.as((status) => () => {
                            status === Status.Watching
                                ? statusful.remove(_details)
                                : statusful.add(_details, Status.Watching);
                        })}
                    >
                        {status.as((status) =>
                            status === Status.Watching
                                ? "✕ Remove from watchlist"
                                : "★ Add to watchlist"
                        )}
                    </button>
                    <h2>
                        {status.as((status) =>
                            status === Status.Watching
                                ? "★ " + _details.title
                                : _details.title
                        )}
                    </h2>
                    {(_details.release || _details.status || null) && (
                        <small>
                            {_details.release || null}
                            {(_details.status && _details.release && " • ") ||
                                null}
                            {_details.status || null}
                        </small>
                    )}
                    {_details.genres && (
                        <p className="genres">
                            {_details.genres.map((genre) => (
                                <span children={[genre]} />
                            ))}
                        </p>
                    )}
                    <p className="description">
                        <ExpandableText
                            text={_details.description}
                            limit={200}
                        />
                    </p>
                    {_details.alias && (
                        <p className="aliases">
                            <small>a.k.a. </small>
                            <i>{_details.alias.join(" • ")}</i>
                        </p>
                    )}
                </div>
            </div>
            {_details.episodes.length > 0 && (
                <div className="episode-controls">
                    <button
                        className={previous.as(
                            (previous) =>
                                (previous === null && "disabled") || ""
                        )}
                        onclick={previous.as(
                            (previous) =>
                                previous !== null &&
                                (() => {
                                    episodeNumber.ref.value = previous;
                                }) || null
                        )}
                    >
                        {ArrowLeft} prev
                    </button>
                    <div
                        className={
                            _details.episodes.length < (isMobile ? 10 : 19)
                                ? "episode-list center"
                                : _details.episodes.length < 100
                                    ? "episode-list"
                                    : _details.episodes.length < 200
                                        ? "episode-list s"
                                        : "episode-list xs"
                        }
                    >
                        {_details.episodes.map((number) => {
                            const button = createNode(
                                <button
                                    className={episodeNumber.as(
                                        (_episodeNumber) =>
                                            _episodeNumber === number &&
                                            "active" || ""
                                    )}
                                    onclick={() => {
                                        episodeNumber.ref.value = number;
                                    }}
                                >
                                    {number}
                                </button>
                            ) as HTMLButtonElement;

                            if (scrollToEpisode) {
                                buttonsElements[number] = button;
                            }

                            return button;
                        })}
                    </div>
                    <button
                        className={next.as(
                            (next) => (next === null && "disabled") || ""
                        )}
                        onclick={next.as(
                            (next) =>
                                next !== null &&
                                (() => {
                                    episodeNumber.ref.value = next;
                                }) || null
                        )}
                    >
                        next {ArrowRight}
                    </button>
                </div>
            )}
        </div>
    );
}

export const EpisodeDetailsLoading = (
    <div className="episode-header loading">
        <div className="data">
            <div className="image" style={{ animationDelay: randomDelay() }} />
            <div className="info" style={{ animationDelay: randomDelay() }} />
        </div>
        <div className="episode-controls">
            <button style={{ animationDelay: randomDelay() }}>
                {ArrowLeft} prev
            </button>
            <div className="episode-list center">
                {new Array(7).fill(null).map((_, i) => (
                    <button>{i}</button>
                ))}
            </div>
            <button style={{ animationDelay: randomDelay() }}>
                next {ArrowRight}
            </button>
        </div>
    </div>
);
