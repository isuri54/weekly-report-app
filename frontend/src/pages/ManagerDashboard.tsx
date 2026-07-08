import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, CheckCircle, AlertTriangle, Clock, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import AIChat from '../components/AIChat';

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
  const filteredReports = teamReports;

  const submitted = filteredReports.filter(r => r.status === 'SUBMITTED').length;

  let totalTeamMembers = users.filter(user => user.role === 'MEMBER').length || 1;
  let membersWhoSubmitted = new Set(
    filteredReports
      .filter(r => r.status === 'SUBMITTED' && r.user?.role === 'MEMBER')
      .map(r => r.user?._id)
  ).size;

  let membersPending = totalTeamMembers - membersWhoSubmitted;
  let complianceRate = Math.round((membersWhoSubmitted / totalTeamMembers) * 100);

  const openBlockers = filteredReports.filter(r => r.blockers?.trim()).length;

  // Override for single user filter
  if (filters.userId) {
    const selectedUser = users.find(u => u._id === filters.userId);
    if (selectedUser && selectedUser.role === 'MEMBER') {
      const userReports = filteredReports.filter(r => r.user?._id === filters.userId);
      const userSubmitted = userReports.filter(r => r.status === 'SUBMITTED').length;

      totalTeamMembers = 1;
      membersWhoSubmitted = userSubmitted;
      membersPending = userReports.length === 0 ? 1 : (userReports.length - userSubmitted);
      complianceRate = userReports.length > 0 ? Math.round((userSubmitted / userReports.length) * 100) : 0;
    }
  }

  // Per Member Submission Status - Dynamic
  const memberStatus = users
    .filter(user => user.role === 'MEMBER')
    .map(user => {
      const userReports = filteredReports.filter(r => r.user?._id === user._id);
      const submittedCount = userReports.filter(r => r.status === 'SUBMITTED').length;
      
      const lateCount = userReports.filter(r => {
        const submittedDate = r.submittedAt ? new Date(r.submittedAt) : null;
        const weekStart = new Date(r.weekStartDate);
        return submittedDate && (submittedDate.getTime() - weekStart.getTime()) > 3 * 24 * 60 * 60 * 1000;
      }).length;

      const pending = userReports.length === 0 ? 1 : (userReports.length - submittedCount);

      return {
        ...user,
        total: userReports.length || 1, 
        submitted: submittedCount,
        pending: pending,
        late: lateCount
      };
    });

  const displayedMemberStatus = filters.userId 
  ? memberStatus.filter(m => m._id === filters.userId)
  : memberStatus;

  // Chart Data
  const statusData = [
    { name: 'Submitted', value: submitted, color: '#22c55e' },
    { name: 'Pending', value: membersPending, color: '#eab308' }
  ];

  const projectData = projects.map(p => ({
    name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
    count: teamReports.filter(r => r.project?._id === p._id).length
  }));

  // Tasks Completed Trend Over Time (Dynamic - Last 4 Weeks)
  const getTaskCount = (value: unknown) => {
    if (Array.isArray(value)) {
      return value.filter((task): task is string => typeof task === 'string' && task.trim().length > 0).length;
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((task) => task.trim())
        .filter(Boolean).length;
    }

    return 0;
  };

  const getTrendData = () => {
    const sortedReports = [...teamReports].sort((a, b) => 
      new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime()
    );

    const weeklyTasks = sortedReports.reduce((acc: any, report) => {
      const weekKey = format(new Date(report.weekStartDate), 'MMM dd');
      if (!acc[weekKey]) acc[weekKey] = 0;

      acc[weekKey] += getTaskCount(report.tasksCompleted);

      return acc;
    }, {});

    return Object.entries(weeklyTasks).slice(-4).map(([week, tasks]) => ({
      week,
      tasks: Number(tasks)
    }));
  };

  const trendData = getTrendData();

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
    <div className="min-h-screen bg-[#0A2540] text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8 sm:mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold">Team Dashboard</h1>
            <p className="text-blue-100">Real-time team performance overview</p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
            <Link
              to="/manage-reports"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3 rounded-2xl transition-all"
            >
              <FolderOpen size={20} />
              Manage Reports
            </Link>
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

        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 mb-8 sm:mb-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <input 
            type="week" 
            onChange={(e) => setFilters({...filters, week: e.target.value})}
            className="w-full bg-[#1E3A8A] border border-white/30 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-blue-400"
        />
        
        <select 
            value={filters.userId}
            onChange={(e) => setFilters({...filters, userId: e.target.value})}
            className="bg-[#1E3A8A] border border-white/30 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-blue-400 appearance-none"
        >
            <option value="" className="bg-[#0A2540] text-white">All Members</option>
            {users
              .filter(user => user.role === 'MEMBER')
              .map((user) => (
                <option 
                  key={user._id} 
                  value={user._id}
                  className="bg-[#0A2540] text-white"
                >
                  {user.name}
                </option>
              ))
            }
        </select>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <CheckCircle className="text-emerald-400" size={32} />
              <div>
                <p className="text-blue-200 text-sm">Submitted</p>
                <p className="text-3xl sm:text-5xl font-semibold mt-1">{submitted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-4">
              <Clock className="text-yellow-400" size={32} />
              <div>
                <p className="text-blue-200 text-sm">Pending</p>
                <p className="text-3xl sm:text-5xl font-semibold mt-1">{membersPending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-4">
              <Users className="text-blue-400" size={32} />
              <div>
                <p className="text-blue-200 text-sm">Compliance Rate</p>
                <p className="text-3xl sm:text-5xl font-semibold mt-1">{complianceRate}%</p>
                <p className="text-xs text-blue-300 mt-1">
                  {membersWhoSubmitted} of {totalTeamMembers} members
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-4">
              <AlertTriangle className="text-red-400" size={32} />
              <div>
                <p className="text-blue-200 text-sm">Open Blockers</p>
                <p className="text-3xl sm:text-5xl font-semibold mt-1 text-red-400">{openBlockers}</p>
              </div>
            </div>
          </div>
        </div>

        

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-5 sm:p-8 mb-8">
          <h3 className="text-xl font-semibold mb-6">Submission Status per Team Member</h3>
          
          <div className="overflow-x-auto max-h-[292px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <table className="w-full min-w-[640px] border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-white/10 text-blue-200 text-sm ">
                  <th className="pb-4 text-left">Team Member</th>
                  <th className="pb-4 text-center">Total Reports</th>
                  <th className="pb-4 text-center">Submitted</th>
                  <th className="pb-4 text-center">Pending</th>
                  <th className="pb-4 text-center">Late</th>
                  <th className="pb-4 text-center">Compliance</th>
                </tr>
              </thead>
              <tbody className="text-gray-200">
                {displayedMemberStatus.map(member => (
                  <tr key={member._id} className="border-b border-white/10 hover:bg-white/5 transition-colors duration-150">
                    <td className="py-5 font-medium">{member.name}</td>
                    <td className="py-5 text-center">{member.total}</td>
                    <td className="py-5 text-center text-emerald-400 font-medium">{member.submitted}</td>
                    <td className="py-5 text-center text-yellow-400 font-medium">{member.pending}</td>
                    <td className="py-5 text-center text-orange-400 font-medium">{member.late}</td>
                    <td className="py-5 text-center font-semibold">
                      {member.total ? Math.round((member.submitted / member.total) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-5 sm:p-8">
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

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-5 sm:p-8 mt-6 sm:mt-8 mb-8">
          <h3 className="text-xl font-semibold mb-6">Tasks Completed Trend (Last 4 Weeks)</h3>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={trendData}>
              <XAxis dataKey="week" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="tasks" fill="#60a5fa" radius={8} name="Tasks Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-semibold mb-6">Recent Reports</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-blue-200 text-sm">
                  <th className="pb-4">Member</th>
                  <th className="pb-4">Project</th>
                  <th className="pb-4">Week End Date</th>
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
      <AIChat />
    </div>
  );
};

export default Dashboard;