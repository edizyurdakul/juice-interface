import { Tooltip } from 'antd'
import CurrencySymbol from 'components/shared/CurrencySymbol'
import Loading from 'components/shared/Loading'
import ProjectLogo from 'components/shared/ProjectLogo'

import { ThemeContext } from 'contexts/themeContext'
import { constants } from 'ethers'
import { useProjectMetadata } from 'hooks/ProjectMetadata'
import { TrendingProject } from 'models/subgraph-entities/project'
import { CSSProperties, useContext, useMemo } from 'react'
import { formatWad } from 'utils/formatNumber'
import { getTerminalVersion } from 'utils/terminal-versions'

import { trendingWindowDays } from 'constants/trending-projects'
import { SECONDS_IN_DAY } from 'constants/numbers'
import { CURRENCY_ETH } from 'constants/currency'

export default function TrendingProjectCard({
  project,
  size,
  bg,
  rank,
}: {
  project: TrendingProject
  size?: 'sm' | 'lg'
  bg?: string // Used on homepage
  rank: number
}) {
  const {
    theme: { colors, radii },
  } = useContext(ThemeContext)

  const cardStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'pre',
    overflow: 'hidden',
    padding: '25px 20px',
    backgroundColor: bg,
    // Shows darker border when background is set
    border: `1px solid ${
      bg ? colors.stroke.secondary : colors.stroke.tertiary
    }`,
  }

  const rankStyle: CSSProperties = {
    fontSize: 22,
    color: colors.text.primary,
    fontWeight: 400,
    marginRight: 15,
    width: 25,
    textAlign: 'center',
  }

  const { data: metadata } = useProjectMetadata(project?.uri)

  const terminalVersion = getTerminalVersion(project?.terminal)

  // If the total paid is greater than 0, but less than 10 ETH, show two decimal places.
  const precision =
    project.trendingVolume?.gt(0) &&
    project.trendingVolume.lt(constants.WeiPerEther)
      ? 2
      : 0

  const percentGainText = useMemo(() => {
    if (
      project.createdAt &&
      project.createdAt >
        new Date().valueOf() / 1000 - trendingWindowDays * SECONDS_IN_DAY
    ) {
      return 'New'
    }

    const preTrendingVolume = project.totalPaid?.sub(project.trendingVolume)

    if (!preTrendingVolume?.gt(0)) return '+∞'

    const percentGain = project.trendingVolume
      .mul(1000)
      .div(preTrendingVolume)
      .toNumber()

    return `+${
      percentGain >= 10 ? Math.round(percentGain / 10) : percentGain / 10
    }%`
  }, [project])

  return project ? (
    <a
      style={{
        borderRadius: radii.lg,
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      key={project?.handle}
      href={`/#/p/${project?.handle}`}
    >
      {metadata ? (
        <div style={cardStyle} className="clickable-border">
          <div
            style={{ marginRight: 20, display: 'flex', alignItems: 'center' }}
          >
            <div style={rankStyle}>{rank}</div>
            <ProjectLogo
              uri={metadata.logoUri}
              name={metadata.name}
              size={size === 'sm' ? 70 : 110}
            />
          </div>

          <div
            style={{
              flex: 1,
              minWidth: 0,
              fontWeight: 400,
            }}
          >
            <h2
              style={{
                color: colors.text.primary,
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: size === 'sm' ? 16 : 21,
              }}
            >
              {metadata.name}
            </h2>

            {size === 'sm' ? null : (
              <div>
                <span style={{ color: colors.text.primary, fontWeight: 500 }}>
                  @{project?.handle}
                </span>
                <span
                  style={{
                    marginLeft: 10,
                    color: colors.text.tertiary,
                    fontSize: '0.7rem',
                    fontWeight: 500,
                  }}
                >
                  V{terminalVersion}
                </span>
              </div>
            )}

            <div
              style={{
                color: colors.text.primary,
                display: 'flex',
                flexWrap: 'wrap',
                width: '100%',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  {project.trendingPaymentsCount} payment
                  {project.trendingPaymentsCount > 1 ? 's' : ''}
                </span>
                <span style={{ fontWeight: 500 }}>
                  {' '}
                  <CurrencySymbol currency={CURRENCY_ETH} />
                  {formatWad(project.trendingVolume, { precision })}{' '}
                  {percentGainText && <>({percentGainText})</>}
                </span>
              </span>
            </div>

            {metadata.description && (
              <Tooltip title={metadata.description} placement="bottom">
                <div
                  style={{
                    maxHeight: 20,
                    color: colors.text.tertiary,
                    fontWeight: 500,
                    fontSize: size === 'sm' ? 13 : 14,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {metadata.description}
                </div>
              </Tooltip>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {project?.handle} <Loading />
        </div>
      )}
    </a>
  ) : (
    <Loading />
  )
}
