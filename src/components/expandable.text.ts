import { State } from "@9elt/miniframe";

export function ExpandableText(text: string, limit: number) {
    if (text.length <= limit) {
        return {
            tagName: "span",
            children: [text],
        };
    }

    const isOpen = new State(false);

    return {
        tagName: "span",
        children: [
            isOpen.as((isOpen) =>
                isOpen ? text : text.slice(0, limit)
            ),
            {
                tagName: "small",
                style: {
                    color: "#666",
                    cursor: "pointer",
                },
                onclick: () => {
                    isOpen.value = !isOpen.value;
                },
                children: [
                    isOpen.as(isOpen =>
                        isOpen ? " close" : "..."
                    )
                ],
            }
        ]
    };
}
