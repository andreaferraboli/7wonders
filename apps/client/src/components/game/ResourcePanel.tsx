import { motion } from 'framer-motion';

interface ResourcePanelProps {
    coins: number;
    militaryPower: number;
    scienceCompass: number;
    scienceGear: number;
    scienceTablet: number;
    builtCardColors: Record<string, number>;
}

const RESOURCE_ITEMS = [
    { key: 'coins', icon: '💰', label: 'Coins', color: 'text-yellow-400' },
    { key: 'military', icon: '⚔️', label: 'Military', color: 'text-red-400' },
] as const;

const SCIENCE_ITEMS = [
    { key: 'compass', icon: '🧭', label: 'Compass', color: 'text-emerald-400' },
    { key: 'gear', icon: '⚙️', label: 'Gear', color: 'text-emerald-400' },
    { key: 'tablet', icon: '📜', label: 'Tablet', color: 'text-emerald-400' },
] as const;

const CARD_COLORS: Array<{ key: string; icon: string; label: string; color: string }> = [
    { key: 'BROWN', icon: '🪵', label: 'Raw', color: 'text-amber-600' },
    { key: 'GREY', icon: '⚙️', label: 'Mfg', color: 'text-gray-400' },
    { key: 'BLUE', icon: '🏛️', label: 'Civic', color: 'text-blue-400' },
    { key: 'YELLOW', icon: '💰', label: 'Trade', color: 'text-yellow-500' },
    { key: 'RED', icon: '⚔️', label: 'Mil', color: 'text-red-500' },
    { key: 'GREEN', icon: '🔬', label: 'Sci', color: 'text-emerald-500' },
    { key: 'PURPLE', icon: '👥', label: 'Guild', color: 'text-purple-500' },
];

export function ResourcePanel({
    coins,
    militaryPower,
    scienceCompass,
    scienceGear,
    scienceTablet,
    builtCardColors,
}: ResourcePanelProps) {
    const scienceValues = [scienceCompass, scienceGear, scienceTablet];
    const scienceSets = Math.min(...scienceValues);
    const scienceTotal =
        scienceCompass ** 2 + scienceGear ** 2 + scienceTablet ** 2 + scienceSets * 7;

    return (
        <motion.div
            className="glass-panel p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Main resources */}
            <div className="flex items-center gap-4 mb-2">
                {/* Coins */}
                <div className="flex items-center gap-1.5">
                    <span className="text-lg">💰</span>
                    <motion.span
                        className="text-yellow-400 font-bold text-lg font-mono"
                        key={coins}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                    >
                        {coins}
                    </motion.span>
                </div>

                <div className="w-px h-6 bg-white/10" />

                {/* Military */}
                <div className="flex items-center gap-1.5">
                    <span className="text-lg">⚔️</span>
                    <motion.span
                        className="text-red-400 font-bold text-lg font-mono"
                        key={militaryPower}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                    >
                        {militaryPower}
                    </motion.span>
                </div>

                <div className="w-px h-6 bg-white/10" />

                {/* Science */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <span className="text-sm">🧭</span>
                        <span className="text-emerald-400 text-sm font-mono">{scienceCompass}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-sm">⚙️</span>
                        <span className="text-emerald-400 text-sm font-mono">{scienceGear}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-sm">📜</span>
                        <span className="text-emerald-400 text-sm font-mono">{scienceTablet}</span>
                    </div>
                    {scienceTotal > 0 && (
                        <span className="text-emerald-300/60 text-[10px]">
                            ={scienceTotal}VP
                        </span>
                    )}
                </div>
            </div>

            {/* Built card counts */}
            <div className="flex items-center gap-2 flex-wrap">
                {CARD_COLORS.map((cc) => {
                    const count = builtCardColors[cc.key] ?? 0;
                    if (count === 0) return null;
                    return (
                        <div
                            key={cc.key}
                            className="flex items-center gap-0.5"
                            title={`${count} ${cc.label} cards`}
                        >
                            <span className="text-xs">{cc.icon}</span>
                            <span className={`text-xs font-mono ${cc.color}`}>{count}</span>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
