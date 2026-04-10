import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useBlogs } from '../hooks/useBlogs';
import { Search } from 'lucide-react';
import BlogCard from '../components/blog/BlogCard';

export default function Home() {
  const { blogs, loading, fetchBlogs } = useBlogs();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchBlogs({ category });
    
    supabase
      .from('categories')
      .select('name')
      .then(({ data }) => {
        if (data) setCategories(data.map((c) => c.name));
      });
  }, [category, fetchBlogs]);

  const filtered = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.tags?.some((t) => t.includes(search.toLowerCase()))
  );

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-12 bg-slate-100 rounded-3xl w-1/3 mx-auto mb-12" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-96 bg-slate-50 rounded-3xl" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="relative mb-16 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
            BlogNivo
          </span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
          Where brilliant minds meet artificial intelligence. Experience the future of collaborative storytelling.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="glass sticky top-20 z-40 p-4 rounded-[2rem] mb-16 flex flex-col md:flex-row gap-4 max-w-4xl mx-auto border border-white/50 shadow-2xl shadow-blue-500/5">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search blogs, tags, or authors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/40 border-0 rounded-2xl px-5 py-3.5 pl-12 focus:ring-4 focus:ring-blue-500/10 outline-none transition font-medium text-slate-700"
          />
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white/40 border-0 rounded-2xl px-6 py-3.5 outline-none focus:ring-4 focus:ring-blue-500/10 transition cursor-pointer font-bold text-slate-600 text-sm appearance-none"
        >
          <option value="">All Topics</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Blog Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filtered.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="max-w-md mx-auto text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm animate-float">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
            <Search size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">No results found</h2>
          <p className="text-slate-500 font-medium px-8">We couldn't find any articles matching your current search criteria.</p>
          <button 
            onClick={() => { setSearch(''); setCategory(''); }}
            className="mt-8 text-blue-600 font-black text-sm uppercase tracking-widest hover:text-blue-700 transition"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}