import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'MEMBER' as 'MEMBER' | 'MANAGER'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role: 'MEMBER' | 'MANAGER') => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      toast.success('Account created successfully!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A2540] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex min-h-[640px]">
        
        <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-[#0A2540] via-[#1E3A8A] to-[#3B82F6] p-12 flex-col justify-between text-white relative">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center">
                <span className="text-[#0A2540] text-3xl font-bold">W</span>
              </div>
              <span className="text-3xl font-semibold tracking-tight">Weekly Reports</span>
            </div>

            <h2 className="text-5xl font-semibold leading-tight mb-6">
              Let's get you<br />started
            </h2>
            
            <p className="text-blue-100 text-lg leading-relaxed max-w-sm">
              Join your team and make weekly reporting simple, organized, and insightful.
            </p>
          </div>

          <div className="text-sm opacity-75">
            Trusted by teams at Sisenco Digital
          </div>
        </div>

        <div className="flex-1 p-10 lg:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-10">
              <h1 className="text-4xl font-semibold text-gray-900 mb-2">Create Account</h1>
              <p className="text-gray-600">Join the team and start tracking your work</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">I am joining as a</label>
                <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${formData.role === 'MEMBER' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="role"
                      checked={formData.role === 'MEMBER'}
                      onChange={() => handleRoleChange('MEMBER')}
                      className="w-5 h-5 accent-blue-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Team Member</p>
                      <p className="text-sm text-gray-500">Submit weekly reports</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${formData.role === 'MANAGER' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="role"
                      checked={formData.role === 'MANAGER'}
                      onChange={() => handleRoleChange('MANAGER')}
                      className="w-5 h-5 accent-blue-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Manager</p>
                      <p className="text-sm text-gray-500">View team dashboard & analytics</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Create Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="Confirm your password"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3B82F6] hover:bg-[#1E3A8A] text-white font-semibold py-4 rounded-2xl transition-all text-lg mt-4 disabled:opacity-70"
              >
                {loading ? "Creating Account..." : "Create My Account"}
              </button>
            </form>

            <p className="text-center text-gray-600 mt-8">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;