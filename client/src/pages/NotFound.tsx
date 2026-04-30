import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F4F7F6] px-4 py-20">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center rounded-2xl border border-[#E5ECE6] bg-white px-6 py-16 text-center shadow-[0_8px_32px_rgba(0,0,0,0.06)] sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#1F8A84]">
          404 Error
        </p>
        <h1 className="mt-3 text-[2.5rem] font-bold leading-tight text-[#173A39] sm:text-[3rem]">
          This page took a detour
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[#4F5F5B]">
          The page you are looking for is unavailable right now. Continue exploring Sacred Homes and
          find your perfect stay in Varanasi.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild className="h-11 px-6">
            <Link to="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 px-6">
            <Link to="/#homestays">
              <Search className="h-4 w-4" />
              Explore Homestays
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}