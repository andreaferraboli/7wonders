import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
// Wonder image mapping: wonderId + side → image file
const WONDER_IMAGE_MAP = {
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
function getWonderImageUrl(wonderId, side) {
    const key = `${wonderId}_${side}`;
    const filename = WONDER_IMAGE_MAP[key];
    if (!filename)
        return undefined;
    const match = Object.keys(wonderImages).find(k => k.includes(filename));
    return match ? wonderImages[match] : undefined;
}
const WONDER_NAMES = {
    ALEXANDRIA: 'Alessandria',
    BABYLON: 'Babilonia',
    EPHESUS: 'Efeso',
    GIZA: 'Giza',
    HALIKARNASSUS: 'Alicarnasso',
    OLYMPIA: 'Olimpia',
    RHODES: 'Rodi',
};
const WONDER_DETAILS = {
    ALEXANDRIA: { totalStages: { DAY: 3, NIGHT: 3 } },
    BABYLON: { totalStages: { DAY: 3, NIGHT: 2 } },
    EPHESUS: { totalStages: { DAY: 3, NIGHT: 3 } },
    GIZA: { totalStages: { DAY: 3, NIGHT: 4 } },
    HALIKARNASSUS: { totalStages: { DAY: 3, NIGHT: 3 } },
    OLYMPIA: { totalStages: { DAY: 3, NIGHT: 3 } },
    RHODES: { totalStages: { DAY: 3, NIGHT: 2 } },
};
export function WonderBoard({ wonderId, wonderSide, stagesBuilt, startingResource }) {
    const details = WONDER_DETAILS[wonderId];
    const totalStages = details?.totalStages[wonderSide] ?? 3;
    const imageUrl = getWonderImageUrl(wonderId, wonderSide);
    const displayName = WONDER_NAMES[wonderId] ?? wonderId;
    return (_jsxs(motion.div, { id: `wonder-${wonderId}`, className: "relative rounded-xl overflow-hidden", style: {
            border: '2px solid rgba(212, 165, 116, 0.4)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }, initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, children: [_jsxs("div", { className: "relative", style: { height: '180px' }, children: [imageUrl ? (_jsx("img", { src: imageUrl, alt: displayName, className: "w-full h-full object-cover", draggable: false })) : (_jsx("div", { className: "w-full h-full bg-gradient-to-br from-amber-900 to-stone-800 flex items-center justify-center", children: _jsx("span", { className: "text-4xl", children: "\uD83C\uDFDB\uFE0F" }) })), _jsx("div", { className: "absolute bottom-0 left-0 right-0", style: {
                            height: '80px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                        } }), _jsxs("div", { className: "absolute bottom-2 left-3 right-3", children: [_jsx("h2", { className: "text-lg font-bold drop-shadow-lg", style: {
                                    fontFamily: 'Cinzel, Georgia, serif',
                                    color: '#D4A574',
                                    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                                }, children: displayName }), _jsxs("p", { className: "text-[10px] text-white/60", children: ["Lato ", wonderSide === 'DAY' ? '☀️ A' : '🌙 B', startingResource && ` • ${startingResource.toLowerCase()}`] })] }), stagesBuilt === totalStages && (_jsx(motion.div, { className: "absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold", style: {
                            background: 'linear-gradient(135deg, #16a34a, #15803d)',
                            color: '#fff',
                            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.5)',
                        }, initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: 'spring', stiffness: 300, delay: 0.3 }, children: "\uD83C\uDFC6 Completata!" }))] }), _jsxs("div", { className: "p-3", style: {
                    background: 'linear-gradient(to bottom, rgba(26,26,46,0.95), rgba(15,15,35,0.98))',
                }, children: [_jsx("div", { className: "flex gap-1.5", children: Array.from({ length: totalStages }).map((_, index) => {
                            const isBuilt = index < stagesBuilt;
                            const isNext = index === stagesBuilt;
                            return (_jsx(motion.div, { className: "flex-1 h-8 rounded-md flex items-center justify-center transition-all", style: {
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
                                }, initial: false, animate: isBuilt ? { scale: [1, 1.05, 1] } : {}, transition: { duration: 0.3 }, whileHover: isNext ? { scale: 1.03, background: 'rgba(212, 165, 116, 0.1)' } : {}, children: isBuilt ? (_jsx("span", { style: { color: '#D4A574', fontWeight: 'bold', fontSize: '14px' }, children: "\u2713" })) : (_jsx("span", { style: { color: 'rgba(255,255,255,0.25)', fontSize: '11px' }, children: index + 1 })) }, index));
                        }) }), _jsx("div", { className: "mt-2 h-1 bg-white/5 rounded-full overflow-hidden", children: _jsx(motion.div, { className: "h-full rounded-full", style: {
                                background: 'linear-gradient(to right, #D4A574, #CD7F32)',
                            }, initial: { width: 0 }, animate: { width: `${(stagesBuilt / totalStages) * 100}%` }, transition: { duration: 0.5, ease: 'easeOut' } }) })] })] }));
}
