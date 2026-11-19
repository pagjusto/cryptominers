-- ============================================================================
-- CRIPTO MYNERS — SCHEMA OFICIAL SUPABASE (POSTGRESQL)
-- Execute este script no SQL Editor do seu Dashboard Supabase:
-- https://supabase.com/dashboard/project/gknnbkwykvijewqxmbbr/sql
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. TABELA DE PERFIS DE JOGADOR (PROFILES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    wallet_address TEXT PRIMARY KEY,
    player_name TEXT DEFAULT 'Comandante das Minas',
    player_avatar TEXT DEFAULT 'bomb_bot',
    mnc_balance NUMERIC(18, 4) DEFAULT 50.0000,
    usdt_balance NUMERIC(18, 4) DEFAULT 100.0000,
    total_invested NUMERIC(18, 4) DEFAULT 0.0000,
    studio_revenue NUMERIC(18, 4) DEFAULT 0.0000,
    current_house_id TEXT DEFAULT 'tiny',
    last_login_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. TABELA DE SOBREVIVENTES / COMBATENTES DO JOGADOR (USER_HEROES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_heroes (
    id TEXT PRIMARY KEY,
    wallet_address TEXT NOT NULL REFERENCES public.profiles(wallet_address) ON DELETE CASCADE,
    hero_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    name TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'common',
    rarity_name TEXT DEFAULT 'Comum',
    power NUMERIC(10, 2) DEFAULT 1.00,
    speed NUMERIC(10, 2) DEFAULT 1.00,
    durability NUMERIC(10, 2) DEFAULT 100.00,
    current_stamina NUMERIC(10, 2) DEFAULT 100.00,
    max_stamina NUMERIC(10, 2) DEFAULT 100.00,
    current_health NUMERIC(10, 2) DEFAULT 100.00,
    max_health NUMERIC(10, 2) DEFAULT 100.00,
    status TEXT DEFAULT 'work', -- 'work' | 'sleep' | 'house' | 'reserve'
    weapon_id TEXT,
    equipped_gear JSONB DEFAULT '{}'::jsonb,
    coins_per_hour NUMERIC(10, 4) DEFAULT 1.4000,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_heroes_wallet ON public.user_heroes(wallet_address);

-- ----------------------------------------------------------------------------
-- 3. TABELA DE INVENTÁRIO, BAÚS E ARSENAL (USER_INVENTORY)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_inventory (
    wallet_address TEXT PRIMARY KEY REFERENCES public.profiles(wallet_address) ON DELETE CASCADE,
    inventory_chests JSONB DEFAULT '[]'::jsonb,
    purchased_chests JSONB DEFAULT '[]'::jsonb,
    gear_stash JSONB DEFAULT '[]'::jsonb,
    construction_chests JSONB DEFAULT '[]'::jsonb,
    construction_fragments NUMERIC(10, 2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. TABELA DE HISTÓRICO DE TRANSAÇÕES E SAQUES (TRANSACTIONS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT NOT NULL REFERENCES public.profiles(wallet_address) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'claim_reward' | 'withdraw' | 'repair' | 'buy_chest' | 'ad_reward'
    amount_mnc NUMERIC(18, 4) DEFAULT 0.0000,
    net_usdt NUMERIC(18, 4) DEFAULT 0.0000,
    tax_pct NUMERIC(5, 2) DEFAULT 0.00,
    details JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'completed', -- 'completed' | 'pending' | 'failed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON public.transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at DESC);

-- ----------------------------------------------------------------------------
-- 5. TABELA DE MAPAS INDIVIDUAIS DOS JOGADORES (PLAYER_MAPS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.player_maps (
    wallet_address TEXT PRIMARY KEY REFERENCES public.profiles(wallet_address) ON DELETE CASCADE,
    cycle_index INTEGER DEFAULT 1,
    deposits_data JSONB DEFAULT '[]'::jsonb,
    completed_deposits INTEGER DEFAULT 0,
    total_mined_cycle NUMERIC(18, 4) DEFAULT 0.0000,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_maps ENABLE ROW LEVEL SECURITY;

-- Políticas para acesso público/anon (jogadores Web3 autenticados por wallet)
CREATE POLICY "Acesso total a perfis por carteira" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total a herois por carteira" ON public.user_heroes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total ao inventario por carteira" ON public.user_inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total a transacoes por carteira" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total ao mapa por carteira" ON public.player_maps FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 7. FUNÇÃO E TRIGGER PARA ATUALIZAR 'updated_at' AUTOMATICAMENTE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_user_heroes_updated_at
BEFORE UPDATE ON public.user_heroes
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_user_inventory_updated_at
BEFORE UPDATE ON public.user_inventory
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_player_maps_updated_at
BEFORE UPDATE ON public.player_maps
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
