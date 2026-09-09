export interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  // Present on images uploaded via the Media Library (/admin/media or a
  // Film/Book form's picker) — absent on this file's static legacy set.
  caption?: string | null;
  category?: string | null;
}

// Real, unedited production photography supplied directly by Arjun
// Prashanth — not stock imagery, not AI-generated. Dimensions are the
// actual source pixel sizes (read from each file) so the masonry grid and
// next/image both reflect each photo's real, varied aspect ratio instead of
// a guessed/fixed one.
const dimensions: [number, number][] = [
  [1320, 864], [1320, 879], [1320, 891], [1320, 886], [1320, 1329],
  [1320, 873], [1320, 1459], [1320, 1309], [1320, 1305], [1320, 1319],
  [1320, 1304], [1320, 1309], [1320, 1313], [1320, 1311], [1320, 1309],
  [1320, 1308], [1320, 1315], [1320, 1325], [1320, 1318], [1320, 1312],
  [1320, 1320], [1320, 1322], [1320, 1329], [1320, 1315], [1320, 1316],
  [1320, 1311], [1320, 1330], [1320, 1309], [1320, 1302], [1320, 1320],
  [1320, 1312], [1320, 1309], [1320, 1309], [1320, 1318], [1320, 1311],
  [1320, 1313], [1320, 1318], [1320, 1327], [1320, 1316], [1320, 1322],
  [1320, 1326], [1320, 1330], [1320, 988], [1320, 1305], [1320, 1329],
  [1320, 1316], [1274, 1600], [1320, 1320], [1086, 1448], [1320, 1325],
  [1086, 1448], [1122, 1402], [1320, 2024], [3120, 4160],
];

export const galleryImages: GalleryImage[] = dimensions.map(([width, height], i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    src: `/images/gallery/photo-${n}.jpeg`,
    // Generic by design — not every frame includes Arjun himself (cast/crew
    // and set photography are mixed in), so the caption doesn't assert his
    // presence in a specific image without per-photo verification.
    alt: `Film production — behind the scenes photography, image ${i + 1}`,
    width,
    height,
  };
});
