import type { MiniElement } from "@9elt/miniframe";
import { Details, EpisodePlayer } from "../components/details";
import { Loading } from "../components/loading";
import { Releases, ReleasesLoading } from "../components/releases";
import { Search } from "../components/search";
import { Route, details, episode, episodeNumber, releases, route, statusful, urlTitle, watching } from "../global";
import { StateRef } from "../lib/states";
import { Watching } from "./watching";

const Home = [
    watching.as((watching) =>
        watching.data.length > 0 && Watching(watching)
    ),
    releases.as((_releases) =>
        _releases
            ? Releases(_releases)
            : ReleasesLoading
    ),
];

const statusfulRef = new StateRef(statusful);
const episodeNumberRef = new StateRef(episodeNumber);

const Player = [
    details.as((_details) => {
        statusfulRef.clear();
        episodeNumberRef.clear();

        return _details
            ? Details(_details, statusfulRef, episodeNumberRef)
            : Loading;
    }),
    episode.as((_episode) => _episode
        ? EpisodePlayer(_episode)
        : Loading
    ),
];

const Logo = `\
<svg viewBox="0 0 305 91" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M110.458 4C100.458 4 91.1704 13.213 79.9578 33C71.4578 48 68.9578 74.5 76.4578 82C83.9578 89.5 99.9578 90.5 111.958 90.5C123.958 90.5 135.458 90.5 143.958 83C152.458 75.5 148.958 45.5 137.958 27.5C126.958 9.5 118.958 4 110.458 4ZM110.458 15.5C103.958 15.5 92.9051 31 88.9578 41C80.4709 62.5 81.9578 71 85.4578 75C88.9578 79 107.958 79.5 111.958 79.5C115.958 79.5 133.958 78 135.958 75C137.958 72 140.208 59.5 130.958 41C127.458 34 117.958 15.5 110.458 15.5Z"/>
<path d="M55.724 0.0130428C48.524 -0.386957 48.3907 8.51304 49.224 13.013C35.224 21.013 13.224 43.013 3.22398 68.013C-6.77602 93.013 9.22398 89.513 14.224 89.513C19.224 89.513 49.224 89.013 55.724 89.513C62.224 90.013 66.724 83.513 63.224 64.513C59.724 45.513 44.724 59.013 37.224 69.513C29.724 80.013 38.724 74.513 42.724 72.513C46.724 70.513 51.224 66.513 55.724 71.013C60.224 75.513 56.724 88.513 29.224 81.013C1.72399 73.513 30.724 42.513 38.724 32.013C46.724 21.513 53.724 26.513 57.724 26.513C61.724 26.513 63.224 20.013 63.224 16.513C63.224 13.013 64.724 0.513043 55.724 0.0130428Z"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M266.458 4C256.458 4 247.17 13.213 235.958 33C227.458 48 224.958 74.5 232.458 82C239.958 89.5 255.958 90.5 267.958 90.5C279.958 90.5 291.458 90.5 299.958 83C308.458 75.5 304.958 45.5 293.958 27.5C282.958 9.5 274.958 4 266.458 4ZM266.458 15.5C259.958 15.5 248.905 31 244.958 41C236.471 62.5 237.958 71 241.458 75C244.958 79 263.958 79.5 267.958 79.5C271.958 79.5 289.958 78 291.958 75C293.958 72 296.208 59.5 286.958 41C283.458 34 273.958 15.5 266.458 15.5Z"/>
<path d="M211.724 0.0130428C204.524 -0.386957 204.391 8.51304 205.224 13.013C191.224 21.013 169.224 43.013 159.224 68.013C149.224 93.013 165.224 89.513 170.224 89.513C175.224 89.513 205.224 89.013 211.724 89.513C218.224 90.013 222.724 83.513 219.224 64.513C215.724 45.513 200.724 59.013 193.224 69.513C185.724 80.013 194.724 74.513 198.724 72.513C202.724 70.513 207.224 66.513 211.724 71.013C216.224 75.513 212.724 88.513 185.224 81.013C157.724 73.513 186.724 42.513 194.724 32.013C202.724 21.513 209.724 26.513 213.724 26.513C217.724 26.513 219.224 20.013 219.224 16.513C219.224 13.013 220.724 0.513043 211.724 0.0130428Z"/>
</svg>\
`;

const Header = {
    tagName: "header",
    children: [
        {
            tagName: "div",
            children: [
                // @ts-ignore
                {
                    tagName: "button",
                    className: "logo",
                    innerHTML: Logo,
                    onclick: () => {
                        if (route.value !== Route.Home) {
                            urlTitle.value = null;
                            episodeNumber.value = null;
                        }
                    },
                },
                Search,
            ]
        }
    ],
}

export const Root: MiniElement = {
    tagName: "div",
    id: "root",
    children: [
        // @ts-ignore
        Header,
        // @ts-ignore
        {
            tagName: "main",
            children: route.as((route) =>
                route === Route.Home ? Home : Player
            )
        }
    ],
};
