-- ============================================================================
-- PredictiveBES · Medidas de seguridad del lado de Supabase
-- Ejecutar en Supabase → SQL Editor (una sola vez). Complementa las correcciones
-- del frontend para las fallas F-05 (cuenta demo) y F-13 (roles).
-- ============================================================================

-- 1) RLS: cada usuario solo ve y modifica sus propias filas ----------------------
alter table public.user_settings enable row level security;
alter table public.reportes_generados enable row level security;

drop policy if exists "user_settings: propio" on public.user_settings;
create policy "user_settings: propio" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "reportes_generados: propio" on public.reportes_generados;
create policy "reportes_generados: propio" on public.reportes_generados
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2) Cuenta de demostración protegida (F-05) ------------------------------------
-- Impide cambiar la contraseña, el correo o los metadatos de la cuenta demo,
-- aunque alguien use sus credenciales directamente contra la API de Supabase.
create or replace function public.proteger_cuenta_demo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.email = 'demo@predictivebes.com' and (
       new.encrypted_password is distinct from old.encrypted_password
    or new.email is distinct from old.email
    or new.raw_user_meta_data is distinct from old.raw_user_meta_data
  ) then
    raise exception 'La cuenta de demostración no puede modificarse';
  end if;
  return new;
end;
$$;

drop trigger if exists proteger_cuenta_demo on auth.users;
create trigger proteger_cuenta_demo
  before update on auth.users
  for each row execute function public.proteger_cuenta_demo();

-- 3) Roles en app_metadata (F-13) -----------------------------------------------
-- El frontend lee el rol de app_metadata, que solo puede modificarse desde aquí.
-- Ejemplo: asignar el rol de administrador a un usuario.
-- update auth.users
--   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'
--   where email = 'ingeniero@empresa.com';
