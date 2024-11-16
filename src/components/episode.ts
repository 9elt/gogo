import type { MiniElement } from "@9elt/miniframe";
import {
    EpisodeDetails,
    EpisodeDetailsLoading,
} from "../components/episode.details";
import {
    EpisodePlayer,
    EpisodePlayerLoading,
} from "../components/episode.player";
import { details, episode, episodeNumber, statusful } from "../global";
import { StateRef } from "../lib/state.ref";

const statusfulRef = new StateRef(statusful);
const episodeNumberRef = new StateRef(episodeNumber);

export const Episode: MiniElement[] = [
    // @ts-ignore
    details.as((_details) => {
        statusfulRef.clear();
        episodeNumberRef.clear();

        return _details
            ? EpisodeDetails(_details, statusfulRef, episodeNumberRef)
            : EpisodeDetailsLoading;
    }),
    // @ts-ignore
    episode.as((_episode) =>
        _episode === -1
            ? null
            : _episode
              ? EpisodePlayer(_episode)
              : EpisodePlayerLoading
    ),
];
