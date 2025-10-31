import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Building2, MapPin, Users, Bed, User, Mail, Phone, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export default function OrganizationsPage() {
  const [expandedOrgs, setExpandedOrgs] = useState<Set<number>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await api.get('/organizations');
      return response.data;
    },
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleExpand = (orgId: number) => {
    setExpandedOrgs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orgId)) {
        newSet.delete(orgId);
      } else {
        newSet.add(orgId);
      }
      return newSet;
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
        <p className="text-gray-600 mt-2">Manage all organizations and PG locations</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-600">Loading organizations...</div>
      ) : (
        <div className="space-y-3">
          {data?.data?.map((org: any) => {
            const isExpanded = expandedOrgs.has(org.s_no);
            return (
              <div key={org.s_no} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                {/* Compact Organization Header - Always Visible */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => toggleExpand(org.s_no)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base mb-0.5">{org.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {org.pg_locations_count} Locations
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {org.admins?.length || 0} Admins
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(org.created_at)}
                        </span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expandable Details Section */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    {org.description && (
                      <p className="text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">{org.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Admins Section */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          Admins
                        </h4>
                        {org.admins && org.admins.length > 0 ? (
                          <div className="space-y-2">
                            {org.admins.map((admin: any) => (
                              <div key={admin.s_no} className="bg-white rounded-lg p-2.5 border border-gray-200">
                                <div className="flex items-start gap-2">
                                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-3.5 h-3.5 text-blue-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <p className="font-semibold text-gray-900 text-xs">{admin.name}</p>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                        admin.status === 'ACTIVE' 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {admin.status}
                                      </span>
                                    </div>
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1 text-[11px] text-gray-600">
                                        <Mail className="w-2.5 h-2.5" />
                                        <span className="truncate">{admin.email}</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-[11px] text-gray-600">
                                        <Phone className="w-2.5 h-2.5" />
                                        <span>{admin.phone}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">No admins assigned</p>
                        )}
                      </div>

                      {/* PG Locations Section */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                          <MapPin className="w-3.5 h-3.5 text-green-600" />
                          PG Locations
                        </h4>
                        {org.pg_locations && org.pg_locations.length > 0 ? (
                          <div className="space-y-2">
                            {org.pg_locations.map((location: any) => (
                              <div key={location.s_no} className="bg-white rounded-lg p-2.5 border border-gray-200">
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <p className="font-semibold text-gray-900 text-xs flex-1">{location.location_name}</p>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                                    location.status === 'ACTIVE' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {location.status}
                                  </span>
                                </div>
                                {location.address && (
                                  <p className="text-[11px] text-gray-600 mb-1.5 line-clamp-1">{location.address}</p>
                                )}
                                <div className="flex items-center gap-3 text-[11px] text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Building2 className="w-2.5 h-2.5" />
                                    <span>{location.rooms_count} Rooms</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Bed className="w-2.5 h-2.5" />
                                    <span>{location.beds_count} Beds</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">No PG locations added</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
