import { useSuiClient } from '@mysten/dapp-kit'
import { useQuery } from '@tanstack/react-query'
import { getFactoryCap } from '../helpers/transactions'

const useGetFactoryCapOwner = ({
  yourStableCoinType,
}: {
  yourStableCoinType: string
}) => {
  const suiClient = useSuiClient()
  return useQuery({
    queryKey: ['factory-cap', yourStableCoinType],
    queryFn: async () => {
      const cap = await getFactoryCap({
        suiClient,
        yourStableCoinType,
      })
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
