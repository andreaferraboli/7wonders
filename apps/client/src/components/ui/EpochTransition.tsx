import { motion } from 'framer-motion';

export interface EpochTransitionProps {
    epoch: number;
    onComplete?: () => void;
}

const EPOCH_NAMES: Record<number, string> = {
    1: 'Età delle Fondamenta',
    2: 'Età del Progresso',
    3: 'Età delle Meraviglie',
};

const EPOCH_ICONS: Record<number, string> = {
    1: '🏛️',
    2: '⚙️',
    3: '🌟',
};

const EPOCH_SUBTITLES: Record<number, string> = {
    1: 'Getta le fondamenta della tua città',
    2: 'Avanza la tua civiltà con scienza e commercio',
    3: 'Costruisci il tuo lascito e conquista la gloria eterna',
};

export function EpochTransition({ epoch, onComplete }: EpochTransitionProps) {
    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onAnimationComplete={() => {
                if (onComplete) {
                    setTimeout(onComplete, 2500);
                }
            }}
        >
            {/* Background overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(26,26,46,0.95), rgba(0,0,0,0.95))',
                }}
            />

            {/* Particles */}
            <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full"
                        style={{
                            backgroundColor: 'rgba(212, 165, 116, 0.4)',
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
                    className="text-sm uppercase tracking-[0.3em] font-medium mb-2"
                    style={{ color: 'rgba(212, 165, 116, 0.5)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    Età {['I', 'II', 'III'][epoch - 1]}
                </motion.div>

                {/* Epoch name */}
                <motion.h1
                    className="text-5xl sm:text-6xl font-bold"
                    style={{
                        fontFamily: 'Cinzel, Georgia, serif',
                        background: 'linear-gradient(to right, #D4A574, #FFFFFF, #CD7F32)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    {EPOCH_NAMES[epoch] ?? `Età ${epoch}`}
                </motion.h1>

                {/* Decorative line */}
                <motion.div
                    className="mt-6 mx-auto h-px"
                    style={{
                        background: 'linear-gradient(to right, transparent, rgba(212, 165, 116, 0.5), transparent)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: '16rem' }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                />

                {/* Subtitle */}
                <motion.p
                    className="mt-4 text-sm"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    {EPOCH_SUBTITLES[epoch] ?? ''}
                </motion.p>
            </div>
        </motion.div>
    );
}
