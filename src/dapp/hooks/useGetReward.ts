import { useSuiClient } from '@mysten/dapp-kit'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { getRewardValue } from '~~/dapp/helpers/transactions'

type UseGetRewardProps = Omit<
  UseQueryOptions<string, Error, string, string[]>,
  'queryKey' | 'queryFn'
> & {
  yourStableCoinType: string
}

const useGetReward = ({
  yourStableCoinType,
  ...options
}: UseGetRewardProps) => {
  const suiClient = useSuiClient()
  return useQuery({
    queryKey: ['rewardValue', yourStableCoinType],
    queryFn: () => getRewardValue(suiClient, yourStableCoinType),
    ...options,
  })
}

export default useGetReward
