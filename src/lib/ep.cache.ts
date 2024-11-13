const LSK_EP_CACHE = "epcache";
const CACHE_MAX_SIZE = 64;

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
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}

function dumpEpCache() {
    localStorage.setItem(LSK_EP_CACHE, JSON.stringify(epCache));
}
