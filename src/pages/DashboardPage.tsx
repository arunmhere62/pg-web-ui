import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Ticket, Building2, Users, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/tickets/stats');
      return response.data.data;
    },
  });

  const statCards = [
    {
      title: 'Total Tickets',
      value: stats?.total || 0,
      icon: Ticket,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Open Tickets',
      value: stats?.byStatus?.open || 0,
      icon: TrendingUp,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      title: 'In Progress',
      value: stats?.byStatus?.inProgress || 0,
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Resolved',
      value: stats?.byStatus?.resolved || 0,
      icon: Building2,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the Super Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Overview</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Ticket Categories</p>
              <p className="text-sm text-gray-600 mt-1">
                {Object.entries(stats?.byCategory || {}).map(([key, value]) => (
                  <span key={key} className="mr-4">
                    {key}: {value as number}
                  </span>
                ))}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Priority Distribution</p>
              <p className="text-sm text-gray-600 mt-1">
                {Object.entries(stats?.byPriority || {}).map(([key, value]) => (
                  <span key={key} className="mr-4">
                    {key}: {value as number}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
