import { State } from "@9elt/miniframe";

export function ExpandableText(text: string, limit: number) {
    if (text.length <= limit) {
        return {
            tagName: "span",
            children: [text],
        };
    }

    const isOpen = new State(false);

    const onclick = () => {
        isOpen.value = !isOpen.value;
    };

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
                tabIndex: 0,
                onclick,
                onkeydown: (e: KeyboardEvent) => {
                    e.key === "Enter" && onclick();
                },
                children: [
                    isOpen.as((isOpen) =>
                        isOpen ? " close" : "..."
                    ),
                ],
            },
        ],
    };
}
