'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, UserRoundCheck } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';

type Props = {
  followingId: string;
  viewerId?: string | null;
  className?: string;
  compact?: boolean;
};

export function FollowButton({ followingId, viewerId, className = '', compact = false }: Props) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();
  const { t } = useApp();
  const [userId, setUserId] = useState<string | null>(viewerId ?? null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      let id = viewerId ?? null;
      if (viewerId === undefined) {
        const { data: { user } } = await supabase.auth.getUser();
        id = user?.id ?? null;
      }
      if (!mounted) return;
      setUserId(id);
      if (id && id !== followingId) {
        const { data } = await supabase.from('follows').select('follower_id')
          .eq('follower_id', id).eq('following_id', followingId).maybeSingle();
        if (mounted) setIsFollowing(!!data);
      }
      if (mounted) setReady(true);
    })();
    return () => { mounted = false; };
  }, [followingId, supabase, viewerId]);

  if (userId === followingId) return null;

  async function toggle() {
    if (!userId) {
      router.push('/auth');
      return;
    }
    if (busy) return;
    const previous = isFollowing;
    setIsFollowing(!previous);
    setBusy(true);
    const result = previous
      ? await supabase.from('follows').delete().eq('follower_id', userId).eq('following_id', followingId)
      : await supabase.from('follows').insert({ follower_id: userId, following_id: followingId });
    if (result.error) setIsFollowing(previous);
    setBusy(false);
  }

  return (
    <button type="button" onClick={toggle} disabled={!ready || busy}
      aria-pressed={isFollowing}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${isFollowing ? 'border-gray-200 bg-white text-gray-700' : 'border-emerald-600 bg-emerald-600 text-white'} ${className}`}>
      {isFollowing ? <UserRoundCheck size={compact ? 14 : 16} /> : <UserPlus size={compact ? 14 : 16} />}
      {t(isFollowing ? 'following' : 'follow')}
    </button>
  );
}
