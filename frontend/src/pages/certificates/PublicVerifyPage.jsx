import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import certificateService from '../../services/certificateService';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Calendar, 
  Hash, 
  ArrowLeft,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const PublicVerifyPage = () => {
  const { code } = useParams();

  const [searchCode, setSearchCode] = useState(code || '');
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const performVerification = async (codeToVerify) => {
    if (!codeToVerify) return;
    setLoading(true);
    setError('');
    setCertData(null);
    setSearched(true);

    try {
      const res = await certificateService.verifyCertificate(codeToVerify.trim());
      setCertData(res.data.certificate);
    } catch (err) {
      setError(err.message || 'Certificate verification failed. Code not recognized.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      setSearchCode(code);
      performVerification(code);
    }
  }, [code]);

  const handleSubmit = (e) => {
    e.preventDefault();
    performVerification(searchCode);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Navigation */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to LearnHub Platform
      </Link>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/10">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Credential Verification Authority
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Verify authentic certificates issued by LearnHub. Cryptographically validated against our immutable verification registry.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Enter Certificate Code (e.g., LH-MTLCPNP9-JBO1)"
            required
            className="w-full pl-5 pr-28 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-xl font-mono uppercase"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Verify
          </button>
        </div>
      </form>

      {/* Verification Result Display */}
      {searched && (
        <div className="pt-4">
          {certData ? (
            <div className="glass-panel-glow p-8 sm:p-10 rounded-3xl border border-emerald-500/40 bg-slate-900/80 space-y-6 shadow-2xl">
              {/* Authenticity Banner */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Authentic Credential Verified
                    </span>
                    <h3 className="text-lg font-bold text-white font-mono">{certData.certificateCode}</h3>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-500/30">
                  Official Record
                </span>
              </div>

              {/* Verified Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Recipient Learner</span>
                  <div className="text-lg font-extrabold text-white">{certData.studentName}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Completed Curriculum</span>
                  <div className="text-lg font-extrabold text-indigo-400">{certData.courseTitle}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Lead Instructor</span>
                  <div className="font-semibold text-slate-200">{certData.instructorName}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Date Verified & Issued</span>
                  <div className="font-semibold text-slate-200">{new Date(certData.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>

              {/* Cryptographic SHA-256 Hash */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span>SHA-256 Cryptographic Verification Hash:</span>
                </div>
                <div className="font-mono text-xs text-slate-300 break-all select-all">
                  {certData.verificationHash}
                </div>
              </div>

              <div className="text-center text-xs text-slate-500 pt-2">
                This verification certifies that the student fulfilled all course curriculum, passed required automated assessments, and submitted project requirements.
              </div>
            </div>
          ) : error ? (
            <div className="glass-panel p-8 rounded-3xl border border-rose-500/40 bg-slate-900/60 text-center space-y-3">
              <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Verification Failed</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">{error}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default PublicVerifyPage;
