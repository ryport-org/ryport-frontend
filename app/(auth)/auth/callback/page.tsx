export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-line border-t-sky" />
        <p className="text-sm text-mist">Completing sign-in…</p>
      </div>
    </div>
  );
}
