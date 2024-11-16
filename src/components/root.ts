import type { MiniElement } from "@9elt/miniframe";
import { Route, route } from "../global";
import { Episode } from "./episode";
import { Footer } from "./footer";
import { Header } from "./header";
import { Home } from "./home";

export const Root: MiniElement = {
    tagName: "div",
    id: "root",
    children: [
        // @ts-ignore
        Header,
        // @ts-ignore
        {
            tagName: "main",
            children: route.as((route) => {
                route === Route.Episode &&
                    setTimeout(
                        () =>
                            scrollTo({
                                top: 0,
                                behavior: "smooth",
                            }),
                        50
                    );

                return route === Route.Home ? Home : Episode;
            }),
        },
        // @ts-ignore
        Footer,
    ],
};
