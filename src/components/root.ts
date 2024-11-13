import { State, type MiniElement } from "@9elt/miniframe";
import { Details } from "../components/details";
import { Releases } from "../components/releases";
import { Search } from "../components/search";
import { details, episode, releases } from "../global";

export const Root: MiniElement = {
    tagName: "div",
    // @ts-ignore
    children: [{
        tagName: "div",
        children: [
            Search,
            State.use({ releases, details, episode }).as((g) =>
                g.details
                    ? Details(g.details, g.episode)
                    : Releases(g.releases),
            ),
        ]
    }],
};
