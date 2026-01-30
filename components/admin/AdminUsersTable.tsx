'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
  _count: {
    trips: number;
  };
}

interface Stats {
  total: number;
  premium: number;
  admins: number;
}

export default function AdminUsersTable() {
  const t = useTranslations('admin');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setStats(data.stats);
      } else {
        alert('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    setUpdatingUserId(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPremium: !currentStatus,
        }),
      });

      if (response.ok) {
        // Update local state
        setUsers(users.map(u =>
          u.id === userId ? { ...u, isPremium: !currentStatus } : u
        ));
        // Update stats
        if (stats) {
          setStats({
            ...stats,
            premium: currentStatus ? stats.premium - 1 : stats.premium + 1,
          });
        }
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    if (!confirm(t('confirmAdminChange'))) return;

    setUpdatingUserId(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isAdmin: !currentStatus,
        }),
      });

      if (response.ok) {
        // Update local state
        setUsers(users.map(u =>
          u.id === userId ? { ...u, isAdmin: !currentStatus } : u
        ));
        // Update stats
        if (stats) {
          setStats({
            ...stats,
            admins: currentStatus ? stats.admins - 1 : stats.admins + 1,
          });
        }
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">{t('totalUsers')}</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-yellow-200">
            <p className="text-sm text-gray-600 mb-1">{t('premiumUsers')}</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.premium}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-purple-200">
            <p className="text-sm text-gray-600 mb-1">{t('adminUsers')}</p>
            <p className="text-3xl font-bold text-purple-600">{stats.admins}</p>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('user')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('trips')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('joined')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user._count.trips}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {user.isPremium && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          👑 Premium
                        </span>
                      )}
                      {user.isAdmin && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          🛡️ Admin
                        </span>
                      )}
                      {!user.isPremium && !user.isAdmin && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Free
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => togglePremium(user.id, user.isPremium)}
                        disabled={updatingUserId === user.id}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                          user.isPremium
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {user.isPremium ? '👑 Remove Premium' : '👑 Make Premium'}
                      </button>
                      <button
                        onClick={() => toggleAdmin(user.id, user.isAdmin)}
                        disabled={updatingUserId === user.id}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                          user.isAdmin
                            ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {user.isAdmin ? '🛡️ Remove Admin' : '🛡️ Make Admin'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('noUsers')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
