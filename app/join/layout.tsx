export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted">
      <div className="mx-auto flex min-h-screen w-full max-w-app-frame flex-col justify-center bg-background">
        {children}
      </div>
    </div>
  );
}
