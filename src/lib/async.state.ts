import { State } from "@9elt/miniframe";

type Group = { [key: string]: State<any> };

type Static<T extends State<any>> = T extends State<infer U> ? U : never;

type StaticGroup<T extends Group> = AsyncState<{
    [K in keyof T]: Static<T[K]>;
}>;

export class AsyncState<T> extends State<T> {
    constructor(value: T) {
        super(value);
    }

    static useAsync<T extends Group>(states: T): StaticGroup<T> {
        const group = new AsyncState({}) as unknown as StaticGroup<T>;

        for (const key in states) {
            group.value[key] = states[key].value;
            states[key].sub(
                (current) =>
                    (group.value = Object.assign(group.value, {
                        [key]: current,
                    }))
            );
        }

        return group;
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
