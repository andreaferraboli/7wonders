import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
// Import all card images dynamically
const cardImages = import.meta.glob('@/assets/cards/*.png', { eager: true, as: 'url' });
function getCardImageUrl(cardId) {
    // Remove duplicate suffixes (e.g. "taverna" appears multiple times)
    const baseName = cardId.replace(/_\d+$/, '');
    // Try exact match first
    const exactKey = Object.keys(cardImages).find(k => k.includes(`/${cardId}.png`));
    if (exactKey)
        return cardImages[exactKey];
    // Try base name match
    const baseKey = Object.keys(cardImages).find(k => k.includes(`/${baseName}.png`));
    if (baseKey)
        return cardImages[baseKey];
    return undefined;
}
// Determine card color from Italian name
function getCardColor(cardId) {
    // Brown - raw materials
    const brown = ['cantiere_di_abbattimento', 'cava_pietra', 'bacino_argilla', 'filone_minerario', 'vivaio', 'scavi', 'fossa_argilla', 'deposito_legname', 'giacimento', 'miniera', 'segheria', 'tagliapietre', 'mattonificio', 'fonderia'];
    // Grey - manufactured goods
    const grey = ['vetreria', 'stamperia', 'filanda'];
    // Blue - civilian
    const blue = ['pozzo', 'bagni', 'altare', 'teatro', 'statua', 'acquedotto', 'tempio', 'tribunale', 'pantheon', 'giardini', 'municipio', 'palazzo', 'senato'];
    // Yellow - commercial
    const yellow = ['taverna', 'mercato', 'stazione_commerciale_ovest', 'stazione_commerciale_est', 'caravanserraglio', 'foro', 'vigneto', 'bazar', 'faro', 'porto', 'camera_di_commercio', 'arena'];
    // Red - military
    const red = ['palizzata', 'caserma', 'torre_di_guardia', 'scuderie', 'campo_di_tiro_con_l_arco', 'mura', 'zona_di_addestramento', 'arsenale', 'fortificazioni', 'opificio_d_assedio', 'circo', 'palestra_gladatoria', 'castra'];
    // Green - science
    const green = ['farmacia', 'opificio', 'scrittorio', 'ambulatorio', 'laboratorio', 'biblioteca', 'scuola', 'loggia', 'osservatorio', 'accademia', 'universita', 'studio'];
    // Purple - guilds
    const purple = ['gilda_dei_lavoratori', 'gilda_degli_artigiani', 'gilda_dei_mercanti', 'gilda_dei_filosofi', 'gilda_delle_spie', 'gilda_degli_arredatori', 'gilda_degli_armatori', 'gilda_degli_scienziati', 'gilda_dei_magistrati', 'gilda_dei_costruttori'];
    if (brown.includes(cardId))
        return '#8B4513';
    if (grey.includes(cardId))
        return '#6B7280';
    if (blue.includes(cardId))
        return '#2563EB';
    if (yellow.includes(cardId))
        return '#F59E0B';
    if (red.includes(cardId))
        return '#DC2626';
    if (green.includes(cardId))
        return '#16A34A';
    if (purple.includes(cardId))
        return '#7C3AED';
    return '#374151';
}
function getCardBorderColor(cardId) {
    const color = getCardColor(cardId);
    switch (color) {
        case '#8B4513': return '#D4A574';
        case '#6B7280': return '#9CA3AF';
        case '#2563EB': return '#60A5FA';
        case '#F59E0B': return '#FCD34D';
        case '#DC2626': return '#F87171';
        case '#16A34A': return '#34D399';
        case '#7C3AED': return '#A78BFA';
        default: return '#6B7280';
    }
}
export function Card({ cardId, isSelected = false, isDisabled = false, onClick, onHover, onHoverEnd, compact = false, }) {
    const imageUrl = getCardImageUrl(cardId);
    const borderColor = getCardBorderColor(cardId);
    if (compact) {
        // Small built-card representation
        return (_jsx("div", { className: "w-6 h-8 rounded overflow-hidden border cursor-default hover:scale-125 hover:z-10 transition-transform", style: { borderColor: borderColor, borderWidth: '1.5px' }, title: cardId.replace(/_/g, ' '), children: imageUrl ? (_jsx("img", { src: imageUrl, alt: cardId, className: "w-full h-full object-cover object-top" })) : (_jsx("div", { className: "w-full h-full", style: { backgroundColor: getCardColor(cardId) } })) }));
    }
    return (_jsxs(motion.div, { id: `card-${cardId}`, className: `
                relative rounded-xl cursor-pointer select-none overflow-hidden
                ${isSelected ? 'ring-3 ring-yellow-400 ring-offset-2 ring-offset-slate-900' : ''}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                transition-shadow duration-200
            `, style: {
            width: '120px',
            height: '185px',
            border: `2px solid ${isSelected ? '#FFD700' : borderColor}`,
            boxShadow: isSelected
                ? `0 0 20px rgba(255, 215, 0, 0.5), inset 0 0 10px rgba(255, 215, 0, 0.1)`
                : `0 4px 12px rgba(0,0,0,0.4)`,
        }, whileHover: !isDisabled ? { scale: 1.1, y: -15, zIndex: 20 } : {}, whileTap: !isDisabled ? { scale: 0.96 } : {}, onClick: !isDisabled ? onClick : undefined, onHoverStart: onHover, onHoverEnd: onHoverEnd, layout: true, layoutId: cardId, children: [imageUrl ? (_jsx("img", { src: imageUrl, alt: cardId.replace(/_/g, ' '), className: "w-full h-full object-cover", draggable: false })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center p-2", style: { backgroundColor: getCardColor(cardId) }, children: _jsx("span", { className: "text-white text-xs text-center font-semibold drop-shadow-md leading-tight", children: cardId.replace(/_/g, ' ') }) })), isSelected && (_jsx(motion.div, { className: "absolute inset-0 pointer-events-none", style: {
                    border: '3px solid #FFD700',
                    borderRadius: '0.75rem',
                    backgroundColor: 'rgba(255, 215, 0, 0.08)',
                }, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }))] }));
}
export { getCardColor };
