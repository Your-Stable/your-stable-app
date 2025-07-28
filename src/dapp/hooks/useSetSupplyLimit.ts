import { useMutation } from '@tanstack/react-query'
import { prepareUpdateSupplyLimitTransaction } from '../helpers/transactions'
import { useCurrentAccount } from '@mysten/dapp-kit'
import useTransact from '@suiware/kit/useTransact'
import { COINS } from '../config'
import useFactory from './useFactory'

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
  const { data: factory } = useFactory(yourStableCoin.type)
  const account = useCurrentAccount()
  return useMutation({
    mutationFn: async (supplyLimit: number) => {
      if (!factory) throw new Error('Factory not found')
      if (!account?.address) {
        throw new Error('Account not found')
      }
      const supplyLimitBigInt = BigInt(
        supplyLimit * 10 ** yourStableCoin.decimals
      )

      const tx = await prepareUpdateSupplyLimitTransaction(
        supplyLimitBigInt,
        factory
      )
      const txHash = transact(tx)
      return txHash
    },
  })
}

export default useSetSupplyLimit
