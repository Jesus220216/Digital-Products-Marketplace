import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">
              Digital<span className="text-emerald-500">Store</span>
            </h3>
            <p className="text-slate-400 text-sm">
              Tu marketplace de confianza para productos digitales de alta calidad.
              Videos, PDFs y mas.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Productos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/videos" className="text-slate-400 hover:text-white transition-colors">
                  Videos
                </Link>
              </li>
              <li>
                <Link to="/pdfs" className="text-slate-400 hover:text-white transition-colors">
                  PDFs
                </Link>
              </li>
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                  Ver todo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/afiliados" className="text-slate-400 hover:text-white transition-colors">
                  Programa de Afiliados
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Terminos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Politica de Privacidad
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center text-slate-400">
                <Mail className="w-4 h-4 mr-2" />
                info@digitalstore.com
              </li>
              <li className="flex items-center text-slate-400">
                <Phone className="w-4 h-4 mr-2" />
                +1 234 567 890
              </li>
              <li className="flex items-center text-slate-400">
                <MapPin className="w-4 h-4 mr-2" />
                Ciudad de Mexico, MX
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} DigitalStore. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
