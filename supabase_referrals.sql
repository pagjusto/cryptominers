-- ============================================================================
-- CRYPTOZOMBIES — SISTEMA DE INDICAÇÃO (1% DE COMISSÃO EM COINS)
-- Regra de negócio: Jogador precisa ter pelo menos 1 herói para divulgar.
-- Comissão creditada em Coins sobre compras reais de Baús em USDT.
-- ============================================================================

-- 1. Colunas de indicação na tabela profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS referred_by_code TEXT,
  ADD COLUMN IF NOT EXISTS referral_coins_earned NUMERIC NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code
  ON public.profiles (referral_code);

CREATE INDEX IF NOT EXISTS idx_profiles_referred_by_user_id
  ON public.profiles (referred_by_user_id);

-- 2. Tabela de histórico de comissões de indicação
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_name TEXT,
  package_id TEXT NOT NULL,
  purchase_usdt NUMERIC NOT NULL CHECK (purchase_usdt > 0),
  commission_pct NUMERIC NOT NULL DEFAULT 1,
  coins_rewarded NUMERIC NOT NULL CHECK (coins_rewarded >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_no_self_referral CHECK (referrer_user_id <> referred_user_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer
  ON public.referral_rewards (referrer_user_id, created_at DESC);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own referral rewards" ON public.referral_rewards;
CREATE POLICY "Users can view their own referral rewards"
  ON public.referral_rewards
  FOR SELECT
  USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

-- 4. Função para gerar código único ao criar/atualizar usuário e vincular indicador
CREATE OR REPLACE FUNCTION public.bind_referral_on_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ref_code TEXT;
  v_referrer_id UUID;
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := 'CZ' || UPPER(SUBSTRING(REPLACE(NEW.id::TEXT, '-', '') FROM 1 FOR 6));
  END IF;

  -- Vínculo imutável: apenas se ainda não tiver indicador
  IF NEW.referred_by_user_id IS NULL AND NEW.referred_by_code IS NOT NULL AND NEW.referred_by_code <> '' THEN
    v_ref_code := UPPER(TRIM(NEW.referred_by_code));
    SELECT id INTO v_referrer_id
    FROM public.profiles
    WHERE UPPER(referral_code) = v_ref_code
      AND id <> NEW.id
    LIMIT 1;

    IF v_referrer_id IS NOT NULL THEN
      NEW.referred_by_user_id := v_referrer_id;
      NEW.referred_by_code := v_ref_code;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bind_referral_on_profile ON public.profiles;
CREATE TRIGGER trg_bind_referral_on_profile
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.bind_referral_on_profile();

-- 5. RPC para processar comissão de 1% em Coins quando indicado compra baú em USDT
CREATE OR REPLACE FUNCTION public.process_referral_purchase_reward(
  p_referred_user_id UUID,
  p_package_id TEXT,
  p_purchase_usdt NUMERIC,
  p_miner_rate NUMERIC DEFAULT 0.01
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_id UUID;
  v_referred_name TEXT;
  v_commission_pct NUMERIC := 1;
  v_coins_rewarded NUMERIC;
  v_rate NUMERIC;
BEGIN
  IF p_purchase_usdt IS NULL OR p_purchase_usdt <= 0 THEN
    RETURN jsonb_build_object('credited', false, 'reason', 'invalid_amount');
  END IF;

  v_rate := GREATEST(COALESCE(p_miner_rate, 0.01), 0.0001);

  SELECT referred_by_user_id, player_name
  INTO v_referrer_id, v_referred_name
  FROM public.profiles
  WHERE id = p_referred_user_id
  LIMIT 1;

  IF v_referrer_id IS NULL OR v_referrer_id = p_referred_user_id THEN
    RETURN jsonb_build_object('credited', false, 'reason', 'no_referrer');
  END IF;

  -- 1% do valor em USDT convertido para Coins
  v_coins_rewarded := ROUND(((p_purchase_usdt * (v_commission_pct / 100.0)) / v_rate)::NUMERIC, 2);

  INSERT INTO public.referral_rewards (
    referrer_user_id,
    referred_user_id,
    referred_name,
    package_id,
    purchase_usdt,
    commission_pct,
    coins_rewarded
  ) VALUES (
    v_referrer_id,
    p_referred_user_id,
    COALESCE(v_referred_name, 'Comandante'),
    COALESCE(p_package_id, 'chest'),
    p_purchase_usdt,
    v_commission_pct,
    v_coins_rewarded
  );

  UPDATE public.profiles
  SET
    referral_coins_earned = COALESCE(referral_coins_earned, 0) + v_coins_rewarded,
    bcoin_balance = COALESCE(bcoin_balance, 0) + v_coins_rewarded
  WHERE id = v_referrer_id;

  RETURN jsonb_build_object(
    'credited', true,
    'referrer_user_id', v_referrer_id,
    'coins_rewarded', v_coins_rewarded,
    'commission_pct', v_commission_pct
  );
END;
$$;
