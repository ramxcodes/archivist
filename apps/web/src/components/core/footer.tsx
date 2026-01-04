"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const year = 2026;

  return (
    <footer className="mt-20 md:mt-32 py-8 border-t border-[#2A2B2F]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4">
          {/* Main footer text */}
          <p className="text-gray-600 text-[9px] md:text-[10px] uppercase font-bold tracking-[0.3em] md:tracking-[0.4em] text-center">
            Archivist &copy; {year}
          </p>

          {/* Built by section */}
          <div className="group flex items-center gap-2">
            <Image
              className="hidden size-12 rounded-2xl border border-gray-400 group-hover:border-2 md:block"
              src="/ram.png"
              width={48}
              height={48}
              alt="Ram"
            />
            <p className="opacity-50 transition-all duration-300 ease-in-out group-hover:opacity-100 text-gray-400 text-sm">
              <Link target="_blank" href="https://www.ramx.in">
                Built with ❤️{" "}
                <span className="transition-all duration-300 ease-in-out group-hover:underline">
                  Ram
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
