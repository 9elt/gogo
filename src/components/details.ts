import { State, createNode, type MiniElement } from "@9elt/miniframe";
import { Status, statusful } from "../global";
import type { Episode, EpisodeDetails } from "../lib/gogo";
import { StateRef } from "../lib/states";
import { Statusful } from "../lib/statusful";
import { ExpandableText } from "./expandable.text";

export function Details(
    _details: EpisodeDetails,
    _statusful: StateRef<Statusful[]>,
    episodeNumber: StateRef<number | null>
): MiniElement {
    const status = _statusful.as((_statusful) =>
        _statusful.find((s) => s.urlTitle === _details.urlTitle)?.status
    );

    const next = episodeNumber.as((episodeNumber) =>
        _details.episodes[
        _details.episodes.indexOf(episodeNumber || 0) - 1
        ] || null
    );

    const previous = episodeNumber.as((episodeNumber) =>
        _details.episodes[
        _details.episodes.indexOf(episodeNumber || 0) + 1
        ] || null
    );

    const scrollToEpisode = _details.episodes.length > 25;

    const buttonsElements: { [key: number]: HTMLButtonElement; } = {};

    if (scrollToEpisode) {
        episodeNumber.sub((episodeNumber) => episodeNumber !== null &&
            buttonsElements[episodeNumber]?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest",
            })
        );
    }

    return {
        // @ts-ignore
        tagName: "div",
        className: status.as((status) =>
            status === Status.Watching ? "details-container watching" :
                "details-container"
        ),
        children: [
            // @ts-ignore
            {
                tagName: "div",
                className: "details",
                style: {
                },
                children: [
                    {
                        tagName: "div",
                        className: "image",
                        style: {
                            backgroundImage: "url(" + _details.image + ")",
                        },
                        children: [
                            {
                                tagName: "div",
                                className: "status-bar",
                            },
                        ]
                    },
                    {
                        tagName: "div",
                        className: "data",
                        children: [
                            // @ts-ignore
                            {
                                tagName: "button",
                                children: [
                                    status.as((status) => status === Status.Watching
                                        ? "✕ Remove from watchlist"
                                        : "★ Add to watchlist"
                                    )
                                ],
                                onclick: status.as((status) => (() => {
                                    status === Status.Watching
                                        ? statusful.remove(_details)
                                        : statusful.add(_details, Status.Watching);
                                })),
                            },
                            {
                                tagName: "h2",
                                children: [
                                    status.as((status) =>
                                        status === Status.Watching
                                            ? "★ " + _details.title
                                            : _details.title
                                    ),
                                ],
                            },
                            (_details.release || _details.status) && {
                                tagName: "small",
                                children: [
                                    _details.release || null,
                                    _details.status && _details.release && " • " || null,
                                    _details.status || null,
                                ],
                            },
                            _details.genres && {
                                tagName: "p",
                                className: "genres",
                                children: _details.genres.map((genre) => ({
                                    tagName: "span",
                                    children: [genre],
                                }))
                            },
                            {
                                tagName: "p",
                                className: "description",
                                children: [
                                    ExpandableText(_details.description, 200)
                                ],
                            },
                            _details.alias && {
                                tagName: "p",
                                className: "aliases",
                                children: [
                                    {
                                        tagName: "small",
                                        children: ["a.k.a. "],
                                    },
                                    {
                                        tagName: "i",
                                        children: [
                                            _details.alias.join(" • "),
                                        ],
                                    }
                                ],
                            }
                        ],
                    },
                ],
            },
            // @ts-ignore
            {
                tagName: "div",
                className: "episode-buttons",
                children: [
                    {
                        tagName: "button",
                        className: previous.as((previous) => previous === null && "disabled" || null),
                        children: ["🢐 previous"],
                        onclick: previous.as((previous) => previous !== null && (() => {
                            episodeNumber.ref.value = previous;
                        })),
                    },
                    // @ts-ignore
                    {
                        tagName: "div",
                        className: _details.episodes.length < 19
                            ? "episode-list center"
                            : _details.episodes.length < 100
                                ? "episode-list"
                                : _details.episodes.length < 200
                                    ? "episode-list s"
                                    : "episode-list xs",
                        children: _details.episodes.map((number) => {
                            const button = createNode({
                                // @ts-ignore
                                tagName: "button",
                                className: episodeNumber.as((_episodeNumber) =>
                                    _episodeNumber === number && "active"
                                ),
                                children: [number],
                                onclick: () => {
                                    episodeNumber.ref.value = number;
                                },
                            });

                            if (scrollToEpisode) {
                                buttonsElements[number] = button;
                            }

                            return button;
                        }),
                    },
                    {
                        tagName: "button",
                        className: next.as((next) => next === null && "disabled" || null),
                        children: ["next 🢒"],
                        onclick: next.as((next) => next !== null && (() => {
                            episodeNumber.ref.value = next;
                        })),
                    },
                ]
            }
        ],
    };
}

const LSK_SERVER = "server";

export function EpisodePlayer(_episode: Episode): MiniElement {
    const lastServer = localStorage.getItem(LSK_SERVER);

    const src = new State(
        _episode.links.find((item) => item.server === lastServer)?.href
        || _episode.links[0].href
    );

    const iframe = createNode({
        // @ts-ignore
        tagName: "iframe",
        src,
    });

    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("marginwidth", "0");
    iframe.setAttribute("marginheight", "0");
    iframe.setAttribute("scrolling", "no");

    return {
        tagName: "div",
        className: "player",
        children: [
            iframe,
            // @ts-ignore
            // @ts-ignore
            {
                tagName: "div",
                className: "server-list",
                children:
                    [
                        {
                            tagName: "small",
                            children: ["servers"],
                        },
                        ..._episode.links.map((item) => ({
                            tagName: "button",
                            className: src.as((src) => src === item.href && "active"),
                            children: [
                                item.server
                            ],
                            onclick: () => {
                                src.value = item.href;
                                localStorage.setItem(LSK_SERVER, item.server);
                            }
                        }))
                    ],
            },
        ],
    };
}
