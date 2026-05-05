import { createClient } from '@supabase/supabase-js';

// supabase-js valida que la URL no sea vacía al crear el cliente. En build sin
// env vars usamos un placeholder con formato URL válido para evitar el throw.
// En runtime, si NEXT_PUBLIC_SUPABASE_URL no está definida, el cliente fallará
// en la primera llamada a la API (comportamiento correcto, fácil de depurar).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-build-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};
