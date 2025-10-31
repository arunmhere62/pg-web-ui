import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { formatDateTime } from '../lib/utils';
import { Search, Building2, MapPin, User, Mail, Phone } from 'lucide-react';

export default function TicketsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', search, status],
    queryFn: async () => {
      const params: any = { page: 1, limit: 50 };
      if (search) params.search = search;
      if (status) params.status = status;
      const response = await api.get('/tickets', { params });
      return response.data;
    },
  });

  // Fetch organizations and PG locations to map IDs to names
  const { data: orgsData } = useQuery({
    queryKey: ['organizations-list'],
    queryFn: async () => {
      const response = await api.get('/organizations', { params: { limit: 100 } });
      return response.data;
    },
  });

  const getOrgName = (orgId: number | null) => {
    if (!orgId || !orgsData?.data) return 'N/A';
    const org = orgsData.data.find((o: any) => o.s_no === orgId);
    return org?.name || 'Unknown';
  };

  const getPGLocation = (orgId: number | null, pgId: number | null) => {
    if (!pgId || !orgId || !orgsData?.data) return null;
    const org = orgsData.data.find((o: any) => o.s_no === orgId);
    if (!org?.pg_locations) return null;
    return org.pg_locations.find((pg: any) => pg.s_no === pgId);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-purple-100 text-purple-700',
      RESOLVED: 'bg-green-100 text-green-700',
      CLOSED: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'bg-red-100 text-red-700',
      HIGH: 'bg-orange-100 text-orange-700',
      MEDIUM: 'bg-yellow-100 text-yellow-700',
      LOW: 'bg-green-100 text-green-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-600 mt-2">Manage all support tickets across organizations</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-600">Loading tickets...</div>
        ) : data?.data?.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No tickets found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PG Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.data?.map((ticket: any) => {
                  const pgLocation = getPGLocation(ticket.organization_id, ticket.pg_id);
                  const isExpanded = expandedTicket === ticket.s_no;
                  const user = ticket.users_issue_tickets_reported_byTousers;
                  
                  return (
                    <React.Fragment key={ticket.s_no}>
                      <tr
                        onClick={() => setExpandedTicket(isExpanded ? null : ticket.s_no)}
                        className="hover:bg-gray-50 cursor-pointer transition"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{ticket.title}</p>
                            <p className="text-xs text-gray-500">{ticket.ticket_number}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-sm text-gray-700">{getOrgName(ticket.organization_id)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {pgLocation ? (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-green-600" />
                              <div>
                                <p className="text-sm text-gray-700">{pgLocation.location_name}</p>
                                {pgLocation.address && (
                                  <p className="text-xs text-gray-500 line-clamp-1">{pgLocation.address}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-600" />
                            <span className="text-sm text-gray-700">{user?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{formatDateTime(ticket.created_at)}</span>
                        </td>
                      </tr>
                      {isExpanded && user && (
                        <tr className="bg-blue-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="flex items-start gap-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                  <p className="text-xs text-gray-600">{user.roles?.role_name || 'User'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span>{user.email}</span>
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Phone className="w-4 h-4 text-gray-500" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/tickets/${ticket.s_no}`);
                                }}
                                className="ml-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                              >
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
