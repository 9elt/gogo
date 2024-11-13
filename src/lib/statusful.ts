const LSK_STATUSFUL = "statusful";
const SER_VERSION = "v1.";

export enum Status {
    Watching,
};

export type Statusful = {
    title: string;
    urlTitle: string;
    image: string;
    status: Status;
};

export function loadStatusful() {
    try {
        const raw = localStorage.getItem(LSK_STATUSFUL);
        return raw ? deserialize(raw) : [];
    }
    catch {
        return [];
    }
}

export function dumpStatusful(value: Statusful[]) {
    localStorage.setItem(LSK_STATUSFUL, serialize(value));
}

export function serialize(values: Statusful[]) {
    let result = SER_VERSION;

    for (const value of values) {
        result += value.title
            + "\n"
            + value.urlTitle
            + "\n"
            + value.image
            + "\n"
            + value.status
            + "\n\n";
    }

    return result.slice(0, -2);
}

function deserialize(value: string): Statusful[] {
    if (!value.startsWith(SER_VERSION)) {
        return [];
    }

    const values = value.replace(SER_VERSION, "").split("\n\n");
    const result = new Array<Statusful>(values.length);

    for (let i = 0; i < values.length; i++) {
        let [title, urlTitle, image, status] = values[i].split("\n");

        if (!title || !urlTitle || !image || !status) {
            console.warn("failed to parse statusful item", values[i]);
            continue;
        }

        result[i] = {
            title,
            urlTitle,
            image,
            status: Number(status) as Status,
        };
    }

    return result;
}
