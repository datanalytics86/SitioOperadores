import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

export default function Home() {
  // Datos mock - serán reemplazados con Supabase
  const vacantes = [
    {
      id: '1',
      titulo: 'Operador CAEX experiencia',
      equipo_requerido: 'CAEX',
      descripcion: 'Se busca operador CAEX con experiencia mínima 5 años para faena en Atacama.',
      region: 'Atacama',
      turno: 'rotativo',
      salario_min: 3000000,
      salario_max: 4000000,
    },
    {
      id: '2',
      titulo: 'Cargador Frontal turno día',
      equipo_requerido: 'Cargador Frontal',
      descripcion: 'Buscamos cargador frontal con licencia C para trabajar en construcción.',
      region: 'Metropolitana',
      turno: 'mañana',
      salario_min: 2500000,
      salario_max: 3200000,
    },
    {
      id: '3',
      titulo: 'Retroexcavadora urgente',
      equipo_requerido: 'Retroexcavadora',
      descripcion: 'Puesto urgente para retroexcavadora en proyecto de infraestructura.',
      region: 'Valparaíso',
      turno: 'tarde',
      salario_min: 2000000,
      salario_max: 2800000,
    },
  ];

  return (
    <main className="bg-ink-800 min-h-screen">
      <Navbar />
      <Hero />

      {/* Featured Jobs */}
      <section id="empleos" className="py-20 bg-ink-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label mb-2">Empleos destacados</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Oportunidades esperando por ti
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Consulta nuestras ofertas más recientes y encuentra el trabajo que se ajusta a tu perfil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vacantes.map((vacante) => (
              <div key={vacante.id} className="card p-6">
                <p className="section-label mb-2">{vacante.equipo_requerido}</p>
                <h3 className="text-xl font-semibold text-white mb-2">{vacante.titulo}</h3>
                <p className="text-sm text-gray-400 mb-4">{vacante.descripcion}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Región:</span>
                    <span className="text-white">{vacante.region}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Turno:</span>
                    <span className="text-faena-300 capitalize">{vacante.turno}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sueldo:</span>
                    <span className="text-faena font-semibold">
                      ${(vacante.salario_min / 1000).toFixed(0)}k - ${(vacante.salario_max / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
                <button className="w-full mt-4 btn-primary text-sm">
                  Postular ahora
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-20 bg-ink-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label mb-2">Proceso simple</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Cómo funciona
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Operators */}
            <div>
              <h3 className="text-2xl font-bold text-faena mb-6">Para Operadores</h3>
              <div className="space-y-6">
                {[
                  { num: '1', title: 'Regístrate', desc: 'Crea tu perfil en segundos' },
                  { num: '2', title: 'Filtra empleos', desc: 'Busca por equipo, región y turno' },
                  { num: '3', title: 'Postula', desc: 'Envía tu CV en un click' },
                  { num: '4', title: 'Consigue el turno', desc: 'Contacto directo con la empresa' },
                ].map((step) => (
                  <div key={step.num} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-faena text-black font-bold flex items-center justify-center flex-shrink-0">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{step.title}</h4>
                      <p className="text-sm text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Companies */}
            <div>
              <h3 className="text-2xl font-bold text-faena mb-6">Para Empresas</h3>
              <div className="space-y-6">
                {[
                  { num: '1', title: 'Publica tu aviso', desc: 'Describe el puesto en detalle' },
                  { num: '2', title: 'Recibe postulaciones', desc: 'Operadores calificados aplican' },
                  { num: '3', title: 'Revisa candidatos', desc: 'Accede a perfiles y CVs' },
                  { num: '4', title: 'Contrata al mejor', desc: 'Contacto directo y rápido' },
                ].map((step) => (
                  <div key={step.num} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-faena text-black font-bold flex items-center justify-center flex-shrink-0">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{step.title}</h4>
                      <p className="text-sm text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
