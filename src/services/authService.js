// ============================================================================
// CRYPTOZOMBIES — SERVIÇO DE AUTENTICAÇÃO (SUPABASE AUTH)
// ============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { getStoredReferralCode } from './referralService';

const LOCAL_AUTH_FALLBACK_KEY = 'crypto_zombies_local_auth_user_v1';

/**
 * Traduz mensagens de erro comuns do Supabase Auth para Português.
 */
export function translateAuthError(message = '') {
  const msg = String(message).toLowerCase();
  if (msg.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.';
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'Este e-mail já está cadastrado. Faça login na aba Entrar.';
  }
  if (msg.includes('password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (msg.includes('unable to validate email address') || msg.includes('invalid email')) {
    return 'Digite um endereço de e-mail válido.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Confirme seu e-mail pelo link enviado na caixa de entrada antes de entrar.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Muitas tentativas em sequência. Aguarde alguns instantes e tente novamente.';
  }
  return message || 'Não foi possível concluir a autenticação.';
}

/**
 * Obtém a sessão atual autenticada no Supabase (ou fallback local se offline).
 */
export async function getCurrentAuthUser() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session?.user) {
        return session.user;
      }
    } catch (err) {
      console.warn('[Auth] Falha ao consultar sessão Supabase:', err);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_AUTH_FALLBACK_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Inscreve um listener para mudanças de autenticação (login, logout, refresh).
 */
export function subscribeAuthChanges(callback) {
  if (!isSupabaseConfigured || !supabase) {
    return () => {};
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });

  return () => subscription?.unsubscribe();
}

/**
 * Realiza login com e-mail e senha.
 */
export async function signInWithEmail(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !password) {
    throw new Error('Preencha e-mail e senha para entrar.');
  }

  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Autenticação em nuvem não configurada neste ambiente.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password
  });

  if (error) {
    throw new Error(translateAuthError(error.message));
  }

  if (data?.user?.user_metadata?.player_name) {
    localStorage.setItem('cripto_myners_player_name', data.user.user_metadata.player_name);
  }

  return data.user;
}

/**
 * Cria uma nova conta com e-mail, senha e nome de comandante.
 */
export async function signUpWithEmail(email, password, playerName) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (playerName || '').trim() || 'Comandante';

  if (!cleanEmail || !password) {
    throw new Error('Preencha todos os campos obrigatórios.');
  }
  if (password.length < 6) {
    throw new Error('A senha precisa ter no mínimo 6 caracteres.');
  }
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Autenticação em nuvem não configurada neste ambiente.');
  }

  const pendingRef = getStoredReferralCode();

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        player_name: cleanName,
        ...(pendingRef ? { referred_by: pendingRef } : {})
      }
    }
  });

  if (error) {
    throw new Error(translateAuthError(error.message));
  }

  localStorage.setItem('cripto_myners_player_name', cleanName);

  // Caso o projeto Supabase exija confirmação de e-mail, session vem null
  const needsEmailConfirmation = Boolean(data?.user && !data?.session);

  return {
    user: data.user,
    session: data.session,
    needsEmailConfirmation
  };
}

/**
 * Encerra a sessão atual do jogador.
 */
export async function signOutUser() {
  localStorage.removeItem(LOCAL_AUTH_FALLBACK_KEY);

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(translateAuthError(error.message));
    }
  }
}
