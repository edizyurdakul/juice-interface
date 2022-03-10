import { Trans } from '@lingui/macro'
import { Button, Col, Row } from 'antd'
import PayInput from 'components/shared/inputs/Pay/PayInput'
import ProjectHeader from 'components/shared/ProjectHeader'
import { V2ProjectContext } from 'contexts/v2/projectContext'
import { BigNumber } from 'ethers'
import { useContext, useState } from 'react'
import { fromPermille, fromWad } from 'utils/formatNumber'
import {
  deserializeV2FundingCycleMetadata,
  serializeV2FundingCycleMetadata,
} from 'utils/v2/serializers'

import V2PayButton from './Pay/V2PayButton'
import V2ReconfigureModal from './V2ReconfigureModal'

export default function V2Project() {
  const [reconfigureModalVisible, setReconfigureModalVisible] =
    useState<boolean>(false)
  const {
    projectId,
    projectMetadata,
    fundingCycle,
    payoutSplits,
    reserveTokenSplits,
    ETHBalance,
  } = useContext(V2ProjectContext)

  if (!projectId) return null

  const start = fundingCycle?.start
    ? new Date(fundingCycle?.start?.mul(1000).toNumber())
    : null

  const end =
    fundingCycle?.start && fundingCycle?.duration
      ? new Date(
          fundingCycle?.start.add(fundingCycle?.duration).mul(1000).toNumber(),
        )
      : null

  const reservedRate = 0 // todo get this from v2fundingcyclemetadata
  const weight = fundingCycle?.weight
  return (
    <>
      <Row>
        <ProjectHeader metadata={projectMetadata} />
      </Row>
      <Row>
        <Col md={12} xs={24}>
          <h2>Volume: {fromWad(ETHBalance)}</h2>

          {fundingCycle && (
            <div>
              <h2>Funding Cycle details</h2>
              <ul>
                <li>FC#{fundingCycle?.number.toNumber()}</li>
                <li>
                  Discount rate: {fromPermille(fundingCycle.discountRate)}%
                </li>
                <li>Start: {start?.toISOString()}</li>
                <li>End: {end?.toISOString()}</li>
                <li>Weight: {fromWad(fundingCycle.weight)}</li>
                <li>Metadata: {fundingCycle?.metadata.toString()}</li>
              </ul>

              <h3>ETH payouts</h3>
              <ul>
                {payoutSplits?.map(split => (
                  <li>{split.beneficiary}</li>
                ))}
              </ul>

              <h3>Reserve token allocation</h3>
              <ul>
                {reserveTokenSplits?.map(split => (
                  <li>{split.beneficiary}</li>
                ))}
              </ul>
            </div>
          )}
          <Button onClick={() => setReconfigureModalVisible(true)}>
            <Trans>Reconfigure project</Trans>
          </Button>
          <V2ReconfigureModal
            visible={reconfigureModalVisible}
            onOk={() => setReconfigureModalVisible(false)}
          />
        </Col>
        <Col md={12} xs={24}>
          <PayInput
            PayButton={V2PayButton}
            reservedRate={reservedRate}
            weight={weight}
          />
        </Col>
      </Row>
    </>
  )
}
