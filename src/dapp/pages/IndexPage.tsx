import { FC, useState } from 'react'
import Layout from '~~/components/layout/Layout'
import MintRedeemForm from '~~/dapp/components/MintRedeemForm'
import NetworkSupportChecker from '../../components/NetworkSupportChecker'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import CustomConnectButton from '~~/components/CustomConnectButton'
import useGetClaimableAccount from '../hooks/useGetClaimableAccount'
import { COINS, YOUR_STABLE_COINS } from '../config'
import ClaimForm from '../components/ClaimForm'

const IndexPage: FC = () => {
  const currentAccount = useCurrentAccount()
  const [yourStableCoin, setYourStableCoin] = useState<COINS>(
    YOUR_STABLE_COINS[0]
  )
  const { data: claimableAccounts } = useGetClaimableAccount({
    suiClient: useSuiClient(),
    yourStableCoinType: yourStableCoin.type,
  })
  const canClaim =
    currentAccount?.address &&
    Array.isArray(claimableAccounts) &&
    claimableAccounts?.length > 0 &&
    claimableAccounts.includes(currentAccount?.address)

  return (
    <Layout>
      <NetworkSupportChecker />
      <div className="justify-content flex flex-grow flex-col items-center justify-center rounded-md p-3">
        {currentAccount ? (
          <>
            <MintRedeemForm
              yourStableCoin={yourStableCoin}
              setYourStableCoin={setYourStableCoin}
            />
            {canClaim && <ClaimForm yourStableCoin={yourStableCoin} />}
          </>
        ) : (
          <CustomConnectButton />
        )}
      </div>
    </Layout>
  )
}

export default IndexPage
