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
