import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../utils/axios';

interface Project {
  _id: string;
  name: string;
  description?: string;
  color?: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  });

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      toast.error('Failed to load projects');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', description: '', color: '#3b82f6' });
    setEditingProject(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject._id}`, formData);
        toast.success('Project updated');
      } else {
        await api.post('/projects', formData);
        toast.success('Project created');
      }
      fetchProjects();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      color: project.color || '#3b82f6'
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this project?')) return;
    
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cannot delete project that is in use');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A2540] text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-semibold">Projects & Categories</h1>
            <p className="text-blue-100 mt-2">Manage work categories used in reports</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-3 bg-white text-[#0A2540] px-6 py-3 rounded-2xl font-semibold hover:bg-white/90"
          >
            <Plus size={22} />
            New Project
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white text-gray-900 rounded-3xl w-full max-w-md">
              <div className="p-8">
                <h2 className="text-2xl font-semibold mb-6">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500"
                      placeholder="Client A / Internal Tooling"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 h-28"
                      placeholder="Brief description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color Tag</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-20 h-12 border border-gray-200 rounded-xl cursor-pointer"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={resetForm} className="flex-1 py-4 border rounded-2xl">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 bg-[#0A2540] text-white py-4 rounded-2xl font-semibold">
                      {loading ? 'Saving...' : editingProject ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-2xl flex-shrink-0"
                    style={{ backgroundColor: project.color || '#3b82f6' }}
                  />
                  <div>
                    <h3 className="font-semibold text-xl">{project.name}</h3>
                    {project.description && <p className="text-blue-100 text-sm mt-1 line-clamp-2">{project.description}</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => handleEdit(project)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                >
                  <Edit2 size={18} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(project._id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all"
                >
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;