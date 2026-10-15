import ReactMarkdown from "react-markdown";

interface TableBlock {
    type: "table";
    headers: string[];
    alignments: Array<"left" | "center" | "right">;
    rows: string[][];
}

interface MarkdownBlock {
    type: "markdown";
    content: string;
}

type Block = TableBlock | MarkdownBlock;

function parseRow(line: string): string[] {
    let trimmed = line.trim();
    if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
    if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
    return trimmed.split("|").map((c) => c.trim());
}

function isTableSeparator(line: string): boolean {
    if (!line.includes("-")) return false;
    const cells = parseRow(line);
    return cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c));
}

function isTableRow(line: string): boolean {
    return line.trim().startsWith("|") || line.includes("|");
}

function parseMarkdownBlocks(text: string): Block[] {
    const lines = text.split("\n");
    const blocks: Block[] = [];
    let textBuffer: string[] = [];
    let i = 0;

    const flushText = () => {
        if (textBuffer.length > 0) {
            blocks.push({ type: "markdown", content: textBuffer.join("\n") });
            textBuffer = [];
        }
    };

    while (i < lines.length) {
        const line = lines[i];

        if (isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
            flushText();
            const headers = parseRow(line);
            const sepCells = parseRow(lines[i + 1]);
            const alignments: Array<"left" | "center" | "right"> = sepCells.map((s) => {
                if (s.startsWith(":") && s.endsWith(":")) return "center";
                if (s.endsWith(":")) return "right";
                return "left";
            });

            i += 2;
            const rows: string[][] = [];
            while (i < lines.length && isTableRow(lines[i]) && lines[i].trim().length > 0) {
                if (isTableSeparator(lines[i])) break;
                rows.push(parseRow(lines[i]));
                i++;
            }

            blocks.push({ type: "table", headers, alignments, rows });
        } else {
            textBuffer.push(line);
            i++;
        }
    }

    flushText();
    return blocks;
}

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    if (!content.includes("|")) {
        return <ReactMarkdown>{content}</ReactMarkdown>;
    }

    const blocks = parseMarkdownBlocks(content);

    return (
        <>
            {blocks.map((block, idx) => {
                if (block.type === "markdown") {
                    return <ReactMarkdown key={idx}>{block.content}</ReactMarkdown>;
                }

                return (
                    <table key={idx}>
                        <thead>
                            <tr>
                                {block.headers.map((header, hIdx) => (
                                    <th key={hIdx} style={{ textAlign: block.alignments[hIdx] || "left" }}>
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <>{children}</>,
                                            }}
                                        >
                                            {header}
                                        </ReactMarkdown>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {block.rows.map((row, rIdx) => (
                                <tr key={rIdx}>
                                    {row.map((cell, cIdx) => (
                                        <td key={cIdx} style={{ textAlign: block.alignments[cIdx] || "left" }}>
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ children }) => <>{children}</>,
                                                }}
                                            >
                                                {cell}
                                            </ReactMarkdown>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            })}
        </>
    );
}
