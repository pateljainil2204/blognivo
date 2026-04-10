-- 1. Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 2. Users Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 3. Blogs Policies
CREATE POLICY "Approved blogs are viewable by everyone" ON public.blogs FOR SELECT USING (status = 'approved');
CREATE POLICY "Authors can view all their own blogs" ON public.blogs FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Admins can view all blogs" ON public.blogs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Authors can insert blogs" ON public.blogs FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own blogs" ON public.blogs FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Admins can update any blog" ON public.blogs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Authors can delete own blogs" ON public.blogs FOR DELETE USING (auth.uid() = author_id);

-- 4. Likes Policies
CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- 5. Bookmarks Policies
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- 6. Follows Policies
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can insert own follows" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete own follows" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- 7. AI Summaries Policies
CREATE POLICY "Summaries are viewable by everyone" ON public.ai_summaries FOR SELECT USING (true);

-- 8. Categories Policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- 9. Storage Policies (Bucket: blog-images)
-- Note: Assuming the bucket 'blog-images' already exists.
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public can view blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Authenticated users can upload blog images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'blog-images' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update own blog images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'blog-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own blog images" ON storage.objects FOR DELETE USING (
  bucket_id = 'blog-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 10. RPC for views (if not exists)
CREATE OR REPLACE FUNCTION increment_views(blog_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.blogs
  SET views = COALESCE(views, 0) + 1
  WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
