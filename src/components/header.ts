import type { MiniElement } from "@9elt/miniframe";
import { Search } from "../components/search";
import { Route, episodeNumber, route, urlTitle } from "../global";
import { Logo } from "./logo";

export const Header: MiniElement = {
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
            ],
        },
    ],
};
