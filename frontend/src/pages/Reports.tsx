import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit3, Send, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import api from '../utils/axios';

interface Project {
  _id: string;
  name: string;
}

interface Report {
  _id: string;
  weekStartDate: string;
  project: Project;
  tasksCompleted: string;
  tasksPlanned: string;
  blockers?: string;
  hoursWorked?: number;
  notes?: string;
  status: 'DRAFT' | 'SUBMITTED';
  submittedAt?: string;
}

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    weekStartDate: '',
    project: '',
    tasksCompleted: '',
    tasksPlanned: '',
    blockers: '',
    hoursWorked: '',
    notes: ''
  });

  const fetchReports = async () => {
    try {
      const { data } = await api.get('http://localhost:5000/api/reports');
      setReports(data);
    } catch (error) {
      toast.error('Failed to load reports');
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('http://localhost:5000/api/projects');
      setProjects(data);
    } catch (error) {
      console.log("Projects not loaded yet");
    }
  };

  useEffect(() => {
    fetchReports();
    fetchProjects();
  }, []);

  const resetForm = () => {
    setFormData({
      weekStartDate: '',
      project: '',
      tasksCompleted: '',
      tasksPlanned: '',
      blockers: '',
      hoursWorked: '',
      notes: ''
    });
    setEditingReport(null);
    setShowForm(false);
  };

  const handleEdit = (report: Report) => {
    setEditingReport(report);
    setFormData({
      weekStartDate: report.weekStartDate.split('T')[0],
      project: report.project._id,
      tasksCompleted: report.tasksCompleted,
      tasksPlanned: report.tasksPlanned,
      blockers: report.blockers || '',
      hoursWorked: report.hoursWorked?.toString() || '',
      notes: report.notes || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingReport) {
        await api.put(`http://localhost:5000/api/reports/${editingReport._id}`, formData);
        toast.success('Report updated successfully');
      } else {
        await api.post('http://localhost:5000/api/reports', formData);
        toast.success('Report created successfully');
      }
      
      fetchReports();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async (id: string) => {
    try {
      await api.put(`http://localhost:5000/api/reports/${id}/submit`);
      toast.success('Report submitted successfully');
      fetchReports();
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A2540] text-white pb-12">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">My Weekly Reports</h1>
            <p className="text-blue-100 mt-2">Document your progress and plan ahead</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-3 bg-white text-[#0A2540] px-6 py-3.5 rounded-2xl font-semibold hover:bg-white/90 transition-all"
          >
            <Plus size={22} />
            New Weekly Report
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white text-gray-900 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-auto">
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-3xl font-semibold">
                  {editingReport ? 'Edit Weekly Report' : 'Create New Weekly Report'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Week Starting Date</label>
                    <input
                      type="date"
                      value={formData.weekStartDate}
                      onChange={(e) => setFormData({ ...formData, weekStartDate: e.target.value })}
                      required
                      className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project / Category</label>
                    <select
                      value={formData.project}
                      onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                      required
                      className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="">Select Project</option>
                      {projects.map((proj) => (
                        <option key={proj._id} value={proj._id}>
                          {proj.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tasks Completed This Week</label>
                  <textarea
                    value={formData.tasksCompleted}
                    onChange={(e) => setFormData({ ...formData, tasksCompleted: e.target.value })}
                    required
                    rows={4}
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 resize-y"
                    placeholder="List the tasks you completed..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tasks Planned for Next Week</label>
                  <textarea
                    value={formData.tasksPlanned}
                    onChange={(e) => setFormData({ ...formData, tasksPlanned: e.target.value })}
                    required
                    rows={4}
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 resize-y"
                    placeholder="What do you plan to work on next week..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blockers / Challenges</label>
                  <textarea
                    value={formData.blockers}
                    onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
                    rows={3}
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 resize-y"
                    placeholder="Any blockers or challenges you faced..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hours Worked (Optional)</label>
                    <input
                      type="number"
                      value={formData.hoursWorked}
                      onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                      className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500"
                      placeholder="e.g. 38"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes / Links (Optional)</label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500"
                      placeholder="Any links or extra notes..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-4 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#3B82F6] text-white py-4 rounded-2xl font-semibold hover:bg-[#1E3A8A] transition-all disabled:opacity-70"
                  >
                    {loading ? 'Saving...' : editingReport ? 'Update Report' : 'Create Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {reports.length === 0 ? (
            <div className="text-center py-20 text-blue-100">
              No reports yet. Create your first weekly report!
            </div>
          ) : (
            reports.map((report) => (
              <div key={report._id} className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 text-blue-300 text-sm">
                      <Calendar size={18} />
                      {format(new Date(report.weekStartDate), 'EEEE, MMMM dd, yyyy')}
                    </div>
                    <h3 className="text-2xl font-semibold mt-2">{report.project.name}</h3>
                  </div>
                  <span className={`px-5 py-2 rounded-full text-sm font-medium ${report.status === 'SUBMITTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {report.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-8 text-gray-200">
                  <div>
                    <p className="uppercase text-xs tracking-widest text-blue-200 mb-2">Tasks Completed</p>
                    <p className="leading-relaxed whitespace-pre-wrap">{report.tasksCompleted}</p>
                  </div>
                  <div>
                    <p className="uppercase text-xs tracking-widest text-blue-200 mb-2">Planned for Next Week</p>
                    <p className="leading-relaxed whitespace-pre-wrap">{report.tasksPlanned}</p>
                  </div>
                </div>

                {report.blockers && (
                  <div className="mt-6">
                    <p className="uppercase text-xs tracking-widest text-red-300 mb-2">Blockers</p>
                    <p className="text-red-200 leading-relaxed">{report.blockers}</p>
                  </div>
                )}

                <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
                  <button
                    onClick={() => handleEdit(report)}
                    className="flex items-center gap-2 px-5 py-2.5 text-blue-400 hover:text-blue-300 hover:bg-white/5 rounded-2xl transition-all"
                  >
                    <Edit3 size={18} /> Edit
                  </button>

                  {report.status === 'DRAFT' && (
                    <button
                      onClick={() => submitReport(report._id)}
                      className="flex items-center gap-2 px-5 py-2.5 text-emerald-400 hover:text-emerald-300 hover:bg-white/5 rounded-2xl transition-all"
                    >
                      <Send size={18} /> Submit Report
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;