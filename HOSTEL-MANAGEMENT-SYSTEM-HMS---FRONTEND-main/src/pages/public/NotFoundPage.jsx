import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-white px-4 py-16">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#1F6F7A]">
          404
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#1A2A30]">
          Page not found
        </h1>

        <p className="mt-3 text-sm text-[#6B7A85]">
          The page you are looking for does not exist.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-[linear-gradient(135deg,#1F6F7A,#2FA8B8)] px-5 text-sm font-medium text-white shadow-md transition hover:opacity-95"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
