const LSK_EP_CACHE = "epcache";
const SER_VERSION = "v1.";
const EPISODE_CACHE_MAX_SIZE = 256;

export const episodeCache = load() as [string, number][] & {
    get(id: string): number | undefined;
    add(id: string, ep: number): void;
};

episodeCache.get = (id) => {
    return episodeCache.find((item) => item[0] === id)?.[1];
};

episodeCache.add = (id, ep) => {
    for (const item of episodeCache) {
        if (item[0] === id) {
            item[1] = ep;
            dump();
            return;
        }
    }
    if (episodeCache.length > EPISODE_CACHE_MAX_SIZE) {
        episodeCache.shift();
    }
    episodeCache.push([id, ep]);
    dump();
};

function load() {
    try {
        const raw = localStorage.getItem(LSK_EP_CACHE);
        return raw ? deserialize(raw) : [];
    } catch {
        return [];
    }
}

function dump() {
    localStorage.setItem(LSK_EP_CACHE, serialize(episodeCache));
}

function serialize(value: [string, number][]) {
    let result = SER_VERSION;

    for (const [id, ep] of value) {
        result += id + "\n" + ep + "\n\n";
    }

    return result.slice(0, -2);
}

function deserialize(value: string) {
    if (!value.startsWith(SER_VERSION)) {
        return [];
    }

    const values = value.replace(SER_VERSION, "").split("\n\n");
    const result: [string, number][] = new Array(values.length);

    for (let i = 0; i < values.length; i++) {
        const [id, ep] = values[i].split("\n");
        result[i] = [id, Number(ep)];
    }

    return result;
}
