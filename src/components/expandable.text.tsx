import { State } from "@9elt/miniframe";

export function ExpandableText({
    text,
    limit,
}: {
    text: string;
    limit: number;
}) {
    if (text.length <= limit) {
        return <span>{text}</span>;
    }

    const isOpen = new State(false);

    const onclick = () => {
        isOpen.value = !isOpen.value;
    };

    return (
        <span>
            {isOpen.as((isOpen) => (isOpen ? text : text.slice(0, limit)))}
            <small
                style={{
                    color: "#666",
                    cursor: "pointer",
                }}
                tabIndex={0}
                onclick={onclick}
                onkeydown={(e: KeyboardEvent) => {
                    e.key === "Enter" && onclick();
                }}
            >
                {isOpen.as((isOpen) => (isOpen ? " close" : "..."))}
            </small>
        </span>
    );
}
