import { BottomNav } from "@/components/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted">
      <div className="mx-auto flex min-h-screen w-full max-w-app-frame flex-col bg-background">
        <div className="flex-1 pb-16">{children}</div>
        <BottomNav />
      </div>
    </div>
  );
}
