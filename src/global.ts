import {
    getDetails,
    getEpisode,
    getReleases,
    getSearch
} from "./lib/gogo";
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

export const details = urlTitle.asyncAs(async (urlTitle) =>
    urlTitle === null ? null : await getDetails(urlTitle)
);

export const episodeNumber = new UrlState<number>("episode", Number);

export const episode = episodeNumber.asyncAs(async (episodeNumber) =>
    details.value && episodeNumber !== null
        ? await getEpisode(details.value.urlTitle, episodeNumber)
        : null
);
