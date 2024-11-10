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
        href: string;
        episode: number;
        title: string;
    }>(items.length);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const title = item.querySelector(".name")?.textContent;

        const href = item.querySelector("img")?.src;

        const episode = item
            .querySelector(".episode")
            ?.textContent
            ?.replace("Episode ", "");

        if (!title || !href || !episode) {
            console.warn('failed to parse item', item);
            continue;
        }

        result[i] = {
            href: href!,
            episode: parseInt(episode!),
            title: title!,
        };
    }

    return result;
}
