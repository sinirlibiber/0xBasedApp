export type BuilderScore = {
  score: number;
  normalized: number;
  tier: 'NOVICE' | 'VERIFIED' | 'ELITE';
};

export async function getBuilderScore(address: string): Promise<BuilderScore> {
  try {
    const response = await fetch(`https://api.talentprotocol.com/api/v2/passports/${address}`, {
      headers: {
        'X-API-KEY': process.env.NEXT_PUBLIC_TALENT_PROTOCOL_API_KEY || '',
      },
    });

    if (!response.ok) {
      return { score: 0, normalized: 0, tier: 'NOVICE' };
    }

    const data = await response.json();
    const score = data.passport?.score || 0;
    const normalized = Math.min(score / 100, 1);

    let tier: 'NOVICE' | 'VERIFIED' | 'ELITE' = 'NOVICE';
    if (score >= 60) tier = 'ELITE';
    else if (score >= 20) tier = 'VERIFIED';

    return { score, normalized, tier };
  } catch (error) {
    console.error('Failed to fetch builder score:', error);
    return { score: 0, normalized: 0, tier: 'NOVICE' };
  }
}

export function calculateAPYBoost(builderScore: BuilderScore): number {
  // MaxAPY = BaseAPY × (1 + M_reputation)
  // M_reputation = 1.0 + (BuilderScore_normalized × 0.5)
  const reputationMultiplier = 1.0 + builderScore.normalized * 0.5;
  return reputationMultiplier;
}

export function getTierMaxLockPeriod(tier: 'NOVICE' | 'VERIFIED' | 'ELITE'): number {
  switch (tier) {
    case 'ELITE':
      return 90; // 90 days
    case 'VERIFIED':
      return 60; // 60 days
    case 'NOVICE':
    default:
      return 30; // 30 days
  }
}
