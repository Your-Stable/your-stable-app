import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { useQuery } from '@tanstack/react-query'
import { getSupplyLimit } from '../helpers/transactions'

const useGetSupplyLimit = ({
  yourStableCoinType,
}: {
  yourStableCoinType: string
}) => {
  const suiClient = useSuiClient()
  const account = useCurrentAccount()
  return useQuery({
    queryKey: ['supply-limit', yourStableCoinType],
    queryFn: async () => {
      if (!account) {
        throw new Error('Account not found')
      }
      const supplyLimit = await getSupplyLimit({
        suiClient,
        yourStableCoinType,
      })

      return supplyLimit
    },
    enabled: !!account,
  })
}

export default useGetSupplyLimit
