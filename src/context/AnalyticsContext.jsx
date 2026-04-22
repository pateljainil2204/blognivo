import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const AnalyticsContext = createContext();

export function AnalyticsProvider({ children }) {
  const { user, isAdmin } = useAuth();
  
  // Shared state for all analytics
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    activeAuthors: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalLikes: 0,
    totalBookmarks: 0,
    globalCategoryDistribution: [],
    loading: true
  });

  const [authorStats, setAuthorStats] = useState({
    blogs: [],
    totalViews: 0,
    totalLikes: 0,
    totalBookmarks: 0,
    totalFollowers: 0,
    categoryStats: [],
    recentActivity: [],
    bestPerformers: { views: null, likes: null },
    loading: true
  });

  const fetchAdminStats = useCallback(async () => {
    if (!isAdmin) return;
    
    setAdminStats(prev => ({ ...prev, loading: true }));
    try {
      const [
        usersRes,
        blogsRes,
        authorsRes,
        likesRes,
        bookmarksRes
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('blogs').select('*'), // Fetch all to compute categories
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'author'),
        supabase.from('likes').select('*', { count: 'exact', head: true }),
        supabase.from('bookmarks').select('*', { count: 'exact', head: true })
      ]);

      const allBlogs = blogsRes.data || [];
      let pending = 0, approved = 0, rejected = 0;
      const catCount = {};

      allBlogs.forEach(blog => {
        if (blog.status === 'pending') pending++;
        if (blog.status === 'approved') approved++;
        if (blog.status === 'rejected') rejected++;
        
        // Count category distribution globally
        if (blog.status === 'approved') {
          const cat = blog.category || 'General';
          catCount[cat] = (catCount[cat] || 0) + 1;
        }
      });

      const totalApproved = approved || 1;
      const globalCategoryDistribution = Object.keys(catCount).map(cat => ({
        name: cat,
        count: catCount[cat],
        percentage: Math.round((catCount[cat] / totalApproved) * 100)
      })).sort((a, b) => b.count - a.count);

      setAdminStats({
        totalUsers: usersRes.count || 0,
        totalBlogs: allBlogs.length,
        activeAuthors: authorsRes.count || 0,
        pending,
        approved,
        rejected,
        totalLikes: likesRes.count || 0,
        totalBookmarks: bookmarksRes.count || 0,
        globalCategoryDistribution,
        loading: false
      });
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      setAdminStats(prev => ({ ...prev, loading: false }));
    }
  }, [isAdmin]);

  const fetchAuthorStats = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setAuthorStats(prev => ({ ...prev, loading: true }));
    
    try {
      const { data: blogsData } = await supabase
        .from('blogs')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });
      
      const allBlogs = blogsData || [];
      const approvedBlogs = allBlogs.filter(b => b.status === 'approved');
      
      let totalViews = 0;
      let totalLikes = 0;
      let totalBookmarks = 0;
      
      const catMap = {};

      approvedBlogs.forEach(blog => {
        totalViews += (blog.views || 0);
        totalLikes += (blog.likes_count || 0);
        totalBookmarks += (blog.bookmarks_count || 0);

        const cat = blog.category || 'General';
        if (!catMap[cat]) catMap[cat] = { name: cat, views: 0, count: 0 };
        catMap[cat].views += (blog.views || 0);
        catMap[cat].count += 1;
      });

      const blogIds = allBlogs.map(b => b.id);
      
      let followersCount = 0;
      let recentActivity = [];

      if (blogIds.length > 0) {
        const [followerRes, likeRes, bookmarkRes] = await Promise.all([
          supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
          supabase.from('likes').select('*, blogs(title), users(name)').in('blog_id', blogIds).order('created_at', { ascending: false }).limit(10),
          supabase.from('bookmarks').select('*, blogs(title), users(name)').in('blog_id', blogIds).order('created_at', { ascending: false }).limit(10)
        ]);

        followersCount = followerRes.count || 0;
        
        const followerDetails = await supabase.from('follows').select('*, users!follows_follower_id_fkey(name)').eq('following_id', user.id).order('created_at', { ascending: false }).limit(6);
        
        recentActivity = [
          ...(likeRes.data || []).map(l => ({ type: 'like', user: l.users?.name || 'Someone', target: l.blogs?.title, date: l.created_at })),
          ...(bookmarkRes.data || []).map(b => ({ type: 'bookmark', user: b.users?.name || 'Someone', target: b.blogs?.title, date: b.created_at })),
          ...(followerDetails.data || []).map(f => ({ type: 'follow', user: f.users?.name || 'Someone', target: 'you', date: f.created_at }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
      }

      const bestViews = approvedBlogs.length > 0 ? [...approvedBlogs].sort((a, b) => (b.views || 0) - (a.views || 0))[0] : null;
      const bestLikes = approvedBlogs.length > 0 ? [...approvedBlogs].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))[0] : null;

      const categoryStats = Object.values(catMap).map(cat => ({
        ...cat,
        percentage: totalViews > 0 ? Math.round((cat.views / totalViews) * 100) : 0
      })).sort((a, b) => b.views - a.views);

      setAuthorStats({
        blogs: allBlogs,
        totalViews,
        totalLikes,
        totalBookmarks,
        totalFollowers: followersCount,
        categoryStats,
        recentActivity,
        bestPerformers: { views: bestViews, likes: bestLikes },
        loading: false
      });

    } catch (err) {
      console.error('Error fetching author stats:', err);
      if (!silent) setAuthorStats(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  // Initial Fetching
  useEffect(() => {
    if (user) {
      fetchAuthorStats();
      if (isAdmin) fetchAdminStats();
    }
  }, [user, isAdmin, fetchAdminStats, fetchAuthorStats]);

  // Handle Optimistic Updates
  const updateOptimisticStats = useCallback((actionType, payload) => {
    // payload: { isAdded: boolean, blogId?: number }
    if (isAdmin) {
      setAdminStats(prev => ({
        ...prev,
        totalLikes: actionType === 'like' ? prev.totalLikes + (payload.isAdded ? 1 : -1) : prev.totalLikes,
        totalBookmarks: actionType === 'bookmark' ? prev.totalBookmarks + (payload.isAdded ? 1 : -1) : prev.totalBookmarks,
      }));
    }

    if (user) {
      setAuthorStats(prev => {
        // Only update author stats if the targeted blog belongs to this author
        const isAuthorBlog = payload.blogId && prev.blogs.some(b => b.id === payload.blogId);
        if (!isAuthorBlog) return prev;

        return {
          ...prev,
          totalLikes: actionType === 'like' ? prev.totalLikes + (payload.isAdded ? 1 : -1) : prev.totalLikes,
          totalBookmarks: actionType === 'bookmark' ? prev.totalBookmarks + (payload.isAdded ? 1 : -1) : prev.totalBookmarks,
        };
      });
    }
  }, [isAdmin, user]);

  return (
    <AnalyticsContext.Provider value={{ adminStats, authorStats, fetchAdminStats, fetchAuthorStats, updateOptimisticStats }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export const useAnalytics = () => {
  return useContext(AnalyticsContext);
};
