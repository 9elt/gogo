const LSK_EP_CACHE = "epcache";
const SER_VERSION = "v1.";
const CACHE_MAX_SIZE = 256;

export const epCache = loadEpCache() as [string, number][] & {
    get(id: string): number | undefined;
    add(id: string, ep: number): void;
};

epCache.get = (id) => {
    return epCache.find((item) => item[0] === id)?.[1];
};

epCache.add = (id, ep) => {
    for (const item of epCache) {
        if (item[0] === id) {
            item[1] = ep;
            dumpEpCache();
            return;
        }
    }
    if (epCache.length > CACHE_MAX_SIZE) {
        epCache.shift();
    }
    epCache.push([id, ep]);
    dumpEpCache();
};

function loadEpCache() {
    try {
        const raw = localStorage.getItem(LSK_EP_CACHE);
        return raw ? deserialize(raw) : [];
    } catch {
        return [];
    }
}

function dumpEpCache() {
    localStorage.setItem(LSK_EP_CACHE, serialize(epCache));
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
