/**
 * Leaderboard Scoring System
 * Implements Elo-style rating adjustments based on ride performance
 */

// Payoff matrix multipliers based on rider rank vs horse tier
export const PAYOFF_MATRIX = {
    // Format: [riderRank][horseTier] = multiplier
    beginner: {
        tier1: 1.5,  // Beginner on easy horse - good practice
        tier2: 0.8,  // Beginner on difficult horse - risky
    },
    intermediate: {
        tier1: 1.2,  // Intermediate on easy horse - moderate reward
        tier2: 1.3,  // Intermediate on difficult horse - good challenge
    },
    advanced: {
        tier1: 0.9,  // Advanced on easy horse - low reward
        tier2: 1.4,  // Advanced on difficult horse - optimal pairing
    },
    elite: {
        tier1: 0.7,  // Elite on easy horse - minimal reward
        tier2: 1.5,  // Elite on difficult horse - maximum challenge
    },
};

// K-factor determines how much ratings change per ride
const K_FACTOR = 32;

export interface RideScore {
    riderId: string;
    horseId: string;
    performance: number; // 0-10 scale
    difficulty: number; // 0-10 scale
    riderRank: string;
    horseTier: string;
    riderPoints: number;
    horsePoints: number;
}

export interface ScoreResult {
    newRiderPoints: number;
    newHorsePoints: number;
    riderPointsChange: number;
    horsePointsChange: number;
}

/**
 * Calculate expected score based on rating difference
 * Uses standard Elo formula
 */
function expectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Normalize performance to 0-1 scale
 */
function normalizePerformance(performance: number, difficulty: number): number {
    // Adjust performance based on difficulty
    const adjustedPerformance = (performance * difficulty) / 10;
    return Math.max(0, Math.min(1, adjustedPerformance / 10));
}

/**
 * Get payoff multiplier from matrix
 */
function getPayoffMultiplier(riderRank: string, horseTier: string): number {
    const normalizedRank = riderRank.toLowerCase();
    const normalizedTier = horseTier.toLowerCase().replace(/\s+/g, '');

    const matrix = PAYOFF_MATRIX as any;
    return matrix[normalizedRank]?.[normalizedTier] || 1.0;
}

/**
 * Calculate new ratings after a ride
 * @param score - Ride performance data
 * @returns New ratings for both rider and horse
 */
export function calculateRatings(score: RideScore): ScoreResult {
    const { riderPoints, horsePoints, performance, difficulty, riderRank, horseTier } = score;

    // Calculate expected scores
    const expectedRider = expectedScore(riderPoints, horsePoints);
    const expectedHorse = expectedScore(horsePoints, riderPoints);

    // Normalize actual performance (0-1 scale)
    const actualScore = normalizePerformance(performance, difficulty);

    // Get payoff multiplier
    const multiplier = getPayoffMultiplier(riderRank, horseTier);

    // Calculate rating changes based on Elo formula with payoff adjustment
    const riderChange = K_FACTOR * multiplier * (actualScore - expectedRider);
    const horseChange = K_FACTOR * multiplier * ((1 - actualScore) - expectedHorse);

    // Calculate new ratings (ensure they don't go below 0)
    const newRiderPoints = Math.max(0, Math.round(riderPoints + riderChange));
    const newHorsePoints = Math.max(0, Math.round(horsePoints + horseChange));

    return {
        newRiderPoints,
        newHorsePoints,
        riderPointsChange: newRiderPoints - riderPoints,
        horsePointsChange: newHorsePoints - horsePoints,
    };
}

/**
 * Determine rider rank based on points
 */
export function getRiderRank(points: number): string {
    if (points >= 1800) return "Elite";
    if (points >= 1600) return "Advanced";
    if (points >= 1400) return "Intermediate";
    return "Beginner";
}

/**
 * Determine horse tier based on points
 */
export function getHorseTier(points: number): string {
    if (points >= 1600) return "Tier 2";
    return "Tier 1";
}
