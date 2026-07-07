import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, CheckCircle, AlertTriangle, Clock, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import api from '../utils/axios';

const Dashboard = () => {
  const [teamReports, setTeamReports] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    week: '',
    userId: '',
    projectId: ''
  });

  const fetchDashboardData = async () => {
    try {
      const [reportsRes, projectsRes, usersRes] = await Promise.all([
        api.get('/reports/team', {
          params: {
            weekStart: filters.week,
            userId: filters.userId,
            projectId: filters.projectId
          }
        }),
        api.get('/projects'),
        api.get('/reports/users')
      ]);

      setTeamReports(reportsRes.data);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  // Summary Stats
  const totalReports = teamReports.length;
  const submitted = teamReports.filter(r => r.status === 'SUBMITTED').length;
  const pending = totalReports - submitted;
  const complianceRate = totalReports ? Math.round((submitted / totalReports) * 100) : 0;

  const openBlockers = teamReports.filter(r => r.blockers && r.blockers.length > 5).length;

  // Chart Data
  const statusData = [
    { name: 'Submitted', value: submitted, color: '#22c55e' },
    { name: 'Pending', value: pending, color: '#eab308' }
  ];

  const projectData = projects.map(p => ({
    name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
    count: teamReports.filter(r => r.project?._id === p._id).length
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A2540] text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-white/70 border-blue-400 mx-auto mb-6"></div>
          <p className="text-xl font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A2540] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-semibold">Team Dashboard</h1>
            <p className="text-blue-100">Real-time team performance overview</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/projects"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3 rounded-2xl transition-all"
            >
              <FolderOpen size={20} />
              Manage Projects
            </Link>
            <div className="text-sm text-blue-300">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-4">
              <CheckCircle className="text-emerald-400" size={32} />
              <div>
                <p className="text-blue-200 text-sm">Submitted</p>
                <p className="text-5xl font-semibold mt-1">{submitted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-4">
              <Clock className="text-yellow-400" size={32} />
              <div>
                <p className="text-blue-200 text-sm">Pending</p>
                <p className="text-5xl font-semibold mt-1">{pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-4">
              <Users className="text-blue-400" size={32} />
              <div>
                <p className="text-blue-200 text-sm">Compliance</p>
                <p className="text-5xl font-semibold mt-1">{complianceRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-4">
              <AlertTriangle className="text-red-400" size={32} />
              <div>
                <p className="text-blue-200 text-sm">Open Blockers</p>
                <p className="text-5xl font-semibold mt-1 text-red-400">{openBlockers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-10 flex flex-wrap gap-4">
        <input 
            type="week" 
            onChange={(e) => setFilters({...filters, week: e.target.value})}
            className="bg-[#1E3A8A] border border-white/30 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-blue-400"
        />
        
        <select 
            value={filters.userId}
            onChange={(e) => setFilters({...filters, userId: e.target.value})}
            className="bg-[#1E3A8A] border border-white/30 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-blue-400 appearance-none"
        >
            <option value="" className="bg-[#0A2540] text-white">All Members</option>
            {users.map((user) => (
            <option 
                key={user._id} 
                value={user._id}
                className="bg-[#0A2540] text-white"
            >
                {user.name} ({user.role})
            </option>
            ))}
        </select>

        {/* Projects Dropdown */}
        <select 
            value={filters.projectId}
            onChange={(e) => setFilters({...filters, projectId: e.target.value})}
            className="bg-[#1E3A8A] border border-white/30 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-blue-400 appearance-none"
        >
            <option value="" className="bg-[#0A2540] text-white">All Projects</option>
            {projects.map(p => (
            <option 
                key={p._id} 
                value={p._id}
                className="bg-[#0A2540] text-white"
            >
                {p.name}
            </option>
            ))}
        </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h3 className="text-xl font-semibold mb-6">Submission Status</h3>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <h3 className="text-xl font-semibold mb-6">Workload by Project</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={projectData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#60a5fa" radius={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-semibold mb-6">Recent Reports</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-blue-200 text-sm">
                  <th className="pb-4">Member</th>
                  <th className="pb-4">Project</th>
                  <th className="pb-4">Week</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Blockers</th>
                </tr>
              </thead>
              <tbody className="text-gray-200">
                {teamReports.slice(0, 8).map((report) => (
                  <tr key={report._id} className="border-b border-white/10 last:border-0">
                    <td className="py-5">{report.user?.name}</td>
                    <td className="py-5">{report.project?.name}</td>
                    <td className="py-5">{format(new Date(report.weekStartDate), 'MMM dd')}</td>
                    <td className="py-5">
                      <span className={`px-4 py-1 rounded-full text-xs ${report.status === 'SUBMITTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-5 text-red-300">{report.blockers ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;