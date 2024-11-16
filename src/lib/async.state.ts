import { State } from "@9elt/miniframe";

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
