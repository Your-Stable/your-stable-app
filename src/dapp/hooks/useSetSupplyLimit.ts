import { useMutation } from '@tanstack/react-query'
import { prepareUpdateSupplyLimitTransaction } from '../helpers/transactions'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { toast } from 'react-hot-toast'
import useTransact from '@suiware/kit/useTransact'
import { notification } from '~~/helpers/notification'
import { useState } from 'react'
import useGetSupplyLimit from './useGetSupplyLimit'

const useSetSupplyLimit = ({
  yourStableCoinType,
}: {
  yourStableCoinType: string
}) => {
  const { refetch: refetchSupplyLimit } = useGetSupplyLimit({
    yourStableCoinType,
  })
  const [isPending, setIsPending] = useState(false)
  const [notificationId, setNotificationId] = useState<string>()
  const { transact } = useTransact({
    onBeforeStart: () => {
      setIsPending(true)
      toast.loading('Updating supply limit')
      const nId = notification.txLoading()
      setNotificationId(nId)
    },
    onSuccess: () => {
      toast.dismiss(notificationId)
      notification.txSuccess(`Supply limit updated`, notificationId)
      refetchSupplyLimit()
      setIsPending(false)
    },
    onError: (error) => {
      setIsPending(false)
      toast.dismiss(notificationId)
      notification.txError(error, error.message, notificationId)
    },
  })
  const suiClient = useSuiClient()
  const account = useCurrentAccount()
  const mutation = useMutation({
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
  return {
    ...mutation,
    isPending: mutation.isPending || isPending,
  }
}

export default useSetSupplyLimit
