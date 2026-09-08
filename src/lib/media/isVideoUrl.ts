// Shared by server components and client components alike (no Node
// imports), so a card can decide image-vs-video from the URL string alone.
const VIDEO_EXT = /\.(mp4|webm)(\?.*)?$/i;

export function isVideoUrl(url: string | null | undefined): boolean {
  return !!url && VIDEO_EXT.test(url);
}
