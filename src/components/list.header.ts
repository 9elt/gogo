import type { MiniElement } from "@9elt/miniframe";

export function ListHeader(
    Title: MiniElement,
    Pagination: MiniElement
): MiniElement {
    return {
        tagName: "div",
        className: "list-header",
        children: [
            {
                tagName: "h3",
                children: [Title],
            },
            Pagination,
        ],
    };
}
