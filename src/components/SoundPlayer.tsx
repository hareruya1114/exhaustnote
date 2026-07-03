'use client';

import { useRef, useState } from 'react';

/**
 * 1マフラー=1音源のシンプルなプレイヤー。
 * preload="none" で、再生ボタンを押したときにだけ音源を取得する。
 */
export function SoundPlayer({
  src,
  brandLabel,
  caption,
}: {
  src: string;
  brandLabel: string;
  caption?: string | null;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasSrc = Boolean(src);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
    } else {
      setLoading(true);
      a.play()
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-asphalt-700 bg-asphalt-900 p-4">
      <p className="font-mono text-[11px] tracking-wide text-titanium-500">SOUND — {brandLabel}</p>
      {caption && <p className="mt-0.5 text-xs text-titanium-300">{caption}</p>}

      <div className="rpm-ticks my-4 h-[70px] rounded-md border border-asphalt-800" aria-hidden="true" />

      {hasSrc ? (
        <>
          <audio
            ref={audioRef}
            src={src}
            preload="none"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          >
            お使いのブラウザは音声再生に対応していません。
          </audio>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              aria-pressed={playing}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-tacho px-4 py-3.5 text-sm font-bold text-white transition hover:brightness-110"
            >
              <span aria-hidden="true">{playing ? '■' : '▶'}</span>
              {playing ? '停止' : loading ? '読み込み中…' : '排気音を再生'}
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-asphalt-700 px-4 py-3.5 text-center text-sm text-titanium-500">
          音源は準備中です
        </div>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-titanium-500">
        スマホのマナーモードでは音が出ないことがあります。音源はストリーミング配信（preload=none）です。
      </p>
    </div>
  );
}
