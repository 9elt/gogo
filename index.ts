import { createNode, MiniElement, State } from "@9elt/miniframe";

const _tmp = document.createElement("div");

const GOGO_URL = "https://anitaku.bz";
const GOGO_CDN = "https://ajax.gogocdn.net";

class UrlState<T extends { toString: () => string }> extends State<T | null> {
    constructor(
        key: string,
        keyAs: ((value: string) => T | null)
    ) {
        const query = new URLSearchParams(window.location.search);
        const init = query.get(key);
        // @ts-ignore
        super(init && keyAs(init));
        this.sub((value) => {
            const query = new URLSearchParams(window.location.search);
            // @ts-ignore
            value === null
                ? query.delete(key)
                : query.set(key, value.toString());
            const str = query.toString();
            const update = window.location.protocol + "//" + window.location.host + window.location.pathname + (str && "?" + str);
            window.history.pushState({ path: update }, '', update);
        });
        window.addEventListener("popstate", () => {
            const query = new URLSearchParams(window.location.search);
            const value = query.get(key);
            // @ts-ignore
            this.value = value && keyAs(value);
        });
    }
}

const releases = new State<Release[]>([]);

const search = new UrlState<string>("search", String);
const results = new State<Awaited<ReturnType<typeof getSearch>> | null>(null);
search.sub(async (search) => {
    results.value = search?.trim() ? await getSearch(search) : null;
})(search.value, search.value);

const urlTitle = new UrlState<string>("title", String);
const details = new State<Awaited<ReturnType<typeof getDetails>> | null>(null);
const episodes = new State<Awaited<ReturnType<typeof loadEpisodeList>> | null>(null);
urlTitle.sub(async (urlTitle) => {
    details.value = urlTitle ? await getDetails(urlTitle) : null;
})(urlTitle.value, urlTitle.value);
details.sub(async (details) => {
    episodes.value = details ? await loadEpisodeList(details.id.toString(), 0, details.episodes) : null;
})(details.value, details.value);

const episodeNumber = new UrlState<number>("episode", Number);
const episode = new State<Awaited<ReturnType<typeof getEpisode>> | null>(null);
episodeNumber.sub(async (episodeNumber) => {
    episode.value = details.value && episodeNumber ? await getEpisode(details.value.urlTitle, episodeNumber) : null;
})(episodeNumber.value, episodeNumber.value);

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
            isOpen.as((isOpen) => isOpen ? text : text.slice(0, limit)),
            {
                tagName: "small",
                style: {
                    color: "#666",
                    cursor: "pointer",
                },
                children: [isOpen.as(isOpen => isOpen ? " close" : "...")],
                onclick: () => {
                    isOpen.value = !isOpen.value;
                }
            }
        ]
    }
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
    releases.value = await getRecentReleases(1);

    const root: MiniElement = {
        tagName: "div",
        // @ts-ignore
        children: State.use({ releases, details, episode, episodes })
            .as(({ releases: _releases, details: _details, episode: _episode, episodes: _episodes }) => {
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
                                            onclick: async () => {
                                                urlTitle.value = result.href.replace("/category/", "");
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
                                    children: (_releases as Release[]).map((item) => ({
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
                                                onclick: async () => {
                                                    urlTitle.value = item.href.replace(/-episode-\d+/, "").replace("/", "");
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
                            _episodes && {
                                tagName: "div",
                                children: _episodes.map((e) => ({
                                    tagName: "button",
                                    children: [e.episode === _episode?.number && ">", e.episode],
                                    onclick: async () => {
                                        episodeNumber.value = e.episode;
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

// loadEpisodeList("5960", 0, 100).then(console.log).catch(console.error);
// getDetails("youjo-senki").then(console.log).catch(console.error);
//
// getEpisode("youjo-senki", 1).then((res) => {
//     const src = res[0].href;
//
//     const iframe = createNode({
//         // @ts-ignore
//         tagName: "iframe",
//         src,
//         allowfullscreen: "true",
//         frameborder: "0",
//         marginwidth: "0",
//         marginheight: "0",
//         scrolling: "no",
//     });
//
//     const root = createNode({
//         tagName: "div",
//         children: [
//             iframe,
//             ...res.map((item) => ({
//                 tagName: "button",
//                 children: [item.server],
//                 onclick: () => {
//                     iframe.src = item.href;
//                 }
//             })),
//         ]
//     });
//
//     document.body.append(root);
// }).catch(console.error);
//

/*

gogo api

*/

async function getEpisode(name: string, episode: number) {
    const raw = await fetch(GOGO_URL + "/" + name + "-episode-" + episode.toString().replace(".", "-"));

    if (!raw.ok) {
        throw new Error("failed to fetch details");
    }

    _tmp.innerHTML = sanitize(await raw.text());

    const _links = _tmp.querySelectorAll(".anime_muti_link li");

    const links = new Array<{
        server: string;
        href: string;
    }>(_links.length);

    for (let i = 0; i < _links.length; i++) {
        const _li = _links[i];
        const _a = _li.querySelector("a[data-video]") as HTMLAnchorElement | null;

        const server = _li.className;
        const href = _a?.dataset.video;

        if (!href || !server) {
            console.warn("failed to parse link", _li);
            continue;
        }

        links[i] = {
            server,
            href,
        };
    }

    return {
        number: episode,
        links,
    };
}

async function getDetails(name: string) {
    const raw = await fetch(GOGO_URL + "/category/" + name);

    if (!raw.ok) {
        throw new Error("failed to fetch details");
    }

    _tmp.innerHTML = sanitize(await raw.text())

    const title = _tmp
        .querySelector(".anime_info_body_bg>h1")
        ?.textContent;

    const id = _tmp
        .querySelector("input#movie_id")
        ?.getAttribute("value");

    const _pages = _tmp.querySelectorAll("#episode_page a");

    const pages = new Array<[number, number]>(_pages.length);

    for (let i = 0; i < _pages.length; i++) {
        const page = _pages[i];

        const start = page.getAttribute("ep_start");
        const end = page.getAttribute("ep_end");

        if (!start || !end) {
            console.warn("failed to parse page", page);
            continue;
        }

        pages[i] = [
            Number(start),
            Number(end)
        ];
    }

    const episodes = pages[pages.length - 1][1];

    const description = _tmp
        .querySelector(".description")
        ?.textContent;

    const image = (
        _tmp.querySelector(".anime_info_body_bg>img") as HTMLImageElement | null
    )
        ?.dataset.src;

    if (!title || !id || !description || !image) {
        throw new Error("failed to parse details");
    }

    _tmp.innerHTML = "";

    const result = {
        id: Number(id),
        title,
        urlTitle: name,
        pages,
        episodes,
        description,
        image,
    };

    console.log(result);

    return result;
}

async function loadEpisodeList(id: string, from: number = 0, to: number = 99) {
    const raw = await fetch(GOGO_CDN + "/ajax/load-list-episode?ep_start=" + from + "&ep_end=" + to + "&id=" + id + "&default_ep=0");

    if (!raw.ok) {
        throw new Error("failed to fetch episode list");
    }

    _tmp.innerHTML = sanitize(await raw.text());

    const items = _tmp.querySelectorAll("#episode_related>li");

    const result = new Array<{
        href: string;
        episode: number;
    }>(items.length);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const href = item
            .querySelector("a")
            ?.href
            .replace(window.location.origin, "");

        const episode = item
            .querySelector(".name")
            ?.textContent
            ?.replace("EP ", "");

        if (!href || !episode) {
            console.warn("failed to parse item", item);
            continue;
        }

        result[i] = {
            href,
            episode: Number(episode),
        };
    }

    _tmp.innerHTML = "";

    return result;
}

async function getSearch(search: string) {
    const raw = await fetch(GOGO_CDN + "/site/loadAjaxSearch?keyword=" + encodeURI(search) + "&id=-1");

    if (!raw.ok) {
        throw new Error("failed to fetch search result");
    }

    _tmp.innerHTML = sanitize((await raw.json()).content);

    const items = _tmp.querySelectorAll("#header_search_autocomplete_body>div");

    const result = new Array<{
        title: string;
        href: string;
        image: string;
    }>(items.length);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const title = item?.textContent;

        const href = item
            .querySelector("a")
            ?.href
            .replace(window.location.origin, "");

        const image = (item.querySelector(".thumbnail-recent_search") as HTMLDivElement)
            ?.style
            .background
            .replace("url(", "")
            .replace(")", "");

        if (!title || !href || !image) {
            console.warn("failed to parse item", item);
            continue;
        }

        result[i] = {
            title,
            href,
            image,
        };
    }

    _tmp.innerHTML = "";

    return result;
}

type Release = {
    title: string;
    href: string;
    image: string;
    episode: number;
};

async function getRecentReleases(page: number) {
    const raw = await fetch(GOGO_CDN + "/ajax/page-recent-release.html?page=" + page + "&type=1");

    if (!raw.ok) {
        throw new Error("failed to fetch recent releases");
    }

    _tmp.innerHTML = sanitize(await raw.text());

    const items = _tmp.querySelectorAll(".items>li");

    const result = new Array<{
        title: string;
        href: string;
        image: string;
        episode: number;
    }>(items.length);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const title = item.querySelector(".name")?.textContent;

        const href = item.querySelector("a")?.href.replace(window.location.origin, "");

        const image = item.querySelector("img")?.dataset.src;

        const episode = item
            .querySelector(".episode")
            ?.textContent
            ?.replace("Episode ", "");

        if (!title || !href || !image || !episode) {
            console.warn("failed to parse item", item);
            continue;
        }

        result[i] = {
            title,
            href,
            image,
            episode: Number(episode),
        };
    }

    _tmp.innerHTML = "";

    return result;
}

function sanitize(html: string) {
    return html
        .replace(/<script.*?>.*?<\/script>/g, "")
        .replace(/<link.*?>/g, "")
        .replace(/<style.*?>.*?<\/style>/g, "")
        .replace(/<head>.*?<\/head>/g, "")
        // @ts-ignore
        .replaceAll("src=", "data-src=");
}
