import { useSuiClient } from '@mysten/dapp-kit'
import { useQuery } from '@tanstack/react-query'
import { PACKAGE_ID } from 'your-stable-sdk'
import { formatBalance } from '../utils'

const useGetRewardHistory = ({
  yourStableCoinType,
}: {
  yourStableCoinType: string
}) => {
  const suiClient = useSuiClient()
  return useQuery({
    queryKey: ['reward-history', yourStableCoinType],
    queryFn: async () => {
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::event::ClaimReward<${yourStableCoinType}>`,
        },
        order: 'descending',
      })
      const result = []
      for (const event of events.data) {
        const tx = event.id.txDigest
        const events = await suiClient.queryEvents({
          query: {
            Transaction: tx,
          },
          order: 'descending',
          limit: 2,
        })
        const target = events.data.find(
          (e) => e.type.indexOf('StrategyLossEvent') !== -1
        )
        if (target) {
          const buck = (target.parsedJson as { withdrawn: number }).withdrawn
          result.push({
            buck: formatBalance(buck, 9),
            tx: tx,
            timestamp: event.timestampMs,
          })
        }
      }

      return result
    },
    enabled: !!yourStableCoinType,
  })
}
export default useGetRewardHistory
