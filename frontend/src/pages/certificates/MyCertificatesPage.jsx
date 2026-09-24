import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import certificateService from '../../services/certificateService';
import progressService from '../../services/progressService';
import { useAuth } from '../../context/AuthContext';
import { 
  Award, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  FileText, 
  Share2, 
  Calendar, 
  Hash,
  AlertCircle
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export const MyCertificatesPage = () => {
  const { user } = useAuth();

  const [certificates, setCertificates] = useState([]);
  const [dashboardCourses, setDashboardCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingCourseId, setClaimingCourseId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [certRes, dashRes] = await Promise.all([
        certificateService.getMyCertificates(),
        progressService.getStudentDashboard()
      ]);
      setCertificates(certRes.data.certificates || []);
      setDashboardCourses(dashRes.data.courses || []);
    } catch (err) {
      setError(err.message || 'Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClaimCertificate = async (courseId) => {
    setClaimingCourseId(courseId);
    setError('');
    setMessage('');
    try {
      const res = await certificateService.issueCertificate(courseId);
      setMessage(`Certificate ${res.data.certificate.certificateCode} successfully issued and verified!`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to issue certificate');
    } finally {
      setClaimingCourseId(null);
    }
  };

  const handleCopyLink = (code) => {
    const url = `${window.location.origin}/verify/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm text-slate-400">Loading verified credentials...</p>
      </div>
    );
  }

  // Courses eligible for certificate claim that aren't yet claimed
  const alreadyClaimedCourseIds = new Set(certificates.map((c) => c.course?._id || c.course));
  const claimableCourses = dashboardCourses.filter(
    (c) => c.isEligibleForCertificate && !alreadyClaimedCourseIds.has(c.course?._id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-indigo-950/60 to-slate-900/60 border border-slate-800 p-8 sm:p-10">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Cryptographic Credentials
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            My Verified Certificates
          </h1>
          <p className="text-sm text-slate-300">
            Official proof of mastery with SHA-256 cryptographic verification hashes. Download high-resolution PDFs or share instant verification URLs.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Claim Available Certificates Banner */}
      {claimableCourses.length > 0 && (
        <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-emerald-500/40 bg-emerald-950/20 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            Course Completed — Certificate Ready to Claim!
          </div>
          <p className="text-sm text-slate-200">
            You have satisfied 100% of the lessons, quizzes, and practical assignments for the following curriculum:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {claimableCourses.map((c) => (
              <div
                key={c.course?._id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{c.course?.title}</h4>
                  <span className="text-xs text-emerald-400 font-semibold">100% Verified Progress</span>
                </div>
                <button
                  onClick={() => handleClaimCertificate(c.course?._id)}
                  disabled={claimingCourseId === c.course?._id}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  <Award className="w-3.5 h-3.5" />
                  {claimingCourseId === c.course?._id ? 'Generating...' : 'Issue Certificate'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issued Certificates Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Earned Certificates ({certificates.length})</h2>

        {certificates.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4">
            <Award className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Certificates Issued Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Complete all required lessons, pass quizzes, and submit assignments in your enrolled courses to earn verifiable certificates.
            </p>
            <Link
              to="/student"
              className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25"
            >
              View Learning Progress
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-slate-900/60 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-6 shadow-xl"
              >
                <div className="space-y-4">
                  {/* Certificate Top Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      Verified Credential
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {cert.certificateCode}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-400">Awarded to: <strong className="text-white">{cert.studentName}</strong></span>
                    <h3 className="text-xl font-extrabold text-white tracking-tight leading-snug">
                      {cert.courseTitle}
                    </h3>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Lead Instructor:</span>
                      <strong className="text-slate-200">{cert.instructorName}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Date Issued:</span>
                      <strong className="text-slate-200">{new Date(cert.issueDate).toLocaleDateString()}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Verification Hash:</span>
                      <strong className="text-slate-300 font-mono text-[10px]">{cert.verificationHash?.substring(0, 16)}...</strong>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => handleCopyLink(cert.certificateCode)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-semibold"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    {copiedCode === cert.certificateCode ? 'Copied to Clipboard!' : 'Share Public Link'}
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/verify/${cert.certificateCode}`}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Verify Online
                    </Link>

                    <a
                      href={certificateService.getDownloadUrl(cert._id)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/25 flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCertificatesPage;
