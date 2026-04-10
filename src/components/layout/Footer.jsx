import { Link } from 'react-router-dom';
import { BookOpen, Globe, Share2, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-2xl font-black text-blue-600 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                <BookOpen size={20} />
              </div>
              <span className="tracking-tighter">BlogNivo</span>
            </Link>
            <p className="text-slate-500 max-w-sm mb-6">
              Empowering creators with AI-driven insights and a seamless writing experience. Join our community of thought leaders today.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition">
                <Share2 size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition">
                <Globe size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition">
                <MessageSquare size={16} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/" className="hover:text-blue-600 transition">Explore Blogs</Link></li>
              <li><Link to="/editor" className="hover:text-blue-600 transition">Start Writing</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-600 transition">Author Dashboard</Link></li>
              <li><Link to="/signup" className="hover:text-blue-600 transition">Join Community</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-blue-600 transition">About Us</a></li>
              <li><a href="#" className="hover:text-blue-600 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-600 transition">Contact Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} BlogNivo AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-slate-600">Status</a>
            <a href="#" className="hover:text-slate-600">APIs</a>
            <a href="#" className="hover:text-slate-600">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}