import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Users, History, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
}

interface PromptItem {
    _id: string;
    prompt: string;
    response: string;
    createdAt: string;
}

const Admin = () => {
    const navigate = useNavigate();
    const [secret, setSecret] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [authError, setAuthError] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [userHistories, setUserHistories] = useState<Record<string, PromptItem[]>>({});
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setLoading(true);
        try {
            const res = await API.get('/users/admin/all', {
                headers: { 'x-admin-secret': secret }
            });
            setUsers(res.data.data || []);
            setAuthenticated(true);
        } catch (err: any) {
            setAuthError('Invalid admin secret. Access denied.');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserHistory = async (userId: string) => {
        if (expandedUser === userId) {
            setExpandedUser(null);
            return;
        }
        setExpandedUser(userId);
        if (!userHistories[userId]) {
            try {
                const res = await API.get(`/prompts/history/${userId}`);
                setUserHistories(prev => ({ ...prev, [userId]: res.data.data || [] }));
            } catch {
                setUserHistories(prev => ({ ...prev, [userId]: [] }));
            }
        }
    };

    if (!authenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <ShieldCheck className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Admin access</h2>
                        <p className="text-gray-500 text-sm mt-1">Enter the admin secret to continue</p>
                    </div>

                    {authError && (
                        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
                            {authError}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            placeholder="Admin secret key"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : 'Enter admin panel'}
                        </button>
                    </form>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4 cursor-pointer"
                    >
                        ← Back to dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-sm text-blue-600 hover:underline cursor-pointer"
                    >
                        ← Back to dashboard
                    </button>
                </div>

                <div className="space-y-4">
                    <p className="text-gray-500 text-sm">{users.length} registered users</p>

                    {users.map((user) => (
                        <div key={user._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div
                                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition"
                                onClick={() => toggleUserHistory(user._id)}
                            >
                                <div>
                                    <h3 className="font-bold text-gray-800">{user.name}</h3>
                                    <p className="text-sm text-gray-500">{user.email} · {user.phone}</p>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <History className="w-4 h-4" />
                                    <span className="text-xs">View history</span>
                                    {expandedUser === user._id
                                        ? <ChevronUp className="w-4 h-4" />
                                        : <ChevronDown className="w-4 h-4" />
                                    }
                                </div>
                            </div>

                            {expandedUser === user._id && (
                                <div className="border-t border-gray-100 p-5 bg-gray-50">
                                    {!userHistories[user._id] ? (
                                        <p className="text-sm text-gray-400">Loading...</p>
                                    ) : userHistories[user._id].length === 0 ? (
                                        <p className="text-sm text-gray-400">No learning history yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {userHistories[user._id].map((item) => (
                                                <div key={item._id} className="bg-white p-4 rounded-xl border border-gray-200">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="font-semibold text-gray-700 text-sm">"{item.prompt}"</p>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(item.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 line-clamp-3 whitespace-pre-wrap">
                                                        {item.response}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Admin;
