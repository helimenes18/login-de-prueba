-- ============================================================
-- PredictiveBES · Cambios necesarios en Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1) Tabla de configuración por usuario (pantalla Configuración)
create table if not exists public.user_settings (
    user_id uuid primary key references auth.users(id) on delete cascade,
    pip_min numeric default 100,
    pdp_max numeric default 1500,
    pdt_max numeric default 200,
    corriente_min numeric default 2.0,
    email_alerts boolean default true,
    dashboard_alerts boolean default true,
    auto_reports boolean default false,
    monitor_interval_seconds integer default 3,
    updated_at timestamptz default now()
);

alter table public.user_settings enable row level security;

create policy "user_settings_select_own"
    on public.user_settings for select
    using (auth.uid() = user_id);

create policy "user_settings_upsert_own"
    on public.user_settings for insert
    with check (auth.uid() = user_id);

create policy "user_settings_update_own"
    on public.user_settings for update
    using (auth.uid() = user_id);


-- 2) Tabla de historial de reportes generados (pantalla Reportes / Perfil)
create table if not exists public.reportes_generados (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    tipo text,
    formato text,
    fecha_inicio date,
    fecha_fin date,
    total_registros integer,
    filename text,
    created_at timestamptz default now()
);

alter table public.reportes_generados enable row level security;

create policy "reportes_select_own"
    on public.reportes_generados for select
    using (auth.uid() = user_id);

create policy "reportes_insert_own"
    on public.reportes_generados for insert
    with check (auth.uid() = user_id);


-- ============================================================
-- OPCIONAL (no implementado en el frontend todavía):
-- Tabla "pozos" si más adelante quieres que el Mapa muestre
-- telemetría real por pozo en vez de los datos de ejemplo.
-- ============================================================
-- create table if not exists public.pozos (
--     id text primary key,            -- ej. 'BES-01'
--     estado text,                    -- Operando / Alerta / Falla / Mantenimiento / Parado
--     petroleo_bpd numeric,
--     gas_bpd numeric,
--     pos_x numeric,                  -- coordenada X dentro del SVG del mapa
--     pos_y numeric,                  -- coordenada Y dentro del SVG del mapa
--     updated_at timestamptz default now()
-- );
