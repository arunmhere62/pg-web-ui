import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { formatDateTime } from '../lib/utils';
import { ArrowLeft, Send } from 'lucide-react';

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const response = await api.get(`/tickets/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await api.patch(`/tickets/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setNewStatus('');
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (commentText: string) => {
      await api.post(`/tickets/${id}/comments`, { comment: commentText });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      setComment('');
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!ticket) {
    return <div className="p-8">Ticket not found</div>;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-purple-100 text-purple-700',
      RESOLVED: 'bg-green-100 text-green-700',
      CLOSED: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tickets
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
                <p className="text-sm text-gray-600">{ticket.ticket_number}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-700 mb-4">{ticket.description}</p>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">
                Category: <span className="font-medium text-gray-900">{ticket.category}</span>
              </span>
              <span className="text-gray-600">
                Priority: <span className="font-medium text-gray-900">{ticket.priority}</span>
              </span>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Comments ({ticket.issue_ticket_comments?.length || 0})
            </h2>
            <div className="space-y-4 mb-6">
              {ticket.issue_ticket_comments?.map((c: any) => (
                <div key={c.s_no} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{c.users?.name}</span>
                    <span className="text-sm text-gray-600">{formatDateTime(c.created_at)}</span>
                  </div>
                  <p className="text-gray-700">{c.comment}</p>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="border-t border-gray-200 pt-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                rows={3}
              />
              <button
                onClick={() => addCommentMutation.mutate(comment)}
                disabled={!comment.trim() || addCommentMutation.isPending}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Post Comment
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Update Status</h3>
            <select
              value={newStatus || ticket.status}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-3"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <button
              onClick={() => updateStatusMutation.mutate(newStatus)}
              disabled={!newStatus || newStatus === ticket.status || updateStatusMutation.isPending}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Status
            </button>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Reported By</p>
                <p className="font-medium text-gray-900">
                  {ticket.users_issue_tickets_reported_byTousers?.name || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium text-gray-900">{formatDateTime(ticket.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-600">Last Updated</p>
                <p className="font-medium text-gray-900">{formatDateTime(ticket.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
