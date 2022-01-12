import { BigNumber } from '@ethersproject/bignumber'
import { formatWad } from 'utils/formatNumber'
import { parseEther } from 'ethers/lib/utils'
import { useCurrencyConverter } from 'hooks/CurrencyConverter'
import { currencyName } from 'utils/currency'
import { weightedRate } from 'utils/math'
import { t, Trans } from '@lingui/macro'
import { CurrencyOption } from 'models/currency-option'
import { useContext, useMemo } from 'react'

import { ProjectContext } from 'contexts/projectContext'

import { CURRENCY_ETH } from 'constants/currency'

/**
 * Help text shown below the Pay input field.
 *
 * If the user has entered an amount, display
 * the amount of project tokens they will recieve.
 *
 * Else, display the exchange rate of the user selected currency to project token.
 */
export default function InputSubText({
  payInCurrrency,
  weiPayAmt,
}: {
  payInCurrrency: CurrencyOption
  weiPayAmt: BigNumber | undefined
}) {
  const { currentFC, tokenSymbol } = useContext(ProjectContext)
  const converter = useCurrencyConverter()

  const tokenText = tokenSymbol ?? t`tokens`

  const receiveText = useMemo(() => {
    const formatReceivedTickets = (wei: BigNumber) => {
      const exchangeRate = weightedRate(currentFC, wei, 'payer')
      return formatWad(exchangeRate, { precision: 0 })
    }

    if (weiPayAmt?.gt(0)) {
      return `${formatReceivedTickets(weiPayAmt)} ${tokenText}`
    }

    const receivedTickets = formatReceivedTickets(
      (payInCurrrency === CURRENCY_ETH
        ? parseEther('1')
        : converter.usdToWei('1')) ?? BigNumber.from(0),
    )
    return `${receivedTickets} ${tokenText}/${currencyName(payInCurrrency)}`
  }, [converter, payInCurrrency, tokenText, weiPayAmt, currentFC])

  return (
    <div style={{ fontSize: '.7rem' }}>
      <span>
        <Trans>Receive {receiveText}</Trans>
      </span>
    </div>
  )
}