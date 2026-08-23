"use client";

import { Music, Video as VideoIcon, Image as ImageIcon, Paperclip } from "lucide-react";

export type MediaKind = "image" | "audio" | "video" | null;

/** Fallback for attachments recorded before media_type existed. */
export function kindFromUrl(url: string | null | undefined): MediaKind {
  if (!url) return null;
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  if (!ext) return null;
  if (["jpg", "jpeg", "png", "gif", "webp", "avif", "bmp", "svg"].includes(ext)) return "image";
  if (["mp3", "m4a", "aac", "ogg", "oga", "wav", "flac", "opus"].includes(ext)) return "audio";
  if (["mp4", "webm", "mov", "m4v", "avi", "mkv"].includes(ext)) return "video";
  return null;
}

export function resolveKind(mediaType: string | null | undefined, url: string | null | undefined): MediaKind {
  if (mediaType === "image" || mediaType === "audio" || mediaType === "video") return mediaType;
  return kindFromUrl(url);
}

export function MediaIcon({ kind, size = 14 }: { kind: MediaKind; size?: number }) {
  if (kind === "audio") return <Music size={size} />;
  if (kind === "video") return <VideoIcon size={size} />;
  if (kind === "image") return <ImageIcon size={size} />;
  return <Paperclip size={size} />;
}

export function mediaLabel(kind: MediaKind): string {
  if (kind === "audio") return "Audio attached";
  if (kind === "video") return "Video attached";
  if (kind === "image") return "Image attached";
  return "File attached";
}

/**
 * Renders an attachment as what it actually is. Audio and video get real
 * players; anything unrecognised degrades to a link rather than a broken
 * element.
 */
export default function MediaAttachment({
  url,
  mediaType,
  className = "",
}: {
  url: string;
  mediaType?: string | null;
  className?: string;
}) {
  const kind = resolveKind(mediaType, url);

  if (kind === "image") {
    return (
      <img
        src={url}
        alt="Letter attachment"
        className={`h-auto w-full max-h-[400px] object-cover ${className}`}
      />
    );
  }

  if (kind === "audio") {
    return (
      <div className={`w-full px-6 py-5 ${className}`}>
        <audio controls preload="metadata" src={url} className="w-full">
          Your browser can’t play audio.{" "}
          <a href={url}>Download the recording</a>.
        </audio>
      </div>
    );
  }

  if (kind === "video") {
    return (
      <video
        controls
        preload="metadata"
        src={url}
        className={`h-auto w-full max-h-[400px] ${className}`}
      >
        Your browser can’t play video. <a href={url}>Download the video</a>.
      </video>
    );
  }

  return (
    <div className={`px-6 py-5 ${className}`}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-accent-text underline underline-offset-2"
      >
        <Paperclip size={14} /> Open the attachment
      </a>
    </div>
  );
}
