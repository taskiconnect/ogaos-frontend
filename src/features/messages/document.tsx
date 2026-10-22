export type Run = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  link?: string;
};
export type Block = {
  kind: "paragraph" | "heading" | "quote" | "bullet";
  runs: Run[];
};
export type MessageDocument = Block[];
export function safeLink(value: string) {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" && !!u.hostname && !u.username && !u.password
    );
  } catch {
    return false;
  }
}
export function DocumentView({ document }: { document: MessageDocument }) {
  return (
    <div className="space-y-4 break-words leading-7">
      {document.map((b, i) => (
        <div
          key={i}
          className={
            b.kind === "heading"
              ? "text-xl font-semibold"
              : b.kind === "quote"
                ? "border-l-4 border-blue-400 pl-4"
                : ""
          }
        >
          {b.kind === "bullet" && "• "}
          {b.runs.map((r, j) => {
            const text = (
              <span
                className="whitespace-pre-wrap"
                style={{
                  fontWeight: r.bold ? 700 : undefined,
                  fontStyle: r.italic ? "italic" : undefined,
                  textDecoration: [
                    r.underline ? "underline" : "",
                    r.strike ? "line-through" : "",
                  ].join(" "),
                }}
              >
                {r.text}
              </span>
            );
            return r.link && safeLink(r.link) ? (
              <a
                key={j}
                href={r.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {text}
              </a>
            ) : (
              <span key={j}>{text}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
export function formatMessageDate(value: string) {
  const date = new Date(
    value.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00"),
  );
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString("en-NG");
}
