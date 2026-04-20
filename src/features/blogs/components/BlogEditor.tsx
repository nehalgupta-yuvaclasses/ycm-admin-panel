import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Undo,
  Redo,
} from "lucide-react";
import { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BlogEditorProps {
  content: Record<string, any>;
  onChange: (content: Record<string, any>) => void;
  editable?: boolean;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  children,
  title,
  className,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "h-8 w-8 inline-flex items-center justify-center rounded-lg transition-all active:scale-95 disabled:scale-100",
        isActive
          ? "bg-foreground text-background shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
        disabled && "opacity-20 pointer-events-none",
        className
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-4 bg-border/60 mx-1 shrink-0" />;
}

function EditorToolbar({ editor }: { editor: Editor }) {
  const addLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex items-center gap-0.5 border-b border-border/60 bg-background px-3 py-2">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={addLink} isActive={editor.isActive("link")} title="Link">
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>

      <div className="flex-1" />

      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}

export default function BlogEditor({ content, onChange, editable = true }: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline cursor-pointer" },
      }),
      Placeholder.configure({
        placeholder: "Start your story...",
      }),
    ],
    content: content && Object.keys(content).length > 0 ? content : undefined,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[760px] px-0 py-0 text-[17px] leading-relaxed",
      },
    },
  });

  useEffect(() => {
    if (editor && content && Object.keys(content).length > 0) {
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
        editor.commands.setContent(content);
      }
    }
  }, []);

  if (!editor) return null;

  return (
    <div className="blog-editor-wrapper bg-background">
      {editable && (
        <div className="sticky top-0 z-20 border-b border-border/60 bg-background">
          <EditorToolbar editor={editor} />
        </div>
      )}
      <div className="prose-container animate-in fade-in slide-in-from-bottom-2 duration-500 px-6 py-8 lg:px-8 lg:py-10">
        <EditorContent editor={editor} className="tiptap-editor" />
      </div>
    </div>
  );
}
