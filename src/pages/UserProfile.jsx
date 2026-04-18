import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Heart, Bookmark, User, BookOpen, Clock, Settings, Grid, List } from 'lucide-react';
import ProfileLayout from '../components/profile/ProfileLayout';
import BlogCard from '../components/blog/BlogCard';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const { id } = useParams();
  const { user: currentUser, profile: currentProfile } = useAuth();
  const [likes, setLikes] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [following, setFollowing] = useState([]);
  const [myBlogs, setMyBlogs] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('liked');

  const targetId = id || currentUser?.id;
  const isOwnProfile = !id || id === currentUser?.id;

  const fetchData = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      // Fetch profile info
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetId)
        .single();
      
      setActiveProfile(profileData);

      const isTargetAuthor = profileData?.role === 'author';

      const [bmRes, likeRes, followRes] = await Promise.all([
        isOwnProfile 
          ? supabase.from('bookmarks').select('*, blogs(*, users!blogs_author_id_fkey(name, avatar))').eq('user_id', targetId)
          : Promise.resolve({ data: [] }),
        supabase
          .from('likes')
          .select('*, blogs(*, users!blogs_author_id_fkey(name, avatar))')
          .eq('user_id', targetId),
        supabase
          .from('follows')
          .select('*, users!follows_following_id_fkey(name, avatar, bio)')
          .eq('follower_id', targetId),
      ]);

      setBookmarks((bmRes.data || []).filter(b => b.blogs));
      setLikes((likeRes.data || []).filter(l => l.blogs));
      setFollowing(followRes.data || []);

      if (isTargetAuthor) {
        const { data } = await supabase
          .from('blogs')
          .select('*, users!blogs_author_id_fkey(name, avatar)')
          .eq('author_id', targetId)
          .eq('status', 'approved') // Only show approved blogs for public view
          .order('created_at', { ascending: false });
        setMyBlogs(data || []);
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
      toast.error('Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [targetId, isOwnProfile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = [
    { label: 'Articles Liked', value: likes.length, icon: Heart, iconColor: 'text-pink-400', hoverColor: 'group-hover:text-pink-400', borderColor: 'hover:border-pink-500/30' },
    { label: 'Following', value: following.length, icon: User, iconColor: 'text-cyan-400', hoverColor: 'group-hover:text-cyan-400', borderColor: 'hover:border-cyan-500/30' },
    ...(isOwnProfile ? [{ label: 'Bookmarks', value: bookmarks.length, icon: Bookmark, iconColor: 'text-amber-400', hoverColor: 'group-hover:text-amber-400', borderColor: 'hover:border-amber-500/30' }] : []),
    ...(myBlogs.length > 0 ? [{ label: 'Publications', value: myBlogs.length, icon: BookOpen, iconColor: 'text-indigo-400', hoverColor: 'group-hover:text-indigo-400', borderColor: 'hover:border-indigo-500/30' }] : []),
  ];

  const actionButton = isOwnProfile ? (
    <Link to="/dashboard" className="px-6 py-3 rounded-2xl font-bold text-sm transition-all bg-white/10 text-white border border-white/20 shadow-lg hover:bg-white/20 hover:scale-105 flex items-center gap-2">
      <Settings size={16} /> Edit Profile
    </Link>
  ) : null;

  return (
    <ProfileLayout profile={activeProfile} stats={stats} actionButton={actionButton}>
      <div className="flex flex-col gap-8">
        {/* Tabs Navigation */}
        <div className="flex items-center gap-8 border-b border-white/10 pb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {[
            { id: 'liked', label: 'Liked Articles', icon: Heart, visible: true },
            { id: 'saved', label: 'Saved Blogs', icon: Bookmark, visible: isOwnProfile },
            { id: 'following', label: 'Following Authors', icon: User, visible: true },
            { id: 'my-blogs', label: 'My Publications', icon: Grid, visible: activeProfile?.role === 'author' },
          ]
          .filter(tab => tab.visible)
          .map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative flex items-center gap-2 ${
                activeTab === tab.id ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 rounded-3xl" />)}
            </div>
          ) : (
            <>
              {activeTab === 'liked' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {likes.length > 0 ? (
                    likes.map(l => <BlogCard key={l.id} blog={l.blogs} />)
                  ) : (
                    <EmptyState message="No liked articles yet." />
                  )}
                </div>
              )}

              {activeTab === 'saved' && isOwnProfile && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookmarks.length > 0 ? (
                    bookmarks.map(b => <BlogCard key={b.id} blog={b.blogs} />)
                  ) : (
                    <EmptyState message="Your saved library is empty." />
                  )}
                </div>
              )}

              {activeTab === 'following' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {following.length > 0 ? (
                    following.map(f => (
                      <Link key={f.id} to={f.users?.role === 'author' ? `/author/${f.following_id}` : `/profile/${f.following_id}`} className="glass p-6 rounded-3xl border border-white/10 hover:border-indigo-500/30 transition-all flex items-center gap-4 group">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-white border-2 border-white/5 overflow-hidden">
                          {f.users?.avatar ? <img src={f.users.avatar} alt="" className="w-full h-full object-cover" /> : f.users?.name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{f.users?.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{f.users?.bio || (f.users?.role === 'author' ? 'Author' : 'Reader')}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <EmptyState message="Not following anyone yet." />
                  )}
                </div>
              )}

              {activeTab === 'my-blogs' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myBlogs.length > 0 ? (
                    myBlogs.map(blog => <BlogCard key={blog.id} blog={blog} />)
                  ) : (
                    <EmptyState message="No public blogs yet." />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProfileLayout>
  );
}

function EmptyState({ message }) {
  return (
    <div className="col-span-full py-20 text-center glass rounded-[2.5rem] border border-dashed border-white/10">
      <p className="text-gray-400 font-bold italic tracking-tight">{message}</p>
    </div>
  );
}
