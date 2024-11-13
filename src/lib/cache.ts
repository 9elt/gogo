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
