"use client";

import React, { useState } from "react";

// Dynamic API Base URL for local development and production deployment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ConverterUI() {
    const [subject, setSubject] = useState("MATHEMATICS");
    const [group, setGroup] = useState("THIRD TERM 2025/2026 EXAM QUESTIONS");
    const [mark, setMark] = useState<number>(0.5);
    const [inputMode, setInputMode] = useState<"file" | "text">("file");
    const [rawText, setRawText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleConvert = async () => {
        setError(null);
        if (inputMode === "file" && !file) {
            setError("Please select or drop a .docx document.");
            return;
        }
        if (inputMode === "text" && !rawText.trim()) {
            setError("Please enter or paste your exam text.");
            return;
        }

        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("subject", subject);
        formData.append("question_group", group);
        formData.append("mark", mark.toString());

        if (inputMode === "file" && file) {
            formData.append("file", file);
        } else {
            formData.append("raw_text", rawText);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/convert`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to process request.");
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(
                err.message ||
                "Error connecting to backend server. Ensure backend is running."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith(".docx")) {
                setFile(droppedFile);
                setError(null);
            } else {
                setError("Only .docx files are supported.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-10">
                {/* Navigation / Header */}
                <header className="flex items-center justify-between border-b border-neutral-200/80 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center text-white font-mono font-bold text-sm shadow-sm">
                            LMS
                        </div>
                        <div>
                            <h1 className="text-base font-semibold text-neutral-900 tracking-tight">
                                Question Bank Engine
                            </h1>
                            <p className="text-xs text-neutral-500">
                                Document Parser & UTF-8 Formatter
                            </p>
                        </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                        System Online
                    </span>
                </header>

                {/* Form Container */}
                <main className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] space-y-8">
                    {/* Metadata Section */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                            01 / Metadata Configuration
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                                    Question Group
                                </label>
                                <input
                                    type="text"
                                    value={group}
                                    onChange={(e) => setGroup(e.target.value)}
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                                    Mark Per Item
                                </label>
                                <select
                                    value={mark}
                                    onChange={(e) => setMark(parseFloat(e.target.value))}
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-all cursor-pointer"
                                >
                                    <option value={0.5}>0.5 Marks (Senior)</option>
                                    <option value={0.8}>0.8 Marks (Junior)</option>
                                    <option value={1.0}>1.0 Mark (Standard)</option>
                                    <option value={1.5}>1.5 Marks</option>
                                    <option value={2.0}>2.0 Marks</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="h-[1px] bg-neutral-100" />

                    {/* Input Mode & Document Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                                02 / Source Content
                            </h2>
                            <div className="bg-neutral-100 p-1 rounded-xl flex gap-1 border border-neutral-200/60">
                                <button
                                    onClick={() => setInputMode("file")}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${inputMode === "file"
                                            ? "bg-white text-neutral-900 shadow-sm"
                                            : "text-neutral-500 hover:text-neutral-900"
                                        }`}
                                >
                                    Document (.docx)
                                </button>
                                <button
                                    onClick={() => setInputMode("text")}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${inputMode === "text"
                                            ? "bg-white text-neutral-900 shadow-sm"
                                            : "text-neutral-500 hover:text-neutral-900"
                                        }`}
                                >
                                    Raw Text
                                </button>
                            </div>
                        </div>

                        {inputMode === "file" ? (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${isDragging
                                        ? "border-neutral-900 bg-neutral-50"
                                        : file
                                            ? "border-neutral-300 bg-neutral-50/50"
                                            : "border-neutral-200 hover:border-neutral-300 bg-white"
                                    }`}
                            >
                                <input
                                    type="file"
                                    accept=".docx"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    id="file-input"
                                    className="hidden"
                                />

                                <div className="max-w-xs mx-auto space-y-3">
                                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-600">
                                        📄
                                    </div>
                                    {file ? (
                                        <div>
                                            <p className="text-xs font-semibold text-neutral-900">
                                                {file.name}
                                            </p>
                                            <p className="text-[11px] text-neutral-400 mt-0.5">
                                                {(file.size / 1024).toFixed(1)} KB • Ready to convert
                                            </p>
                                            <label
                                                htmlFor="file-input"
                                                className="inline-block mt-3 text-xs text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
                                            >
                                                Replace file
                                            </label>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-xs font-medium text-neutral-800">
                                                Drag & drop your .docx file here, or{" "}
                                                <label
                                                    htmlFor="file-input"
                                                    className="text-neutral-900 font-semibold underline cursor-pointer"
                                                >
                                                    browse
                                                </label>
                                            </p>
                                            <p className="text-[11px] text-neutral-400 mt-1">
                                                Supports multi-class examination papers
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <textarea
                                rows={7}
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                                placeholder="Paste exam questions, passages, and stanzas here..."
                                className="w-full p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 font-mono text-xs focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-all resize-y"
                            />
                        )}
                    </div>

                    {error && (
                        <div className="p-3.5 bg-neutral-900 text-white rounded-xl text-xs flex items-center justify-between font-mono">
                            <span>
                                <span>⚠️</span> {error}
                            </span>
                            <button
                                onClick={() => setError(null)}
                                className="text-neutral-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={handleConvert}
                        disabled={loading}
                        className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-xl shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 text-xs tracking-wide cursor-pointer flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Parsing & Solving Questions...</span>
                            </>
                        ) : (
                            <span>Convert to LMS CSV Structure →</span>
                        )}
                    </button>
                </main>

                {/* Results Panel */}
                {result && (
                    <section className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-900">
                                    Conversion Complete
                                </h3>
                                <p className="text-xs text-neutral-500">
                                    Processed into comma-safe, UTF-8 CSV assets
                                </p>
                            </div>
                            <div className="flex gap-6">
                                <div>
                                    <span className="block text-[10px] font-mono uppercase text-neutral-400">
                                        Total Items
                                    </span>
                                    <span className="text-sm font-semibold text-neutral-900">
                                        {result.metrics?.total_questions_processed || 0}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-mono uppercase text-neutral-400">
                                        Classes
                                    </span>
                                    <span className="text-sm font-semibold text-neutral-900">
                                        {result.csv_files?.length || 0}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-mono uppercase text-neutral-400">
                                        Corrections
                                    </span>
                                    <span className="text-sm font-semibold text-neutral-900">
                                        {result.metrics?.total_answer_corrections || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Generated CSV Downloads */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                                Generated Datasets
                            </h4>
                            <div className="grid grid-cols-1 gap-2.5">
                                {result.csv_files?.map((item: any, idx: number) => {
                                    // Ensure download URL points to full API path in production
                                    const fullDownloadUrl = item.download_url.startsWith("http")
                                        ? item.download_url
                                        : `${API_BASE_URL}${item.download_url}`;

                                    return (
                                        <div
                                            key={idx}
                                            className="p-3.5 bg-neutral-50 border border-neutral-200/60 rounded-xl flex items-center justify-between"
                                        >
                                            <div>
                                                <span className="text-xs font-medium text-neutral-900 block">
                                                    {item.class_name} Dataset
                                                </span>
                                                <span className="text-[11px] text-neutral-500">
                                                    {item.count} Questions • {mark} Marks each
                                                </span>
                                            </div>
                                            <a
                                                href={fullDownloadUrl}
                                                download
                                                className="px-3 py-1.5 bg-white border border-neutral-200 hover:border-neutral-900 text-neutral-900 text-xs font-medium rounded-lg shadow-sm transition-all"
                                            >
                                                Download CSV
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Audit Log */}
                        {result.audit_summary && result.audit_summary.length > 0 && (
                            <div className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-4 space-y-2">
                                <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                                    Verification & Audit Logs
                                </h4>
                                <ul className="space-y-1 pl-4 list-disc text-xs text-neutral-600 font-mono">
                                    {result.audit_summary.map((log: string, idx: number) => (
                                        <li key={idx}>{log}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}