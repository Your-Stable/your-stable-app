import { useMutation } from '@tanstack/react-query'
import { claimReward } from '../helpers/transactions'
import { useCurrentAccount } from '@mysten/dapp-kit'
import useTransact from '@suiware/kit/useTransact'
import useFactory from './useFactory'

const useClaim = ({
  yourStableCoinType,
  onBeforeStart,
  onSuccess,
  onError,
}: {
  yourStableCoinType: string
  onBeforeStart: () => void
  onSuccess: () => void
  onError: (error: Error) => void
}) => {
  const account = useCurrentAccount()

  const { transact } = useTransact({
    onBeforeStart,
    onSuccess,
    onError,
  })
  const { data: factory } = useFactory(yourStableCoinType)
  return useMutation({
    mutationFn: async () => {
      if (!account?.address) {
        throw new Error('No account found')
      }
      if (!factory) throw new Error('Factory not found')
      const tx = await claimReward(account?.address, factory)

      const txHash = transact(tx)
      return txHash
    },
  })
}

export default useClaim
