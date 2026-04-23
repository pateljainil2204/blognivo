import { useState, useRef, useEffect } from 'react';
import { Image, X, Hash, Loader2, Save, Send, Search, Plus, Check, ChevronDown } from 'lucide-react';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize isCustom based on current category
  useEffect(() => {
    if (category && categories.length > 0) {
      setIsCustom(!categories.includes(category));
    }
  }, [category, categories]);

  const filteredCategories = categories.filter(c => 
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showCreateOption = searchQuery && !categories.some(c => c.toLowerCase() === searchQuery.toLowerCase());

  const handleSelect = (val) => {
    setCategory(val);
    setSearchQuery('');
    setIsDropdownOpen(false);
    setIsCustom(false);
  };

  const handleCreateNew = () => {
    if (searchQuery) {
      setCategory(searchQuery);
      setSearchQuery('');
      setIsDropdownOpen(false);
      setIsCustom(true);
    }
  };
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
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3.5 text-gray-300 font-bold outline-none focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/30 transition-all cursor-pointer flex items-center justify-between group/select"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {isCustom && <span className="bg-indigo-500/20 text-indigo-400 text-[8px] px-1.5 py-0.5 rounded uppercase font-black tracking-tighter shrink-0">Custom</span>}
                  <span className="truncate">{category || 'Select a topic'}</span>
                </div>
                <ChevronDown size={18} className={`text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute z-[60] mt-3 w-full bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3 border-b border-white/5">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search or create topic..."
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && showCreateOption) {
                            handleCreateNew();
                          }
                        }}
                        className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-indigo-500/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((c) => (
                        <button
                          key={c}
                          onClick={() => handleSelect(c)}
                          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all group/item"
                        >
                          <span>{c}</span>
                          {category === c && <Check size={14} className="text-indigo-400" />}
                        </button>
                      ))
                    ) : !showCreateOption && (
                      <div className="px-4 py-8 text-center text-xs text-gray-600 font-bold uppercase tracking-widest">
                        No topics found
                      </div>
                    )}

                    {showCreateOption && (
                      <button
                        onClick={handleCreateNew}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-indigo-400 hover:bg-indigo-500/10 transition-all border border-indigo-500/10 m-1 w-[calc(100%-8px)]"
                      >
                        <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                          <Plus size={14} strokeWidth={3} />
                        </div>
                        <div className="text-left overflow-hidden">
                          <p className="text-[10px] text-indigo-400/50 uppercase tracking-widest font-black leading-none mb-1">Create Topic</p>
                          <p className="truncate">"{searchQuery}"</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}
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