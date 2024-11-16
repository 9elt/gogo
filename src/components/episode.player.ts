import { State, createNode, type MiniElement } from "@9elt/miniframe";
import type { Episode } from "../lib/gogo";

const LSK_SERVER = "server";

export function EpisodePlayer(_episode: Episode): MiniElement {
    const lastServer = localStorage.getItem(LSK_SERVER);

    const src = new State(
        _episode.links.find((item) => item.server === lastServer)?.href ||
            _episode.links[0].href
    );

    const iframe = createNode({
        // @ts-ignore
        tagName: "iframe",
        className: "player-iframe",
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
                className: "player-server-list",
                children: [
                    {
                        tagName: "small",
                        children: ["servers"],
                    },
                    ..._episode.links.map((item) => ({
                        tagName: "button",
                        className: src.as(
                            (src) => src === item.href && "active"
                        ),
                        children: [item.server],
                        onclick: () => {
                            src.value = item.href;
                            localStorage.setItem(LSK_SERVER, item.server);
                        },
                    })),
                ],
            },
        ],
    };
}

export const EpisodePlayerLoading = {
    tagName: "div",
    className: "player loading",
    children: [
        {
            tagName: "div",
            className: "player-iframe",
        },
        {
            tagName: "div",
            className: "player-server-list",
            children: [
                {
                    tagName: "small",
                    children: ["servers"],
                },
                {
                    tagName: "button",
                    children: ["vidcdn"],
                },
                {
                    tagName: "button",
                    children: ["streamwish"],
                },
                {
                    tagName: "button",
                    children: ["hydrax"],
                },
                {
                    tagName: "button",
                    children: ["mp4upload"],
                },
            ],
        },
    ],
};
