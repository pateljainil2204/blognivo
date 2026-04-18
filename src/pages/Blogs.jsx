import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useBlogs } from '../hooks/useBlogs';
import { Search, BrainCircuit, RefreshCw } from 'lucide-react';
import BlogCard from '../components/blog/BlogCard';

export default function Blogs() {
  const { blogs, loading, fetchBlogs } = useBlogs();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('latest'); // latest, likes, views

  useEffect(() => {
    fetchBlogs({ category });

    supabase
      .from('categories')
      .select('name')
      .then(({ data }) => {
        if (data) setCategories(data.map((c) => c.name));
      });
  }, [category, fetchBlogs]);

  const filteredAndSortedBlogs = useMemo(() => {
    let result = blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.tags?.some((t) => t.includes(search.toLowerCase()))
    );

    switch (sortBy) {
      case 'likes':
        result = result.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        break;
      case 'views':
        result = result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'latest':
      default:
        result = result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }
    return result;
  }, [blogs, search, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 w-full overflow-hidden min-h-screen">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-white">
          Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Blogs</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
          Discover insights, tutorials, and stories from our community of authors.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass p-4 rounded-3xl mb-10 flex flex-col lg:flex-row gap-4 border border-white/10 shadow-lg shadow-indigo-500/5 items-center justify-between">
        <div className="w-full lg:max-w-md relative">
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 pl-12 focus:ring-1 focus:ring-indigo-500/50 outline-none transition font-medium text-white placeholder-gray-500"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto justify-center lg:justify-end">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-full px-5 py-3 outline-none focus:ring-1 focus:ring-indigo-500/50 transition cursor-pointer font-bold text-gray-300 text-sm appearance-none"
          >
            <option value="" className="bg-slate-900">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c} className="bg-slate-900">{c}</option>
            ))}
          </select>

          <div className="flex bg-white/5 border border-white/10 rounded-full p-1">
            {['latest', 'likes', 'views'].map((sortOption) => (
              <button
                key={sortOption}
                onClick={() => setSortBy(sortOption)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  sortBy === sortOption 
                    ? 'bg-indigo-500 text-white shadow-md' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {sortOption}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 glass rounded-2xl animate-pulse border-white/5" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>

          {filteredAndSortedBlogs.length === 0 && (
            <div className="max-w-md mx-auto text-center py-16 glass rounded-[3rem] border border-white/10 shadow-lg mt-12">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500">
                <Search size={32} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">No articles found</h2>
              <p className="text-gray-400 font-medium px-8 mb-6">Try adjusting your search or filter to find what you're looking for.</p>
              <button onClick={() => { setSearch(''); setCategory(''); setSortBy('latest'); }} className="btn-primary text-sm px-6 py-2">
                Clear Filters
              </button>
            </div>
          )}

          {/* Simple Pagination/Load More UI */}
          {filteredAndSortedBlogs.length > 0 && (
            <div className="mt-16 text-center">
              <button className="glass px-8 py-4 rounded-full border border-white/10 font-bold text-indigo-300 hover:bg-white/5 hover:text-indigo-200 transition-colors inline-flex items-center gap-2">
                <RefreshCw size={16} /> Load More Articles
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
