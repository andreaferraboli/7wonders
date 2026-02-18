import { motion } from 'framer-motion';

interface WonderBoardProps {
    wonderId: string;
    wonderSide: string;
    stagesBuilt: number;
    totalStages?: number;
    startingResource?: string;
    onBuildStage?: (stageIndex: number) => void;
}

// Wonder image mapping: wonderId + side → image file
const WONDER_IMAGE_MAP: Record<string, string> = {
    'GIZA_DAY': '01_Giza_A.jpg',
    'BABYLON_DAY': '02_Babilonia_A.jpg',
    'OLYMPIA_DAY': '03_Olimpia_A.jpg',
    'RHODES_DAY': '04_Rodi_A.jpg',
    'EPHESUS_DAY': '05_Efeso_A.jpg',
    'ALEXANDRIA_DAY': '06_Alexandria_A.jpg',
    'HALIKARNASSUS_DAY': '07_Alicarnasso_A.jpg',
    'GIZA_NIGHT': '08_Giza_B.jpg',
    'BABYLON_NIGHT': '09_Babilonia_B.jpg',
    'OLYMPIA_NIGHT': '10_Olimpia_B.jpg',
    'RHODES_NIGHT': '11_Rodi_B.jpg',
    'EPHESUS_NIGHT': '12_Efeso_B.jpg',
    'ALEXANDRIA_NIGHT': '13_Alexandria_B.jpg',
    'HALIKARNASSUS_NIGHT': '14_Alicarnasso_B.jpg',
};

const wonderImages = import.meta.glob('@/assets/wonders/*.jpg', { eager: true, as: 'url' });

function getWonderImageUrl(wonderId: string, side: string): string | undefined {
    const key = `${wonderId}_${side}`;
    const filename = WONDER_IMAGE_MAP[key];
    if (!filename) return undefined;

    const match = Object.keys(wonderImages).find(k => k.includes(filename));
    return match ? wonderImages[match] : undefined;
}

const WONDER_NAMES: Record<string, string> = {
    ALEXANDRIA: 'Alessandria',
    BABYLON: 'Babilonia',
    EPHESUS: 'Efeso',
    GIZA: 'Giza',
    HALIKARNASSUS: 'Alicarnasso',
    OLYMPIA: 'Olimpia',
    RHODES: 'Rodi',
};

const WONDER_DETAILS: Record<string, { totalStages: Record<string, number> }> = {
    ALEXANDRIA: { totalStages: { DAY: 3, NIGHT: 3 } },
    BABYLON: { totalStages: { DAY: 3, NIGHT: 2 } },
    EPHESUS: { totalStages: { DAY: 3, NIGHT: 3 } },
    GIZA: { totalStages: { DAY: 3, NIGHT: 4 } },
    HALIKARNASSUS: { totalStages: { DAY: 3, NIGHT: 3 } },
    OLYMPIA: { totalStages: { DAY: 3, NIGHT: 3 } },
    RHODES: { totalStages: { DAY: 3, NIGHT: 2 } },
};

export function WonderBoard({ wonderId, wonderSide, stagesBuilt, startingResource }: WonderBoardProps) {
    const details = WONDER_DETAILS[wonderId];
    const totalStages = details?.totalStages[wonderSide] ?? 3;
    const imageUrl = getWonderImageUrl(wonderId, wonderSide);
    const displayName = WONDER_NAMES[wonderId] ?? wonderId;

    return (
        <motion.div
            id={`wonder-${wonderId}`}
            className="relative rounded-xl overflow-hidden"
            style={{
                border: '2px solid rgba(212, 165, 116, 0.4)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* Wonder image */}
            <div className="relative" style={{ height: '180px' }}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-900 to-stone-800 flex items-center justify-center">
                        <span className="text-4xl">🏛️</span>
                    </div>
                )}

                {/* Gradient overlay at bottom for text readability */}
                <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                        height: '80px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                    }}
                />

                {/* Wonder name overlay */}
                <div className="absolute bottom-2 left-3 right-3">
                    <h2
                        className="text-lg font-bold drop-shadow-lg"
                        style={{
                            fontFamily: 'Cinzel, Georgia, serif',
                            color: '#D4A574',
                            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                        }}
                    >
                        {displayName}
                    </h2>
                    <p className="text-[10px] text-white/60">
                        Lato {wonderSide === 'DAY' ? '☀️ A' : '🌙 B'}
                        {startingResource && ` • ${startingResource.toLowerCase()}`}
                    </p>
                </div>

                {/* Completion badge */}
                {stagesBuilt === totalStages && (
                    <motion.div
                        className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold"
                        style={{
                            background: 'linear-gradient(135deg, #16a34a, #15803d)',
                            color: '#fff',
                            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.5)',
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
                    >
                        🏆 Completata!
                    </motion.div>
                )}
            </div>

            {/* Wonder stages progress */}
            <div
                className="p-3"
                style={{
                    background: 'linear-gradient(to bottom, rgba(26,26,46,0.95), rgba(15,15,35,0.98))',
                }}
            >
                <div className="flex gap-1.5">
                    {Array.from({ length: totalStages }).map((_, index) => {
                        const isBuilt = index < stagesBuilt;
                        const isNext = index === stagesBuilt;
                        return (
                            <motion.div
                                key={index}
                                className="flex-1 h-8 rounded-md flex items-center justify-center transition-all"
                                style={{
                                    border: isBuilt
                                        ? '2px solid rgba(212, 165, 116, 0.7)'
                                        : isNext
                                            ? '2px dashed rgba(212, 165, 116, 0.4)'
                                            : '2px dashed rgba(255,255,255,0.1)',
                                    background: isBuilt
                                        ? 'linear-gradient(135deg, rgba(212, 165, 116, 0.25), rgba(205, 127, 50, 0.15))'
                                        : isNext
                                            ? 'rgba(255,255,255,0.03)'
                                            : 'rgba(255,255,255,0.01)',
                                    opacity: !isBuilt && !isNext ? 0.4 : 1,
                                    cursor: isNext ? 'pointer' : 'default',
                                }}
                                initial={false}
                                animate={isBuilt ? { scale: [1, 1.05, 1] } : {}}
                                transition={{ duration: 0.3 }}
                                whileHover={isNext ? { scale: 1.03, background: 'rgba(212, 165, 116, 0.1)' } : {}}
                            >
                                {isBuilt ? (
                                    <span style={{ color: '#D4A574', fontWeight: 'bold', fontSize: '14px' }}>✓</span>
                                ) : (
                                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>{index + 1}</span>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{
                            background: 'linear-gradient(to right, #D4A574, #CD7F32)',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(stagesBuilt / totalStages) * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
