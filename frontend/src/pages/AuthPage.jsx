import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
        setMessage('Η εγγραφή έγινε επιτυχώς! Μπορείς να συνδεθείς τώρα.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Κάτι πήγε στραβά. Δοκίμασε ξανά.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
        <h2 className="text-3xl font-extrabold text-white text-center mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-slate-400 text-center text-sm mb-6">{isLogin ? 'Σύνδεση στο Marketing Automation SaaS' : 'Ξεκίνα να αυτοματοποιείς τις καμπάνιες σου'}</p>
        {error && (<div className="bg-rose-500/10 border border-rose-500 text-rose-400 p-3 rounded-xl text-sm mb-4 text-center">{error}</div>)}
        {message && (<div className="bg-emerald-500/10 border border-emerald-500 text-emerald-400 p-3 rounded-xl text-sm mb-4 text-center">{message}</div>)}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 mt-2">
            {submitting ? (<><Loader2 className="animate-spin" size={18} /> Παρακαλώ περιμένετε...</>) : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-indigo-400 hover:text-indigo-300 transition-all">
            {isLogin ? 'Δεν έχεις λογαριασμό; Κάνε εγγραφή' : 'Έχεις ήδη λογαριασμό; Σύνδεσαι εδώ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;