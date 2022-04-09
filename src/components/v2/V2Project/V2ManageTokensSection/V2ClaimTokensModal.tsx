import { t, Trans } from '@lingui/macro'
import { Form, Space } from 'antd'
import FormattedAddress from 'components/shared/FormattedAddress'
import InputAccessoryButton from 'components/shared/InputAccessoryButton'
import FormattedNumberInput from 'components/shared/inputs/FormattedNumberInput'
import { ThemeContext } from 'contexts/themeContext'
import * as constants from '@ethersproject/constants'
import { useContext, useLayoutEffect, useState } from 'react'
import { formatWad, fromWad, parseWad } from 'utils/formatNumber'
import TransactionModal from 'components/shared/TransactionModal'
import { V2ProjectContext } from 'contexts/v2/projectContext'
import { useClaimTokensTx } from 'hooks/v2/transactor/ClaimTokensTx'
import useUserUnclaimedTokenBalance from 'hooks/v2/contractReader/UserUnclaimedTokenBalance'

export default function V2ClaimTokensModal({
  visible,
  onCancel,
}: {
  visible?: boolean
  onCancel?: VoidFunction
}) {
  const [loading, setLoading] = useState<boolean>()
  const [transactionPending, setTransactionPending] = useState<boolean>()
  const [claimAmount, setClaimAmount] = useState<string>()
  const {
    theme: { colors },
  } = useContext(ThemeContext)
  const { tokenSymbol, tokenAddress } = useContext(V2ProjectContext)
  const claimTokensTx = useClaimTokensTx()

  const { data: unclaimedBalance } = useUserUnclaimedTokenBalance()

  useLayoutEffect(() => {
    setClaimAmount(fromWad(unclaimedBalance))
  }, [unclaimedBalance])

  function unstake() {
    if (
      !claimAmount ||
      parseWad(claimAmount).eq(0) // Disable claiming 0 tokens
    )
      return

    setLoading(true)

    claimTokensTx(
      { claimAmount: parseWad(claimAmount) },
      {
        onDone: () => {
          setTransactionPending(true)
          setLoading(false)
        },
        onConfirmed: () => {
          setTransactionPending(false)
          if (onCancel) onCancel()
        },
      },
    )
  }

  const ticketsIssued = tokenAddress
    ? tokenAddress !== constants.AddressZero
    : false

  return (
    <TransactionModal
      title={`Claim ${tokenSymbol ?? 'tokens'} as ERC-20 tokens`}
      visible={visible}
      onOk={unstake}
      okText={`Claim ${claimAmount} ERC-20 tokens`}
      confirmLoading={loading}
      transactionPending={transactionPending}
      okButtonProps={{ disabled: parseWad(claimAmount).eq(0) }}
      onCancel={onCancel}
      width={600}
      centered
    >
      <Space direction="vertical" size="large">
        {!ticketsIssued && (
          <div style={{ padding: 10, background: colors.background.l1 }}>
            <Trans>
              <b>Note:</b> Tokens cannot be claimed because no ERC-20 token has
              been issued for this project. ERC-20 tokens must be issued by the
              project owner.
            </Trans>
          </div>
        )}

        <div>
          <p>
            <Trans>
              Claiming {tokenSymbol} tokens will convert your {tokenSymbol}{' '}
              balance to ERC-20 tokens and mint them to your wallet.
            </Trans>
          </p>
          <p style={{ fontWeight: 600 }}>
            <Trans>
              If you're unsure if you need to claim, you probably don't.
            </Trans>
          </p>
          <p>
            <Trans>
              You can still redeem your {tokenSymbol} tokens for overflow
              without claiming them, and you can transfer your unclaimed{' '}
              {tokenSymbol} tokens to another address from the Tools menu, which
              can be accessed from the wrench icon in the upper right hand
              corner of this project.
            </Trans>
          </p>
        </div>

        <div>
          <div>
            <Trans>
              <label>Your unclaimed {tokenSymbol} tokens:</label>{' '}
              {formatWad(unclaimedBalance, { precision: 8 })}
            </Trans>
          </div>
          {ticketsIssued && (
            <div>
              <Trans>
                <label>{tokenSymbol} ERC-20 address:</label>{' '}
                <FormattedAddress address={tokenAddress} />
              </Trans>
            </div>
          )}
        </div>

        <Form layout="vertical">
          <Form.Item label={t`Amount of ERC-20 tokens to claim`}>
            <FormattedNumberInput
              min={0}
              max={parseFloat(fromWad(unclaimedBalance))}
              disabled={!ticketsIssued}
              placeholder="0"
              value={claimAmount}
              accessory={
                <InputAccessoryButton
                  content={t`MAX`}
                  onClick={() => setClaimAmount(fromWad(unclaimedBalance))}
                />
              }
              onChange={val => setClaimAmount(val)}
            />
          </Form.Item>
        </Form>
      </Space>
    </TransactionModal>
  )
}
