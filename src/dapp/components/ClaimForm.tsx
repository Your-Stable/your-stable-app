import { Button, Card, Flex, Skeleton, Text } from '@radix-ui/themes'
import useGetReward from '~~/dapp/hooks/useGetReward'
import useClaim from '../hooks/useClaim'
import useGetTotalMinted from '../hooks/useGetTotalMinted'
import { COINS } from '../config'
import useGetRewardApy from '../hooks/useGetRewardApy'
import { formatPercentage } from '../utils'

const ClaimForm = ({ yourStableCoin }: { yourStableCoin: COINS }) => {
  const { data: rewardValue } = useGetReward({
    yourStableCoinType: yourStableCoin.type,
  })
  const { data: totalMinted } = useGetTotalMinted({
    yourStableCoinType: yourStableCoin.type,
  })
  const { mutate: claim, isPending } = useClaim({
    yourStableCoinType: yourStableCoin.type,
  })

  const { data: rewardApy, isPending: isGetRewardApyPending } =
    useGetRewardApy()
  return (
    <Card variant="classic" className="w-full p-6">
      <Flex direction="column" gap="4">
        <Flex direction="column" gap="4">
          <Flex justify="between">
            <Text size="2">Total Minted:</Text>
            <Text size="2" weight="medium">
              {totalMinted} {yourStableCoin.name}
            </Text>
          </Flex>
          <Flex justify="between">
            <Text size="2">Reward APY:</Text>
            {isGetRewardApyPending ? (
              <Skeleton className="h-5 w-16" />
            ) : (
              <Text size="2" weight="medium">
                {rewardApy ? formatPercentage(rewardApy) : '-'} %
              </Text>
            )}
          </Flex>
          <Flex justify="between">
            <Text size="2">Unclaimed Reward:</Text>
            <Text size="2" weight="medium">
              {rewardValue} BUCK
            </Text>
          </Flex>
        </Flex>
        <Button
          variant="solid"
          size="3"
          className="cursor-pointer"
          color="blue"
          onClick={() => claim()}
          disabled={isPending}
        >
          {isPending ? 'Claiming' : 'Claim'}
        </Button>
      </Flex>
    </Card>
  )
}

export default ClaimForm
