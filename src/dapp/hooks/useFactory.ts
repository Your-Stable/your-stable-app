import { useSuiClient } from '@mysten/dapp-kit'
import { useQuery } from '@tanstack/react-query'
import { YourStableClient } from 'your-stable-sdk'

const useFactory = (coinType: string) => {
  const suiClient = useSuiClient()
  return useQuery({
    queryKey: ['factory', coinType],
    queryFn: () => YourStableClient.initialize(suiClient, coinType),
  })
}

export default useFactory
