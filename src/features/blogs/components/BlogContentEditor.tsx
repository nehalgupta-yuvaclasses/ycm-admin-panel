import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

const BlogEditor = lazy(() => import("./BlogEditor"));

interface BlogContentEditorProps {
  content: Record<string, any>;
  onChange: (content: Record<string, any>) => void;
  isPreview: boolean;
}

export function BlogContentEditor({ content, onChange, isPreview }: BlogContentEditorProps) {
  if (isPreview) {
    return (
      <div className="blog-preview rounded-2xl border border-border/60 bg-background px-6 py-8 lg:px-8 lg:py-10">
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: renderPreviewContent(content),
          }}
        />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[32rem] items-center justify-center rounded-2xl border border-border/60 bg-muted/20">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading editor...
          </div>
        </div>
      }
    >
      <BlogEditor content={content} onChange={onChange} />
    </Suspense>
  );
}

function renderPreviewContent(json: Record<string, any>): string {
  if (!json || !json.content) {
    return "<p style='color:var(--muted-foreground); opacity:0.55;'>Start writing to preview the post here.</p>";
  }

  function renderNode(node: any): string {
    if (node.type === "text") {
      let text = escapeHtml(node.text || "");

      if (node.marks) {
        for (const mark of node.marks) {
          switch (mark.type) {
            case "bold":
              text = `<strong>${text}</strong>`;
              break;
            case "italic":
              text = `<em>${text}</em>`;
              break;
            case "underline":
              text = `<u>${text}</u>`;
              break;
            case "link":
              text = `<a href="${escapeHtml(mark.attrs?.href || "")}" target="_blank" rel="noopener noreferrer">${text}</a>`;
              break;
          }
        }
      }

      return text;
    }

    const children = (node.content || []).map(renderNode).join("");

    switch (node.type) {
      case "doc":
        return children;
      case "paragraph":
        return `<p>${children}</p>`;
      case "heading":
        return `<h${node.attrs?.level || 2}>${children}</h${node.attrs?.level || 2}>`;
      case "bulletList":
        return `<ul>${children}</ul>`;
      case "orderedList":
        return `<ol>${children}</ol>`;
      case "listItem":
        return `<li>${children}</li>`;
      case "blockquote":
        return `<blockquote>${children}</blockquote>`;
      case "codeBlock":
        return `<pre><code>${children}</code></pre>`;
      case "image":
        return `<img src="${escapeHtml(node.attrs?.src || "")}" alt="${escapeHtml(node.attrs?.alt || "")}" />`;
      case "horizontalRule":
        return "<hr />";
      default:
        return children;
    }
  }

  return renderNode(json);
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}
