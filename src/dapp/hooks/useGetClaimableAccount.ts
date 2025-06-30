import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { getClaimableAccounts } from '../helpers/transactions'
import { SuiClient } from '@mysten/sui/client'

type UseGetClaimableAccountProps = Omit<
  UseQueryOptions<string[], Error, string[]>,
  'queryKey' | 'queryFn'
> & {
  suiClient: SuiClient
  yourStableCoinType: string
}

const useGetClaimableAccount = ({
  suiClient,
  yourStableCoinType,
  ...options
}: UseGetClaimableAccountProps) => {
  return useQuery({
    queryKey: ['claimable-account', yourStableCoinType],
    queryFn: async () => {
      const claimableAccounts = await getClaimableAccounts({
        suiClient,
        yourStableCoinType,
      })
      return claimableAccounts
    },
    ...options,
    enabled: !!suiClient && !!yourStableCoinType,
  })
}

export default useGetClaimableAccount
