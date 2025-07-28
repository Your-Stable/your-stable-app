import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { getRewardValue } from '~~/dapp/helpers/transactions'
import useFactory from './useFactory'

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
  const { data: factory } = useFactory(yourStableCoinType)
  return useQuery({
    queryKey: ['rewardValue', yourStableCoinType],
    queryFn: async () => {
      if (!factory) throw new Error('Factory not found')
      return getRewardValue(factory)
    },
    ...options,
    enabled: !!factory,
  })
}

export default useGetReward
