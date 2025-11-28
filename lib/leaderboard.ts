/**
 * Leaderboard Scoring System - Payoff Matrix Implementation
 * Implements fair, cheat-proof leaderboard based on admin-locked horse tiers
 * 
 * Tiers:
 * - Beginner: 0-1300 points
 * - Intermediate: 1301-1700 points
 * - Advanced: 1701+ points
 */

export type RiderTier = "Beginner" | "Intermediate" | "Advanced";
export type HorseAdminTier = "Beginner" | "Intermediate" | "Advanced";

export interface RideScore {
    riderId: string;
    horseId: string;
    rps: number; // Rider Performance Score (1-10) from stable owner
    riderRankPoints: number; // Current rider's rank points
    horseAdminTier: HorseAdminTier; // Admin-locked horse tier
}

export interface ScoreResult {
    riderPointsChange: number;
    newRiderPoints: number;
    riderTier: RiderTier;
}

/**
 * Calculate rider tier from rank points
 */
export function getRiderTier(rankPoints: number): RiderTier {
    if (rankPoints >= 1701) return "Advanced";
    if (rankPoints >= 1301) return "Intermediate";
    return "Beginner";
}

/**
 * Calculate points change using Payoff Matrix
 * Based on rider tier, horse admin tier, and RPS (Pass/Fail)
 */
export function calculatePointsChange(
    riderTier: RiderTier,
    horseAdminTier: HorseAdminTier,
    rps: number
): number {
    // Determine Pass (rps >= 7) or Fail (rps <= 6)
    const isPass = rps >= 7;

    let pointsChange = 0;

    // --- Rider is BEGINNER (0-1300) ---
    if (riderTier === "Beginner") {
        if (horseAdminTier === "Beginner") {
            pointsChange = isPass ? +15 : -10; // Pass/Fail
        } else if (horseAdminTier === "Intermediate") {
            pointsChange = isPass ? +30 : -5;
        } else if (horseAdminTier === "Advanced") {
            pointsChange = isPass ? +70 : 0; // No penalty for failing advanced horse
        }
    }
    // --- Rider is INTERMEDIATE (1301-1700) ---
    else if (riderTier === "Intermediate") {
        if (horseAdminTier === "Beginner") {
            // Penalty for riding down
            pointsChange = isPass ? -20 : -40; // Lose points even on a "Pass"
        } else if (horseAdminTier === "Intermediate") {
            pointsChange = isPass ? +20 : -15; // Pass/Fail
        } else if (horseAdminTier === "Advanced") {
            pointsChange = isPass ? +50 : -10; // Upset
        }
    }
    // --- Rider is ADVANCED (1701+) ---
    else if (riderTier === "Advanced") {
        if (horseAdminTier === "Beginner") {
            // Huge penalty for riding down
            pointsChange = isPass ? -50 : -80;
        } else if (horseAdminTier === "Intermediate") {
            // Penalty for riding down
            pointsChange = isPass ? -10 : -30;
        } else if (horseAdminTier === "Advanced") {
            pointsChange = isPass ? +25 : -20; // Pass/Fail
        }
    }

    return pointsChange;
}

/**
 * Calculate new ratings after a ride
 * This is the main function that implements the Payoff Matrix
 */
export function calculateRatings(score: RideScore): ScoreResult {
    const { riderRankPoints, horseAdminTier, rps } = score;

    // Determine rider's current tier
    const riderTier = getRiderTier(riderRankPoints);

    // Calculate points change using payoff matrix
    const pointsChange = calculatePointsChange(riderTier, horseAdminTier, rps);

    // Calculate new rider points (ensure it doesn't go below 0)
    const newRiderPoints = Math.max(0, riderRankPoints + pointsChange);

    // Determine new tier (in case it changed)
    const newRiderTier = getRiderTier(newRiderPoints);

    return {
        riderPointsChange: pointsChange,
        newRiderPoints,
        riderTier: newRiderTier,
    };
}
