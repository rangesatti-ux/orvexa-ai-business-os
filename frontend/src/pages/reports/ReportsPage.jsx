import { useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Download,
  Users,
  Package,
  ShoppingCart,
  Wallet,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";

function ReportsPage() {
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");

  const downloadReport = async (
    reportKey,
    endpoint,
    fileName,
    extension
  ) => {
    try {
      setDownloading(reportKey);
      setError("");

      const response = await api.get(endpoint, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.${extension}`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download report:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to download the report. Please try again."
      );
    } finally {
      setDownloading("");
    }
  };

  const reports = [
    {
      key: "employees-pdf",
      title: "Employee PDF Report",
      description:
        "Download a PDF report containing employee information.",
      endpoint: "/reports/employees/pdf",
      fileName: "employees-report",
      extension: "pdf",
      icon: Users,
      type: "PDF",
    },
    {
      key: "employees-excel",
      title: "Employee Excel Report",
      description:
        "Download employee information in Excel format.",
      endpoint: "/reports/employees/excel",
      fileName: "employees-report",
      extension: "xlsx",
      icon: FileSpreadsheet,
      type: "Excel",
    },
    {
      key: "inventory-pdf",
      title: "Inventory PDF Report",
      description:
        "Download a PDF report containing current inventory data.",
      endpoint: "/reports/inventory/pdf",
      fileName: "inventory-report",
      extension: "pdf",
      icon: Package,
      type: "PDF",
    },
    {
      key: "sales-pdf",
      title: "Sales PDF Report",
      description:
        "Download a PDF report containing sales information.",
      endpoint: "/reports/sales/pdf",
      fileName: "sales-report",
      extension: "pdf",
      icon: ShoppingCart,
      type: "PDF",
    },
    {
      key: "payroll-pdf",
      title: "Payroll PDF Report",
      description:
        "Download a PDF report containing payroll information.",
      endpoint: "/reports/payroll/pdf",
      fileName: "payroll-report",
      extension: "pdf",
      icon: Wallet,
      type: "PDF",
    },
  ];

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Reports
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Generate and download business reports.
        </p>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-200"
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          REPORT CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon;

          const isDownloading =
            downloading === report.key;

          return (
            <div
              key={report.key}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              {/* ICON */}

              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Icon size={24} />
                </div>

                <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-slate-800 dark:text-slate-400">
                  {report.type}
                </span>
              </div>

              {/* CONTENT */}

              <div className="mt-5">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {report.title}
                </h2>

                <p className="mt-2 min-h-[42px] text-sm leading-6 text-gray-500 dark:text-slate-400">
                  {report.description}
                </p>
              </div>

              {/* DOWNLOAD */}

              <button
                onClick={() =>
                  downloadReport(
                    report.key,
                    report.endpoint,
                    report.fileName,
                    report.extension
                  )
                }
                disabled={isDownloading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDownloading ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="animate-spin"
                    />

                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={17} />

                    Download Report
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          INFORMATION
      ====================================================== */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
        <div className="flex gap-3">
          <div className="mt-0.5 text-blue-600 dark:text-blue-400">
            <FileText size={20} />
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Reports are generated from live business data
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-slate-400">
              Each report is generated by the Orvexa backend
              using the latest available employee, inventory,
              sales, or payroll data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;