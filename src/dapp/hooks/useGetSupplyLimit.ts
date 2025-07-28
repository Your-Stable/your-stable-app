import { useCurrentAccount } from '@mysten/dapp-kit'
import { useQuery } from '@tanstack/react-query'
import { getSupplyLimit } from '../helpers/transactions'
import useFactory from './useFactory'

const useGetSupplyLimit = ({
  yourStableCoinType,
}: {
  yourStableCoinType: string
}) => {
  const { data: factory } = useFactory(yourStableCoinType)
  const account = useCurrentAccount()
  return useQuery({
    queryKey: ['supply-limit', yourStableCoinType],
    queryFn: async () => {
      if (!factory) throw new Error('Factory not found')
      if (!account) {
        throw new Error('Account not found')
      }
      const supplyLimit = await getSupplyLimit(yourStableCoinType, factory)

      return supplyLimit
    },
    enabled: !!factory && !!account,
  })
}

export default useGetSupplyLimit
