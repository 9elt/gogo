import { State, type MiniElement } from "@9elt/miniframe";
import { Details } from "../components/details";
import { Loading } from "../components/loading";
import { Releases } from "../components/releases";
import { Search } from "../components/search";
import { details, episode, releases } from "../global";

export const Root: MiniElement = {
    tagName: "div",
    id: "root",
    // @ts-ignore
    children: [{
        tagName: "div",
        children: [
            Search,
            State.use({ releases, details, episode }).as((g) =>
                g.episode === undefined
                    || g.details === undefined
                    || g.releases === undefined
                    ? Loading
                    : g.details
                        ? Details(g.details, g.episode)
                        : Releases(g.releases || []),
            ),
        ]
    }],
};
