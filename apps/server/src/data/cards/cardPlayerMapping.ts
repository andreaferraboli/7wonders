/**
 * Card-to-player mapping from 7wonders_cards.json.
 * 
 * Each card has a list of player counts. In a game with N players,
 * the number of copies of that card = number of entries <= N.
 * Example: players [3,5] in a 6-player game → 2 copies (both 3 and 5 are ≤ 6)
 *          players [3,7] in a 6-player game → 1 copy  (only 3 is ≤ 6)
 */

export interface CardPlayerEntry {
    name: string;        // Italian name (matches image file name)
    players: number[];   // Player count thresholds
    age: number;         // Age/epoch 1, 2, or 3
}

// Maps Italian names to server card IDs
export const ITALIAN_TO_ID: Record<string, string[]> = {
    // Age 1 - Brown (raw materials)
    "cantiere_di_abbattimento": ["LUMBER_YARD", "LUMBER_YARD_4P"],
    "cava_pietra": ["STONE_PIT", "STONE_PIT_5P"],
    "bacino_argilla": ["CLAY_POOL", "CLAY_POOL_5P"],
    "filone_minerario": ["ORE_VEIN", "ORE_VEIN_4P"],
    "vivaio": ["TREE_FARM"],
    "scavi": ["EXCAVATION"],
    "fossa_argilla": ["CLAY_PIT"],
    "deposito_legname": ["TIMBER_YARD"],
    "giacimento": ["FOREST_CAVE"],
    "miniera": ["MINE"],
    // Age 1 - Grey (manufactured goods)
    "vetreria": ["GLASSWORKS_1", "GLASSWORKS_1_6P", "GLASSWORKS_2", "GLASSWORKS_2_5P"],
    "stamperia": ["PRESS_1", "PRESS_1_6P", "PRESS_2", "PRESS_2_5P"],
    "filanda": ["LOOM_1", "LOOM_1_6P", "LOOM_2", "LOOM_2_5P"],
    // Age 1 - Blue (civilian)
    "pozzo": ["PAWNSHOP", "PAWNSHOP_7P"],
    "bagni": ["BATHS", "BATHS_7P"],
    "altare": ["ALTAR", "ALTAR_5P"],
    "teatro": ["THEATER", "THEATER_6P"],
    // Age 1 - Yellow (commercial)
    "taverna": ["TAVERN", "TAVERN_5P", "TAVERN_7P"],
    "mercato": ["EAST_TRADING_POST", "EAST_TRADING_POST_7P"],  // Re-used
    "stazione_commerciale_ovest": ["WEST_TRADING_POST", "WEST_TRADING_POST_7P"],
    "stazione_commerciale_est": ["EAST_TRADING_POST", "EAST_TRADING_POST_7P"],
    // Age 1 - Red (military)
    "palizzata": ["STOCKADE", "STOCKADE_7P"],
    "caserma": ["BARRACKS", "BARRACKS_5P"],
    "torre_di_guardia": ["GUARD_TOWER", "GUARD_TOWER_4P"],
    // Age 1 - Green (science)
    "farmacia": ["APOTHECARY", "APOTHECARY_5P"],
    "opificio": ["WORKSHOP", "WORKSHOP_7P"],
    "scrittorio": ["SCRIPTORIUM", "SCRIPTORIUM_4P"],
    // Age 2 - Brown
    "segheria": ["SAWMILL", "SAWMILL_4P"],
    "tagliapietre": ["QUARRY", "QUARRY_4P"],
    "mattonificio": ["BRICKYARD", "BRICKYARD_4P"],
    "fonderia": ["FOUNDRY", "FOUNDRY_4P"],
    // Age 2 - Blue
    "statua": ["STATUE", "STATUE_7P"],
    "acquedotto": ["AQUEDUCT", "AQUEDUCT_7P"],
    "tempio": ["TEMPLE", "TEMPLE_6P"],
    "tribunale": ["COURTHOUSE", "COURTHOUSE_5P"],
    // Age 2 - Yellow
    "caravanserraglio": ["CARAVANSERY", "CARAVANSERY_5P", "CARAVANSERY_6P"],
    "foro": ["FORUM", "FORUM_6P", "FORUM_7P"],
    "vigneto": ["VINEYARD", "VINEYARD_6P"],
    "bazar": ["BAZAR", "BAZAR_7P"],
    // Age 2 - Red
    "scuderie": ["STABLES", "STABLES_5P"],
    "campo_di_tiro_con_l_arco": ["ARCHERY_RANGE", "ARCHERY_RANGE_6P"],
    "mura": ["WALLS", "WALLS_7P"],
    "zona_di_addestramento": ["TRAINING_GROUND", "TRAINING_GROUND_6P", "TRAINING_GROUND_7P"],
    // Age 2 - Green
    "ambulatorio": ["DISPENSARY", "DISPENSARY_4P"],
    "laboratorio": ["LABORATORY", "LABORATORY_5P"],
    "biblioteca": ["LIBRARY", "LIBRARY_6P"],
    "scuola": ["SCHOOL", "SCHOOL_7P"],
    // Age 3 - Blue
    "pantheon": ["PANTHEON", "PANTHEON_6P"],
    "giardini": ["GARDENS", "GARDENS_4P"],
    "municipio": ["TOWN_HALL", "TOWN_HALL_6P"],
    "palazzo": ["PALACE", "PALACE_7P"],
    "senato": ["SENATE", "SENATE_5P"],
    // Age 3 - Yellow
    "faro": ["LIGHTHOUSE", "LIGHTHOUSE_6P"],
    "porto": ["HAVEN", "HAVEN_4P"],
    "camera_di_commercio": ["CHAMBER_OF_COMMERCE", "CHAMBER_OF_COMMERCE_6P"],
    "arena": ["ARENA", "ARENA_5P"],
    // Age 3 - Red
    "arsenale": ["ARSENAL", "ARSENAL_5P"],
    "fortificazioni": ["FORTIFICATIONS", "FORTIFICATIONS_7P"],
    "opificio_d_assedio": ["SIEGE_WORKSHOP", "SIEGE_WORKSHOP_5P"],
    "circo": ["CIRCUS", "CIRCUS_6P"],
    "palestra_gladatoria": ["LUDUS", "LUDUS_7P"],
    "castra": ["CASTRA", "CASTRA_7P"],
    // Age 3 - Green
    "loggia": ["LODGE", "LODGE_6P"],
    "osservatorio": ["OBSERVATORY", "OBSERVATORY_7P"],
    "accademia": ["ACADEMY", "ACADEMY_7P"],
    "universita": ["UNIVERSITY", "UNIVERSITY_4P"],
    "studio": ["STUDY", "STUDY_5P"],
    // Age 3 - Purple (guilds - always 1 copy for 3+ players)
    "gilda_dei_lavoratori": ["WORKERS_GUILD"],
    "gilda_degli_artigiani": ["CRAFTSMENS_GUILD"],
    "gilda_dei_mercanti": ["TRADERS_GUILD"],
    "gilda_dei_filosofi": ["PHILOSOPHERS_GUILD"],
    "gilda_delle_spie": ["SPIES_GUILD"],
    "gilda_degli_arredatori": ["STRATEGISTS_GUILD"],
    "gilda_degli_armatori": ["SHIPOWNERS_GUILD"],
    "gilda_degli_scienziati": ["SCIENTISTS_GUILD"],
    "gilda_dei_magistrati": ["MAGISTRATES_GUILD"],
    "gilda_dei_costruttori": ["BUILDERS_GUILD"],
};

// The card list from 7wonders_cards.json
export const CARD_PLAYER_MAP: CardPlayerEntry[] = [
    // Age 1
    { name: "cantiere_di_abbattimento", players: [3, 4], age: 1 },
    { name: "cava_pietra", players: [3, 5], age: 1 },
    { name: "bacino_argilla", players: [3, 5], age: 1 },
    { name: "filone_minerario", players: [3, 4], age: 1 },
    { name: "vivaio", players: [6], age: 1 },
    { name: "scavi", players: [4], age: 1 },
    { name: "fossa_argilla", players: [3], age: 1 },
    { name: "deposito_legname", players: [3], age: 1 },
    { name: "giacimento", players: [5], age: 1 },
    { name: "miniera", players: [6], age: 1 },
    { name: "vetreria", players: [3, 6], age: 1 },
    { name: "stamperia", players: [3, 6], age: 1 },
    { name: "filanda", players: [3, 6], age: 1 },
    { name: "pozzo", players: [4, 7], age: 1 },
    { name: "bagni", players: [3, 7], age: 1 },
    { name: "altare", players: [3, 5], age: 1 },
    { name: "teatro", players: [3, 6], age: 1 },
    { name: "taverna", players: [4, 5, 7], age: 1 },
    { name: "mercato", players: [3, 6], age: 1 },
    { name: "stazione_commerciale_ovest", players: [3, 7], age: 1 },
    { name: "stazione_commerciale_est", players: [3, 7], age: 1 },
    { name: "palizzata", players: [3, 7], age: 1 },
    { name: "caserma", players: [3, 5], age: 1 },
    { name: "torre_di_guardia", players: [3, 4], age: 1 },
    { name: "farmacia", players: [3, 5], age: 1 },
    { name: "opificio", players: [3, 7], age: 1 },
    { name: "scrittorio", players: [3, 4], age: 1 },
    // Age 2
    { name: "segheria", players: [3, 4], age: 2 },
    { name: "tagliapietre", players: [3, 4], age: 2 },
    { name: "mattonificio", players: [3, 4], age: 2 },
    { name: "fonderia", players: [3, 4], age: 2 },
    { name: "vetreria", players: [3, 5], age: 2 },
    { name: "stamperia", players: [3, 5], age: 2 },
    { name: "filanda", players: [3, 5], age: 2 },
    { name: "statua", players: [3, 7], age: 2 },
    { name: "acquedotto", players: [3, 7], age: 2 },
    { name: "tempio", players: [3, 6], age: 2 },
    { name: "tribunale", players: [3, 5], age: 2 },
    { name: "caravanserraglio", players: [3, 5, 6], age: 2 },
    { name: "foro", players: [3, 6, 7], age: 2 },
    { name: "vigneto", players: [3, 6], age: 2 },
    { name: "bazar", players: [4, 7], age: 2 },
    { name: "scuderie", players: [3, 5], age: 2 },
    { name: "campo_di_tiro_con_l_arco", players: [3, 6], age: 2 },
    { name: "mura", players: [3, 7], age: 2 },
    { name: "zona_di_addestramento", players: [4, 6, 7], age: 2 },
    { name: "ambulatorio", players: [3, 4], age: 2 },
    { name: "laboratorio", players: [3, 5], age: 2 },
    { name: "biblioteca", players: [3, 6], age: 2 },
    { name: "scuola", players: [3, 7], age: 2 },
    // Age 3
    { name: "pantheon", players: [3, 6], age: 3 },
    { name: "giardini", players: [3, 4], age: 3 },
    { name: "municipio", players: [3, 6], age: 3 },
    { name: "palazzo", players: [3, 7], age: 3 },
    { name: "senato", players: [3, 5], age: 3 },
    { name: "faro", players: [3, 6], age: 3 },
    { name: "porto", players: [3, 4], age: 3 },
    { name: "camera_di_commercio", players: [4, 6], age: 3 },
    { name: "arena", players: [3, 5], age: 3 },
    { name: "arsenale", players: [3, 5], age: 3 },
    { name: "fortificazioni", players: [3, 7], age: 3 },
    { name: "opificio_d_assedio", players: [3, 5], age: 3 },
    { name: "circo", players: [4, 6], age: 3 },
    { name: "loggia", players: [3, 6], age: 3 },
    { name: "osservatorio", players: [3, 7], age: 3 },
    { name: "accademia", players: [3, 7], age: 3 },
    { name: "universita", players: [3, 4], age: 3 },
    { name: "studio", players: [3, 5], age: 3 },
    { name: "gilda_dei_lavoratori", players: [3], age: 3 },
    { name: "gilda_degli_artigiani", players: [3], age: 3 },
    { name: "gilda_dei_mercanti", players: [3], age: 3 },
    { name: "gilda_dei_filosofi", players: [3], age: 3 },
    { name: "gilda_delle_spie", players: [3], age: 3 },
    { name: "gilda_degli_arredatori", players: [3], age: 3 },
    { name: "gilda_degli_armatori", players: [3], age: 3 },
    { name: "gilda_degli_scienziati", players: [3], age: 3 },
    { name: "gilda_dei_magistrati", players: [3], age: 3 },
    { name: "gilda_dei_costruttori", players: [3], age: 3 },
    { name: "palestra_gladatoria", players: [5, 7], age: 3 },
    { name: "castra", players: [4, 7], age: 3 },
];

/**
 * Get the cards for a given age and player count.
 * Returns an array of Italian card names (which matches the image filenames).
 * Each card may appear multiple times based on the player count logic.
 */
export function getCardsForAgeAndPlayers(age: number, playerCount: number): string[] {
    const cards: string[] = [];
    
    for (const entry of CARD_PLAYER_MAP) {
        if (entry.age !== age) continue;
        
        // Count how many player thresholds are <= playerCount
        const copies = entry.players.filter(p => p <= playerCount).length;
        
        for (let i = 0; i < copies; i++) {
            cards.push(entry.name);
        }
    }
    
    return cards;
}

/**
 * For age 3, guilds need special handling: pick playerCount + 2 guilds randomly
 */
export function getGuildCardNames(): string[] {
    return CARD_PLAYER_MAP
        .filter(entry => entry.age === 3 && entry.name.startsWith("gilda_"))
        .map(entry => entry.name);
}

export function getNonGuildAge3Cards(playerCount: number): string[] {
    const cards: string[] = [];
    
    for (const entry of CARD_PLAYER_MAP) {
        if (entry.age !== 3) continue;
        if (entry.name.startsWith("gilda_")) continue;
        
        const copies = entry.players.filter(p => p <= playerCount).length;
        for (let i = 0; i < copies; i++) {
            cards.push(entry.name);
        }
    }
    
    return cards;
}
