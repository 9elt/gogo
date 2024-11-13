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

const IMAGE_URI = "https://gogocdn.net/cover";

export function serialize(values: Statusful[]) {
    let result = SER_VERSION;

    for (const value of values) {
        result += value.title
            + "\n"
            + (value.urlTitle === safeurl(value.title) ? "@T" : value.urlTitle)
            + "\n"
            + value.image
                .replace(IMAGE_URI, "@U")
                .replace(value.urlTitle, "@T")
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

        if (urlTitle === "@T") {
            urlTitle = safeurl(title);
        }

        if (!title || !urlTitle || !image || !status) {
            console.warn("failed to parse statusful item", values[i]);
            continue;
        }

        result[i] = {
            title,
            urlTitle,
            image: image
                .replace("@U", IMAGE_URI)
                .replace("@T", urlTitle),
            status: Number(status) as Status,
        };
    }

    return result;
}

function safeurl(title: string) {
    return title
        .replace(/[^a-z0-9]/gi, "-")
        .replace(/(-)+/g, "-")
        .toLowerCase();
}
