import {
  useCurrentAccount,
  useSuiClient,
  useSuiClientQuery,
} from '@mysten/dapp-kit'
import { SuiSignAndExecuteTransactionOutput } from '@mysten/wallet-standard'
import {
  Button,
  TextField,
  Select,
  Card,
  Flex,
  Text,
  Badge,
} from '@radix-ui/themes'
import useTransact from '@suiware/kit/useTransact'
import { MouseEvent, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { EXPLORER_URL_VARIABLE_NAME } from '~~/config/network'
import {
  prepareBurnAndRedeemYourStableTransaction,
  prepareBurnYourStableTransaction,
  prepareMintYourStableTransaction,
  prepareRedeemYourStableTransaction,
} from '~~/dapp/helpers/transactions'
import { transactionUrl } from '~~/helpers/network'
import { notification } from '~~/helpers/notification'
import useNetworkConfig from '~~/hooks/useNetworkConfig'
import { formatBalance } from '~~/dapp/utils'
import { COINS, STABLE_COINS, YOUR_STABLE_COINS } from '../config'
import useGetTotalMinted from '../hooks/useGetTotalMinted'

const MintRedeemForm = ({
  yourStableCoin,
  setYourStableCoin,
}: {
  yourStableCoin: COINS
  setYourStableCoin: (coin: COINS) => void
}) => {
  const currentAccount = useCurrentAccount()
  const suiClient = useSuiClient()
  const { useNetworkVariable } = useNetworkConfig()
  const [notificationId, setNotificationId] = useState<string>()
  const explorerUrl = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME)
  const [isPending, setIsPending] = useState(false)
  const { refetch: refetchTotalMinted } = useGetTotalMinted({
    yourStableCoinType: yourStableCoin.type,
  })

  const [selectedStableCoin, setSelectedStableCoin] = useState<COINS>(
    STABLE_COINS[0]
  )

  const usdcCoin = STABLE_COINS.find((coin) => coin.name === 'USDC')

  const [isMint, setIsMint] = useState(true)
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (isMint) {
      setSelectedStableCoin(STABLE_COINS[0])
    } else {
      setYourStableCoin(YOUR_STABLE_COINS[0])
    }
  }, [isMint])

  // Balance queries
  const {
    data: stableCoinBalance,
    isPending: isStableBalanceFetching,
    refetch: refetchStableCoinBalance,
  } = useSuiClientQuery(
    'getBalance',
    {
      owner: currentAccount?.address || '',
      coinType: selectedStableCoin.type,
    },
    {
      enabled: !!currentAccount?.address,
      gcTime: 10000,
      queryKey: ['balance', selectedStableCoin.type],
    }
  )

  const {
    data: yourStableBalance,
    isPending: isYourStableFetching,
    refetch: refetchYourStableCoinBalance,
  } = useSuiClientQuery(
    'getBalance',
    {
      owner: currentAccount?.address || '',
      coinType: yourStableCoin.type,
    },
    {
      enabled: !!currentAccount?.address,
      gcTime: 10000,
      queryKey: ['balance', yourStableCoin.type],
    }
  )

  // Transaction handler
  const { transact: create } = useTransact({
    onBeforeStart: () => {
      setIsPending(true)
      const nId = notification.txLoading()
      setNotificationId(nId)
    },
    onSuccess: async (data: SuiSignAndExecuteTransactionOutput) => {
      setIsPending(false)
      toast.dismiss(notificationId)
      notification.txSuccess(
        transactionUrl(explorerUrl, data.digest),
        notificationId
      )

      // Invalidate both balance queries
      await refetchStableCoinBalance()
      await refetchYourStableCoinBalance()
      await refetchTotalMinted()
    },
    onError: (e: Error) => {
      notification.txError(e, null, notificationId)
      setIsPending(false)
    },
  })

  // Computed values based on mint/burn action
  const {
    inputCoin,
    outputCoin,
    inputBalance,
    outputBalance,
    inputBalanceLoading,
    outputBalanceLoading,
    inputDecimals,
    // outputDecimals,
    insufficientBalance,
  } = useMemo(() => {
    const formattedStableBalance = formatBalance(
      stableCoinBalance?.totalBalance || 0,
      selectedStableCoin.decimals
    )

    const formattedYourStableBalance = formatBalance(
      yourStableBalance?.totalBalance || 0,
      yourStableCoin.decimals
    )

    if (isMint) {
      // Mint: Deposit stable coin ? Receive your stable
      return {
        inputCoin: selectedStableCoin,
        outputCoin: yourStableCoin,
        inputBalance: formattedStableBalance,
        outputBalance: formattedYourStableBalance,
        inputBalanceLoading: isStableBalanceFetching,
        outputBalanceLoading: isYourStableFetching,
        inputDecimals: selectedStableCoin.decimals,
        // outputDecimals: YOUR_STABLE_DECIMALS[selectedYourStable],

        insufficientBalance:
          amount &&
          Number(amount) * 10 ** selectedStableCoin.decimals > 0 &&
          Number(amount) * 10 ** selectedStableCoin.decimals >
            Number(stableCoinBalance?.totalBalance || 0),
      }
    } else {
      // Burn: Deposit your stable ? Receive stable coin
      return {
        inputCoin: yourStableCoin,
        outputCoin: selectedStableCoin,
        inputBalance: formattedYourStableBalance,
        outputBalance: formattedStableBalance,
        inputBalanceLoading: isYourStableFetching,
        outputBalanceLoading: isStableBalanceFetching,
        inputDecimals: yourStableCoin.decimals,
        // outputDecimals: STABLE_COIN_DECIMALS[selectedStableCoin],
        insufficientBalance:
          amount &&
          Number(amount) * 10 ** yourStableCoin.decimals > 0 &&
          Number(amount) * 10 ** yourStableCoin.decimals >
            Number(yourStableBalance?.totalBalance || 0),
      }
    }
  }, [
    amount,
    isMint,
    selectedStableCoin,
    yourStableCoin,
    stableCoinBalance,
    yourStableBalance,
    isStableBalanceFetching,
    isYourStableFetching,
  ])

  const calculatedOutput = useMemo(() => {
    return Number(amount) || 0
  }, [amount])

  const handleOnClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!currentAccount?.address) return

    let tx

    if (isMint) {
      const value = BigInt(Math.floor(Number(amount) * 10 ** inputDecimals))
      tx = await prepareMintYourStableTransaction(
        suiClient,
        selectedStableCoin.type,
        yourStableCoin.type,
        value,
        currentAccount.address
      )
    } else {
      const value = BigInt(Math.floor(Number(amount) * 10 ** inputDecimals))
      if (selectedStableCoin.name === 'USDC') {
        if (yourStableCoin.instantRedeem) {
          tx = await prepareRedeemYourStableTransaction(
            suiClient,
            yourStableCoin.type,
            value,
            currentAccount.address
          )
        } else {
          tx = await prepareBurnAndRedeemYourStableTransaction(
            suiClient,
            yourStableCoin.type,
            value,
            currentAccount.address
          )
        }
      } else {
        tx = await prepareBurnYourStableTransaction(
          suiClient,
          yourStableCoin.type,
          value,
          currentAccount.address
        )
      }
    }

    create(tx)
  }

  const isDisabled = !!insufficientBalance || !amount || isPending

  return (
    <div className="my-2 flex w-96 flex-grow flex-col items-center justify-center">
      <Card size="3" style={{ width: '100%' }}>
        <Flex direction="column" gap="4">
          {/* Action Toggle */}
          <Flex gap="2">
            <Button
              className="cursor-pointer"
              variant={isMint ? 'solid' : 'soft'}
              onClick={() => setIsMint(true)}
              style={{ flex: 1 }}
            >
              Mint
            </Button>
            <Button
              className="cursor-pointer"
              variant={!isMint ? 'solid' : 'soft'}
              onClick={() => setIsMint(false)}
              style={{ flex: 1 }}
            >
              Redeem
            </Button>
          </Flex>

          {/* Input Section */}
          <Card variant="surface">
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center">
                <Text size="2" weight="medium">
                  You {isMint ? 'Deposit' : 'Redeem'}
                </Text>
                <Flex gap="2" align="center">
                  <Text size="2" color="gray">
                    Balance:
                  </Text>
                  {inputBalanceLoading ? (
                    <Flex gap="1" align="center">
                      <Text size="2" color="gray">
                        Loading
                      </Text>
                      <svg
                        className="animate-spin"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"
                        />
                      </svg>
                    </Flex>
                  ) : (
                    <Text size="2" weight="bold" color="blue">
                      {inputBalance} {inputCoin.name}
                    </Text>
                  )}
                </Flex>
              </Flex>

              <Flex gap="2" align="center">
                <TextField.Root
                  placeholder="0.00"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Select.Root
                  value={isMint ? selectedStableCoin.name : yourStableCoin.name}
                  onValueChange={(v) => {
                    if (isMint) {
                      setSelectedStableCoin(
                        STABLE_COINS.find((coin) => coin.name === v) ||
                          STABLE_COINS[0]
                      )
                    } else {
                      setYourStableCoin(
                        YOUR_STABLE_COINS.find((coin) => coin.name === v) ||
                          YOUR_STABLE_COINS[0]
                      )
                    }
                  }}
                >
                  <Select.Trigger
                    className="cursor-pointer"
                    style={{ minWidth: '80px' }}
                  />
                  <Select.Content>
                    {isMint ? (
                      <Select.Item
                        className="cursor-pointer"
                        key={usdcCoin?.name}
                        value={usdcCoin?.name || ''}
                      >
                        {usdcCoin?.name || ''}
                      </Select.Item>
                    ) : (
                      YOUR_STABLE_COINS.map((coin) => (
                        <Select.Item
                          className="cursor-pointer"
                          key={coin.name}
                          value={coin.name}
                        >
                          {coin.name}
                        </Select.Item>
                      ))
                    )}
                  </Select.Content>
                </Select.Root>
              </Flex>

              {amount && insufficientBalance && (
                <Text size="1" color="red">
                  Insufficient balance
                </Text>
              )}
            </Flex>
          </Card>

          {/* Output Section */}
          <Card variant="surface">
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center">
                <Text size="2" weight="medium">
                  You {isMint ? 'receive' : 'get back'}
                </Text>
                <Flex gap="2" align="center">
                  <Text size="2" color="gray">
                    Balance:
                  </Text>
                  {outputBalanceLoading ? (
                    <Flex gap="1" align="center">
                      <Text size="2" color="gray">
                        Loading
                      </Text>
                      <svg
                        className="animate-spin"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"
                        />
                      </svg>
                    </Flex>
                  ) : (
                    <Text size="2" weight="bold" color="green">
                      {outputBalance} {outputCoin.name}
                    </Text>
                  )}
                </Flex>
              </Flex>

              <Flex gap="2" align="center">
                <TextField.Root
                  placeholder="0.00"
                  value={calculatedOutput.toFixed(2)}
                  disabled
                  style={{ flex: 1 }}
                />

                <Select.Root
                  value={isMint ? yourStableCoin.name : selectedStableCoin.name}
                  onValueChange={(v) => {
                    if (isMint) {
                      setYourStableCoin(
                        YOUR_STABLE_COINS.find((coin) => coin.name === v) ||
                          YOUR_STABLE_COINS[0]
                      )
                    } else {
                      setSelectedStableCoin(
                        STABLE_COINS.find((coin) => coin.name === v) ||
                          STABLE_COINS[0]
                      )
                    }
                  }}
                >
                  <Select.Trigger
                    className="cursor-pointer"
                    style={{ minWidth: '80px' }}
                  />
                  <Select.Content>
                    {isMint
                      ? YOUR_STABLE_COINS.map((coin) => (
                          <Select.Item
                            className="cursor-pointer"
                            key={coin.name}
                            value={coin.name}
                          >
                            {coin.name}
                          </Select.Item>
                        ))
                      : STABLE_COINS.map((coin) => (
                          <Select.Item
                            className="cursor-pointer"
                            key={coin.name}
                            value={coin.name}
                          >
                            {coin.name}
                          </Select.Item>
                        ))}
                  </Select.Content>
                </Select.Root>
              </Flex>
            </Flex>
          </Card>
          {!isMint &&
            selectedStableCoin.name === 'USDC' &&
            !yourStableCoin.instantRedeem && (
              <Text size="1" color="gray">
                The request will be processed in 24 hours and the funds will be
                sent directly to your wallet.
              </Text>
            )}
          {/* Action Button */}
          <Button
            variant="solid"
            size="3"
            onClick={handleOnClick}
            disabled={isDisabled}
            color={isMint ? 'blue' : 'orange'}
            className="cursor-pointer"
          >
            {isMint
              ? `Mint ${calculatedOutput.toFixed(2)} ${yourStableCoin.name}`
              : `Redeem ${calculatedOutput.toFixed(2)} ${selectedStableCoin.name}`}
          </Button>

          {/* Preview Summary */}
          {amount && (
            <Card variant="classic">
              <Flex direction="column" gap="2">
                <Text size="2" weight="bold" color="gray">
                  Transaction Summary
                </Text>
                <Flex justify="between">
                  <Text size="2">Action:</Text>
                  <Badge size="2" color={isMint ? 'blue' : 'orange'}>
                    {isMint ? 'Mint' : 'Redeem'}{' '}
                    {isMint ? yourStableCoin.name : yourStableCoin.name}
                  </Badge>
                </Flex>
                <Flex justify="between">
                  <Text size="2">Exchange Rate:</Text>
                  <Text size="2" weight="medium">
                    1:1
                  </Text>
                </Flex>
              </Flex>
            </Card>
          )}
        </Flex>
      </Card>
    </div>
  )
}

export default MintRedeemForm
