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

        const withdrawEvent = events.data.find(
          (e) =>
            e.type.indexOf(
              `0x2a721777dc1fcf7cda19492ad7c2272ee284214652bde3e9740e2f49c3bff457::vault::WithdrawEvent<0xd01d27939064d79e4ae1179cd11cfeeff23943f32b1a842ea1a1e15a0045d77d::st_sbuck::ST_SBUCK>`
            ) !== -1
        )

        if (withdrawEvent) {
          const buck = (withdrawEvent.parsedJson as { amount: number }).amount
          result.push({
            buck: formatBalance(buck, 9),
            rawBuck: buck,
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
