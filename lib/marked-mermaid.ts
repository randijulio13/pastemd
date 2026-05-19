import { marked } from "marked";

const mermaidExtension = {
    name: "mermaid",
    level: "block" as const,
    start(src: string) {
        const idx = src.indexOf("```mermaid");
        return idx === -1 ? -1 : idx;
    },
    tokenizer(src: string) {
        const match = src.match(/^```mermaid\n([\s\S]*?)```/);
        if (match) {
            return {
                type: "mermaid",
                raw: match[0],
                text: match[1].trimEnd(),
                tokens: [] as never[],
            };
        }
    },
    renderer(token: { text: string }) {
        return `<div class="mermaid">\n${token.text}\n</div>`;
    },
};

marked.use({ extensions: [mermaidExtension] });
