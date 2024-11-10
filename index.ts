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
        image: string;
        episode: number;
        title: string;
    }>(items.length);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const title = item.querySelector(".name")?.textContent;

        const image = item.querySelector("img")?.src;

        const episode = item
            .querySelector(".episode")
            ?.textContent
            ?.replace("Episode ", "");

        if (!title || !image || !episode) {
            console.warn('failed to parse item', item);
            continue;
        }

        result[i] = {
            image: image!,
            episode: parseInt(episode!),
            title: title!,
        };
    }

    return result;
}
