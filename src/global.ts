import { State } from "@9elt/miniframe";
import { AsyncState } from "./lib/async.state";
import { episodeCache } from "./lib/episode.cache";
import {
    getDetails,
    getEpisode,
    getReleases,
    getSearch,
    type SearchResult,
} from "./lib/gogo";
import {
    STATUSFUL_MAX_SIZE,
    Status,
    Statusful,
    dumpStatusful,
    loadStatusful,
} from "./lib/statusful";
import { UrlState } from "./lib/url.state";

const QK_RELEASES_PAGE = "releases";
const QK_WATCHING_PAGE = "watching";
const QK_SEARCH = "search";
const QK_TITLE = "title";

export const releasesPage = new UrlState(QK_RELEASES_PAGE, Number);
releasesPage.value ||= 1;

export const releases = releasesPage.asyncAs(async (page) =>
    page === null ? [] : await getReleases(page)
);

export const search = new UrlState<string>(QK_SEARCH, String);

export const results = search.asyncAs(async (search) =>
    search?.trim() ? await getSearch(search) : null
);

export const urlTitle = new UrlState<string>(QK_TITLE, String);

export enum Route {
    Home,
    Episode,
}

export const route = urlTitle.as((title) =>
    title === null ? Route.Home : Route.Episode
);

const headTitle = document.querySelector("head>title")!;
const originalTitle = headTitle.textContent;

export const details = urlTitle.asyncAs(async (urlTitle) => {
    const details = urlTitle === null ? null : await getDetails(urlTitle);

    headTitle.textContent = details?.title || originalTitle;

    if (details && details.episodes.length === 0) {
        episodeNumber.value = -1;
    }

    if (
        details &&
        details.episodes.length > 0 &&
        episodeNumber.value === null
    ) {
        episodeNumber.value =
            episodeCache.get(urlTitle!) ||
            details.episodes[details.episodes.length - 1] ||
            -1;
    }

    return details;
}, null);

export const episodeNumber = new AsyncState<number | null>(null);

episodeNumber.sub((value) => {
    if (
        value !== null &&
        value !== -1 &&
        urlTitle.value !== null &&
        // NOTE: Avoid storing the default value
        (episodeCache.get(urlTitle.value) !== null || value !== 1)
    ) {
        episodeCache.add(urlTitle.value, value);
    }
});

export const episode = AsyncState.useAsync({ episodeNumber, urlTitle }).asyncAs(
    async (g) =>
        g.urlTitle && g.episodeNumber !== null && g.episodeNumber !== -1
            ? await getEpisode(g.urlTitle, g.episodeNumber)
            : g.episodeNumber === -1
              ? // NOTE: No episode available
                -1
              : // NOTE: Loading
                null
);

export const statusful = new State(loadStatusful()) as State<Statusful[]> & {
    add: (value: SearchResult, status: Status) => void;
    remove: (value: SearchResult) => void;
};

statusful.sub(dumpStatusful);

statusful.add = (value, status) => {
    for (const item of statusful.value) {
        if (item.urlTitle === value.urlTitle) {
            item.status = status;
            statusful.value = statusful.value;
            return;
        }
    }
    statusful.value.push({ ...value, status });
    if (statusful.value.length > STATUSFUL_MAX_SIZE) {
        statusful.value.shift();
    }
    statusful.value = statusful.value;
};

statusful.remove = (value) => {
    statusful.value = statusful.value.filter(
        (v) => v.urlTitle !== value.urlTitle
    );
};

export const WATCHING_PAGE_SIZE = 8;

export const watchingPage = new UrlState(QK_WATCHING_PAGE, Number);
watchingPage.value ||= 1;

export type Watching = {
    maxPage: number;
    data: Statusful[];
};

statusful.sub((_statusful) => {
    const maxPage = Math.ceil(_statusful.length / WATCHING_PAGE_SIZE);
    watchingPage.value = Math.min(watchingPage.value || 0, maxPage);
});

export const watching = State.use({
    watchingPage,
    statusful,
}).as((g) => {
    const maxPage = Math.ceil(g.statusful.length / WATCHING_PAGE_SIZE);

    g.watchingPage ||= 1;

    if (g.watchingPage > maxPage) {
        g.watchingPage = maxPage;
    }

    const data = g.statusful
        // @ts-ignore
        .slice()
        .reverse()
        .slice(
            (g.watchingPage - 1) * WATCHING_PAGE_SIZE,
            g.watchingPage * WATCHING_PAGE_SIZE
        );

    return {
        maxPage,
        data,
    };
});
