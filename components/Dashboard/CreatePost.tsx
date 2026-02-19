import { useState, useRef, useTransition, useEffect } from "react";
import { Image as ImageIcon, Video, Send, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createPost } from "@/lib/actions/post.actions";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import AvatarWithEffect from "../AvatarWithEffect";
import { motion, AnimatePresence } from "framer-motion";

export default function CreatePost({ user, dict, dbUserId }: { user: any; dict?: any; dbUserId?: string }) {
    const t = dict?.dashboard || {};
    const [text, setText] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);

    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");

    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const pathname = usePathname() || "/dashboard";
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [text]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Clear video if image selected (mutually exclusive)
            if (videoFile) removeVideo();

            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validation: Max 50MB
            if (file.size > 50 * 1024 * 1024) {
                setErrorMessage("Video too large. Max size is 50MB.");
                setStatus('error');
                setTimeout(() => setStatus('idle'), 3000);
                return;
            }

            // Clear image if video selected
            if (imageFile) removeImage();

            setVideoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setVideoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeVideo = () => {
        setVideoFile(null);
        setVideoPreview(null);
        if (videoInputRef.current) videoInputRef.current.value = "";
    }

    const handleSubmit = async () => {
        if (!text.trim() && !imageFile && !videoFile) return;

        setStatus('uploading');
        setProgress(0);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + Math.random() * 10;
            });
        }, 300);

        const formData = new FormData();
        formData.append("text", text);
        if (imageFile) {
            formData.append("image", imageFile);
        }
        if (videoFile) {
            formData.append("video", videoFile);
        }

        startTransition(async () => {
            try {
                // Pass pathname to revalidate correctly
                // Use explicit dbUserId if provided (for Prisma), fallback to user._id (for Sanity/legacy)
                const result = (await createPost(dbUserId || user._id, formData, pathname)) as any;
                clearInterval(progressInterval);

                if (result.success) {
                    setProgress(100);
                    setStatus('success');

                    // Reset form after delay
                    setTimeout(() => {
                        setText("");
                        removeImage();
                        removeVideo();
                        setStatus('idle');
                        setProgress(0);
                    }, 2000);
                } else {
                    setStatus('error');
                    setErrorMessage(result.error || "Failed to create post");
                    setTimeout(() => setStatus('idle'), 3000);
                }
            } catch (error) {
                clearInterval(progressInterval);
                setStatus('error');
                setErrorMessage("Something went wrong");
                setTimeout(() => setStatus('idle'), 3000);
            }
        });
    };

    return (
        <div className="glass-liquid p-6 mb-8 relative overflow-hidden group">
            {/* Background Gradient Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--site-secondary)]/5 via-[var(--site-accent)]/5 to-[var(--site-secondary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative z-10 flex gap-4">
                <div className="hidden sm:block">
                    <AvatarWithEffect
                        src={(() => {
                            if (!user.profileImage) return user.imageURL;
                            if (typeof user.profileImage === 'string') return user.profileImage;
                            try {
                                return urlFor(user.profileImage).width(100).url();
                            } catch (e) {
                                return user.imageURL;
                            }
                        })()}
                        alt={user.fullName || "User"}
                        size={48}
                        effect={user.equippedEffect}
                        frame={user.equippedFrame}
                        background={user.equippedBackground}
                        profileColor={user.profileColor}
                        frameColor={user.frameColor}
                    />
                </div>

                <div className="flex-1 space-y-4">
                    <div className="min-h-[120px]">
                        <textarea
                            ref={textareaRef}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={status !== 'idle'}
                            placeholder={t.whats_on_your_mind || "What's on your mind?"}
                            className="w-full h-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[var(--glass-text)] placeholder-[var(--glass-text-muted)] text-lg resize-none p-0 disabled:opacity-50"
                            rows={3}
                            style={{ overflow: 'hidden', minHeight: '120px' }}
                        />
                    </div>

                    <AnimatePresence>
                        {imagePreview && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                                className="relative rounded-xl overflow-hidden border border-white/10"
                            >
                                <div className="relative w-full h-64 sm:h-80">
                                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                </div>
                                <button
                                    onClick={removeImage}
                                    disabled={status !== 'idle'}
                                    className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm"
                                >
                                    <X size={18} />
                                </button>
                            </motion.div>
                        )}
                        {videoPreview && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                                className="relative rounded-xl overflow-hidden border border-white/10 bg-black"
                            >
                                <video
                                    src={videoPreview}
                                    controls
                                    className="w-full max-h-[400px]"
                                />
                                <button
                                    onClick={removeVideo}
                                    disabled={status !== 'idle'}
                                    className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm z-10"
                                >
                                    <X size={18} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Progress Bar */}
                    <AnimatePresence>
                        {status === 'uploading' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden"
                            >
                                <motion.div
                                    className="h-full bg-gradient-to-r from-[var(--site-accent)] to-[var(--site-secondary)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error Message */}
                    <AnimatePresence>
                        {status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2 text-sm"
                            >
                                <AlertCircle size={16} />
                                {errorMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                                accept="image/*"
                                className="hidden"
                                disabled={status !== 'idle'}
                            />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={status !== 'idle'}
                                className="p-2.5 rounded-full hover:bg-[var(--site-secondary)]/10 text-[var(--site-secondary)]/80 hover:text-[var(--site-secondary)] transition-colors disabled:opacity-50"
                                title="Add Image"
                            >
                                <ImageIcon size={22} />
                            </motion.button>

                            <input
                                type="file"
                                ref={videoInputRef}
                                onChange={handleVideoSelect}
                                accept="video/*"
                                className="hidden"
                                disabled={status !== 'idle'}
                            />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => videoInputRef.current?.click()}
                                disabled={status !== 'idle'}
                                className="p-2.5 rounded-full hover:bg-purple-500/10 text-purple-500/80 hover:text-purple-500 transition-colors disabled:opacity-50"
                                title="Add Video"
                            >
                                <Video size={22} />
                            </motion.button>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={(!text.trim() && !imageFile && !videoFile) || status !== 'idle'}
                            className={`
                                relative px-6 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all overflow-hidden flex items-center gap-2
                                ${status === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-gradient-to-r from-site-accent-prev to-site-accent-next hover:opacity-90'}
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                            `}
                        >
                            <AnimatePresence mode="wait">
                                {status === 'uploading' ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex items-center gap-2"
                                    >
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>{t.posting || "Posting..."}</span>
                                    </motion.div>
                                ) : status === 'success' ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle2 size={18} />
                                        <span>Posted!</span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex items-center gap-2"
                                    >
                                        <span>{t.post || "Post"}</span>
                                        <Send size={16} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Success Overlay Flash */}
            <AnimatePresence>
                {status === 'success' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-green-500/10 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-3xl"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            className="bg-white dark:bg-black rounded-full p-4 shadow-2xl text-green-500"
                        >
                            <CheckCircle2 size={48} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
