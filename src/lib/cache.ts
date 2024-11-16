const CACHE_MAX_SIZE = 64;

export const cache = [] as unknown as {
    id: string;
    data: any;
}[] & {
    get(id: string): any;
    add(id: string, data: any): void;
};

cache.add = (id, data) => {
    cache.push({ id, data });
    if (cache.length > CACHE_MAX_SIZE) {
        cache.shift();
    }
};

cache.get = (id) => {
    for (let i = cache.length - 1; i >= 0; i--) {
        if (cache[i].id === id) {
            return cache[i].data;
        }
    }
    return null;
};

const PREFETCHER_MAX_SIZE = 8;

export const prefetcher = [] as unknown as {
    id: string;
    data: Promise<any>;
}[] & {
    get(id: string): any;
    add(id: string, data: Promise<any>): void;
};

prefetcher.add = (id, data) => {
    prefetcher.push({ id, data });
    if (prefetcher.length > PREFETCHER_MAX_SIZE) {
        prefetcher.shift();
    }
};

prefetcher.get = (id) => {
    for (let i = prefetcher.length - 1; i >= 0; i--) {
        if (prefetcher[i].id === id) {
            return prefetcher[i].data;
        }
    }
    return null;
};
