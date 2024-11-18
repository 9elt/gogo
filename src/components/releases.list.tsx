import { type MiniElement } from "@9elt/miniframe";
import { releasesPage, statusful } from "../global";
import type { Release } from "../lib/gogo";
import { StateRef } from "../lib/state.ref";
import { randomDelay } from "../util";
import { Card } from "./card";
import { ListPagination } from "./list.pagination";

const statusfulRef = new StateRef(statusful);

const ReleasesPagination = releasesPage.as((_page) => (
    <ListPagination
        page={_page}
        max={99}
        onclick={(page) => {
            releasesPage.value = page;
        }}
    />
));

export function ReleasesList(_releases: Release[]): MiniElement {
    statusfulRef.clear();

    return (
        <div className="releases-list">
            <div className="list-header">
                <h3>Recent Releases</h3>
                {ReleasesPagination}
            </div>
            <div className="card-list">
                {_releases.map((_entry) => (
                    <Card entry={_entry} statusful={statusfulRef} />
                ))}
            </div>
            <div className="list-footer">{ReleasesPagination}</div>
        </div>
    );
}

const LoadingPagination = (
    <ListPagination page={1} max={6} onclick={() => {}} />
);

export const ReleasesLoading: MiniElement = (
    <div className="loading">
        <div className="list-header">
            <h3>Recent Releases</h3>
            {LoadingPagination}
        </div>
        <div className="card-list">
            {new Array(8).fill(0).map(() => (
                <div
                    className="card loading"
                    style={{
                        animationDelay: randomDelay(),
                    }}
                />
            ))}
        </div>
        <div className="list-footer">{LoadingPagination}</div>
    </div>
);
