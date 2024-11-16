import { cache, prefetcher } from "./cache";

const _TMP = document.createElement("div");

const GOGO_URL = "https://anitaku.bz";
const GOGO_CDN_URL = "https://ajax.gogocdn.net";

export type Episode = {
    number: number;
    links: {
        server: string;
        href: string;
    }[];
};

export async function getEpisode(name: string, episode: number): Promise<Episode> {
    const cacheId = "GET episode" + name + episode;
    const cached = cache.get(cacheId);

    if (cached) {
        return cached;
    }

    const raw = await fetch(GOGO_URL + "/" + name + "-episode-" + episode.toString().replace(".", "-"));

    if (!raw.ok) {
        throw new Error("failed to fetch details");
    }

    _TMP.innerHTML = sanitize(await raw.text());

    const _links = _TMP.querySelectorAll(".anime_muti_link li");

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

    const result = {
        number: episode,
        links,
    };

    cache.add(cacheId, result);

    return result;
}

type EpisodeStatus = "Ongoing" | "Completed" | "Upcoming";

export type EpisodeDetails = {
    title: string;
    urlTitle: string;
    episodes: number[];
    description: string;
    image: string;
    genres?: string[];
    release?: number;
    alias?: string[];
    status?: EpisodeStatus;
};

export function getDetailsCacheId(urlTitle: string) {
    return "GET details" + urlTitle;
}

export async function getDetails(urlTitle: string): Promise<EpisodeDetails> {
    const cacheId = getDetailsCacheId(urlTitle);
    const cached = prefetcher.get(cacheId) || cache.get(cacheId);

    if (cached) {
        return cached;
    }

    const raw = await fetch(GOGO_URL + "/category/" + urlTitle);

    if (!raw.ok) {
        throw new Error("failed to fetch details");
    }

    _TMP.innerHTML = sanitize(await raw.text());

    const title = _TMP
        .querySelector(".anime_info_body_bg>h1")
        ?.textContent;

    const episodeListId = _TMP
        .querySelector("input#movie_id")
        ?.getAttribute("value");

    const _pages = _TMP.querySelectorAll("#episode_page a");

    let lastEpisode = 0;

    for (let i = 0; i < _pages.length; i++) {
        const page = _pages[i];

        const end = page.getAttribute("ep_end");

        if (!end) {
            console.warn("failed to parse page", page);
            continue;
        }

        lastEpisode = Math.max(lastEpisode, Number(end));
    }

    const _items = _TMP.querySelectorAll(".anime_info_body_bg>p.type");

    const data: {
        genres?: string[];
        release?: number;
        alias?: string[];
        status?: EpisodeStatus;
    } = {};

    for (let i = 0; i < _items.length; i++) {
        const _item = _items[i];
        const _span = _item.querySelector("span");

        if (!_span) {
            continue;
        }

        const key = _span.textContent?.trim() || "";
        _span.remove();

        const text = _item.textContent?.trim() || "";

        switch (key) {
            case "Genre:":
                data.genres = text.split(/,|;/).map((genre) => genre.trim());
                break;
            case "Released:":
                data.release = Number(text);
                break;
            case "Other name:":
                data.alias = text.split(/,|;/).map((alias) => alias.trim());
                break;
            case "Status:":
                data.status = text as EpisodeStatus;
                break;
        }
    }

    const description = _TMP
        .querySelector(".description")
        ?.textContent || "no description provided.";

    const image = (
        _TMP.querySelector(".anime_info_body_bg>img") as HTMLImageElement | null
    )
        ?.dataset.src;

    if (!title || !episodeListId || !description || !image) {
        console.error(
            "title", title,
            "episodeListId", episodeListId,
            "description", description,
            "image", image
        );
        throw new Error("failed to parse details");
    }

    _TMP.innerHTML = "";

    const result = {
        title,
        urlTitle,
        episodes: lastEpisode === 0 ? [] :
            await getEpisodeList(episodeListId, 0, lastEpisode),
        description,
        image,
        ...data,
    };

    cache.add(cacheId, result);

    return result;
}

export async function getEpisodeList(id: string, from: number = 0, to: number = 99) {
    const raw = await fetch(GOGO_CDN_URL + "/ajax/load-list-episode?ep_start=" + from + "&ep_end=" + to + "&id=" + id + "&default_ep=0");

    if (!raw.ok) {
        throw new Error("failed to fetch episode list");
    }

    _TMP.innerHTML = sanitize(await raw.text());

    const _lis = _TMP.querySelectorAll("#episode_related>li");

    const result = new Array<number>(_lis.length);

    for (let i = 0; i < _lis.length; i++) {
        const _li = _lis[i];

        const episode = _li
            .querySelector(".name")
            ?.textContent
            ?.replace("EP ", "");

        if (!episode) {
            console.warn("failed to parse item", _li);
            continue;
        }

        result[i] = Number(episode);
    }

    _TMP.innerHTML = "";

    return result;
}

export type SearchResult = {
    title: string;
    urlTitle: string;
    image: string;
};

export async function getSearch(search: string): Promise<SearchResult[]> {
    const cacheId = "GET search" + search;
    const cached = cache.get(cacheId);

    if (cached) {
        return cached;
    }

    const raw = await fetch(GOGO_CDN_URL + "/site/loadAjaxSearch?keyword=" + encodeURI(search) + "&id=-1");

    if (!raw.ok) {
        throw new Error("failed to fetch search result");
    }

    _TMP.innerHTML = sanitize((await raw.json()).content);

    const _divs = _TMP.querySelectorAll("#header_search_autocomplete_body>div");

    const result = new Array<SearchResult>(_divs.length);

    for (let i = 0; i < _divs.length; i++) {
        const _div = _divs[i];

        const title = _div?.textContent;

        const urlTitle = _div
            .querySelector("a")
            ?.href
            .replace(window.location.origin + window.location.pathname, "")
            .replace("/category", "");

        const image = (_div.querySelector(".thumbnail-recent_search") as HTMLDivElement)
            ?.style
            .background
            .replace('url("', "")
            .replace('")', "");

        if (!title || !urlTitle || !image) {
            console.warn("failed to parse item", _div);
            continue;
        }

        result[i] = {
            title,
            urlTitle,
            image,
        };
    }

    _TMP.innerHTML = "";

    cache.add(cacheId, result);

    return result;
}

export type Release = {
    title: string;
    urlTitle: string;
    image: string;
    episode: number;
};

export async function getReleases(page: number): Promise<Release[]> {
    const cacheId = "GET releases" + page;
    const cached = cache.get(cacheId);

    if (cached) {
        return cached;
    }

    const raw = await fetch(GOGO_CDN_URL + "/ajax/page-recent-release.html?page=" + page + "&type=1");

    if (!raw.ok) {
        throw new Error("failed to fetch recent releases");
    }

    _TMP.innerHTML = sanitize(await raw.text());

    const _lis = _TMP.querySelectorAll(".items>li");

    const result = new Array<Release>(_lis.length);

    for (let i = 0; i < _lis.length; i++) {
        const _li = _lis[i];

        const title = _li.querySelector(".name")?.textContent;

        const urlTitle = _li
            .querySelector("a")
            ?.href
            .replace(window.location.origin, "")
            .replace(/-episode-\d+/, "")
            .replace("/", "");

        const image = _li.querySelector("img")?.dataset.src;

        const episode = _li
            .querySelector(".episode")
            ?.textContent
            ?.replace("Episode ", "");

        if (!title || !urlTitle || !image || !episode) {
            console.warn("failed to parse item", _li);
            continue;
        }

        result[i] = {
            title,
            urlTitle,
            image,
            episode: Number(episode),
        };
    }

    _TMP.innerHTML = "";

    cache.add(cacheId, result);

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
