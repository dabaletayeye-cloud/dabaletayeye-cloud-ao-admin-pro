import { useState, useRef, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  PlayIcon,
  PauseIcon,
  Volume2Icon,
  VolumeXIcon,
  Volume1Icon,
  MaximizeIcon,
  MinimizeIcon,
  RotateCcwIcon,
  MonitorPlayIcon,
  PictureInPicture2Icon,
  GaugeIcon,
  RepeatIcon,
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const VIDEO_SRC = 'https://media.w3.org/2010/05/sintel/trailer.mp4';
const SPEED_OPTIONS = [0.5, 1, 1.5, 2] as const;
type SpeedValue = (typeof SPEED_OPTIONS)[number];

// ── volume icon selector ─────────────────────────────────────────────────────
function VolumeIcon({ volume, muted }: { volume: number; muted: boolean }) {
  if (muted || volume === 0) return <VolumeXIcon size={16} />;
  if (volume < 0.5) return <Volume1Icon size={16} />;
  return <Volume2Icon size={16} />;
}

// ── tooltip wrapper ───────────────────────────────────────────────────────────
function CtrlBtn({
  onClick,
  title,
  children,
  style,
  active,
}: {
  onClick?: () => void;
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  active?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: active
          ? 'rgba(255,255,255,0.22)'
          : hover
          ? 'rgba(255,255,255,0.15)'
          : 'transparent',
        border: active ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'background 0.15s',
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function VideoPlayerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [draggingProgress, setDraggingProgress] = useState(false);
  const [draggingVolume, setDraggingVolume] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<SpeedValue>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [pip, setPip] = useState(false);

  // ── sync volume ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
    v.muted = muted;
  }, [volume, muted]);

  // ── sync playback rate ───────────────────────────────────────────────────────
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = playbackRate;
  }, [playbackRate]);

  // ── auto-hide controls when playing ─────────────────────────────────────────
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setControlsVisible(false);
      }
    }, 2800);
  }, []);

  useEffect(() => () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  // ── keyboard: Space → play/pause ────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── toggle play/pause ────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => setVideoError(true));
    } else {
      v.pause();
    }
    resetHideTimer();
  }, [resetHideTimer]);

  // ── replay ───────────────────────────────────────────────────────────────────
  const replay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    setEnded(false);
    setCurrentTime(0);
    v.play().catch(() => setVideoError(true));
    resetHideTimer();
  }, [resetHideTimer]);

  // ── progress: seek from click/drag ──────────────────────────────────────────
  const seekFromEvent = useCallback((e: { clientX: number }) => {
    const bar = progressRef.current;
    const v = videoRef.current;
    if (!bar || !v || !v.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
    setCurrentTime(v.currentTime);
  }, []);

  // ── volume: set from click/drag ─────────────────────────────────────────────
  const volumeFromEvent = useCallback((e: { clientX: number }) => {
    const bar = volumeBarRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(ratio);
    if (ratio > 0) setMuted(false);
  }, []);

  // ── global mouse events for drag ─────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (draggingProgress) seekFromEvent(e);
      if (draggingVolume) volumeFromEvent(e);
    };
    const onUp = () => {
      setDraggingProgress(false);
      setDraggingVolume(false);
    };
    if (draggingProgress || draggingVolume) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [draggingProgress, draggingVolume, seekFromEvent, volumeFromEvent]);

  // ── fullscreen change listener ───────────────────────────────────────────────
  useEffect(() => {
    const onFsChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // ── PiP change listener ──────────────────────────────────────────────────────
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnterPip = () => setPip(true);
    const onLeavePip = () => setPip(false);
    v.addEventListener('enterpictureinpicture', onEnterPip);
    v.addEventListener('leavepictureinpicture', onLeavePip);
    return () => {
      v.removeEventListener('enterpictureinpicture', onEnterPip);
      v.removeEventListener('leavepictureinpicture', onLeavePip);
    };
  }, []);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const togglePip = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await v.requestPictureInPicture();
      }
    } catch {
      // PiP not supported or denied
    }
  };

  // ── progress hover preview ───────────────────────────────────────────────────
  const onProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    const v = videoRef.current;
    if (!bar || !v || !v.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(ratio * v.duration);
    setHoverX(e.clientX - rect.left);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;
  const volumePercent = muted ? 0 : volume * 100;

  return (
    <AdminLayout>
      <div
        data-cmp="VideoPlayerPage"
        style={{
          minHeight: '100%',
          background: 'var(--background)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* header */}
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--foreground)' }}>
            视频播放器
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
            基于 HTML5 &lt;video&gt; 的自定义播放器，支持倍速切换、空格控制、画中画、播放结束重播等
          </p>
        </div>

        {/* ── second row: extra feature buttons ── */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)', fontWeight: 600 }}>
            快速操作：
          </span>
          {/* PiP demo button */}
          <button
            onClick={togglePip}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 16px',
              borderRadius: 10,
              border: pip
                ? '1.5px solid var(--primary)'
                : '1.5px solid var(--border)',
              background: pip
                ? 'color-mix(in srgb, var(--primary) 10%, var(--card))'
                : 'var(--card)',
              color: pip ? 'var(--primary)' : 'var(--foreground)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s',
              boxShadow: pip ? '0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent)' : 'none',
            }}
          >
            <PictureInPicture2Icon size={16} />
            {pip ? '退出画中画' : '开启画中画'}
          </button>

          {/* speed buttons row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--card)',
            border: '1.5px solid var(--border)',
            borderRadius: 10,
            padding: '5px 10px',
          }}>
            <GaugeIcon size={14} style={{ color: 'var(--muted-foreground)' }} />
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 600, marginRight: 2 }}>
              倍速
            </span>
            {SPEED_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => {
                  setPlaybackRate(s);
                  const v = videoRef.current;
                  if (v) v.playbackRate = s;
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: 7,
                  border: playbackRate === s
                    ? '1.5px solid var(--primary)'
                    : '1.5px solid transparent',
                  background: playbackRate === s
                    ? 'color-mix(in srgb, var(--primary) 12%, var(--muted))'
                    : 'transparent',
                  color: playbackRate === s ? 'var(--primary)' : 'var(--foreground)',
                  fontSize: 12,
                  fontWeight: playbackRate === s ? 800 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.14s',
                }}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* keyboard hint */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 10,
            background: 'var(--muted)',
            border: '1px solid var(--border)',
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 22,
              background: 'var(--card)',
              border: '1.5px solid var(--border)',
              borderRadius: 5,
              fontSize: 11,
              fontWeight: 800,
              color: 'var(--foreground)',
              fontFamily: 'monospace',
              boxShadow: '0 2px 0 var(--border)',
            }}>
              Space
            </span>
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>
              播放 / 暂停
            </span>
          </div>
        </div>

        {/* player + side info */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── player ── */}
          <div style={{ flex: '1 1 560px', minWidth: 0 }}>
            <div
              ref={containerRef}
              onMouseMove={resetHideTimer}
              onMouseLeave={() => {
                if (playing) setControlsVisible(false);
              }}
              style={{
                position: 'relative',
                background: '#000',
                borderRadius: fullscreen ? 0 : 16,
                overflow: 'hidden',
                aspectRatio: '16/9',
                cursor: controlsVisible ? 'default' : 'none',
                boxShadow: '0 8px 40px rgba(0,0,0,0.28)',
              }}
            >
              {/* video element */}
              <video
                ref={videoRef}
                src={VIDEO_SRC}
                preload="metadata"
                onClick={togglePlay}
                onPlay={() => { setPlaying(true); setEnded(false); resetHideTimer(); }}
                onPause={() => { setPlaying(false); setControlsVisible(true); if (hideTimerRef.current) clearTimeout(hideTimerRef.current); }}
                onTimeUpdate={() => {
                  const v = videoRef.current;
                  if (!v) return;
                  setCurrentTime(v.currentTime);
                  if (v.buffered.length > 0) {
                    setBuffered(v.buffered.end(v.buffered.length - 1));
                  }
                }}
                onLoadedMetadata={() => {
                  const v = videoRef.current;
                  if (!v) return;
                  setDuration(v.duration);
                  setLoaded(true);
                }}
                onEnded={() => { setPlaying(false); setEnded(true); setControlsVisible(true); }}
                onError={() => setVideoError(true)}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  objectFit: 'contain',
                  cursor: 'pointer',
                }}
              />

              {/* error overlay */}
              <div
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 12, background: 'rgba(0,0,0,0.85)',
                  opacity: videoError ? 1 : 0,
                  pointerEvents: videoError ? 'auto' : 'none',
                  transition: 'opacity 0.2s',
                }}
              >
                <MonitorPlayIcon size={48} style={{ color: 'rgba(255,255,255,0.25)' }} />
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>视频加载失败，请检查网络后重试</span>
                <button
                  onClick={() => { setVideoError(false); videoRef.current?.load(); }}
                  style={{
                    padding: '8px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <RotateCcwIcon size={13} /> 重新加载
                </button>
              </div>

              {/* ── ended overlay (replay) ── */}
              <div
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 16,
                  background: 'rgba(0,0,0,0.72)',
                  backdropFilter: 'blur(4px)',
                  opacity: ended && !videoError ? 1 : 0,
                  pointerEvents: ended && !videoError ? 'auto' : 'none',
                  transition: 'opacity 0.3s',
                }}
              >
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em' }}>
                  播放结束
                </div>
                <button
                  onClick={replay}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.14)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid rgba(255,255,255,0.35)',
                    transition: 'transform 0.15s, background 0.15s',
                  }}>
                    <RepeatIcon size={30} style={{ color: '#fff' }} />
                  </div>
                  <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>重新播放</span>
                </button>
              </div>

              {/* big play center button — shown when paused (not ended) */}
              <div
                onClick={togglePlay}
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: !playing && loaded && !videoError && !ended ? 1 : 0,
                  pointerEvents: !playing && loaded && !videoError && !ended ? 'auto' : 'none',
                  transition: 'opacity 0.2s',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 68, height: 68, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid rgba(255,255,255,0.35)',
                  transition: 'transform 0.15s',
                }}>
                  <PlayIcon size={28} fill="#fff" style={{ color: '#fff', marginLeft: 4 }} />
                </div>
              </div>

              {/* controls bar */}
              <div
                style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.82))',
                  padding: '28px 16px 14px',
                  transform: controlsVisible ? 'translateY(0)' : 'translateY(100%)',
                  transition: 'transform 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {/* ── progress bar ── */}
                <div style={{ position: 'relative', paddingBottom: 4 }}>
                  {/* hover time tooltip */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: Math.max(20, Math.min(hoverX, (progressRef.current?.offsetWidth ?? 0) - 20)),
                      transform: 'translateX(-50%)',
                      background: 'rgba(0,0,0,0.85)',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 7px',
                      borderRadius: 5,
                      marginBottom: 6,
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      opacity: hoverTime !== null ? 1 : 0,
                      transition: 'opacity 0.1s',
                    }}
                  >
                    {formatTime(hoverTime ?? 0)}
                  </div>

                  <div
                    ref={progressRef}
                    onMouseDown={e => { setDraggingProgress(true); seekFromEvent(e); }}
                    onMouseMove={onProgressHover}
                    style={{
                      height: 4,
                      background: 'rgba(255,255,255,0.25)',
                      borderRadius: 99,
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'height 0.12s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.height = '6px'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.height = '4px'; setHoverTime(null); }}
                  >
                    {/* buffered */}
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: `${bufferedPercent}%`,
                      background: 'rgba(255,255,255,0.22)',
                      borderRadius: 99,
                      transition: 'width 0.3s',
                    }} />
                    {/* played */}
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: `${progressPercent}%`,
                      background: 'var(--primary)',
                      borderRadius: 99,
                      transition: draggingProgress ? 'none' : 'width 0.1s',
                    }} />
                    {/* thumb */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: `${progressPercent}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 13, height: 13,
                      background: '#fff',
                      borderRadius: '50%',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                      transition: draggingProgress ? 'none' : 'left 0.1s',
                      pointerEvents: 'none',
                    }} />
                  </div>
                </div>

                {/* ── bottom row: buttons + time + speed + volume + pip + fullscreen ── */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  {/* play / pause */}
                  <CtrlBtn onClick={togglePlay} title={playing ? '暂停 (Space)' : '播放 (Space)'}>
                    {playing
                      ? <PauseIcon size={18} fill="#fff" style={{ color: '#fff' }} />
                      : <PlayIcon size={18} fill="#fff" style={{ color: '#fff', marginLeft: 2 }} />
                    }
                  </CtrlBtn>

                  {/* time display */}
                  <div style={{
                    color: '#fff',
                    fontSize: 12,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    marginLeft: 2,
                    marginRight: 4,
                    letterSpacing: '0.03em',
                    opacity: 0.9,
                  }}>
                    {formatTime(currentTime)}
                    <span style={{ opacity: 0.5, margin: '0 3px' }}>/</span>
                    {formatTime(duration)}
                  </div>

                  {/* spacer */}
                  <div style={{ flex: 1 }} />

                  {/* ── speed selector (in controls bar) ── */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowSpeedMenu(m => !m)}
                      title="倍速"
                      style={{
                        background: showSpeedMenu ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.22)',
                        color: '#fff',
                        borderRadius: 7,
                        padding: '4px 10px',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                        letterSpacing: '0.02em',
                        transition: 'background 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        height: 30,
                        flexShrink: 0,
                      }}
                    >
                      <GaugeIcon size={13} />
                      {playbackRate}x
                    </button>
                    {/* speed dropdown */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 8px)',
                        right: 0,
                        background: 'rgba(20,20,28,0.96)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 10,
                        overflow: 'hidden',
                        minWidth: 80,
                        opacity: showSpeedMenu ? 1 : 0,
                        pointerEvents: showSpeedMenu ? 'auto' : 'none',
                        transform: showSpeedMenu ? 'translateY(0) scale(1)' : 'translateY(4px) scale(0.96)',
                        transformOrigin: 'bottom right',
                        transition: 'opacity 0.15s, transform 0.15s',
                      }}
                    >
                      {[...SPEED_OPTIONS].reverse().map(s => (
                        <button
                          key={s}
                          onClick={() => {
                            setPlaybackRate(s);
                            const v = videoRef.current;
                            if (v) v.playbackRate = s;
                            setShowSpeedMenu(false);
                          }}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '9px 14px',
                            textAlign: 'center',
                            background: playbackRate === s ? 'rgba(255,255,255,0.12)' : 'transparent',
                            border: 'none',
                            color: playbackRate === s ? '#fff' : 'rgba(255,255,255,0.7)',
                            fontSize: 13,
                            fontWeight: playbackRate === s ? 800 : 500,
                            cursor: 'pointer',
                            fontFamily: 'monospace',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = playbackRate === s ? 'rgba(255,255,255,0.12)' : 'transparent'; }}
                        >
                          {s === 1 ? '1x 正常' : `${s}x`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* volume */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
                    <CtrlBtn onClick={() => setMuted(m => !m)} title={muted ? '取消静音' : '静音'}>
                      <VolumeIcon volume={volume} muted={muted} />
                    </CtrlBtn>
                    {/* volume slider */}
                    <div
                      ref={volumeBarRef}
                      onMouseDown={e => { setDraggingVolume(true); volumeFromEvent(e); }}
                      style={{
                        width: 72,
                        height: 4,
                        background: 'rgba(255,255,255,0.25)',
                        borderRadius: 99,
                        cursor: 'pointer',
                        position: 'relative',
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.height = '6px'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.height = '4px'; }}
                    >
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: `${volumePercent}%`,
                        background: 'var(--primary)',
                        borderRadius: 99,
                        transition: draggingVolume ? 'none' : 'width 0.1s',
                      }} />
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: `${volumePercent}%`,
                        transform: 'translate(-50%, -50%)',
                        width: 12, height: 12,
                        background: '#fff',
                        borderRadius: '50%',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                        pointerEvents: 'none',
                        transition: draggingVolume ? 'none' : 'left 0.1s',
                      }} />
                    </div>
                  </div>

                  {/* PiP icon in controls */}
                  <CtrlBtn onClick={togglePip} title={pip ? '退出画中画' : '画中画'} active={pip} style={{ marginLeft: 2 }}>
                    <PictureInPicture2Icon size={15} />
                  </CtrlBtn>

                  {/* fullscreen */}
                  <CtrlBtn onClick={toggleFullscreen} title={fullscreen ? '退出全屏' : '全屏'} style={{ marginLeft: 2 }}>
                    {fullscreen
                      ? <MinimizeIcon size={16} />
                      : <MaximizeIcon size={16} />
                    }
                  </CtrlBtn>
                </div>
              </div>
            </div>

            {/* video info bar */}
            <div style={{
              marginTop: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: loaded && !videoError ? '#10b981' : videoError ? '#ef4444' : '#f59e0b',
                  boxShadow: loaded && !videoError ? '0 0 6px #10b981' : 'none',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
                  {videoError ? '加载失败' : loaded ? '就绪' : '加载中…'}
                </span>
              </div>
              {/* current speed badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '2px 8px',
                fontSize: 11,
                color: playbackRate !== 1 ? 'var(--primary)' : 'var(--muted-foreground)',
                fontWeight: 700,
                fontFamily: 'monospace',
              }}>
                <GaugeIcon size={11} />
                {playbackRate}x
              </div>
              {pip && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'color-mix(in srgb, var(--primary) 8%, var(--muted))',
                  border: '1px solid color-mix(in srgb, var(--primary) 25%, var(--border))',
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontSize: 11,
                  color: 'var(--primary)',
                  fontWeight: 700,
                }}>
                  <PictureInPicture2Icon size={11} />
                  画中画模式
                </div>
              )}
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)', opacity: 0.6 }}>|</span>
              <span style={{ fontSize: 12, color: 'var(--muted-foreground)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {VIDEO_SRC}
              </span>
            </div>
          </div>

          {/* ── right: feature list ── */}
          <div style={{
            width: 260,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            {/* keyboard shortcuts */}
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '16px 18px',
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--foreground)', marginBottom: 12 }}>
                ⌨️ 快捷说明
              </div>
              {[
                { key: 'Space', action: '播放 / 暂停' },
                { key: '点击视频', action: '播放 / 暂停' },
                { key: '拖拽进度条', action: '跳转到指定时间' },
                { key: '拖拽音量条', action: '调节音量大小' },
                { key: '音量图标', action: '切换静音状态' },
                { key: '倍速按钮', action: '0.5x / 1x / 1.5x / 2x' },
                { key: '画中画', action: '浮窗模式播放' },
                { key: '⛶ 全屏', action: '进入 / 退出全屏' },
              ].map(row => (
                <div key={row.key} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  fontSize: 12,
                  padding: '6px 0',
                  borderBottom: '1px solid var(--border)',
                  gap: 8,
                }}>
                  <span style={{
                    color: 'var(--foreground)',
                    fontWeight: 600,
                    background: 'var(--muted)',
                    borderRadius: 5,
                    padding: '1px 6px',
                    fontSize: 11,
                    flexShrink: 0,
                    fontFamily: row.key === 'Space' ? 'monospace' : 'inherit',
                  }}>
                    {row.key}
                  </span>
                  <span style={{ color: 'var(--muted-foreground)', textAlign: 'right' }}>{row.action}</span>
                </div>
              ))}
            </div>

            {/* feature badges */}
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '16px 18px',
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--foreground)', marginBottom: 12 }}>
                ✦ 功能特性
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {[
                  'HTML5 原生视频',
                  '自定义控制条',
                  '可拖拽进度条',
                  '缓冲区显示',
                  '悬停时间预览',
                  '音量调节',
                  '一键静音',
                  '倍速切换',
                  '画中画模式',
                  '空格键控制',
                  '播放结束重播',
                  '全屏支持',
                  '自动隐藏控制条',
                  '错误重载处理',
                ].map(f => (
                  <span key={f} style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--primary)',
                    background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
                    borderRadius: 99,
                    padding: '3px 9px',
                  }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* tips */}
            <div style={{
              background: 'color-mix(in srgb, var(--primary) 5%, var(--card))',
              border: '1px solid color-mix(in srgb, var(--primary) 18%, var(--border))',
              borderRadius: 12,
              padding: '14px 16px',
            }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--primary)', marginBottom: 8 }}>
                💡 使用提示
              </div>
              {[
                '按 Space 键可随时切换播放/暂停（焦点不在按钮上时生效）',
                '控制条右侧倍速按钮可弹出下拉菜单快速切换',
                '播放结束后显示重播覆盖层，点击可从头播放',
                '画中画模式让视频在任意页面悬浮播放',
                '播放时静止鼠标约 3 秒后控制条自动隐藏',
              ].map((tip, i) => (
                <div key={i} style={{
                  fontSize: 11,
                  color: 'var(--muted-foreground)',
                  lineHeight: 1.7,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 5,
                }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>·</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
