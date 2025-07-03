import { useQuery } from '@tanstack/react-query'
import { BucketClient } from 'bucket-protocol-sdk'

const useGetPrice = () => {
  return useQuery({
    queryKey: ['price'],
    queryFn: async () => {
      const bucketClient = new BucketClient()
      const prices = await bucketClient.getPrices()
      return prices
    },
    staleTime: 1000 * 30,
  })
}

export default useGetPrice
