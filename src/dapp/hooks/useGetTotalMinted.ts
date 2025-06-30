import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { getTotalMinted } from '../helpers/transactions'
import { useSuiClient } from '@mysten/dapp-kit'

type UseGetTotalMintedProps = Omit<
  UseQueryOptions<string, Error, string>,
  'queryKey' | 'queryFn'
> & {
  yourStableCoinType: string
}

const useGetTotalMinted = ({
  yourStableCoinType,
  ...options
}: UseGetTotalMintedProps) => {
  const suiClient = useSuiClient()
  return useQuery({
    queryKey: ['total-minted', yourStableCoinType],
    queryFn: async () => {
      const totalMinted = await getTotalMinted({
        suiClient,
        yourStableCoinType,
      })
      return totalMinted
    },
    ...options,
    enabled: !!suiClient && !!yourStableCoinType,
  })
}

export default useGetTotalMinted
