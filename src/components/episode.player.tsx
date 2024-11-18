import { State, createNode, type MiniElement } from "@9elt/miniframe";
import type { Episode } from "../lib/gogo";

const LSK_SERVER = "server";

export function EpisodePlayer(_episode: Episode): MiniElement {
    const lastServer = localStorage.getItem(LSK_SERVER);

    const src = new State(
        _episode.links.find((item) => item.server === lastServer)?.href ||
            _episode.links[0].href
    );

    const iframe = createNode(<iframe className="player-iframe" src={src} />);

    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("marginwidth", "0");
    iframe.setAttribute("marginheight", "0");
    iframe.setAttribute("scrolling", "no");

    return (
        <div className="player">
            {iframe}
            <div className="player-server-list">
                <small>servers</small>
                {_episode.links.map((item) => (
                    <button
                        className={src.as(
                            (src) => src === item.href && "active"
                        )}
                        onclick={() => {
                            src.value = item.href;
                            localStorage.setItem(LSK_SERVER, item.server);
                        }}
                    >
                        {item.server}
                    </button>
                ))}
            </div>
        </div>
    );
}

export const EpisodePlayerLoading = (
    <div className="player loading">
        <div className="player-iframe" />
        <div className="player-server-list">
            <small>servers</small>
            <button>vidcdn</button>
            <button>streamwish</button>
            <button>hydrax</button>
            <button>mp4upload</button>
        </div>
    </div>
);
