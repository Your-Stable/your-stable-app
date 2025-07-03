import { useMutation } from '@tanstack/react-query'
import { claimReward } from '../helpers/transactions'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import useTransact from '@suiware/kit/useTransact'
import { useState } from 'react'
import toast from 'react-hot-toast'
import useGetReward from './useGetReward'
import { notification } from '~~/helpers/notification'

const useClaim = ({ yourStableCoinType }: { yourStableCoinType: string }) => {
  const account = useCurrentAccount()
  const [isPending, setIsPending] = useState(false)
  const [notificationId, setNotificationId] = useState<string>()
  const { data: rewardValue, refetch } = useGetReward({
    yourStableCoinType,
  })
  const { transact } = useTransact({
    onBeforeStart: () => {
      setIsPending(true)
      toast.loading('Claiming')
      const nId = notification.txLoading()
      setNotificationId(nId)
    },
    onSuccess: () => {
      toast.dismiss(notificationId)
      notification.txSuccess(`Claimed ${rewardValue} BUCK`, notificationId)
      refetch()
      setIsPending(false)
    },
    onError: (error) => {
      setIsPending(false)
      toast.dismiss(notificationId)
      notification.txError(error, error.message, notificationId)
    },
  })
  const suiClient = useSuiClient()
  const mutation = useMutation({
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
  return {
    ...mutation,
    isPending: mutation.isPending || isPending,
  }
}

export default useClaim
