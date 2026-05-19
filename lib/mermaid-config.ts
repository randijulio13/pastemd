let initialized = false;

export async function renderMermaid() {
    if (typeof window === "undefined") return;
    if (!document.querySelector(".mermaid")) return;

    const mermaid = (await import("mermaid")).default;

    if (!initialized) {
        mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
        });
        initialized = true;
    }

    try {
        await mermaid.run({ querySelector: ".mermaid" });
    } catch {
        // mermaid handles errors inline in the DOM
    }
}
