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
 * Calculate points change using Fair Payoff Matrix
 * Based on rider tier, horse admin tier, and RPS (Fail/Good/Excellent)
 * 
 * New 3-Tier Scoring:
 * - Fail: 1-6 RPS
 * - Good: 7-8 RPS
 * - Excellent: 9-10 RPS
 */
export function calculatePointsChange(
    riderTier: RiderTier,
    horseAdminTier: HorseAdminTier,
    rps: number
): number {
    // Determine performance tier
    let performanceTier: "Fail" | "Good" | "Excellent";
    if (rps >= 9) {
        performanceTier = "Excellent";
    } else if (rps >= 7) {
        performanceTier = "Good";
    } else {
        performanceTier = "Fail";
    }

    let pointsChange = 0;

    // --- NEW FAIR MATRIX ---
    // Principle: Higher skill always rewards more than penalties
    // Advanced riders get small rewards for easy horses (not penalties)

    // --- Rider is BEGINNER (0-1300) ---
    if (riderTier === "Beginner") {
        if (horseAdminTier === "Beginner") {
            if (performanceTier === "Excellent") pointsChange = 20;
            else if (performanceTier === "Good") pointsChange = 10;
            else pointsChange = -5;
        } else if (horseAdminTier === "Intermediate") {
            if (performanceTier === "Excellent") pointsChange = 40;
            else if (performanceTier === "Good") pointsChange = 20;
            else pointsChange = -5;
        } else if (horseAdminTier === "Advanced") {
            if (performanceTier === "Excellent") pointsChange = 80;
            else if (performanceTier === "Good") pointsChange = 40;
            else pointsChange = 0; // No penalty for failing advanced horse
        }
    }
    // --- Rider is INTERMEDIATE (1301-1700) ---
    else if (riderTier === "Intermediate") {
        if (horseAdminTier === "Beginner") {
            // Small rewards for easy horses (not penalties)
            if (performanceTier === "Excellent") pointsChange = 10;
            else if (performanceTier === "Good") pointsChange = 5;
            else pointsChange = -10;
        } else if (horseAdminTier === "Intermediate") {
            if (performanceTier === "Excellent") pointsChange = 30;
            else if (performanceTier === "Good") pointsChange = 15;
            else pointsChange = -10;
        } else if (horseAdminTier === "Advanced") {
            if (performanceTier === "Excellent") pointsChange = 60;
            else if (performanceTier === "Good") pointsChange = 30;
            else pointsChange = -5;
        }
    }
    // --- Rider is ADVANCED (1701+) ---
    else if (riderTier === "Advanced") {
        if (horseAdminTier === "Beginner") {
            // Small rewards for easy horses (not penalties)
            if (performanceTier === "Excellent") pointsChange = 8;
            else if (performanceTier === "Good") pointsChange = 3;
            else pointsChange = -15;
        } else if (horseAdminTier === "Intermediate") {
            // Moderate rewards (not penalties)
            if (performanceTier === "Excellent") pointsChange = 25;
            else if (performanceTier === "Good") pointsChange = 10;
            else pointsChange = -15;
        } else if (horseAdminTier === "Advanced") {
            if (performanceTier === "Excellent") pointsChange = 50;
            else if (performanceTier === "Good") pointsChange = 20;
            else pointsChange = -15;
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
