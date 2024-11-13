import { State, createNode, type MiniElement } from "@9elt/miniframe";
import { Status, episodeNumber, statusful, urlTitle } from "../global";
import type { Episode, EpisodeDetails } from "../lib/gogo";
import { ExpandableText } from "./expandable.text";

export function Details(_details: EpisodeDetails, _episode: Episode | null): MiniElement {
    const status = statusful.as((statusful) =>
        statusful.find((s) => s.urlTitle === _details.urlTitle)?.status
    );

    return {
        tagName: "div",
        children: [
            // @ts-ignore
            {
                tagName: "div",
                children: [
                    {
                        tagName: "button",
                        children: ["< back"],
                        onclick: () => {
                            urlTitle.value = null;
                            episodeNumber.value = null;
                        },
                    },
                    {
                        tagName: "div",
                        children: status.as((status) => [{
                            tagName: "button",
                            children: [
                                status === Status.Watching ? "✕ not watching" : "★ watching"
                            ],
                            onclick: () => {
                                status === Status.Watching
                                    ? statusful.remove(_details)
                                    : statusful.add(_details, Status.Watching);
                            },
                        }]),
                    },
                    {
                        tagName: "h4",
                        children: [_details.title],
                    },
                    {
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
                                src: _details.image,
                            },
                            {
                                tagName: "p",
                                children: [
                                    ExpandableText(_details.description, 200)
                                ],
                            },
                        ]
                    },
                    _details && {
                        tagName: "div",
                        children: _details.episodes.map((e) => ({
                            tagName: "button",
                            children: [e === _episode?.number && ">", e],
                            onclick: async () => {
                                episodeNumber.value = e;
                            },
                        })),
                    }
                ],
            },
            // @ts-ignore
            _episode && Episode(_episode),
        ],
    };
}

const LSK_SERVER = "server";

function Episode(_episode: Episode): MiniElement {
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
        children: [
            iframe,
            // @ts-ignore
            {
                tagName: "div",
                children: _episode.links.map((item) => ({
                    tagName: "button",
                    children: [
                        src.as((src) => src === item.href && ">"),
                        item.server
                    ],
                    onclick: () => {
                        src.value = item.href;
                        localStorage.setItem(LSK_SERVER, item.server);
                    }
                })),
            },
        ],
    }
}
