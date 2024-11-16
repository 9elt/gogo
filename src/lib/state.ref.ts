import { State, type Sub } from "@9elt/miniframe";

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
        this.refs.push(this.ref.sub(f));
        return f;
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
