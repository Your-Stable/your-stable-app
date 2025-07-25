import { FC, useState } from 'react'
import Layout from '~~/components/layout/Layout'
import MintRedeemForm from '~~/dapp/components/MintRedeemForm'
import NetworkSupportChecker from '../../components/NetworkSupportChecker'
import { useCurrentAccount } from '@mysten/dapp-kit'
import CustomConnectButton from '~~/components/CustomConnectButton'
import useGetClaimableAccount from '../hooks/useGetClaimableAccount'
import { COINS, YOUR_STABLE_COINS } from '../config'
import ClaimForm from '../components/ClaimForm'
import AdvanceSettings from '../components/AdvanceSettings'
import useGetFactoryCapOwner from '../hooks/useGetFactoryCapOwner'

const IndexPage: FC = () => {
  const currentAccount = useCurrentAccount()

  const userAddress = currentAccount?.address

  const [yourStableCoin, setYourStableCoin] = useState<COINS>(
    YOUR_STABLE_COINS[0]
  )
  const { data: claimableAccounts } = useGetClaimableAccount({
    yourStableCoinType: yourStableCoin.type,
  })

  const { data: factoryCapOwner } = useGetFactoryCapOwner({
    yourStableCoinType: yourStableCoin.type,
  })

  const hasFactoryCapOwner = !!factoryCapOwner
  const hasUserAddress = !!userAddress

  const canClaim = hasUserAddress && claimableAccounts?.includes(userAddress)

  const hasFactoryCapPermission =
    hasFactoryCapOwner && hasUserAddress && factoryCapOwner === userAddress

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
            {hasFactoryCapPermission && (
              <AdvanceSettings yourStableCoin={yourStableCoin} />
            )}
          </>
        ) : (
          <CustomConnectButton />
        )}
      </div>
    </Layout>
  )
}

export default IndexPage
