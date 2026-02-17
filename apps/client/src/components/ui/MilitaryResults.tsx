import { motion, AnimatePresence } from 'framer-motion';

interface MilitaryResult {
    opponentName: string;
    yourPower: number;
    theirPower: number;
    result: 'victory' | 'defeat' | 'draw';
    token: number;
}

interface MilitaryResultsProps {
    results: MilitaryResult[];
    epoch: number;
    visible: boolean;
    onClose: () => void;
}

export function MilitaryResults({ results, epoch, visible, onClose }: MilitaryResultsProps) {
    return (
        <AnimatePresence>
            {visible && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        id="military-results-panel"
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass-panel p-8 w-full max-w-md"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    >
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-2">⚔️</div>
                            <h2 className="font-display text-2xl font-bold text-red-400">
                                Military Conflicts
                            </h2>
                            <p className="text-white/40 text-xs mt-1">End of Epoch {epoch}</p>
                        </div>

                        {/* Results */}
                        <div className="space-y-3">
                            {results.map((result, index) => (
                                <motion.div
                                    key={index}
                                    className={`
                    glass-panel p-4 
                    ${result.result === 'victory' ? 'border-emerald-500/30' : ''}
                    ${result.result === 'defeat' ? 'border-red-500/30' : ''}
                    ${result.result === 'draw' ? 'border-white/10' : ''}
                  `}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + index * 0.15 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {/* Result icon */}
                                            <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-lg
                        ${result.result === 'victory' ? 'bg-emerald-500/20' : ''}
                        ${result.result === 'defeat' ? 'bg-red-500/20' : ''}
                        ${result.result === 'draw' ? 'bg-white/10' : ''}
                      `}>
                                                {result.result === 'victory' && '🏆'}
                                                {result.result === 'defeat' && '💀'}
                                                {result.result === 'draw' && '🤝'}
                                            </div>

                                            <div>
                                                <div className="text-sm font-medium">
                                                    vs {result.opponentName}
                                                </div>
                                                <div className="text-xs text-white/40">
                                                    {result.yourPower} ⚔️ vs {result.theirPower} ⚔️
                                                </div>
                                            </div>
                                        </div>

                                        {/* Token */}
                                        <div className={`
                      text-lg font-bold
                      ${result.token > 0 ? 'text-emerald-400' : ''}
                      ${result.token < 0 ? 'text-red-400' : ''}
                      ${result.token === 0 ? 'text-white/40' : ''}
                    `}>
                                            {result.token > 0 ? `+${result.token}` : result.token}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Summary */}
                        <motion.div
                            className="mt-4 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 + results.length * 0.15 }}
                        >
                            <div className="text-xs text-white/30 mb-4">
                                Total: {results.reduce((sum, r) => sum + r.token, 0)} military points
                            </div>

                            <button
                                id="btn-dismiss-military"
                                className="btn-primary px-6 text-center"
                                onClick={onClose}
                            >
                                Continue
                            </button>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
