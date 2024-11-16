import { AsyncState } from "./async.state";

type ToString = { toString: () => string };

export class UrlState<T extends ToString> extends AsyncState<T | null> {
    constructor(key: string, as: (value: string) => T | null) {
        const query = new URLSearchParams(window.location.search).get(key);
        super(query !== null ? as(query) : null);

        this.sub((value, prevValue) => {
            if (value !== prevValue) {
                const url = window.location.origin + window.location.pathname;
                const params = new URLSearchParams(window.location.search);

                value === null
                    ? params.delete(key)
                    : params.set(key, value.toString());

                const search = params.toString();

                window.history.pushState(
                    {},
                    "",
                    search ? url + "?" + search : url
                );
            }
        });

        window.addEventListener("popstate", () => {
            const query = new URLSearchParams(window.location.search).get(key);
            this.value = query !== null ? as(query) : null;
        });
    }
}
