'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import { DateFilterBar, localDayBounds } from '@/components/DateFilterBar';
import { FollowButton } from '@/components/FollowButton';

type Post = { id: string; seller_id: string; media_url: string; media_type: 'image' | 'video'; caption: string | null; created_at: string; seller: { username: string | null; shop_name: string | null } | null };
type Reminder = { id: string; target_type: string; remind_at: string };
type Stream = { id: string; title: string; room_name: string; seller_id: string; status: string; scheduled_at: string | null; seller: { username: string | null; shop_name: string | null } | null };

export default function ExplorePage() {
  const sb = useMemo(() => supabaseBrowser(), []);
  const { t, language } = useApp();
  const [date, setDate] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void (async () => {
      const [{ data: { user } }, { data: reminderData }] = await Promise.all([
        sb.auth.getUser(),
        sb.auth.getUser().then(({ data: { user } }) => user
          ? sb.from('reminders').select('id,target_type,remind_at').eq('user_id', user.id).order('remind_at')
          : Promise.resolve({ data: [] as Reminder[] })),
      ]);
      if (!active) return;
      setViewerId(user?.id ?? null);
      setReminders((reminderData || []) as Reminder[]);
      const bounds = localDayBounds(date);
      let query = sb.from('posts').select('id,seller_id,media_url,media_type,caption,created_at,seller:profiles!posts_seller_id_fkey(username,shop_name)')
        .is('scheduled_for', null).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).order('created_at', { ascending: false }).limit(50);
      if (bounds) query = query.gte('created_at', bounds.start).lt('created_at', bounds.end);
      const [postResult, streamResult] = await Promise.all([
        query,
        sb.from('live_streams').select('id,title,room_name,seller_id,status,scheduled_at,seller:profiles!live_streams_seller_id_fkey(username,shop_name)').in('status', ['live', 'scheduled']).order('scheduled_at', { ascending: true }).limit(20),
      ]);
      if (!active) return;
      setPosts((postResult.data || []) as unknown as Post[]);
      setStreams((streamResult.data || []) as unknown as Stream[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [sb, date]);

  return <section>
    <div className="px-4 pt-4"><h1 className="text-xl font-bold">{t('explore')}</h1></div>
    <DateFilterBar value={date} onChange={(value) => { setLoading(true); setDate(value); }} />
    <div className="border-y px-4 py-3"><h2 className="mb-3 font-semibold">Live & upcoming</h2><div className="flex gap-3 overflow-x-auto">{streams.map((stream) => <Link key={stream.id} href={stream.status === 'live' ? `/live/${stream.room_name}` : '/'} className="min-w-32 rounded-xl border p-3"><p className="text-xs font-bold text-rose-600">{stream.status === 'live' ? 'LIVE' : 'UPCOMING'}</p><p className="mt-1 truncate text-sm font-semibold">{stream.seller?.shop_name || stream.seller?.username || stream.title}</p>{stream.status === 'live' && <span onClick={(event) => event.preventDefault()}><FollowButton followingId={stream.seller_id} viewerId={viewerId} compact /></span>}</Link>)}</div></div>
    <div className="p-4"><h2 className="font-semibold">{date ? t('datePosts') : t('recentPosts')}</h2>{loading ? <p className="py-8 text-center text-sm text-gray-500">Loading…</p> : posts.length === 0 ? <p className="py-8 text-center text-sm text-gray-500">{date ? t('noPostsDate') : t('noExplorePosts')}</p> : <div className="mt-3 grid grid-cols-2 gap-2">{posts.map((post) => <article key={post.id} className="overflow-hidden rounded-xl border"><Link href={post.seller?.username ? `/seller/${post.seller.username}` : '/'} className="block truncate px-2 py-2 text-xs font-semibold">{post.seller?.shop_name || post.seller?.username || 'Seller'}</Link><Link href="/" className="block aspect-square bg-gray-100">{post.media_type === 'video' ? <video src={post.media_url} playsInline muted className="h-full w-full object-cover" /> : <img src={post.media_url} alt={post.caption || 'Seller post'} className="h-full w-full object-cover" />}</Link><p className="px-2 py-2 text-[10px] text-gray-500">{new Date(post.created_at).toLocaleString(language === 'uz' ? 'uz-UZ' : language, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {t('realCamera')}</p></article>)}</div>}</div>
    <div className="border-t p-4"><h2 className="font-semibold">My reminders</h2>{reminders.length ? reminders.map((reminder) => <p key={reminder.id} className="mt-2 rounded-lg border p-3 text-sm">{reminder.target_type} · {new Date(reminder.remind_at).toLocaleString()}</p>) : <p className="mt-2 text-sm text-gray-500">No saved reminders yet.</p>}</div>
  </section>;
}
