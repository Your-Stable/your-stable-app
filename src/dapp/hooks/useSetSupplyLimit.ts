import { useMutation } from '@tanstack/react-query'
import { prepareUpdateSupplyLimitTransaction } from '../helpers/transactions'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import useTransact from '@suiware/kit/useTransact'
import { COINS } from '../config'

const useSetSupplyLimit = ({
  yourStableCoin,
  onBeforeStart,
  onSuccess,
  onError,
}: {
  yourStableCoin: COINS
  onBeforeStart: () => void
  onSuccess: () => void
  onError: (error: Error) => void
}) => {
  const { transact } = useTransact({
    onBeforeStart,
    onSuccess,
    onError,
  })
  const suiClient = useSuiClient()
  const account = useCurrentAccount()
  return useMutation({
    mutationFn: async (supplyLimit: number) => {
      if (!account?.address) {
        throw new Error('Account not found')
      }
      const supplyLimitBigInt = BigInt(
        supplyLimit * 10 ** yourStableCoin.decimals
      )
      console.log(supplyLimit)
      const tx = await prepareUpdateSupplyLimitTransaction(
        suiClient,
        yourStableCoin.type,
        supplyLimitBigInt
      )
      const txHash = transact(tx)
      return txHash
    },
  })
}

export default useSetSupplyLimit
