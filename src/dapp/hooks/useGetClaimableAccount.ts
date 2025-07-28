import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { getClaimableAccounts } from '../helpers/transactions'
import useFactory from './useFactory'

type UseGetClaimableAccountProps = Omit<
  UseQueryOptions<string[], Error, string[]>,
  'queryKey' | 'queryFn'
> & {
  yourStableCoinType: string
}

const useGetClaimableAccount = ({
  yourStableCoinType,
  ...options
}: UseGetClaimableAccountProps) => {
  const { data: factory } = useFactory(yourStableCoinType)
  return useQuery({
    queryKey: ['claimable-account', yourStableCoinType],
    queryFn: async () => {
      if (!factory) throw new Error('Factory not found')
      const claimableAccounts = await getClaimableAccounts(factory)
      return claimableAccounts
    },
    ...options,
    enabled: !!factory && !!yourStableCoinType,
  })
}

export default useGetClaimableAccount
