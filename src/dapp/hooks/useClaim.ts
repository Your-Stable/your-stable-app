import { useMutation } from '@tanstack/react-query'
import { claimReward } from '../helpers/transactions'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import useTransact from '@suiware/kit/useTransact'

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
  const suiClient = useSuiClient()
  return useMutation({
    mutationFn: async () => {
      if (!account?.address) {
        throw new Error('No account found')
      }
      const tx = await claimReward(
        suiClient,
        yourStableCoinType,
        account?.address
      )

      const txHash = transact(tx)
      return txHash
    },
  })
}

export default useClaim
