"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
            <div className="mx-auto flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-xs font-bold text-white sm:h-9 sm:w-9 sm:text-sm">
                        SC
                    </div>
                    <div>
                        <h1 className="text-sm font-bold leading-none text-neutral-900 sm:text-base">
                            Starlite Toolkit
                        </h1>
                        <p className="mt-0.5 text-[11px] text-neutral-500 sm:text-xs">
                            LMS CSV Engine & Score Regulator
                        </p>
                    </div>
                </div>

                <nav className="grid grid-cols-2 gap-1 rounded-lg bg-neutral-100 p-1 sm:flex sm:w-auto">
                    <Link
                        href="/"
                        className={`rounded-md py-2 px-3 text-center text-xs font-semibold transition ${pathname === "/"
                                ? "bg-white text-neutral-900 shadow-sm"
                                : "text-neutral-600 hover:text-neutral-900"
                            }`}
                    >
                        Question Converter
                    </Link>

                    <Link
                        href="/results"
                        className={`rounded-md py-2 px-3 text-center text-xs font-semibold transition ${pathname === "/results"
                                ? "bg-white text-neutral-900 shadow-sm"
                                : "text-neutral-600 hover:text-neutral-900"
                            }`}
                    >
                        Score Normalizer
                    </Link>
                </nav>
            </div>
        </header>
    );
}