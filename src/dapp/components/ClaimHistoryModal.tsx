import { COINS } from '../config'
import { Button, Dialog, Flex, Grid, Link } from '@radix-ui/themes'
import useGetRewardHistory from '../hooks/useGetRewardHistory'
import { formatTimestamp } from '../utils'
import { MAINNET_EXPLORER_URL } from '~~/config/network'
import { ExternalLinkIcon, XIcon } from 'lucide-react'

const ClaimHistoryModal = ({
  yourStableCoin,
  isClaimHistoryOpen,
  setIsClaimHistoryOpen,
}: {
  yourStableCoin: COINS
  isClaimHistoryOpen: boolean
  setIsClaimHistoryOpen: (open: boolean) => void
}) => {
  const { data: rewardHistory } = useGetRewardHistory({
    yourStableCoinType: yourStableCoin.type,
  })
  return (
    <Dialog.Root open={isClaimHistoryOpen} onOpenChange={setIsClaimHistoryOpen}>
      <Dialog.Trigger>
        <Button className="cursor-pointer" variant="outline" size="3">
          Claim History
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="w-full max-w-md rounded-md p-6">
        <Flex justify="between" pb="4">
          <Dialog.Title>Claim History</Dialog.Title>
          <Dialog.Close className="cursor-pointer">
            <XIcon size={16} />
          </Dialog.Close>
        </Flex>
        <Flex direction="column" gap="4">
          <Grid columns="3" gap="4">
            <Flex align="center" className="text-sm font-normal">
              Time
            </Flex>
            <Flex align="center" justify="end" className="text-sm font-normal">
              Claim Reward
            </Flex>
            <Flex align="center" justify="end" className="text-sm font-normal">
              Txn
            </Flex>
          </Grid>
          {rewardHistory &&
            rewardHistory.length > 0 &&
            rewardHistory.map((item) => (
              <Grid key={item.tx} columns="3" gap="4">
                <Flex align="center" className="text-sm">
                  {formatTimestamp(Number(item.timestamp))}
                </Flex>
                <Flex align="center" justify="end" className="text-sm">
                  {item.buck} BUCK
                </Flex>
                <Flex align="center" justify="end" className="text-sm">
                  <Link
                    href={`${MAINNET_EXPLORER_URL}/txblock/${item.tx}`}
                    target="_blank"
                  >
                    <Flex
                      align="center"
                      gap="2"
                      justify="end"
                      className="text-sm"
                    >
                      {item.tx.slice(0, 6)}... <ExternalLinkIcon size={16} />
                    </Flex>
                  </Link>
                </Flex>
              </Grid>
            ))}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default ClaimHistoryModal
