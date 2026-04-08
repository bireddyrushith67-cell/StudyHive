const rankTiers = [
  { minXp: 0, label: 'Bronze 1' },
  { minXp: 100, label: 'Bronze 2' },
  { minXp: 250, label: 'Bronze 3' },
  { minXp: 450, label: 'Silver 1' },
  { minXp: 700, label: 'Silver 2' },
  { minXp: 1000, label: 'Silver 3' },
  { minXp: 1400, label: 'Gold 1' },
  { minXp: 1850, label: 'Gold 2' },
  { minXp: 2350, label: 'Gold 3' },
  { minXp: 2900, label: 'Platinum 1' },
  { minXp: 3500, label: 'Platinum 2' },
]

export function rankForXp(xp = 0) {
  const safeXp = Number(xp) || 0
  let result = rankTiers[0].label

  for (const tier of rankTiers) {
    if (safeXp >= tier.minXp) result = tier.label
  }

  return result
}
