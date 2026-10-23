import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPublicGalleryVideos } from '@/lib/api';

interface VideoItem {
    id: string;
    src: string;
    thumbnail: string;
    title: string;
    description: string;
    type: 'local' | 'youtube';
}

function toYouTubeVideoId(url: string): string | null {
    const raw = url.trim();
    if (!raw) return null;
    const short = raw.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/i);
    if (short) return short[1];
    const watch = raw.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
    if (watch) return watch[1];
    const embed = raw.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/i);
    if (embed) return embed[1];
    return null;
}

const VideoGallery = () => {
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
    const videosQuery = useQuery({
        queryKey: ['gallery-videos', 'public'],
        queryFn: getPublicGalleryVideos,
        staleTime: 60_000,
    });

    // Dynamically import all local videos from the video folder
    const localVideoFiles = Object.entries(import.meta.glob('../../assets/video/*.mp4', { eager: true, as: 'url' }));

    const localVideos: VideoItem[] = localVideoFiles.map(([path, url], index) => {
        const filename = path.split('/').pop()?.replace('.mp4', '') || `Video ${index + 1}`;
        const title = filename
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());

        return {
            id: `local-${index}`,
            src: url as string,
            thumbnail: '', // We'll show a preview video/icon for local
            title: title,
            description: 'Glimpses of All Saints’ CSI Church',
            type: 'local',
        };
    });

    const adminVideos = useMemo<VideoItem[]>(() => {
        const rows = videosQuery.data ?? [];
        return rows.map((row) => {
            const ytId = toYouTubeVideoId(row.video_url);
            const thumbnail = (row.thumbnail_url ?? '').trim()
                || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : '');
            return {
                id: `db-${row.id}`,
                src: ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1` : row.video_url,
                thumbnail,
                title: row.title,
                description: 'Gallery Video',
                type: ytId ? 'youtube' : 'local',
            };
        });
    }, [videosQuery.data]);

    const backendSections = useMemo(() => {
        const grouped = new Map<string, { title: string; subtitle: string; videos: VideoItem[] }>();
        const rows = videosQuery.data ?? [];
        rows.forEach((row, idx) => {
            const title = (row.category_name ?? '').trim() || 'General Videos';
            const subtitle = (row.category_subtitle ?? '').trim();
            const key = `${title}::${subtitle}`;
            if (!grouped.has(key)) {
                grouped.set(key, { title, subtitle, videos: [] });
            }
            grouped.get(key)!.videos.push(adminVideos[idx]!);
        });
        return [...grouped.values()].filter((s) => s.videos.length > 0);
    }, [videosQuery.data, adminVideos]);

    const sections = backendSections.length > 0
        ? backendSections
        : (localVideos.length > 0
            ? [{ title: 'Church Highlights', subtitle: '', videos: localVideos }]
            : []);

    const openLightbox = (video: VideoItem) => setSelectedVideo(video);
    const closeLightbox = () => setSelectedVideo(null);

    return (
        <div className="py-8">
            {videosQuery.isLoading ? (
                <div className="mb-8 space-y-4 animate-pulse" aria-live="polite" aria-busy="true">
                    <div className="h-7 w-56 bg-muted rounded-md" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i}>
                                <div className="aspect-video rounded-xl bg-muted mb-4" />
                                <div className="h-4 bg-muted rounded w-4/5" />
                                <div className="h-3 bg-muted/80 rounded w-1/3 mt-2" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
            {videosQuery.isError ? (
                <p className="mb-6 text-sm text-muted-foreground">
                    Could not load video links from server. Showing local videos only.
                </p>
            ) : null}
            {sections.map((section, sIndex) => (
                <div key={section.title} className={sIndex > 0 ? 'mt-16' : ''}>
                    <div className="mb-8">
                        <h3 className="text-2xl font-semibold text-foreground relative inline-block">
                            {section.title}
                            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-primary rounded-full" />
                        </h3>
                        {section.subtitle ? (
                            <p className="mt-4 text-sm text-muted-foreground max-w-2xl">
                                {section.subtitle}
                            </p>
                        ) : null}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {section.videos.map((video, index) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                onClick={() => openLightbox(video)}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-video rounded-xl overflow-hidden shadow-card group-hover:shadow-medium transition-all duration-500 bg-muted mb-4">
                                    {video.type === 'youtube' ? (
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                                            <video 
                                                src={video.src} 
                                                className="w-full h-full object-cover opacity-60" 
                                                muted 
                                                preload="metadata"
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                            <Play size={28} fill="currentColor" className="ml-1" />
                                        </div>
                                    </div>
                                </div>
                                <div className="px-1 text-center md:text-left">
                                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                        {video.title}
                                    </h3>
                                    <p className="text-muted-foreground text-[10px] sm:text-xs mt-1 uppercase tracking-wider font-medium">
                                        {video.type === 'youtube' ? 'YouTube' : 'Gallery Video'}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8"
                        onClick={closeLightbox}
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-[110]"
                        >
                            <X size={24} />
                        </button>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {selectedVideo.type === 'youtube' ? (
                                <iframe
                                    src={selectedVideo.src}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <video
                                    src={selectedVideo.src}
                                    className="w-full h-full"
                                    controls
                                    autoPlay
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VideoGallery;
