import { State } from "@9elt/miniframe";
import {
    Episode,
    getDetails,
    getEpisode,
    getReleases,
    getSearch,
    type SearchResult
} from "./lib/gogo";
import { Status, Statusful, dumpStatusful, loadStatusful } from "./lib/statusful";
import { UrlState } from "./lib/url.state";

export const page = new UrlState("page", Number);
page.value ||= 1;

export const releases = page.asyncAs(async (page) =>
    page === null ? [] : await getReleases(page)
);

export const search = new UrlState<string>("search", String);

export const results = search.asyncAs(async (search) =>
    search?.trim() ? await getSearch(search) : null
);

export const urlTitle = new UrlState<string>("title", String);

export const details = urlTitle.asyncAs(async (urlTitle) => {
    const details = urlTitle === null ? null : await getDetails(urlTitle)
    if (details && episodeNumber.value === null) {
        episodeNumber.value = details.episodes[details.episodes.length - 1] || null;
    }
    return details;
});

export const episodeNumber = new State<number | null>(null);

export const episode = new State<Episode | null>(null);
episodeNumber.sub(async (episodeNumber) =>
    episode.value = urlTitle.value && episodeNumber !== null
        ? await getEpisode(urlTitle.value, episodeNumber)
        : null
);

export const statusful = new State(loadStatusful()) as State<Statusful[]> & {
    add: (value: SearchResult, status: Status) => void;
    remove: (value: SearchResult) => void;
};

export { Status };

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
    statusful.value = statusful.value.length > 64
        ? statusful.value.slice(1)
        : statusful.value;
}

statusful.remove = (value) => {
    statusful.value = statusful.value.filter((v) => v.urlTitle !== value.urlTitle);
}
