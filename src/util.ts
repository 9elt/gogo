export const isMobile = matchMedia("(max-width: 768px)").matches;

export function randomDelay() {
    return (Math.random() * 300).toFixed(0) + "ms";
}

export function debounce<F extends (...args: any[]) => any>(
    f: F,
    ms: number
): F {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function (...args: any[]) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            f(...args);
            timeout = null;
        }, ms);
    } as F;
}
