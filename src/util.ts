export const isMobile = matchMedia("(max-width: 768px)").matches;

export function randomDelay() {
    return (Math.random() * 300).toFixed(0) + "ms";
}
