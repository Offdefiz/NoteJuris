import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { X, LogIn, UserPlus, LogOut, Check, Mail, Lock, User, Briefcase, Moon, Sun } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    profile,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logOut,
    updateUserProfile,
    error,
    clearError,
  } = useAuth();
  const { theme, setTheme } = useTheme();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('Estudante de Direito');
  const [loading, setLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Profile edit states
  const [editName, setEditName] = useState(profile?.displayName || '');
  const [editRole, setEditRole] = useState(profile?.role || 'Estudante de Direito');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        onClose();
      } else {
        await signUpWithEmail(email, password, displayName, role);
        onClose();
      }
    } catch {
      // error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    clearError();
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      // error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateUserProfile({
        displayName: editName,
        role: editRole,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md p-6 bg-white dark:bg-[#181e2b] rounded-2xl border border-[#dedbd3] dark:border-[#2b3548] shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#7c8699] dark:text-[#9ea8bd] hover:bg-[#edebe6] dark:hover:bg-[#252f42] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          /* Profile view */
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#202735] dark:bg-[#323d52] text-white text-lg font-bold">
                {(profile?.displayName || user.email || 'E')[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#141822] dark:text-[#f8fafc]">
                  Meu Perfil
                </h3>
                <p className="text-[12px] text-[#6d7586] dark:text-[#97a1b4]">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-[#5b6375] dark:text-[#9ea8bd] uppercase tracking-wider mb-1">
                  Nome de Exibição
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-[#8b95a8]" />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg bg-[#f9f8f5] dark:bg-[#131720] border border-[#dedbd3] dark:border-[#2b3548] text-[#1a1f2b] dark:text-white focus:outline-hidden focus:border-[#2d3a50]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5b6375] dark:text-[#9ea8bd] uppercase tracking-wider mb-1">
                  Área / Ocupação
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-[#8b95a8]" />
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg bg-[#f9f8f5] dark:bg-[#131720] border border-[#dedbd3] dark:border-[#2b3548] text-[#1a1f2b] dark:text-white focus:outline-hidden focus:border-[#2d3a50]"
                  >
                    <option value="Estudante de Direito">Estudante de Direito</option>
                    <option value="Concurseiro(a)">Concurseiro(a) / Carreiras Jurídicas</option>
                    <option value="Advogado(a)">Advogado(a)</option>
                    <option value="Estagiário(a) de Direito">Estagiário(a) de Direito</option>
                    <option value="Professor(a) / Pesquisador(a)">Professor(a) / Pesquisador(a)</option>
                  </select>
                </div>
              </div>

              {/* Theme Preference */}
              <div>
                <label className="block text-[11px] font-bold text-[#5b6375] dark:text-[#9ea8bd] uppercase tracking-wider mb-1">
                  Tema da Interface
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-2 flex-1 py-2 px-3 rounded-lg border text-[12px] font-medium transition-colors ${
                      theme === 'light'
                        ? 'border-[#202735] bg-[#ece9e2] text-[#151922] font-semibold'
                        : 'border-[#dedbd3] dark:border-[#2b3548] text-[#6b7385]'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Claro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-2 flex-1 py-2 px-3 rounded-lg border text-[12px] font-medium transition-colors ${
                      theme === 'dark'
                        ? 'border-[#60a5fa] bg-[#1e2738] text-white font-semibold'
                        : 'border-[#dedbd3] dark:border-[#2b3548] text-[#6b7385]'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Escuro</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-lg bg-[#222a38] dark:bg-[#344055] hover:bg-[#151b24] dark:hover:bg-[#455470] text-white text-[13px] font-semibold transition-colors"
              >
                {profileSaved ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Salvo!</span>
                  </>
                ) : (
                  <span>Salvar Alterações</span>
                )}
              </button>

              <button
                onClick={async () => {
                  await logOut();
                  onClose();
                }}
                className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg border border-[#e0ddd4] dark:border-[#2f394d] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[13px] font-medium transition-colors"
                title="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#151924] dark:text-[#f8fafc]">
                {mode === 'signin' ? 'Acessar Caderno' : 'Criar Nova Conta'}
              </h3>
              <p className="text-[12px] text-[#687081] dark:text-[#9ea8bc] mt-0.5">
                {mode === 'signin'
                  ? 'Entre para salvar suas anotações e fluxogramas na nuvem.'
                  : 'Crie sua conta para sincronizar todos os seus cadernos jurídicos.'}
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex p-1 bg-[#edeae4] dark:bg-[#121620] rounded-xl border border-[#dedbd3] dark:border-[#283244]">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  clearError();
                }}
                className={`flex-1 py-1.5 text-[12px] font-semibold rounded-lg transition-colors ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-[#1f2635] text-[#171b26] dark:text-white shadow-xs'
                    : 'text-[#687080] dark:text-[#96a0b2] hover:text-[#181d28]'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  clearError();
                }}
                className={`flex-1 py-1.5 text-[12px] font-semibold rounded-lg transition-colors ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-[#1f2635] text-[#171b26] dark:text-white shadow-xs'
                    : 'text-[#687080] dark:text-[#96a0b2] hover:text-[#181d28]'
                }`}
              >
                Cadastrar
              </button>
            </div>

            {error && (
              <div className="p-3 text-[12px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5b6375] dark:text-[#9ea8bd] uppercase tracking-wider mb-1">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-[#8b95a8]" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Ex: Maria Fernandes"
                        className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg bg-[#f9f8f5] dark:bg-[#131720] border border-[#dedbd3] dark:border-[#2b3548] text-[#1a1f2b] dark:text-white focus:outline-hidden focus:border-[#2d3a50]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5b6375] dark:text-[#9ea8bd] uppercase tracking-wider mb-1">
                      Ocupação
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-[#8b95a8]" />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg bg-[#f9f8f5] dark:bg-[#131720] border border-[#dedbd3] dark:border-[#2b3548] text-[#1a1f2b] dark:text-white focus:outline-hidden focus:border-[#2d3a50]"
                      >
                        <option value="Estudante de Direito">Estudante de Direito</option>
                        <option value="Concurseiro(a)">Concurseiro(a)</option>
                        <option value="Advogado(a)">Advogado(a)</option>
                        <option value="Estagiário(a)">Estagiário(a)</option>
                        <option value="Professor(a)">Professor(a)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#5b6375] dark:text-[#9ea8bd] uppercase tracking-wider mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#8b95a8]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="estudante@direito.com"
                    className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg bg-[#f9f8f5] dark:bg-[#131720] border border-[#dedbd3] dark:border-[#2b3548] text-[#1a1f2b] dark:text-white focus:outline-hidden focus:border-[#2d3a50]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5b6375] dark:text-[#9ea8bd] uppercase tracking-wider mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#8b95a8]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg bg-[#f9f8f5] dark:bg-[#131720] border border-[#dedbd3] dark:border-[#2b3548] text-[#1a1f2b] dark:text-white focus:outline-hidden focus:border-[#2d3a50]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#202735] dark:bg-[#2f394d] hover:bg-[#141924] dark:hover:bg-[#3d4b66] text-white text-[13px] font-semibold transition-colors mt-2"
              >
                {loading
                  ? 'Processando...'
                  : mode === 'signin'
                  ? 'Entrar no Caderno'
                  : 'Criar Minha Conta'}
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="grow border-t border-[#dedbd3] dark:border-[#2b3548]"></div>
              <span className="shrink mx-3 text-[11px] text-[#868f9f] uppercase tracking-wider font-mono">ou</span>
              <div className="grow border-t border-[#dedbd3] dark:border-[#2b3548]"></div>
            </div>

            {/* Google sign-in */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-[#d8d5cb] dark:border-[#2d374a] bg-white dark:bg-[#191f2c] text-[#2c3342] dark:text-[#e1e6f0] hover:bg-[#f7f6f2] dark:hover:bg-[#202738] text-[13px] font-medium transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com o Google</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
