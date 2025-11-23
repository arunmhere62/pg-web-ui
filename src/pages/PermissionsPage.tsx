import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { 
  Key, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  MoreVertical,
  Tag,
  FileText
} from 'lucide-react';
import PermissionFormModal from '@/components/PermissionFormModal';
import BulkPermissionFormModal from '@/components/BulkPermissionFormModal';

interface Permission {
  s_no: number;
  screen_name: string;
  action: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface PermissionsResponse {
  success: boolean;
  data: Permission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export default function PermissionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Fetch permissions
  const { data, isLoading, error } = useQuery<PermissionsResponse>({
    queryKey: ['permissions', currentPage, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
      });
      
      const response = await api.get(`/permissions?${params}`);
      return response.data;
    },
  });

  
  // Delete permission mutation
  const deletePermissionMutation = useMutation({
    mutationFn: async (permissionId: number) => {
      await api.delete(`/permissions/${permissionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setShowDropdown(null);
    },
  });

  // Group permissions by screen name
  const groupPermissionsByScreenName = (permissions: Permission[]) => {
    const groups: { [key: string]: Permission[] } = {};
    
    permissions.forEach(permission => {
      const screenName = permission.screen_name;
      
      if (!groups[screenName]) {
        groups[screenName] = [];
      }
      groups[screenName].push(permission);
    });
    
    return groups;
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setIsModalOpen(true);
    setShowDropdown(null);
  };

  const handleDelete = async (permissionId: number) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      deletePermissionMutation.mutate(permissionId);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPermission(null);
  };

  const handleCloseBulkModal = () => {
    setIsBulkModalOpen(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Key className="h-8 w-8 text-green-600" />
              Permissions Management
            </h1>
            <p className="text-gray-600 mt-2">Manage system permissions and access controls</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="bg-white hover:bg-gray-50 text-green-600 border border-green-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Bulk Create
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Permission
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading permissions...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Error loading permissions. Please try again.</p>
        </div>
      ) : (
        <>
          {/* Permissions Grouped by Screen Name */}
          {data?.data && data.data.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupPermissionsByScreenName(data.data))
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([screenName, permissions]) => (
                  <div key={screenName}>
                    {/* Screen Name Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
                        {screenName}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {screenName}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {permissions.length} permission{permissions.length !== 1 ? 's' : ''} • {permissions.map(p => p.action).join(', ')}
                        </p>
                      </div>
                    </div>

                    {/* Permissions Grid for this screen */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {permissions.map((permission) => (
                        <div
                          key={permission.s_no}
                          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="p-1.5 bg-green-100 rounded-lg">
                              <Key className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="relative">
                              <button
                                onClick={() => setShowDropdown(showDropdown === permission.s_no ? null : permission.s_no)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                              >
                                <MoreVertical className="h-4 w-4 text-gray-500" />
                              </button>
                              {showDropdown === permission.s_no && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                                  <button
                                    onClick={() => handleEdit(permission)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit Permission
                                  </button>
                                  <button
                                    onClick={() => handleDelete(permission.s_no)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Permission
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-gray-400" />
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-900 text-sm">
                                  {permission.screen_name}
                                </span>
                                <span className="text-gray-400 text-xs">•</span>
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
                            
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {permission.description}
                              </p>
                            </div>

                            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                              Created: {formatDate(permission.created_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No permissions found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by creating your first permission.'
                }
              </p>
              {!searchTerm && (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsBulkModalOpen(true)}
                    className="bg-white hover:bg-gray-50 text-green-600 border border-green-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Bulk Create
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Permission
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, data.pagination.total)} of {data.pagination.total} results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!data.pagination.hasMore}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Permission Form Modal */}
      {isModalOpen && (
        <PermissionFormModal
          permission={editingPermission}
          onClose={handleCloseModal}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
            handleCloseModal();
          }}
        />
      )}

      {/* Bulk Permission Form Modal */}
      {isBulkModalOpen && (
        <BulkPermissionFormModal
          onClose={handleCloseBulkModal}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
            handleCloseBulkModal();
          }}
        />
      )}
    </div>
  );
}
