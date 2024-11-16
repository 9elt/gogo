import type { MiniElement } from "@9elt/miniframe";

export function ListFooter(Pagination: MiniElement): MiniElement {
    return {
        tagName: "div",
        className: "list-footer",
        children: [Pagination],
    };
}
