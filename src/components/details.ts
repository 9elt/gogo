import { type MiniElement } from "@9elt/miniframe";
import { episodeNumber, urlTitle } from "../global";
import type { Episode, EpisodeDetails } from "../lib/gogo";
import { LimitedText } from "./limited.text";

export function Details(_details: EpisodeDetails, _episode: Episode | null): MiniElement {
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
                        tagName: "h4",
                        children: [_details.title],
                    },
                    {
                        tagName: "p",
                        children: [
                            LimitedText(_details.description, 200)
                        ],
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
            _episode && {
                tagName: "div",
                children: [
                    {
                        // @ts-ignore
                        tagName: "iframe",
                        src: _episode.links[0].href,
                        allowfullscreen: "true",
                        frameborder: "0",
                        marginwidth: "0",
                        marginheight: "0",
                        scrolling: "no",
                    },
                    {
                        tagName: "div",
                        children: _episode.links.map((item) => ({
                            tagName: "button",
                            children: [item.server],
                            onclick: () => {
                                document.querySelector("iframe")!.src = item.href;
                            }
                        })),
                    },
                ],
            },
        ],
    };
}
