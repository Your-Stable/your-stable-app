import { Transaction } from '@mysten/sui/transactions'
import { YourStableClient } from 'your-stable-sdk'
import { type SuiClient } from '@mysten/sui/client'
import { normalizeStructTag, SUI_TYPE_ARG } from '@mysten/sui/utils'
import { formatBalance } from '../utils'
import { YOUR_STABLE_COINS } from '../config'

export const prepareMintYourStableTransaction = async (
  suiClient: SuiClient,
  depositedStableCoinType: string,
  depositedAmount: bigint,
  sender: string,
  factory: YourStableClient
) => {
  const tx = new Transaction()
  // example: 0.01 USDC
  const usdcCoin = await getInputCoins(
    tx,
    suiClient,
    sender,
    depositedStableCoinType,
    BigInt(depositedAmount)
  )
  const yourStableCoin = factory.mintYourStableMoveCall(
    tx,
    depositedStableCoinType,
    usdcCoin
  )

  tx.transferObjects([yourStableCoin], sender)

  return tx
}

export const prepareBurnYourStableTransaction = async (
  suiClient: SuiClient,
  yourStableCoinType: string,
  burnedAmount: bigint,
  sender: string,
  factory: YourStableClient
) => {
  const tx = new Transaction()

  const yourStableCoin = await getInputCoins(
    tx,
    suiClient,
    sender,
    yourStableCoinType,
    BigInt(burnedAmount)
  )
  // stableCoin Amount to redeem
  const buckCoin = factory.burnYourStableMoveCall(tx, yourStableCoin)

  tx.transferObjects([buckCoin], sender)

  return tx
}

export const prepareBurnAndRedeemYourStableTransaction = async (
  suiClient: SuiClient,
  yourStableCoinType: string,
  burnedAmount: bigint,
  sender: string,
  factory: YourStableClient
) => {
  const tx = new Transaction()

  const yourStableCoin = await getInputCoins(
    tx,
    suiClient,
    sender,
    yourStableCoinType,
    BigInt(burnedAmount)
  )
  // stableCoin Amount to redeem
  const buckCoin = factory.burnAndRedeemYourStableMoveCall(
    tx,
    yourStableCoin,
    sender,
    BigInt(burnedAmount)
  )

  tx.transferObjects([buckCoin], sender)

  return tx
}

export const prepareRedeemYourStableTransaction = async (
  suiClient: SuiClient,
  yourStableCoinType: string,
  burnedAmount: bigint,
  sender: string,
  factory: YourStableClient
) => {
  const tx = new Transaction()

  const yourStableCoin = await getInputCoins(
    tx,
    suiClient,
    sender,
    yourStableCoinType,
    BigInt(burnedAmount)
  )
  // stableCoin Amount to redeem
  const buckCoin = factory.redeemYourStableMoveCall(tx, yourStableCoin)

  tx.transferObjects([buckCoin], sender)

  return tx
}

export const prepareUpdateSupplyLimitTransaction = async (
  supplyLimit: bigint,
  factory: YourStableClient
) => {
  const tx = new Transaction()
  factory.setBasicLimitMoveCall(tx, supplyLimit)
  return tx
}

export const getRewardValue = async (factory: YourStableClient) => {
  const rewardValue = await factory.getRewardsBuckAmount()

  return formatBalance(rewardValue, 9)
}

export const claimReward = async (
  sender: string,
  factory: YourStableClient
) => {
  const tx = new Transaction()
  const reward = factory.claimRewardMoveCall(tx)

  tx.transferObjects([reward], sender)

  return tx
}

export const getClaimableAccounts = async (factory: YourStableClient) => {
  return factory.factory.beneficiary.toJSON().contents.map((content) => content)
}

export const getTotalMinted = async (
  yourStableCoinType: string,
  factory: YourStableClient
) => {
  const totalMinted = factory.factory.basicSupply.toJSON().supply

  return formatBalance(
    totalMinted,
    YOUR_STABLE_COINS.find((coin) => coin.type === yourStableCoinType)
      ?.decimals || 9
  )
}

export const getFactoryCap = async (factory: YourStableClient) => {
  const cap = factory.factoryCap
  return cap
}

export const getSupplyLimit = async (
  yourStableCoinType: string,
  factory: YourStableClient
) => {
  const supplyLimit = factory.factory.basicSupply.limit
  return formatBalance(
    supplyLimit,
    YOUR_STABLE_COINS.find((coin) => coin.type === yourStableCoinType)
      ?.decimals || 9
  )
}

export async function getInputCoins(
  tx: Transaction,
  client: SuiClient,
  owner: string,
  coinType: string,
  ...amounts: bigint[]
) {
  let isZero = true
  for (const amount of amounts) {
    if (Number(amount) > 0) {
      isZero = false
      break
    }
  }

  if (isZero) {
    return tx.moveCall({
      target: `0x2::coin::zero`,
      typeArguments: [coinType],
    })
  }

  if (
    coinType === SUI_TYPE_ARG ||
    coinType == normalizeStructTag(SUI_TYPE_ARG)
  ) {
    return tx.splitCoins(
      tx.gas,
      amounts.map((amount) => tx.pure.u64(amount))
    )
  } else {
    const { data: userCoins } = await client.getCoins({ owner, coinType })
    const [mainCoin, ...otherCoins] = userCoins.map((coin) =>
      tx.objectRef({
        objectId: coin.coinObjectId,
        version: coin.version,
        digest: coin.digest,
      })
    )
    if (!mainCoin) {
      return tx.moveCall({
        target: `0x2::coin::zero`,
        typeArguments: [coinType],
      })
    }

    if (otherCoins.length > 0) tx.mergeCoins(mainCoin, otherCoins)

    return tx.splitCoins(
      mainCoin,
      amounts.map((amount) => tx.pure.u64(amount))
    )
  }
}
