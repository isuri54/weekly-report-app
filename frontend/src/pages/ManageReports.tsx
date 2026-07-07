import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Eye, X, Calendar, User, Briefcase } from 'lucide-react';
import api from '../utils/axios';

interface Report {
  _id: string;
  user: { _id: string; name: string; };
  project: { _id: string; name: string; };
  weekStartDate: string;
  tasksCompleted: string;
  tasksPlanned: string;
  blockers?: string;
  hoursWorked?: number;
  notes?: string;
  status: 'DRAFT' | 'SUBMITTED';
  submittedAt?: string;
}

const ManageReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [filters, setFilters] = useState({
    week: '',
    userId: '',
    projectId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsRes, usersRes, projectsRes] = await Promise.all([
        api.get('http://localhost:5000/api/reports/team', { params: filters }),
        api.get('http://localhost:5000/api/reports/users'),
        api.get('http://localhost:5000/api/projects')
      ]);

      setReports(reportsRes.data);
      setUsers(usersRes.data.filter((u: any) => u.role === 'MEMBER'));
      setProjects(projectsRes.data);
    } catch (error: any) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const openReport = (report: Report) => {
    setSelectedReport(report);
  };

  const closeModal = () => {
    setSelectedReport(null);
  };

  return (
    <div className="min-h-screen bg-[#0A2540] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-semibold">Manage Reports</h1>
            <p className="text-blue-100">View and analyze all team reports</p>
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
            <option value="">All Members</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>

          <select 
            value={filters.projectId}
            onChange={(e) => setFilters({...filters, projectId: e.target.value})}
            className="bg-[#1E3A8A] border border-white/30 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-blue-400 appearance-none"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-semibold mb-6">All Team Reports</h3>

          {loading ? (
            <div className="text-center py-20">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-20 text-blue-100">No reports found for the selected filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b border-white/10 text-left text-blue-200 text-sm">
                    <th className="pb-4">Member</th>
                    <th className="pb-4">Project</th>
                    <th className="pb-4">Week</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-200 divide-y divide-white/10">
                  {reports.map((report) => (
                    <tr key={report._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-6 font-medium">{report.user?.name}</td>
                      <td className="py-6">{report.project?.name}</td>
                      <td className="py-6">
                        {format(new Date(report.weekStartDate), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-6">
                        <span className={`px-4 py-1 rounded-full text-xs font-medium ${report.status === 'SUBMITTED' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="py-6">
                        <button 
                          onClick={() => openReport(report)}
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Eye size={18} /> View Full Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white text-gray-900 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-8 py-5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-semibold">Weekly Report</h2>
                <p className="text-gray-500">{selectedReport.user.name} • {format(new Date(selectedReport.weekStartDate), 'MMMM dd, yyyy')}</p>
              </div>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Briefcase className="text-blue-600" />
                  <h3 className="font-semibold text-lg">Project</h3>
                </div>
                <p className="text-xl font-medium">{selectedReport.project.name}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Tasks Completed This Week</h3>
                <div className="bg-gray-50 p-6 rounded-2xl whitespace-pre-wrap leading-relaxed">
                  {selectedReport.tasksCompleted}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Tasks Planned for Next Week</h3>
                <div className="bg-gray-50 p-6 rounded-2xl whitespace-pre-wrap leading-relaxed">
                  {selectedReport.tasksPlanned}
                </div>
              </div>

              {selectedReport.blockers && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-red-600">Blockers / Challenges</h3>
                  <div className="bg-red-50 p-6 rounded-2xl text-red-800 whitespace-pre-wrap">
                    {selectedReport.blockers}
                  </div>
                </div>
              )}

              {selectedReport.hoursWorked && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Hours Worked</h3>
                  <p className="text-3xl font-semibold">{selectedReport.hoursWorked} hours</p>
                </div>
              )}

              {selectedReport.notes && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Additional Notes / Links</h3>
                  <div className="bg-gray-50 p-6 rounded-2xl whitespace-pre-wrap">
                    {selectedReport.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReports;