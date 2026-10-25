import { Check, Copy, Download, Table } from "lucide-react";
import { useState } from "react";
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

const markdownComponents = {
    p: ({ children }: { children?: React.ReactNode }) => (
        <p className="mb-2 last:mb-0 text-xs sm:text-sm leading-relaxed text-slate-800">{children}</p>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
        <strong className="font-semibold text-slate-900">{children}</strong>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
        <ul className="my-2 ml-4 list-disc space-y-1 text-xs sm:text-sm text-slate-800">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
        <ol className="my-2 ml-4 list-decimal space-y-1 text-xs sm:text-sm text-slate-800">{children}</ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => <li className="leading-relaxed">{children}</li>,
    code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
        const isInline = !className;
        return isInline ? (
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs text-slate-800 border border-slate-200">
                {children}
            </code>
        ) : (
            <code className="block overflow-x-auto rounded-md bg-slate-900 p-2.5 font-mono text-xs text-slate-100 my-2">
                {children}
            </code>
        );
    },
    blockquote: ({ children }: { children?: React.ReactNode }) => (
        <blockquote className="my-2 border-l-2 border-slate-400 pl-3 italic text-slate-600 text-xs sm:text-sm bg-slate-50 py-1 rounded-r-sm">
            {children}
        </blockquote>
    ),
};

interface MarkdownRendererProps {
    content: string;
}

function formatCsvCell(cell: string): string {
    const clean = cell.replace(/[*_`]/g, "").trim();
    if (clean.includes(";") || clean.includes("\n") || clean.includes('"')) {
        return `"${clean.replace(/"/g, '""')}"`;
    }
    return clean;
}

function TableRenderer({ block }: { block: TableBlock }) {
    const [copied, setCopied] = useState(false);

    function generateCsv(): string {
        const headerLine = block.headers.map(formatCsvCell).join(";");
        const rowLines = block.rows.map((row) => row.map(formatCsvCell).join(";"));
        return [headerLine, ...rowLines].join("\r\n");
    }

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(generateCsv());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Falha ao copiar CSV:", err);
        }
    }

    function handleDownload() {
        const csv = "\uFEFF" + generateCsv();
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tabela_inventario_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="my-2.5 overflow-hidden rounded-md border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-3 py-1.5 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <Table size={13} className="text-slate-400" />
                    <span>Dados tabulares</span>
                    <span className="text-[10px] text-slate-400">({block.rows.length} linhas)</span>
                </span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-200 hover:text-slate-900 active:scale-95 transition-all duration-150 ease-out cursor-pointer"
                        title="Copiar tabela formatada para Excel/CSV"
                    >
                        {copied ? (
                            <>
                                <Check size={12} className="text-emerald-600 animate-scale-in" />
                                <span className="text-emerald-600 font-medium">Copiado</span>
                            </>
                        ) : (
                            <>
                                <Copy size={12} />
                                <span>Copiar CSV</span>
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-200 hover:text-slate-900 active:scale-95 transition-all duration-150 ease-out cursor-pointer"
                        title="Baixar arquivo .CSV compatível com Excel"
                    >
                        <Download size={12} />
                        <span>Baixar</span>
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-medium">
                            {block.headers.map((header, hIdx) => (
                                <th
                                    key={hIdx}
                                    className="px-3 py-2 font-medium"
                                    style={{ textAlign: block.alignments[hIdx] || "left" }}
                                >
                                    <ReactMarkdown
                                        components={{
                                            p: ({ children }) => <>{children}</>,
                                            strong: ({ children }) => (
                                                <span className="font-semibold text-slate-900">{children}</span>
                                            ),
                                        }}
                                    >
                                        {header}
                                    </ReactMarkdown>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {block.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50/75 transition-colors duration-150 ease-out">
                                {row.map((cell, cIdx) => (
                                    <td
                                        key={cIdx}
                                        className="px-3 py-2 text-slate-700"
                                        style={{ textAlign: block.alignments[cIdx] || "left" }}
                                    >
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <>{children}</>,
                                                strong: ({ children }) => (
                                                    <span className="font-medium text-slate-900">{children}</span>
                                                ),
                                                code: ({ children }) => (
                                                    <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-800 border border-slate-200">
                                                        {children}
                                                    </code>
                                                ),
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
            </div>
        </div>
    );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    if (!content.includes("|")) {
        return <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>;
    }

    const blocks = parseMarkdownBlocks(content);

    return (
        <div className="space-y-2">
            {blocks.map((block, idx) => {
                if (block.type === "markdown") {
                    return (
                        <ReactMarkdown key={idx} components={markdownComponents}>
                            {block.content}
                        </ReactMarkdown>
                    );
                }

                return <TableRenderer key={idx} block={block} />;
            })}
        </div>
    );
}
