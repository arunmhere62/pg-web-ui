import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { X, Shield, Settings, Save, Loader2 } from 'lucide-react';

interface Role {
  s_no: number;
  role_name: string;
  permissions: Record<string, any>;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

interface Permission {
  s_no: number;
  permission_key: string;
  description: string;
}

interface PermissionsResponse {
  success: boolean;
  data: Permission[];
}

interface RoleFormModalProps {
  role?: Role | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RoleFormModal({ role, onClose, onSuccess }: RoleFormModalProps) {
  const [formData, setFormData] = useState({
    role_name: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    permissions: {} as Record<string, boolean>,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch permissions for the form
  const { data: permissionsData } = useQuery<PermissionsResponse>({
    queryKey: ['permissions-simple'],
    queryFn: async () => {
      const response = await api.get('/permissions/simple');
      return response.data;
    },
  });

  // Initialize form data
  useEffect(() => {
    if (role) {
      setFormData({
        role_name: role.role_name,
        status: role.status,
        permissions: role.permissions || {},
      });
    }
  }, [role]);

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/roles', data);
      return response.data;
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      }
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.patch(`/roles/${role?.s_no}`, data);
      return response.data;
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.role_name.trim()) {
      newErrors.role_name = 'Role name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (role) {
      updateRoleMutation.mutate(formData);
    } else {
      createRoleMutation.mutate(formData);
    }
  };

  const handlePermissionChange = (permissionKey: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionKey]: checked,
      },
    }));
  };

  
  const isLoading = createRoleMutation.isPending || updateRoleMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {role ? 'Edit Role' : 'Create New Role'}
              </h2>
              <p className="text-sm text-gray-600">
                {role ? 'Update role details and permissions' : 'Add a new role with specific permissions'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {/* General Error */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={formData.role_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, role_name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.role_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter role name"
                  />
                  {errors.role_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.role_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Permissions</h3>
              </div>

              {permissionsData?.data ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {permissionsData.data.map((permission) => (
                      <label
                        key={permission.permission_key}
                        className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions[permission.permission_key] || false}
                          onChange={(e) => handlePermissionChange(permission.permission_key, e.target.checked)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {permission.permission_key}
                          </p>
                          <p className="text-xs text-gray-500">
                            {permission.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading permissions...</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {role ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
