import { useMutation } from '@tanstack/react-query'
import { prepareUpdateSupplyLimitTransaction } from '../helpers/transactions'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import useTransact from '@suiware/kit/useTransact'

const useSetSupplyLimit = ({
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
  const { transact } = useTransact({
    onBeforeStart,
    onSuccess,
    onError,
  })
  const suiClient = useSuiClient()
  const account = useCurrentAccount()
  return useMutation({
    mutationFn: async (supplyLimit: bigint) => {
      if (!account?.address) {
        throw new Error('Account not found')
      }
      const tx = await prepareUpdateSupplyLimitTransaction(
        suiClient,
        yourStableCoinType,
        supplyLimit
      )
      const txHash = transact(tx)
      return txHash
    },
  })
}

export default useSetSupplyLimit
