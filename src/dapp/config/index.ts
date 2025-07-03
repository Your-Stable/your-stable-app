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

export const BUCK_STSBUCK_VAULT_WITHDRAW =
  '0xe3cebd65a961b580068df236d44bc84a2ac6ef2c9dd42df1b07fc6600ab0eeda::vault::withdraw'
export const ST_SBUCK_COIN_TYPE =
  '0xd01d27939064d79e4ae1179cd11cfeeff23943f32b1a842ea1a1e15a0045d77d::st_sbuck::ST_SBUCK'
export const ST_SBUCK_SAVING_VAULT = {
  objectId:
    '0xe83e455a9e99884c086c8c79c13367e7a865de1f953e75bcf3e529cdf03c6224',
  initialSharedVersion: 261896418,
  mutable: true,
}

export const SBUCK_SAVING_VAULT_STRATEGY_WITHDRAW_V1 =
  '0xe3cebd65a961b580068df236d44bc84a2ac6ef2c9dd42df1b07fc6600ab0eeda::sbuck_saving_vault::withdraw_v1'

export const SBUCK_SAVING_VAULT_STRATEGY = {
  objectId:
    '0x55bb4f6737d9a299cae4da7687dcf0ab4f56494dfe6ec1189a388b6018d0c2a8',
  initialSharedVersion: 261896419,
  mutable: true,
}

export const SBUCK_FOUNTAIN = {
  objectId:
    '0xbdf91f558c2b61662e5839db600198eda66d502e4c10c4fc5c683f9caca13359',
  initialSharedVersion: 87170268,
  mutable: true,
}

export const SBUCK_FLASK = {
  objectId:
    '0xc6ecc9731e15d182bc0a46ebe1754a779a4bfb165c201102ad51a36838a1a7b8',
  initialSharedVersion: 90706194,
  mutable: true,
}

export const BUCK_STSBUCK_VAULT_REDEEM_WITHDRAW_TICKET =
  '0xe3cebd65a961b580068df236d44bc84a2ac6ef2c9dd42df1b07fc6600ab0eeda::vault::redeem_withdraw_ticket'
