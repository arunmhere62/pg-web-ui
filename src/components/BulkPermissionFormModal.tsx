import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { X, Key, Save, Loader2, Plus, Trash2, Tag, FileText, AlertCircle } from 'lucide-react';

// Define action type for frontend
type PermissionAction = 'CREATE' | 'EDIT' | 'VIEW' | 'DELETE';

interface BulkPermission {
  screen_name: string;
  action: PermissionAction;
  description: string;
}

interface BulkPermissionFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkPermissionFormModal({ onClose, onSuccess }: BulkPermissionFormModalProps) {
  const [permissions, setPermissions] = useState<BulkPermission[]>([
    { screen_name: '', action: 'CREATE', description: '' }
  ]);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  // Add new permission row
  const addPermission = () => {
    setPermissions([...permissions, { screen_name: '', action: 'CREATE', description: '' }]);
  };

  // Remove permission row
  const removePermission = (index: number) => {
    if (permissions.length > 1) {
      const newPermissions = permissions.filter((_, i) => i !== index);
      setPermissions(newPermissions);
      
      // Clear errors for removed permission
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  // Update permission field
  const updatePermission = (index: number, field: keyof BulkPermission, value: string) => {
    const newPermissions = [...permissions];
    newPermissions[index] = { ...newPermissions[index], [field]: value };
    setPermissions(newPermissions);
    
    // Clear error for this field
    if (errors[index]?.[field]) {
      const newErrors = { ...errors };
      delete newErrors[index][field];
      setErrors(newErrors);
    }
  };

  // Validate all permissions
  const validatePermissions = () => {
    const newErrors: Record<string, Record<string, string>> = {};
    
    permissions.forEach((permission, index) => {
      const permissionErrors: Record<string, string> = {};
      
      if (!permission.screen_name.trim()) {
        permissionErrors.screen_name = 'Screen name is required';
      } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(permission.screen_name)) {
        permissionErrors.screen_name = 'Screen name must start with a letter and contain only letters, numbers, and underscores';
      }

      if (!permission.action) {
        permissionErrors.action = 'Action is required';
      }

      if (!permission.description.trim()) {
        permissionErrors.description = 'Description is required';
      }
      
      if (Object.keys(permissionErrors).length > 0) {
        newErrors[index] = permissionErrors;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Bulk create permissions mutation
  const bulkCreateMutation = useMutation({
    mutationFn: async (data: BulkPermission[]) => {
      const response = await api.post('/permissions/bulk', data);
      return response.data;
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      if (error.response?.data?.message) {
        // Handle bulk creation errors
        setErrors({ general: { message: error.response.data.message } });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePermissions()) {
      return;
    }
    
    // Filter out empty permissions
    const validPermissions = permissions.filter(p => 
      p.screen_name.trim() && p.action && p.description.trim()
    );
    
    if (validPermissions.length === 0) {
      setErrors({ general: { message: 'Please add at least one permission' } });
      return;
    }
    
    bulkCreateMutation.mutate(validPermissions);
  };

  const isLoading = bulkCreateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Key className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Bulk Create Permissions
              </h2>
              <p className="text-sm text-gray-600">
                Create multiple permissions at once
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

        {/* Form - Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          {/* General Error */}
          {errors.general && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600">{errors.general.message}</p>
              </div>
            </div>
          )}

          {/* Scrollable Permissions List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {permissions.map((permission, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      Permission {index + 1}
                    </h3>
                    {permissions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePermission(index)}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Screen Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Screen Name *
                        </div>
                      </label>
                      <input
                        type="text"
                        value={permission.screen_name}
                        onChange={(e) => updatePermission(index, 'screen_name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm ${
                          errors[index]?.screen_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., user, tenant, report"
                      />
                      {errors[index]?.screen_name && (
                        <p className="mt-1 text-sm text-red-600">{errors[index].screen_name}</p>
                      )}
                    </div>

                    {/* Action */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          Action *
                        </div>
                      </label>
                      <select
                        value={permission.action}
                        onChange={(e) => updatePermission(index, 'action', e.target.value as PermissionAction)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm ${
                          errors[index]?.action ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select an action</option>
                        <option value="CREATE">🟢 Create</option>
                        <option value="EDIT">🔵 Edit</option>
                        <option value="VIEW">⚪ View</option>
                        <option value="DELETE">🔴 Delete</option>
                      </select>
                      {errors[index]?.action && (
                        <p className="mt-1 text-sm text-red-600">{errors[index].action}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Description *
                        </div>
                      </label>
                      <input
                        type="text"
                        value={permission.description}
                        onChange={(e) => updatePermission(index, 'description', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm ${
                          errors[index]?.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Describe what this permission allows..."
                      />
                      {errors[index]?.description && (
                        <p className="mt-1 text-sm text-red-600">{errors[index].description}</p>
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  {permission.screen_name && permission.action && (
                    <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Preview:</span>
                        <code className="px-2 py-1 bg-gray-50 border rounded text-xs font-mono">
                          {permission.screen_name}_{permission.action.toLowerCase()}
                        </code>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          permission.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                          permission.action === 'EDIT' ? 'bg-blue-100 text-blue-700' :
                          permission.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {permission.action}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Permission Button */}
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={addPermission}
                className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Permission
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50">
            <div className="text-sm text-gray-500">
              {permissions.filter(p => p.screen_name.trim() && p.action && p.description.trim()).length} permission(s) ready to create
            </div>
            <div className="flex items-center gap-3">
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
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Create {permissions.length} Permission{permissions.length > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
