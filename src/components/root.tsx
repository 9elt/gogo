import { Search } from "../components/search";
import { Route, episodeNumber, route, urlTitle } from "../global";
import { GOGO_URL } from "../lib/gogo";
import { Episode } from "./episode";
import { Home } from "./home";
import { Logo } from "./logo";

export const Root = (
    <div id="root">
        <header>
            <div>
                <button
                    className="logo"
                    onclick={() => {
                        if (route.value !== Route.Home) {
                            urlTitle.value = null;
                            episodeNumber.value = null;
                        }
                    }}
                >
                    {Logo}
                </button>
                {Search}
            </div>
        </header>
        <main>
            {route.as((route) => {
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
            })}
        </main>
        <footer>
            <small>
                This is an alternative client for{" "}
                <a href={GOGO_URL}>gogoanime</a>
            </small>
        </footer>
    </div>
);
