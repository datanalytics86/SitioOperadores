'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const MAX_CV_BYTES = 10 * 1024 * 1024;

export default function OperadorDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [operador, setOperador] = useState<any>(null);
  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadOk, setUploadOk] = useState('');

  const fileInputAvatar = useRef<HTMLInputElement>(null);
  const fileInputCv = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          router.push('/auth/login');
          return;
        }

        setUserId(authUser.id);

        const { data: operadorData } = await supabase
          .from('operadores')
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle();

        if (operadorData) {
          setOperador(operadorData);

          const { data: postulacionesData } = await supabase
            .from('postulaciones')
            .select('*, vacantes(titulo, empresa_id, empresas(nombre))')
            .eq('operador_id', operadorData.id);

          setPostulaciones(postulacionesData || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const uploadFile = async (
    file: File,
    folder: 'avatar' | 'cv',
    column: 'avatar_url' | 'cv_url'
  ) => {
    if (!userId || !operador) return;
    setUploadError('');
    setUploadOk('');

    const path = `${userId}/${folder}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    const { error: uploadErr } = await supabase.storage
      .from('operadores')
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadErr) {
      setUploadError(`Error subiendo archivo: ${uploadErr.message}`);
      return;
    }

    const { data: pub } = supabase.storage.from('operadores').getPublicUrl(path);
    const publicUrl = pub.publicUrl;

    const { error: updateErr } = await supabase
      .from('operadores')
      .update({ [column]: publicUrl })
      .eq('id', operador.id);

    if (updateErr) {
      setUploadError(`Archivo subido pero no se pudo guardar: ${updateErr.message}`);
      return;
    }

    setOperador({ ...operador, [column]: publicUrl });
    setUploadOk(folder === 'avatar' ? 'Foto actualizada' : 'CV actualizado');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('La foto debe ser una imagen');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setUploadError('La foto no puede superar 5 MB');
      return;
    }
    setUploadingAvatar(true);
    await uploadFile(file, 'avatar', 'avatar_url');
    setUploadingAvatar(false);
    if (fileInputAvatar.current) fileInputAvatar.current.value = '';
  };

  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setUploadError('El CV debe ser un archivo PDF');
      return;
    }
    if (file.size > MAX_CV_BYTES) {
      setUploadError('El CV no puede superar 10 MB');
      return;
    }
    setUploadingCv(true);
    await uploadFile(file, 'cv', 'cv_url');
    setUploadingCv(false);
    if (fileInputCv.current) fileInputCv.current.value = '';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-ink-800 pt-20 flex items-center justify-center">
          <p className="text-gray-400">Cargando...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink-800 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              {operador?.avatar_url ? (
                <img
                  src={operador.avatar_url}
                  alt="Foto de perfil"
                  className="w-16 h-16 rounded-full object-cover border-2 border-faena"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-ink-600 flex items-center justify-center text-2xl text-gray-400">
                  {operador?.nombre_completo?.charAt(0) ?? '?'}
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Bienvenido, {operador?.nombre_completo}
                </h1>
                <p className="text-gray-400">{operador?.años_experiencia} años de experiencia</p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-secondary">
              Cerrar sesión
            </button>
          </div>

          {(uploadError || uploadOk) && (
            <div
              className={`px-4 py-3 rounded-lg mb-6 text-sm ${
                uploadError
                  ? 'bg-red-500/10 border border-red-500 text-red-300'
                  : 'bg-green-500/10 border border-green-500 text-green-300'
              }`}
            >
              {uploadError || uploadOk}
            </div>
          )}

          <div className="card p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Documentos y foto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-2">Foto de perfil</p>
                <input
                  ref={fileInputAvatar}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputAvatar.current?.click()}
                  disabled={uploadingAvatar}
                  className="btn-secondary w-full disabled:opacity-50"
                >
                  {uploadingAvatar ? 'Subiendo...' : operador?.avatar_url ? 'Cambiar foto' : 'Subir foto'}
                </button>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG o WebP. Máximo 5 MB.</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Curriculum (CV)</p>
                <input
                  ref={fileInputCv}
                  type="file"
                  accept="application/pdf"
                  onChange={handleCvChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputCv.current?.click()}
                  disabled={uploadingCv}
                  className="btn-secondary w-full disabled:opacity-50"
                >
                  {uploadingCv ? 'Subiendo...' : operador?.cv_url ? 'Reemplazar CV' : 'Subir CV'}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Solo PDF. Máximo 10 MB.{' '}
                  {operador?.cv_url && (
                    <a
                      href={operador.cv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-faena-300 hover:text-faena transition-colors"
                    >
                      Ver CV actual
                    </a>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Mi Perfil</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">RUT</p>
                <p className="text-white">{operador?.rut}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Teléfono</p>
                <p className="text-white">{operador?.telefono}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Región</p>
                <p className="text-white">{operador?.region}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Ciudad</p>
                <p className="text-white">{operador?.ciudad}</p>
              </div>
            </div>
            <Link href="#" className="btn-secondary mt-6 inline-block">
              Editar perfil
            </Link>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Mis Postulaciones</h2>
            {postulaciones.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">Aún no tienes postulaciones</p>
                <Link href="/#empleos" className="btn-primary">
                  Ver empleos disponibles
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {postulaciones.map((post) => (
                  <div key={post.id} className="border border-ink-600 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-semibold">{post.vacantes?.titulo}</h3>
                      <p className="text-gray-400 text-sm">{post.vacantes?.empresas?.nombre}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      post.estado === 'aceptado' ? 'bg-green-500/20 text-green-300' :
                      post.estado === 'rechazado' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {post.estado.charAt(0).toUpperCase() + post.estado.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
