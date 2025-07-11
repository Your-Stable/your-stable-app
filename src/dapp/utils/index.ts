export const formatBalance = (
  balance: bigint | number | string,
  decimals?: number
) => {
  const balanceNumber = Number(balance)
  if (decimals == null) {
    return Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(balanceNumber)
  }
  return Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(balanceNumber / 10 ** decimals)
}

export const formatPercentage = (value: number) => {
  return Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value)
}

export const formatTimestamp = (timestamp: number) => {
  return Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}
