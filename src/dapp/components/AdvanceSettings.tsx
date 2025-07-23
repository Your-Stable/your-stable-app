import {
  Button,
  Card,
  ChevronDownIcon,
  Flex,
  Text,
  TextField,
} from '@radix-ui/themes'
import { COINS } from '../config'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@radix-ui/react-accordion'
import { useState } from 'react'
import useGetSupplyLimit from '../hooks/useGetSupplyLimit'
import useSetSupplyLimit from '../hooks/useSetSupplyLimit'
import { Loader2Icon } from 'lucide-react'
import toast from 'react-hot-toast'
import { notification } from '~~/helpers/notification'

const AdvanceSettings = ({ yourStableCoin }: { yourStableCoin: COINS }) => {
  const [isTransacting, setIsTransacting] = useState(false)
  const [notificationId, setNotificationId] = useState<string>()
  const [isOpen, setIsOpen] = useState(true)
  const [limit, setLimit] = useState('')
  const { data: supplyLimit, refetch: refetchSupplyLimit } = useGetSupplyLimit({
    yourStableCoinType: yourStableCoin.type,
  })
  const { mutate: updateSupplyLimit, isPending: isUpdatingSupplyLimit } =
    useSetSupplyLimit({
      yourStableCoinType: yourStableCoin.type,
      onBeforeStart: () => {
        setIsTransacting(true)
        toast.loading('Updating supply limit')
        const nId = notification.txLoading()
        setNotificationId(nId)
      },
      onSuccess: () => {
        toast.dismiss(notificationId)
        notification.txSuccess(`Supply limit updated`, notificationId)
        refetchSupplyLimit()
        setIsTransacting(false)
      },
      onError: (error) => {
        setIsTransacting(false)
        toast.dismiss(notificationId)
        notification.txError(error, error.message, notificationId)
      },
    })

  const isPending = isTransacting || isUpdatingSupplyLimit
  const isDisabled = isPending || !limit

  return (
    <Card variant="classic" className="my-2 w-full p-6">
      <Accordion
        type="single"
        collapsible
        value={isOpen ? 'advancedSettings' : ''}
        onValueChange={(value) => setIsOpen(value === 'advancedSettings')}
      >
        <AccordionItem value="advancedSettings">
          <AccordionTrigger className="w-full">
            <Flex align="center" gap="2" width="100%" justify="between">
              <Text className="text-md font-bold">Advance settings</Text>
              <ChevronDownIcon
                transform={isOpen ? 'rotate(180)' : 'rotate(0)'}
                className="mr-2 h-3 w-3 transition-transform duration-200"
              />
            </Flex>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <Flex direction="column" gap="4">
              <Text>{yourStableCoin.name} supply limit update</Text>
              <Flex gap="2" align="center">
                <TextField.Root
                  placeholder="Enter whole number (decimals not needed)"
                  className="text-xs"
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  style={{ flex: 1 }}
                />
                {yourStableCoin.name}
              </Flex>
              <Text>
                Current supply limit: {supplyLimit} {yourStableCoin.name}
              </Text>

              <Button
                variant="solid"
                size="3"
                className="cursor-pointer"
                color="blue"
                disabled={isDisabled}
                onClick={() => updateSupplyLimit(BigInt(limit))}
              >
                {isPending && (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update supply limit
              </Button>
            </Flex>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}

export default AdvanceSettings
