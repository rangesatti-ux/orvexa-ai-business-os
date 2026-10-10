import { useEffect, useState } from "react";

import api from "../../services/api";

import DepartmentForm from "./DepartmentForm";
import DepartmentTable from "./DepartmentTable";

function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/departments/");

      setDepartments(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Failed to load departments:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load departments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const saveDepartment = async (department) => {
    try {
      setSaving(true);
      setError("");

      if (editingDepartment) {
        const response = await api.put(
          `/departments/${editingDepartment.id}`,
          department
        );

        setDepartments((previous) =>
          previous.map((item) =>
            item.id === editingDepartment.id
              ? response.data
              : item
          )
        );

        setEditingDepartment(null);
      } else {
        const response = await api.post(
          "/departments/",
          department
        );

        setDepartments((previous) => [
          response.data,
          ...previous,
        ]);
      }
    } catch (err) {
      console.error("Failed to save department:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to save department."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteDepartment = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/departments/${id}`);

      setDepartments((previous) =>
        previous.filter((department) => department.id !== id)
      );

      if (editingDepartment?.id === id) {
        setEditingDepartment(null);
      }
    } catch (err) {
      console.error("Failed to delete department:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to delete department."
      );
    }
  };

  const activeDepartments = departments.filter(
    (department) =>
      department.status?.toLowerCase() === "active"
  ).length;

  const inactiveDepartments = departments.filter(
    (department) =>
      department.status?.toLowerCase() === "inactive"
  ).length;

  const departmentManagers = departments.filter(
    (department) =>
      department.manager_name?.trim()
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Department Management
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Manage your organization's departments.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDepartments}
          disabled={loading}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="font-bold"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-sm">
          <p className="text-sm font-medium opacity-90">
            Total Departments
          </p>

          <p className="mt-2 text-3xl font-bold">
            {departments.length}
          </p>
        </div>

        <div className="rounded-2xl bg-green-600 p-5 text-white shadow-sm">
          <p className="text-sm font-medium opacity-90">
            Active Departments
          </p>

          <p className="mt-2 text-3xl font-bold">
            {activeDepartments}
          </p>
        </div>

        <div className="rounded-2xl bg-yellow-500 p-5 text-white shadow-sm">
          <p className="text-sm font-medium opacity-90">
            Inactive Departments
          </p>

          <p className="mt-2 text-3xl font-bold">
            {inactiveDepartments}
          </p>
        </div>

        <div className="rounded-2xl bg-purple-600 p-5 text-white shadow-sm">
          <p className="text-sm font-medium opacity-90">
            Assigned Managers
          </p>

          <p className="mt-2 text-3xl font-bold">
            {departmentManagers}
          </p>
        </div>
      </div>

      <DepartmentForm
        saveDepartment={saveDepartment}
        editingDepartment={editingDepartment}
        onCancel={() => setEditingDepartment(null)}
      />

      {saving && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
          Saving department...
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-gray-600 dark:text-slate-300">
            Loading departments...
          </p>
        </div>
      ) : (
        <DepartmentTable
          departments={departments}
          deleteDepartment={deleteDepartment}
          editDepartment={setEditingDepartment}
        />
      )}
    </div>
  );
}

export default DepartmentPage;