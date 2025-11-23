import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { X, Key, Save, Loader2, Tag, FileText } from 'lucide-react';

// Define action type for frontend
type PermissionAction = 'CREATE' | 'EDIT' | 'VIEW' | 'DELETE';

interface Permission {
  s_no: number;
  screen_name: string;
  action: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface PermissionFormModalProps {
  permission?: Permission | null;
  onClose: () => void;
  onSuccess: () => void;
}


export default function PermissionFormModal({ permission, onClose, onSuccess }: PermissionFormModalProps) {
  const [formData, setFormData] = useState({
    screen_name: '',
    action: 'CREATE' as PermissionAction,
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data
  useEffect(() => {
    if (permission) {
      setFormData({
        screen_name: permission.screen_name,
        action: permission.action as PermissionAction,
        description: permission.description,
      });
    }
  }, [permission]);

  // Create permission mutation
  const createPermissionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/permissions', data);
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

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.patch(`/permissions/${permission?.s_no}`, data);
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
    
    if (!formData.screen_name.trim()) {
      newErrors.screen_name = 'Screen name is required';
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.screen_name)) {
      newErrors.screen_name = 'Screen name must start with a letter and contain only letters, numbers, and underscores';
    }

    if (!formData.action) {
      newErrors.action = 'Action is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (permission) {
      updatePermissionMutation.mutate(formData);
    } else {
      createPermissionMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isLoading = createPermissionMutation.isPending || updatePermissionMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Key className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {permission ? 'Edit Permission' : 'Create New Permission'}
              </h2>
              <p className="text-sm text-gray-600">
                {permission ? 'Update permission details' : 'Add a new system permission'}
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
        <form onSubmit={handleSubmit} className="p-6">
          {/* General Error */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <div className="space-y-6">
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
                value={formData.screen_name}
                onChange={(e) => handleInputChange('screen_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.screen_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., user, tenant, report"
                disabled={!!permission} // Disable editing screen_name for existing permissions
              />
              {errors.screen_name && (
                <p className="mt-1 text-sm text-red-600">{errors.screen_name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {permission 
                  ? 'Screen name cannot be changed after creation'
                  : 'Use lowercase letters, numbers, and underscores. Must start with a letter.'
                }
              </p>
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
                value={formData.action}
                onChange={(e) => handleInputChange('action', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.action ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={!!permission} // Disable editing action for existing permissions
              >
                <option value="">Select an action</option>
                <option value="CREATE" className="text-green-700">🟢 Create</option>
                <option value="EDIT" className="text-blue-700">🔵 Edit</option>
                <option value="VIEW" className="text-gray-700">⚪ View</option>
                <option value="DELETE" className="text-red-700">🔴 Delete</option>
              </select>
              {errors.action && (
                <p className="mt-1 text-sm text-red-600">{errors.action}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {permission 
                  ? 'Action cannot be changed after creation'
                  : 'Select the action type for this permission.'
                }
              </p>
            </div>

            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description *
                </div>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe what this permission allows users to do..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Permission Key Preview */}
            {formData.screen_name && formData.action && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Preview</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Generated Key:</span>
                    <code className="px-2 py-1 bg-white border rounded text-sm font-mono">
                      {formData.screen_name}_{formData.action.toLowerCase()}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Screen:</span>
                    <span className="text-sm text-gray-900">{formData.screen_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Action:</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      formData.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                      formData.action === 'EDIT' ? 'bg-blue-100 text-blue-700' :
                      formData.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {formData.action}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {permission ? 'Update Permission' : 'Create Permission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
