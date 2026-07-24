"use client";

import React, { useState } from "react";

// Dynamic API Base URL configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RegulatedStudent {
    position: number;
    studentName: string;
    registerNo: string;
    originalMark: string;
    originalStatus: string;
    percentage: number;
    regulatedMark: string;
    regulatedStatus: string;
}

export default function ResultNormalizerUI() {
    const [targetBase, setTargetBase] = useState<number>(0);
    const passThreshold = 40;
    const [deduplicate, setDeduplicate] = useState<boolean>(true);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<RegulatedStudent[]>([]);
    const [meta, setMeta] = useState<{ subject: string; class_name: string }>({
        subject: "",
        class_name: "",
    });
    const [metrics, setMetrics] = useState<{
        totalRowsProcessed: number;
        cleanCount: number;
        duplicatesRemoved: number;
        statusCorrections: number;
    } | null>(null);

    const handleNormalize = async () => {
        if (!file) {
            setError("Please select a result file (.csv or .xlsx).");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("target_base", targetBase.toString());
            formData.append("pass_threshold", passThreshold.toString());
            formData.append("deduplicate", deduplicate.toString());

            const res = await fetch(`${API_BASE_URL}/api/v1/normalize-scores`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Failed to process the uploaded file.");
            }

            const data = await res.json();
            setResults(data.students);
            setMetrics(data.metrics);
            if (data.metadata) {
                setMeta({
                    subject: data.metadata.subject || "EXAM RESULT BROADSHEET",
                    class_name: data.metadata.class_name || "",
                });
            }
        } catch (err: any) {
            setError(err.message || "An error occurred while processing the file.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (results.length === 0) return;
        setDownloadingPdf(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/export-results-pdf`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: meta.subject,
                    class_name: meta.class_name,
                    students: results,
                }),
            });

            if (!response.ok) throw new Error("Failed to generate PDF");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            // Smart file naming featuring Subject + Class Name
            const fileSubject = meta.subject ? meta.subject.replace(/[^a-zA-Z0-9]/g, "_") : "Results";
            const fileClass = meta.class_name ? `_${meta.class_name.replace(/[^a-zA-Z0-9]/g, "_")}` : "";

            a.download = `Results_${fileSubject}${fileClass}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            alert("Could not download PDF. Check if backend server is running.");
        } finally {
            setDownloadingPdf(false);
        }
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
            {/* Title Header */}
            <div className="mb-6">
                <h2 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl">
                    Result Normalizer & Broadsheet Engine
                </h2>
                <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                    Clean score scales, remove double submissions, and recalculate pass or fail statuses using a standard 40% pass mark.
                </p>
            </div>

            {/* Options Panel */}
            <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                            Target Score Scale
                        </label>
                        <select
                            value={targetBase}
                            onChange={(e) => setTargetBase(Number(e.target.value))}
                            className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-800 focus:border-black focus:outline-none"
                        >
                            <option value={0}>Auto-Detect Scale</option>
                            <option value={25}>25 Marks (Senior Secondary)</option>
                            <option value={40}>40 Marks (Junior Secondary)</option>
                            <option value={30}>30 Marks (Mid-Term Exam)</option>
                            <option value={100}>100 Marks (Entrance Exam)</option>
                            <option value={50}>50 Marks</option>
                            <option value={20}>20 Marks</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between md:justify-start md:gap-6 pt-2 md:pt-6">
                        <div className="text-xs text-neutral-600">
                            Pass Mark: <span className="font-bold text-neutral-900">40%</span>
                        </div>

                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                type="checkbox"
                                checked={deduplicate}
                                onChange={(e) => setDeduplicate(e.target.checked)}
                                className="h-4 w-4 rounded border-neutral-300 text-black focus:ring-black"
                            />
                            <span className="text-xs font-medium text-neutral-700">
                                Remove Duplicate Submissions
                            </span>
                        </label>
                    </div>
                </div>

                {/* File Picker */}
                <div className="mt-5 border-t border-neutral-100 pt-5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        Upload Result File (.csv / .xlsx)
                    </label>
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="mt-1 block w-full text-xs text-neutral-600 file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-neutral-800 hover:file:bg-neutral-200"
                    />
                </div>

                {error && (
                    <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleNormalize}
                    disabled={loading}
                    className="mt-5 w-full rounded-lg bg-black py-3 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:bg-neutral-400"
                >
                    {loading ? "Processing Results..." : "Process & Normalize Results →"}
                </button>
            </div>

            {/* Metrics Cards */}
            {metrics && (
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-green-700">Clean Records</div>
                        <div className="mt-1 text-xl font-extrabold text-green-900 sm:text-2xl">{metrics.cleanCount}</div>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Duplicates Removed</div>
                        <div className="mt-1 text-xl font-extrabold text-amber-900 sm:text-2xl">{metrics.duplicatesRemoved} Rows</div>
                    </div>
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Statuses Adjusted</div>
                        <div className="mt-1 text-xl font-extrabold text-blue-900 sm:text-2xl">{metrics.statusCorrections} Updated</div>
                    </div>
                </div>
            )}

            {/* Results Table Section */}
            {results.length > 0 && (
                <div className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-neutral-800">
                                {meta.subject ? meta.subject : "Result Sheet"}
                            </h3>
                            {meta.class_name && (
                                <p className="text-xs text-neutral-500">{meta.class_name}</p>
                            )}
                        </div>

                        <button
                            onClick={handleDownloadPDF}
                            disabled={downloadingPdf}
                            className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:bg-neutral-400 shadow-sm"
                        >
                            {downloadingPdf ? "Generating PDF..." : "📄 Download PDF Broadsheet"}
                        </button>
                    </div>

                    <div className="-mx-4 overflow-x-auto sm:mx-0 sm:rounded-xl border border-neutral-200 bg-white shadow-sm">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="border-b border-neutral-200 bg-neutral-50 font-semibold text-neutral-600">
                                <tr>
                                    <th className="p-3 sm:p-4">Pos</th>
                                    <th className="p-3 sm:p-4">Student Name</th>
                                    <th className="p-3 sm:p-4">Register No</th>
                                    <th className="p-3 sm:p-4">Original Mark</th>
                                    <th className="p-3 sm:p-4">Raw %</th>
                                    <th className="p-3 sm:p-4 bg-neutral-100 font-bold text-black">Regulated Mark</th>
                                    <th className="p-3 sm:p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 font-medium">
                                {results.map((st) => (
                                    <tr key={st.registerNo} className="hover:bg-neutral-50">
                                        <td className="p-3 sm:p-4 font-bold text-neutral-500">#{st.position}</td>
                                        <td className="p-3 sm:p-4 font-semibold text-neutral-900">{st.studentName}</td>
                                        <td className="p-3 sm:p-4 text-neutral-500">{st.registerNo}</td>
                                        <td className="p-3 sm:p-4 text-neutral-400 line-through">{st.originalMark}</td>
                                        <td className="p-3 sm:p-4">{st.percentage}%</td>
                                        <td className="p-3 sm:p-4 bg-neutral-50 font-bold text-neutral-900">{st.regulatedMark}</td>
                                        <td className="p-3 sm:p-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${st.regulatedStatus === "Passed"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {st.regulatedStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}