import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

const VideoGallery = () => {
    // Dynamically import all videos from the video folder
    const videoFiles = Object.entries(import.meta.glob('@/assets/video/*.mp4', { eager: true, as: 'url' }));

    const videos = videoFiles.map(([path, url], index) => {
        // Extract filename for title
        const filename = path.split('/').pop()?.replace('.mp4', '') || `Video ${index + 1}`;
        const title = filename
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());

        return {
            src: url as string,
            title: title,
            description: 'Glimpses of All Saints’ CSI Church',
        };
    });

    if (videos.length === 0) {
        return (
            <div className="py-12 text-center bg-muted/30 rounded-2xl border-2 border-dashed border-muted">
                <p className="text-muted-foreground">No videos available at the moment.</p>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {videos.map((video, index) => (
                    <motion.div
                        key={video.src}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-medium transition-all duration-500"
                    >
                        <div className="relative aspect-video">
                            <video
                                src={video.src}
                                className="w-full h-full object-cover"
                                muted
                                onMouseEnter={(e) => e.currentTarget.play()}
                                onMouseLeave={(e) => {
                                    e.currentTarget.pause();
                                    e.currentTarget.currentTime = 0;
                                }}
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                                <div className="p-4 rounded-full bg-primary/90 text-primary-foreground shadow-lg transform group-hover:scale-110 transition-transform">
                                    <Play size={32} fill="currentColor" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-foreground mb-2">{video.title}</h3>
                            <p className="text-muted-foreground text-sm">{video.description}</p>
                            <div className="mt-4">
                                <a
                                    href={video.src}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary font-medium text-sm hover:underline"
                                >
                                    Watch in full screen
                                </a>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default VideoGallery;
