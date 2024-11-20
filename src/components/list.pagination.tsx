export function ListPagination({
    page,
    max,
    onclick,
}: {
    page: number | null;
    max: number;
    onclick: (page: number) => void;
}) {
    if (page === null) {
        return null;
    }

    const size = 6;
    const left = 1;
    const right = size - left;
    const jump = right - 1;

    let start = Math.min(
        page < size
            ? 1
            : Math.ceil((page - right) / jump) * jump - jump + right,
        max + 1 - size
    );

    const values = new Array<number>(start < 1 ? size - 1 + start : size);

    if (start < 1) {
        start = 1;
    }

    for (let i = 0; i < values.length; i++) {
        values[i] = start + i;
    }

    return (
        <div className="list-pagination">
            {values.map((value) => (
                <button
                    children={value}
                    disabled={value === page}
                    className={(value === page && "active") || undefined}
                    onclick={() => {
                        onclick(value);
                    }}
                />
            ))}
        </div>
    );
}
