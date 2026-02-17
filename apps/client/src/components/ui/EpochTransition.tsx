import { motion, AnimatePresence } from 'framer-motion';

interface EpochTransitionProps {
    epoch: number;
    visible: boolean;
    onComplete?: () => void;
}

const EPOCH_NAMES: Record<number, string> = {
    1: 'Age of Foundation',
    2: 'Age of Progress',
    3: 'Age of Wonder',
};

const EPOCH_ICONS: Record<number, string> = {
    1: '🏛️',
    2: '⚙️',
    3: '🌟',
};

export function EpochTransition({ epoch, visible, onComplete }: EpochTransitionProps) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    onAnimationComplete={() => {
                        if (onComplete) {
                            setTimeout(onComplete, 2000);
                        }
                    }}
                >
                    {/* Background overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-dark-marble to-black" />

                    {/* Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-ancient-gold/40 rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                animate={{
                                    y: [0, -200],
                                    opacity: [0, 0.8, 0],
                                    scale: [1, 1.5, 0.5],
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2,
                                }}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 text-center">
                        {/* Epoch icon */}
                        <motion.div
                            className="text-8xl mb-6"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
                        >
                            {EPOCH_ICONS[epoch] ?? '🏛️'}
                        </motion.div>

                        {/* Epoch number */}
                        <motion.div
                            className="text-ancient-gold/50 text-sm uppercase tracking-[0.3em] font-medium mb-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            Epoch {epoch}
                        </motion.div>

                        {/* Epoch name */}
                        <motion.h1
                            className="font-display text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-ancient-gold via-white to-ancient-bronze"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        >
                            {EPOCH_NAMES[epoch] ?? `Epoch ${epoch}`}
                        </motion.h1>

                        {/* Decorative line */}
                        <motion.div
                            className="mt-6 mx-auto h-px bg-gradient-to-r from-transparent via-ancient-gold/50 to-transparent"
                            initial={{ width: 0 }}
                            animate={{ width: '16rem' }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                        />

                        {/* Subtitle */}
                        <motion.p
                            className="mt-4 text-white/40 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                        >
                            {epoch === 1 && 'Lay the foundations of your ancient city'}
                            {epoch === 2 && 'Advance your civilization with science and trade'}
                            {epoch === 3 && 'Build your legacy and claim eternal glory'}
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
