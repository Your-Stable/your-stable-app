import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { getTotalMinted } from '../helpers/transactions'
import useFactory from './useFactory'

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
  const { data: factory } = useFactory(yourStableCoinType)
  return useQuery({
    queryKey: ['total-minted', yourStableCoinType],
    queryFn: async () => {
      if (!factory) throw new Error('Factory not found')
      const totalMinted = await getTotalMinted(yourStableCoinType, factory)
      return totalMinted
    },
    ...options,
    enabled: !!factory && !!yourStableCoinType,
  })
}

export default useGetTotalMinted
