import { State, createNode, type MiniElement } from "@9elt/miniframe";
import {
    getDetails,
    getEpisode,
    getReleases,
    getSearch,
    type Release
} from "./lib/gogo";
import { UrlState } from "./lib/url.state";

const page = new UrlState("page", Number);

const releases = page.asyncAs(async (page) => page === null ? [] : await getReleases(page));

const search = new UrlState<string>("search", String);

const results = search.asyncAs(async (search) =>
    search?.trim() ? await getSearch(search) : null
);

const urlTitle = new UrlState<string>("title", String);

const details = urlTitle.asyncAs(async (urlTitle) =>
    urlTitle !== null ? await getDetails(urlTitle) : null
);

const episodeNumber = new UrlState<number>("episode", Number);

const episode = episodeNumber.asyncAs(async (episodeNumber) =>
    details.value && episodeNumber !== null
        ? await getEpisode(details.value.urlTitle, episodeNumber)
        : null
);

function LimitedText(text: string, limit: number) {
    if (text.length <= limit) {
        return {
            tagName: "span",
            children: [text],
        };
    }

    const isOpen = new State(false);

    return {
        tagName: "span",
        children: [
            isOpen.as((isOpen) =>
                isOpen ? text : text.slice(0, limit)
            ),
            {
                tagName: "small",
                style: {
                    color: "#666",
                    cursor: "pointer",
                },
                onclick: () => {
                    isOpen.value = !isOpen.value;
                },
                children: [
                    isOpen.as(isOpen =>
                        isOpen ? " close" : "..."
                    )
                ],
            }
        ]
    };
}

function debounce<F extends Function>(f: F, ms: number): F {
    let timeout: number | null = null;

    return function(...args: any[]) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            f(...args);
            timeout = null;
        }, ms);
    } as unknown as F;
}

(async () => {
    const root: MiniElement = {
        tagName: "div",
        // @ts-ignore
        children: State.use({ releases, details, episode })
            .as(({ releases: _releases, details: _details, episode: _episode }) => {
                const msearch = ({
                    tagName: "div",
                    children: [
                        // @ts-ignore
                        {
                            tagName: "input",
                            placeholder: "search",
                            value: search,
                            oninput: debounce((e: any) => {
                                search.value = e.target.value.trim();
                            }, 1_000),
                        },
                        // @ts-ignore
                        {
                            tagName: "div",
                            style: { backgroundColor: "#6662" },
                            children: results.as((results) => results && (results.length > 0
                                ? results.map((result) => ({
                                    tagName: "div",
                                    children: [
                                        {
                                            tagName: "p",
                                            children: [result.title],
                                        },
                                        {
                                            tagName: "button",
                                            children: ["watch"],
                                            onclick: () => {
                                                urlTitle.value = result.urlTitle;
                                                search.value = null;
                                            },
                                        },
                                    ]
                                })) : [
                                    {
                                        tagName: "p",
                                        style: { color: "red" },
                                        children: ["no results found"],
                                    }
                                ])),
                        }
                    ],
                });

                if (!_details) {
                    return [
                        {
                            tagName: "div",
                            children: [
                                msearch,
                                {
                                    tagName: "div",
                                    children: ((_releases || []) as Release[]).map((item) => ({
                                        tagName: "div",
                                        children: [
                                            {
                                                tagName: "p",
                                                children: [item.title, " ", {
                                                    tagName: "small",
                                                    children: ["ep ", item.episode],
                                                }],
                                            },
                                            {
                                                tagName: "button",
                                                children: ["watch"],
                                                onclick: () => {
                                                    urlTitle.value = item.urlTitle;
                                                },
                                            },
                                        ]
                                    }))
                                }
                            ]
                        }
                    ];
                }
                return [
                    {
                        tagName: "div",
                        children: [
                            msearch,
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
                            }
                        ]
                    }
                ]
            })
    };

    document.body.appendChild(createNode(root));
})();
