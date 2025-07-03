import { useQuery } from '@tanstack/react-query'
import useGetPrice from './useGetPrice'
import {
  BucketClient,
  FountainInfo,
  SBUCK_BUCK_LP_REGISTRY_ID,
} from 'bucket-protocol-sdk'

const useGetRewardApy = () => {
  const { data: prices } = useGetPrice()
  return useQuery({
    queryKey: ['reward-apy', prices],
    queryFn: async () => {
      if (!prices?.SUI) return 0
      const bucketClient = new BucketClient()
      const fountain = await bucketClient.getFountain(SBUCK_BUCK_LP_REGISTRY_ID)
      const apr = calculateFountainAPR(fountain, prices?.SUI)

      return calculateAutoCompoundAPY(apr + 1)
    },
    enabled: !!prices,
  })
}

function calculateFountainAPR(fountain: FountainInfo, rewardsPrice: number) {
  const rewardAmount = calculateRewardAmount(
    fountain.flowAmount,
    fountain.flowInterval
  )
  const lpPrice = 1
  return (
    ((rewardAmount * 365) / ((fountain.totalWeight / 10 ** 9) * lpPrice)) *
    rewardsPrice *
    100
  )
}

function calculateRewardAmount(flowAmount: number, flowInterval: number) {
  return (flowAmount / 10 ** 9 / flowInterval) * 86400000
}

function calculateAutoCompoundAPY(apr: number) {
  if (apr === 0) return 0
  // auto-compound every hour
  let n = 365 * 24
  const apy = (1 + apr / 100 / n) ** n - 1
  return apy * 100
}

export default useGetRewardApy
