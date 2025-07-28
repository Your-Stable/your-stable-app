import { useSuiClient } from '@mysten/dapp-kit'
import { useQuery } from '@tanstack/react-query'
import { getFactoryCap } from '../helpers/transactions'
import useFactory from './useFactory'

const useGetFactoryCapOwner = ({
  yourStableCoinType,
}: {
  yourStableCoinType: string
}) => {
  const suiClient = useSuiClient()
  const { data: factory } = useFactory(yourStableCoinType)
  return useQuery({
    queryKey: ['factory-cap', yourStableCoinType],
    queryFn: async () => {
      if (!factory) throw new Error('Factory not found')
      const cap = await getFactoryCap(factory)
      const object = await suiClient.getObject({
        id: cap,
        options: {
          showOwner: true,
        },
      })
      return (object.data?.owner as { AddressOwner: string })?.AddressOwner
    },
  })
}

export default useGetFactoryCapOwner
