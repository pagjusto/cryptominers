import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Skull
} from 'lucide-react';
import { signInWithEmail, signUpWithEmail } from '../services/authService';

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess
}) {
  const [mode, setMode] = useState(initialMode);
  const [playerName, setPlayerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'register') {
      if (!playerName.trim()) {
        setErrorMsg('Escolha um nome de Comandante para o seu perfil.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('As senhas digitadas não coincidem.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const user = await signInWithEmail(email, password);
        if (onAuthSuccess) onAuthSuccess(user);
        onClose();
      } else {
        const result = await signUpWithEmail(email, password, playerName);
        if (result.needsEmailConfirmation) {
          setSuccessMsg(
            'Conta criada! Enviamos um link de confirmação para o seu e-mail. Confirme para entrar.'
          );
        } else if (result.user) {
          if (onAuthSuccess) onAuthSuccess(result.user);
          onClose();
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden font-tech text-white">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Skull size={20} />
            </div>
            <div>
              <h2 className="font-arcade text-sm sm:text-base text-amber-400 tracking-wide">
                {mode === 'login' ? 'ENTRAR NO ABRIGO' : 'CRIAR CONTA'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'login'
                  ? 'Acesse sua base, heróis e saldo na nuvem'
                  : 'Cadastre-se para salvar seu progresso e jogar'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ABAS ENTRAR / CRIAR CONTA */}
        <div className="grid grid-cols-2 gap-2 p-4 pb-0">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition cursor-pointer ${
              mode === 'login'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn size={14} />
            <span>Entrar</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition cursor-pointer ${
              mode === 'register'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus size={14} />
            <span>Cadastrar</span>
          </button>
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs">
              <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Nome de Comandante
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ex: Comandante Silva"
                  maxLength={28}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-emerald-400 focus:outline-none text-sm text-white placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
              E-mail
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-amber-400 focus:outline-none text-sm text-white placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Senha
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-amber-400 focus:outline-none text-sm text-white placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita sua senha"
                  minLength={6}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-emerald-400 focus:outline-none text-sm text-white placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-arcade text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
              mode === 'login'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processando...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn size={16} />
                <span>Entrar na Base</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Criar Conta e Entrar</span>
              </>
            )}
          </button>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span>Você poderá vincular sua carteira Web3 dentro do jogo.</span>
          </div>
        </form>
      </div>
    </div>
  );
}
