import { State, type Sub } from "@9elt/miniframe";

type ToString = { toString: () => string };

export class AsyncState<T> extends State<T> {
    constructor(value: T) {
        super(value);
    }

    asyncAs<C>(fn: (value: T) => Promise<C>, loadingStatus?: C) {
        const child = new State<
            | C
            // NOTE: First load
            | undefined
        >(undefined);

        this.sub((value) => {
            if (loadingStatus !== undefined) {
                child.value = loadingStatus;
            }
            fn(value).then((value) => (child.value = value));
        })(this.value, this.value);

        return child;
    }
}

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

export class StateRef<T> {
    refs: Sub<T>[];
    constructor(public ref: State<T>) {
        this.refs = [];
    }
    clear() {
        this.refs.forEach((ref) => this.ref.unsub(ref));
        this.refs = [];
    }
    sub(f: Sub<T>) {
        return this.ref.sub(f);
    }
    as<A>(f: (value: T) => A): State<A> {
        const child = new State<A>(f(this.ref.value));

        this.refs.push(
            this.ref.sub((value) => {
                child.value = f(value);
            })
        );

        return child;
    }
}
