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
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Cover Image */}
      <div className="relative group">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Cover Image</label>
        {coverUrl ? (
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10">
            <img src={coverUrl} alt="Cover" className="w-full h-80 object-cover" />
            <button
              onClick={removeImage}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 text-red-500 hover:bg-white transition shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all group">
            <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-500">
              <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition">
                <Image size={32} />
              </div>
              <p className="font-bold text-sm tracking-tight">Click to upload high-res cover</p>
              <p className="text-xs opacity-60">PNG, JPG or WEBP (Max 5MB)</p>
            </div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        )}
      </div>

      {/* Main Metadata */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block pl-1">Article Title</label>
          <input
            type="text"
            placeholder="A catchy, SEO-friendly title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-black bg-transparent border-0 border-b-2 border-slate-100 pb-2 outline-none focus:border-blue-600 transition-colors placeholder:text-slate-200"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block pl-1">Topic Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block pl-1">Tags (Max 5)</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
            >
              <Hash size={10} />
              {tag}
              <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-red-500">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Type tag and press enter..."
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
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition"
        />
      </div>

      <div className="h-px bg-slate-100" />

      {/* Content Section */}
      <div className="space-y-4">
        <AIToolbar
          content={content}
          onApply={(text) => setContent(text)}
          onTagsSuggested={(suggested) => setTags([...new Set([...tags, ...suggested])].slice(0, 5))}
          onTitlesSuggested={(t) => setTitle(t)}
        />
        
        <textarea
          placeholder="Unleash your creativity here. Use markdown for styling..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={25}
          className="w-full bg-white border border-slate-100 rounded-3xl p-8 text-lg text-slate-700 leading-relaxed outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm font-serif"
        />
      </div>

      {/* Action Footer */}
      <div className="sticky bottom-8 glass p-4 rounded-2xl flex items-center justify-between border border-slate-200/50 shadow-2xl">
        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs font-medium">
          <Loader2 size={12} className={saving ? 'animate-spin' : 'hidden'} />
          {saving ? 'Saving changes...' : 'All changes saved locally'}
        </div>
        <div className="flex gap-3 ml-auto">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            <Save size={18} /> Save as Draft
          </button>
          <button
            onClick={onPublish}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {isResubmit ? 'Resubmit for Review' : 'Publish Article'}
          </button>
        </div>
      </div>
    </div>
  );
}