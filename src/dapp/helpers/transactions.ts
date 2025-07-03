import { Transaction, TransactionArgument } from '@mysten/sui/transactions'
import { YourStableClient } from 'your-stable-sdk'
import { type SuiClient } from '@mysten/sui/client'
import { normalizeStructTag, SUI_TYPE_ARG } from '@mysten/sui/utils'
import { formatBalance } from '../utils'
import {
  BUCK_STSBUCK_VAULT_REDEEM_WITHDRAW_TICKET,
  BUCK_STSBUCK_VAULT_WITHDRAW,
  SBUCK_FLASK,
  SBUCK_FOUNTAIN,
  SBUCK_SAVING_VAULT_STRATEGY,
  SBUCK_SAVING_VAULT_STRATEGY_WITHDRAW_V1,
  ST_SBUCK_COIN_TYPE,
  ST_SBUCK_SAVING_VAULT,
  YOUR_STABLE_COINS,
} from '../config'
import {
  CLOCK_OBJECT,
  coinFromBalance,
  coinIntoBalance,
  COINS_TYPE_LIST,
  PROTOCOL_OBJECT,
} from 'bucket-protocol-sdk'

export const prepareMintYourStableTransaction = async (
  suiClient: SuiClient,
  depositedStableCoinType: string,
  yourStableCoinType: string,
  depositedAmount: bigint,
  sender: string
) => {
  const factory = await YourStableClient.initialize(
    suiClient,
    yourStableCoinType
  )
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
  sender: string
) => {
  const factory = await YourStableClient.initialize(
    suiClient,
    yourStableCoinType
  )
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

export const prepareRedeemYourStableTransaction = async (
  suiClient: SuiClient,
  yourStableCoinType: string,
  burnedAmount: bigint,
  sender: string
) => {
  const factory = await YourStableClient.initialize(
    suiClient,
    yourStableCoinType
  )
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

export const getRewardValue = async (
  suiClient: SuiClient,
  yourStableCoinType: string
) => {
  const factory = await YourStableClient.initialize(
    suiClient,
    yourStableCoinType
  )
  const rewardValue = await factory.getRewardsBuckAmount()
  return formatBalance(rewardValue, 9)
}

export const claimReward = async (
  suiClient: SuiClient,
  yourStableCoinType: string,
  sender: string
) => {
  const factory = await YourStableClient.initialize(
    suiClient,
    yourStableCoinType
  )
  const tx = new Transaction()
  const reward = factory.claimRewardMoveCall(tx)

  const buckCoin = await withdrawStBuck(tx, reward)
  tx.transferObjects([buckCoin], sender)

  return tx
}

export const getClaimableAccounts = async ({
  suiClient,
  yourStableCoinType,
}: {
  suiClient: SuiClient
  yourStableCoinType: string
}) => {
  const factory = await YourStableClient.initialize(
    suiClient,
    yourStableCoinType
  )
  return factory.factory.beneficiary.toJSON().contents.map((content) => content)
}

export const getTotalMinted = async ({
  suiClient,
  yourStableCoinType,
}: {
  suiClient: SuiClient
  yourStableCoinType: string
}) => {
  const factory = await YourStableClient.initialize(
    suiClient,
    yourStableCoinType
  )
  const totalMinted = factory.factory.basicSupply.toJSON().supply
  console.log({
    totalMinted,
  })
  return formatBalance(
    totalMinted,
    YOUR_STABLE_COINS.find((coin) => coin.type === yourStableCoinType)
      ?.decimals || 9
  )
}

export async function withdrawStBuck(
  tx: Transaction,
  stSBuckCoin: TransactionArgument
) {
  const stSbuckBalance = coinIntoBalance(tx, ST_SBUCK_COIN_TYPE, stSBuckCoin)

  const withdrawTicket = tx.moveCall({
    target: BUCK_STSBUCK_VAULT_WITHDRAW,
    typeArguments: [COINS_TYPE_LIST.BUCK, ST_SBUCK_COIN_TYPE],
    arguments: [
      tx.sharedObjectRef(ST_SBUCK_SAVING_VAULT),
      stSbuckBalance,
      tx.sharedObjectRef(CLOCK_OBJECT),
    ],
  })

  tx.moveCall({
    target: SBUCK_SAVING_VAULT_STRATEGY_WITHDRAW_V1,
    arguments: [
      tx.sharedObjectRef(SBUCK_SAVING_VAULT_STRATEGY),
      tx.sharedObjectRef(PROTOCOL_OBJECT),
      tx.sharedObjectRef(SBUCK_FOUNTAIN),
      tx.sharedObjectRef(SBUCK_FLASK),
      withdrawTicket,
      tx.sharedObjectRef(CLOCK_OBJECT),
    ],
  })

  const [buckBalance] = tx.moveCall({
    target: BUCK_STSBUCK_VAULT_REDEEM_WITHDRAW_TICKET,
    typeArguments: [COINS_TYPE_LIST.BUCK, ST_SBUCK_COIN_TYPE],
    arguments: [tx.sharedObjectRef(ST_SBUCK_SAVING_VAULT), withdrawTicket],
  })
  const buckCoin = coinFromBalance(tx, COINS_TYPE_LIST.BUCK, buckBalance)

  return buckCoin
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
