import { JSX } from "@9elt/miniframe/jsx-runtime";
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

export const Episode = (<>
    {details.as((_details) => {
        statusfulRef.clear();
        episodeNumberRef.clear();

        return _details
            ? <EpisodeDetails _details={_details} _statusful={statusfulRef} episodeNumber={episodeNumberRef} />
            : EpisodeDetailsLoading;
    })}
    {episode.as((_episode) =>
        _episode === -1
            ? null
            : _episode
                ? <EpisodePlayer _episode={_episode} />
                : EpisodePlayerLoading
    )}
</>);
