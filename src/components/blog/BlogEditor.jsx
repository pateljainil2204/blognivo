import { Image, X, Hash, Loader2, Save, Send } from 'lucide-react';
import AIToolbar from '../ai/AIToolbar';

export default function BlogEditor({
  title, setTitle,
  content, setContent,
  category, setCategory,
  categories,
  tags, setTags,
  coverUrl, handleImageUpload, removeImage,
  saving, onSave, onPublish,
  isResubmit = false,
}) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Cover Image */}
      <div className="relative group">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block mb-4 ml-1">Cover Image</label>
        {coverUrl ? (
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/10 border border-white/10 group/img">
            <img src={coverUrl} alt="Cover" className="w-full h-[400px] object-cover transition-transform duration-700 group-hover/img:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />
            <button
              onClick={removeImage}
              className="absolute top-6 right-6 bg-black/40 backdrop-blur-xl rounded-2xl p-3 text-red-400 hover:text-white hover:bg-red-500 transition-all duration-300 shadow-2xl border border-white/10 hover:scale-110"
              title="Remove Cover"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-[300px] border-2 border-dashed border-white/5 rounded-[2rem] cursor-pointer bg-white/[0.02] hover:bg-indigo-500/[0.03] hover:border-indigo-500/30 transition-all duration-500 group/upload">
            <div className="flex flex-col items-center gap-4 text-gray-500 group-hover/upload:text-indigo-400">
              <div className="p-6 bg-white/5 rounded-[1.5rem] group-hover/upload:bg-indigo-500/10 group-hover/upload:scale-110 transition-all duration-500 shadow-xl border border-white/5">
                <Image size={40} strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="font-bold text-base tracking-tight text-gray-300">Add a stunning cover image</p>
                <p className="text-[11px] font-medium opacity-50 mt-1 uppercase tracking-wider">PNG, JPG or WEBP (Max 5MB)</p>
              </div>
            </div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        )}
      </div>

      {/* Main Metadata */}
      <div className="grid gap-10">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Article Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl md:text-5xl font-black bg-transparent border-0 pb-2 outline-none transition-all placeholder:text-white/10 text-white tracking-tight"
          />
          <div className="h-1 w-20 bg-indigo-500/50 rounded-full" />
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block ml-1">Topic Category</label>
            <div className="relative group/select">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-3.5 text-gray-300 font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all appearance-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-gray-200">{c}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 transition-colors group-hover/select:text-indigo-400">
                <X size={16} className="rotate-45" />
              </div>
            </div>
          </div>

      {/* Tags */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block ml-1">Tags (Max 5)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Add tags..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = e.target.value.trim().toLowerCase();
                    if (val && !tags.includes(val) && tags.length < 5) {
                      setTags([...tags, val]);
                      e.target.value = '';
                    }
                  }
                }}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 outline-none transition-all text-white placeholder:text-gray-600"
              />
              <div className="flex flex-wrap gap-2 mt-3 ml-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold px-3 py-1.5 rounded-xl text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-sm animate-in scale-in duration-300"
                  >
                    <Hash size={10} strokeWidth={3} />
                    {tag}
                    <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-red-400 transition-colors p-0.5 hover:bg-red-500/10 rounded-md">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-white/10 my-8" />

      {/* Content Section */}
      <div className="space-y-6 pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 ml-1 mb-2">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50" />
          <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.25em]">Editor & AI Assistant</label>
        </div>
        <AIToolbar
          content={content}
          onApply={(text) => setContent(text)}
          onTagsSuggested={(suggested) => setTags([...new Set([...tags, ...suggested])].slice(0, 5))}
          onTitlesSuggested={(t) => setTitle(t)}
        />
        
        <textarea
          placeholder="Start writing your masterpiece..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className="w-full bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-12 text-xl text-gray-200 leading-[1.8] outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/10 transition-all shadow-inner custom-scrollbar font-sans min-h-[700px] placeholder:text-white/20"
        />
      </div>

      {/* Action Footer */}
      <div className="sticky bottom-6 glass p-2 rounded-3xl flex items-center justify-between border border-white/10 shadow-3xl backdrop-blur-3xl z-50 ring-1 ring-white/10">
        <div className="flex items-center gap-3 pl-4">
          <div className={`w-2 h-2 rounded-full ${saving ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
          <div className="hidden sm:block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            {saving ? 'Saving changes...' : 'Draft auto-saved'}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 text-xs font-black text-gray-400 hover:text-white transition-all disabled:opacity-30 uppercase tracking-[0.15em] hover:bg-white/5 rounded-2xl active:scale-95"
          >
            <Save size={16} strokeWidth={2.5} /> Save Draft
          </button>
          <button
            onClick={onPublish}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-black transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 uppercase tracking-[0.15em] border border-indigo-400/20"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={2.5} />}
            {isResubmit ? 'Resubmit' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}