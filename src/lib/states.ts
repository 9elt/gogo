import { State } from "@9elt/miniframe";

type ToString = { toString: () => string; };

export class AsyncState<T> extends State<T> {
    constructor(value: T) {
        super(value);
    }

    asyncAs<C>(fn: (value: T) => Promise<C>) {
        const child = new State<
            | C
            // NOTE: first load
            | undefined
        >(undefined);

        this.sub(async (value) => {
            child.value = await fn(value);
        })(this.value, this.value);

        return child;
    }
}

export class UrlState<T extends ToString> extends AsyncState<T | null> {
    constructor(
        key: string,
        as: ((value: string) => T | null)
    ) {
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
