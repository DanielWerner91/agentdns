export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse [animation-delay:150ms]" />
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse [animation-delay:300ms]" />
      </div>
    </div>
  );
}
