import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';

interface VideoItem {
    id: string;
    src: string;
    thumbnail: string;
    title: string;
    description: string;
    type: 'local' | 'youtube';
}

const VideoGallery = () => {
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

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

    // Sermon Videos
    const sermonVideos: VideoItem[] = [
        {
            id: '8760XCGy0Lo',
            src: 'https://www.youtube.com/embed/8760XCGy0Lo?autoplay=1',
            thumbnail: 'https://img.youtube.com/vi/8760XCGy0Lo/maxresdefault.jpg',
            title: "2022 All Saints' CSI Church Thrissur Convention | Evg. John Thomas, Missions India",
            description: 'Church Convention 2022',
            type: 'youtube',
        },
        {
            id: 'WUR7BZ8sseA',
            src: 'https://www.youtube.com/embed/WUR7BZ8sseA?autoplay=1',
            thumbnail: 'https://img.youtube.com/vi/WUR7BZ8sseA/maxresdefault.jpg',
            title: "All Saints' CSI Church Thrissur Bible Convention 2024 - Day 01",
            description: 'Bible Convention 2024',
            type: 'youtube',
        }
    ];

    // Sunday School Videos
    const sundaySchoolVideos: VideoItem[] = [
        {
            id: 'CGQLGuFs6kk',
            src: 'https://www.youtube.com/embed/CGQLGuFs6kk?autoplay=1',
            thumbnail: 'https://img.youtube.com/vi/CGQLGuFs6kk/maxresdefault.jpg',
            title: "Sunday School Kids Christmas Koinonia & Bethel Ashram Girls Choreography | Carol 2025",
            description: 'Carol 2025',
            type: 'youtube',
        },
        {
            id: 'wmpvY4epd1A',
            src: 'https://www.youtube.com/embed/wmpvY4epd1A?autoplay=1',
            thumbnail: 'https://img.youtube.com/vi/wmpvY4epd1A/maxresdefault.jpg',
            title: "Christmas Nativity Play 2021",
            description: 'Nativity Play',
            type: 'youtube',
        },
        {
            id: 'r0Gb-F8Zkos',
            src: 'https://www.youtube.com/embed/r0Gb-F8Zkos?autoplay=1',
            thumbnail: 'https://img.youtube.com/vi/r0Gb-F8Zkos/maxresdefault.jpg',
            title: "Sing High Sing Low",
            description: 'Sunday School Song',
            type: 'youtube',
        },
        {
            id: 'OsVwtr0gORw',
            src: 'https://www.youtube.com/embed/OsVwtr0gORw?autoplay=1',
            thumbnail: 'https://img.youtube.com/vi/OsVwtr0gORw/maxresdefault.jpg',
            title: "Dance Performance | Sunday School Annual Day 2022",
            description: 'Annual Day 2022',
            type: 'youtube',
        },
        {
            id: 'D8CkLvCtFVk',
            src: 'https://www.youtube.com/embed/D8CkLvCtFVk?autoplay=1',
            thumbnail: 'https://img.youtube.com/vi/D8CkLvCtFVk/maxresdefault.jpg',
            title: "Dhum Dhum Thana | VBS 2022",
            description: 'VBS 2022',
            type: 'youtube',
        }
    ];

    // Choir Videos
    const choirVideos: VideoItem[] = [
        {
            id: 'o0cB7aYesOQ',
            src: 'https://www.youtube.com/embed/o0cB7aYesOQ?autoplay=1',
            thumbnail: 'https://img.youtube.com/vi/o0cB7aYesOQ/maxresdefault.jpg',
            title: "CAROL 2025 - Part 1",
            description: 'Christmas Carol Service 2024',
            type: 'youtube',
        },
        {
            id: '3C-eKKOkUd8',
            src: 'https://www.youtube.com/embed/3C-eKKOkUd8?autoplay=1',
            thumbnail: 'https://img.youtube.com/vi/3C-eKKOkUd8/maxresdefault.jpg',
            title: "CAROL 2025 - Part 2",
            description: 'Christmas Carol Service 2024',
            type: 'youtube',
        },
        {
            id: '6yDq2WHCBag',
            src: 'https://www.youtube.com/embed/6yDq2WHCBag?autoplay=1',
            thumbnail: 'https://img.youtube.com/vi/6yDq2WHCBag/maxresdefault.jpg',
            title: "CAROL 2024 - Part 1",
            description: 'Christmas Carol Service 2023',
            type: 'youtube',
        },
        {
            id: 'wwAoUZDdaWM',
            src: 'https://www.youtube.com/embed/wwAoUZDdaWM?autoplay=1',
            thumbnail: 'https://img.youtube.com/vi/wwAoUZDdaWM/maxresdefault.jpg',
            title: "CAROL 2024 - Part 2",
            description: 'Christmas Carol Service 2023',
            type: 'youtube',
        },
        {
            id: 'Ppk8CuFBAaM',
            src: 'https://www.youtube.com/embed/Ppk8CuFBAaM?autoplay=1',
            thumbnail: 'https://img.youtube.com/vi/Ppk8CuFBAaM/maxresdefault.jpg',
            title: "CAROL 2024 - Part 3",
            description: 'Christmas Carol Service 2023',
            type: 'youtube',
        },
        {
            id: '4jS2UVP6xHc',
            src: 'https://www.youtube.com/embed/4jS2UVP6xHc?autoplay=1',
            thumbnail: 'https://img.youtube.com/vi/4jS2UVP6xHc/maxresdefault.jpg',
            title: "CAROL 2024 - Part 4",
            description: 'Christmas Carol Service 2023',
            type: 'youtube',
        }
    ];

    const sections = [
        {
            title: 'Sermon Videos',
            videos: sermonVideos
        },
        {
            title: 'Choir Videos',
            videos: choirVideos
        },
        {
            title: 'Sunday School Videos',
            videos: sundaySchoolVideos
        },
        {
            title: 'Church Highlights',
            videos: localVideos
        }
    ].filter(section => section.videos.length > 0);

    const openLightbox = (video: VideoItem) => setSelectedVideo(video);
    const closeLightbox = () => setSelectedVideo(null);

    return (
        <div className="py-8">
            {sections.map((section, sIndex) => (
                <div key={section.title} className={sIndex > 0 ? 'mt-16' : ''}>
                    <h3 className="text-2xl font-semibold mb-8 text-foreground relative inline-block">
                        {section.title}
                        <span className="absolute -bottom-2 left-0 w-12 h-1 bg-primary rounded-full" />
                    </h3>
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
