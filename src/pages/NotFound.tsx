import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center px-4 max-w-lg">
        <h1 className="text-h1 mb-4">404</h1>
        <p className="text-body-lg text-muted-foreground mb-4">Oops! Page not found</p>
        <p className="text-sm text-muted-foreground mb-4">
          This site uses hash links. Use <code className="bg-background px-1 rounded text-xs">#/about</code> style URLs
          (e.g. <code className="bg-background px-1 rounded text-xs">#/events</code>,{" "}
          <code className="bg-background px-1 rounded text-xs">#/admin</code>,{" "}
          <code className="bg-background px-1 rounded text-xs">#/admin/events</code>), not{" "}
          <code className="bg-background px-1 rounded text-xs">/about</code> alone in the address bar.
        </p>
        <p className="text-xs text-muted-foreground mb-2">
          React route: <code className="bg-background px-1 rounded break-all">{location.pathname || "/"}</code>
        </p>
        <p className="text-xs text-amber-800 dark:text-amber-200 mb-6 max-w-md mx-auto">
          If a link 404s, your live site may be an <strong>old build</strong>. Run{" "}
          <code className="px-1 rounded bg-background">npm run build</code> then deploy, then hard-refresh (Ctrl+Shift+R).
          Staff manage events at <Link to="/admin/events" className="underline font-medium">#/admin/events</Link> (admin API
          key).
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mb-6">
          <Link
            to="/"
            className="inline-flex justify-center px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90"
          >
            Return to Home
          </Link>
          <Link to="/events" className="inline-flex justify-center px-4 py-2 rounded-xl border border-border font-medium hover:bg-muted">
            Events
          </Link>
          <Link to="/admin" className="inline-flex justify-center px-4 py-2 rounded-xl border border-border font-medium hover:bg-muted">
            Staff tools
          </Link>
          <Link
            to="/admin/events"
            className="inline-flex justify-center px-4 py-2 rounded-xl border border-border font-medium hover:bg-muted"
          >
            Events admin
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
