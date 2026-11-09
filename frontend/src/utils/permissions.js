// Module permission definitions corresponding to your matrix
const MODULE_PERMISSIONS = {
  dashboard: {
    admin: "full",
    hr: "hr",
    manager: "team",
    employee: "own",
  },
  employees: {
    admin: "full",
    hr: "full",
    manager: "team",
    employee: "own",
  },
  attendance: {
    admin: "all",
    hr: "all",
    manager: "team",
    employee: "own",
  },
  leave: {
    admin: "all",
    hr: "all",
    manager: "none", // No approval per matrix
    employee: "own",
  },
  leaveApproval: {
    admin: true,
    hr: true,
    manager: false,
    employee: false,
  },
  payroll: {
    admin: "full",
    hr: "manage",
    manager: "none",
    employee: "own",
  },
  inventory: {
    admin: "full",
    hr: "none",
    manager: "none",
    employee: "none",
  },
  sales: {
    admin: "full",
    hr: "none",
    manager: "none",
    employee: "none",
  },
  customers: {
    admin: "full",
    hr: "none",
    manager: "none",
    employee: "none",
  },
  departments: {
    admin: "full",
    hr: "view",
    manager: "none",
    employee: "none",
  },
  tasks: {
    admin: "all",
    hr: "none",
    manager: "team",
    employee: "assigned",
  },
  reports: {
    admin: "all",
    hr: "hr",
    manager: "team",
    employee: "own",
  },
  analytics: {
    admin: "full",
    hr: "hr",
    manager: "team",
    employee: "none",
  },
  assistant: {
    admin: "full",
    hr: "hr",
    manager: "team",
    employee: "personal",
  },
  notifications: {
    admin: "all",
    hr: "hr",
    manager: "team",
    employee: "own",
  },
  profile: {
    admin: "own",
    hr: "own",
    manager: "own",
    employee: "own",
  },
  settings: {
    admin: "full",
    hr: "limited",
    manager: "none",
    employee: "none",
  },
};

/**
 * Check what permission level a user has for a specific module.
 * @param {string} role - User role (e.g., 'admin', 'manager', 'hr', 'employee')
 * @param {string} moduleName - Module key matching MODULE_PERMISSIONS
 * @returns {string|boolean} Permission scope or boolean
 */
export function getModulePermission(role, moduleName) {
  if (!role) return "none";
  const normalizedRole = role.toLowerCase();
  const module = MODULE_PERMISSIONS[moduleName];
  
  if (!module) return "none";
  return module[normalizedRole] ?? "none";
}

/**
 * Determines if a user has any valid access (not 'none' or false) to a module.
 */
export function hasModuleAccess(role, moduleName) {
  const permission = getModulePermission(role, moduleName);
  if (typeof permission === "boolean") return permission;
  return permission !== "none";
}