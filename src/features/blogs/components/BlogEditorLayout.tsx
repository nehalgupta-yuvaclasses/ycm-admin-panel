import type { ReactNode } from "react";

interface BlogEditorLayoutProps {
  navigationRail?: ReactNode;
  children: ReactNode;
  settingsPanel: ReactNode;
}

export function BlogEditorLayout({ navigationRail, children, settingsPanel }: BlogEditorLayoutProps) {
  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background">
      {navigationRail ? (
        <aside className="hidden xl:flex h-full min-h-0 w-72 shrink-0 border-r border-border/60 bg-muted/20">
          <div className="h-full w-full overflow-y-auto">{navigationRail}</div>
        </aside>
      ) : null}

      <main className="min-w-0 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {children}
      </main>

      <aside className="hidden xl:flex h-full min-h-0 w-[26rem] shrink-0 border-l border-border/60 bg-background">
        <div className="h-full w-full overflow-y-auto">{settingsPanel}</div>
      </aside>
    </div>
  );
}
