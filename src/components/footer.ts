import type { MiniElement } from "@9elt/miniframe";
import { GOGO_URL } from "../lib/gogo";

export const Footer: MiniElement = {
    tagName: "footer",
    children: [
        // @ts-ignore
        {
            tagName: "small",
            children: [
                "This is an alternative client for ",
                {
                    tagName: "a",
                    href: GOGO_URL,
                    children: ["gogoanime"],
                },
            ],
        },
    ],
};
