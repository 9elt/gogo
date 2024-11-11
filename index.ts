const _tmp = document.createElement('div');

async function getRecentRelease(page: number) {
    const raw = await fetch("https://ajax.gogocdn.net/ajax/page-recent-release.html?page=" + page + "&type=1");

    if (!raw.ok) {
        console.log('failed to fetch', raw);
        throw new Error('failed to fetch');
    }

    _tmp.innerHTML = await raw.text();

    const items = _tmp.querySelectorAll(".items>li");

    const result = new Array<{
        title: string;
        href: string;
        image: string;
        episode: number;
    }>(items.length);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const title = item.querySelector(".name")?.textContent;

        const href = item.querySelector("a")?.href;

        const image = item.querySelector("img")?.src;

        const episode = item
            .querySelector(".episode")
            ?.textContent
            ?.replace("Episode ", "");

        if (!title || !href || !image || !episode) {
            console.warn('failed to parse item', item);
            continue;
        }

        result[i] = {
            title,
            href,
            image,
            episode: parseInt(episode),
        };
    }

    return result;
}
