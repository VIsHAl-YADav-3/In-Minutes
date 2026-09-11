import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

const NotFound = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <Compass className="mb-4 h-14 w-14 text-brand-300" strokeWidth={1.2} />
    <h1 className="font-display text-2xl font-bold text-ink-900">Page not found</h1>
    <p className="mt-1.5 text-sm text-ink-900/50">The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn-primary mt-6">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
