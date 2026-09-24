import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  Users,
  Eye,
  EyeOff
} from 'lucide-react';

export const RegisterPage = () => {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [skillsInput, setSkillsInput] = useState('');
  const [skills, setSkills] = useState(['JavaScript', 'React']);
  const [goal, setGoal] = useState('Full Stack Web Development');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const roleOptions = [
    { id: 'student', label: 'Student', icon: BookOpen, desc: 'Learn skills & take adaptive quizzes' },
    { id: 'instructor', label: 'Instructor', icon: Layers, desc: 'Create courses & curriculum' },
    { id: 'reviewer', label: 'Reviewer', icon: ShieldCheck, desc: 'Review & approve content' },
    { id: 'mentor', label: 'Mentor', icon: Users, desc: 'Guide students & evaluate projects' },
  ];

  // Password strength checks
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isStrong = hasLength && hasUpper && hasLower && hasNumber;

  const handleAddSkill = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillsInput.trim()) {
      e.preventDefault();
      const newSkill = skillsInput.trim().replace(/,$/, '');
      if (!skills.includes(newSkill)) {
        setSkills([...skills, newSkill]);
      }
      setSkillsInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (!isStrong) {
      setLocalError('Please ensure password meets all security criteria (8+ chars, uppercase, lowercase, number)');
      return;
    }

    setIsSubmitting(true);
    setLocalError('');

    try {
      await register({
        name,
        email,
        password,
        role,
        skills,
        learningGoals: [goal]
      });
      navigate('/profile', { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-white">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-purple-950 via-purple-800 to-slate-900 bg-clip-text text-transparent">
              LearnHub
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight pt-2">Create an Account</h2>
          <p className="text-xs text-slate-500">
            Join thousands of learners mastering skills with AI guidance
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {roleOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = role === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRole(opt.id)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  isSelected
                    ? 'border-purple-600 bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'border-purple-100 bg-white text-slate-600 hover:border-purple-200 hover:bg-purple-50/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-purple-600'}`} />
                <span className="text-xs font-bold">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Registration Form Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-purple-100 bg-white shadow-xl shadow-purple-900/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {localError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{localError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-purple-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-purple-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars"
                    required
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-white border border-purple-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-purple-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-purple-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Password security checks */}
            <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1.5 text-[11px]">
              <div className="text-purple-950 font-bold mb-1">Password Requirements:</div>
              <div className="grid grid-cols-2 gap-1">
                <span className={`flex items-center gap-1.5 font-medium ${hasLength ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 8+ Characters
                </span>
                <span className={`flex items-center gap-1.5 font-medium ${hasUpper ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Uppercase (A-Z)
                </span>
                <span className={`flex items-center gap-1.5 font-medium ${hasLower ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Lowercase (a-z)
                </span>
                <span className={`flex items-center gap-1.5 font-medium ${hasNumber ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Number (0-9)
                </span>
              </div>
            </div>

            {/* Target Skills */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1.5">
                Target Skills (Optional)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Type skill & press Enter (e.g. Python, Docker)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-purple-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all font-medium"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-purple-400 hover:text-rose-600 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create {roleOptions.find(r => r.id === role)?.label} Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-purple-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-purple-700 hover:text-purple-800 underline decoration-purple-300">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
