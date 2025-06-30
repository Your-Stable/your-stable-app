export type COIN_TYPE = 'USDC' | 'BUCK' | 'upUSD'
export type COINS = {
  name: COIN_TYPE
  type: string
  decimals: number
}

export const STABLE_COINS: COINS[] = [
  {
    name: 'USDC',
    type: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
    decimals: 6,
  },
  {
    name: 'BUCK',
    type: '0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK',
    decimals: 9,
  },
]

export const YOUR_STABLE_COINS: COINS[] = [
  {
    name: 'upUSD',
    type: '0x5de877a152233bdd59c7269e2b710376ca271671e9dd11076b1ff261b2fd113c::up_usd::UP_USD',
    decimals: 6,
  },
]
