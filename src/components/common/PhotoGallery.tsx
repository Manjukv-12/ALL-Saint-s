import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface GalleryImage {
    src: string;
    alt: string;
    category: string;
}

const PhotoSection = ({ title, images, onImageClick }: { title: string; images: GalleryImage[]; onImageClick: (index: number, categoryImages: GalleryImage[]) => void }) => {
    if (images.length === 0) {
        return (
            <div className="mb-16">
                <h3 className="text-2xl font-semibold mb-6 text-foreground/80">{title}</h3>
                <div className="bg-muted/30 rounded-2xl p-12 text-center border-2 border-dashed border-muted">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">More photos coming soon to the {title} gallery.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-16">
            <h3 className="text-2xl font-semibold mb-8 text-foreground relative inline-block">
                {title}
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-primary rounded-full" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((image, index) => (
                    <motion.div
                        key={image.src}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
                        viewport={{ once: true }}
                        onClick={() => onImageClick(index, images)}
                        className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-card hover:shadow-medium transition-all duration-500 bg-muted"
                    >
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const PhotoGallery = () => {
    const [selectedImage, setSelectedImage] = useState<{ index: number; images: GalleryImage[] } | null>(null);

    // Dynamically import all images from the Gallery folder
    const choirImages = Object.values(import.meta.glob('../../assets/Gallery/choir/*.{jpeg,jpg,png,JPG,JPEG}', { eager: true, as: 'url' }));
    const sundaySchoolImages = Object.values(import.meta.glob('../../assets/Gallery/Sunday School photos/*.{jpeg,jpg,png,JPG,JPEG}', { eager: true, as: 'url' }));
    const womensFellowshipImages = Object.values(import.meta.glob('../../assets/Gallery/Womens fellowship/*.{jpeg,jpg,png,JPG,JPEG}', { eager: true, as: 'url' }));
    const youthImages = Object.values(import.meta.glob('../../assets/Gallery/youth/*.{jpeg,jpg,png,JPG,JPEG}', { eager: true, as: 'url' }));
    const mensFellowshipImages: string[] = []; // No images found for Men's Fellowship

    const mapToGalleryImages = (sources: string[], category: string): GalleryImage[] =>
        sources.map((src, i) => ({ src, alt: `${category} photo ${i + 1}`, category }));

    const sections = [
        { title: 'Choir', images: mapToGalleryImages(choirImages as string[], 'Choir') },
        { title: 'Sunday School', images: mapToGalleryImages(sundaySchoolImages as string[], 'Sunday School') },
        { title: 'Men’s Fellowship', images: mapToGalleryImages(mensFellowshipImages as string[], 'Men’s Fellowship') },
        { title: 'Women’s Fellowship', images: mapToGalleryImages(womensFellowshipImages as string[], 'Women’s Fellowship') },
        { title: 'Youth Fellowship', images: mapToGalleryImages(youthImages as string[], 'Youth Fellowship') },
    ];

    const handleImageClick = (index: number, categoryImages: GalleryImage[]) => {
        setSelectedImage({ index, images: categoryImages });
    };

    const closeLightbox = () => setSelectedImage(null);
    const goToPrevious = () => {
        if (selectedImage) {
            setSelectedImage({
                ...selectedImage,
                index: selectedImage.index === 0 ? selectedImage.images.length - 1 : selectedImage.index - 1
            });
        }
    };
    const goToNext = () => {
        if (selectedImage) {
            setSelectedImage({
                ...selectedImage,
                index: selectedImage.index === selectedImage.images.length - 1 ? 0 : selectedImage.index + 1
            });
        }
    };

    return (
        <div className="py-8">
            {sections.map((section) => (
                <PhotoSection
                    key={section.title}
                    title={section.title}
                    images={section.images}
                    onImageClick={handleImageClick}
                />
            ))}

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
                        onClick={closeLightbox}
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-[110]"
                        >
                            <X size={24} />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                            className="absolute left-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-[110]"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); goToNext(); }}
                            className="absolute right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-[110]"
                        >
                            <ChevronRight size={24} />
                        </button>

                        <motion.div
                            key={selectedImage.index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage.images[selectedImage.index].src}
                                alt={selectedImage.images[selectedImage.index].alt}
                                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                            />
                            <div className="mt-4 px-4 py-2 bg-white/10 rounded-full text-white text-sm backdrop-blur-md">
                                {selectedImage.index + 1} / {selectedImage.images.length} — {selectedImage.images[selectedImage.index].category}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PhotoGallery;
