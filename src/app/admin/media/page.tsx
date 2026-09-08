import MediaLibraryManager from "@/components/admin/media/MediaLibraryManager";

export default function AdminMediaPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium mb-1">Media Library</h1>
      <p className="text-black/50 text-[13px] mb-6">
        Every uploaded image and video, reusable across Films, Books, and their galleries.
      </p>
      <MediaLibraryManager />
    </div>
  );
}
