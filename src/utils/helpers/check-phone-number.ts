function checkPhoneNumber(phoneNumber: string) {
  if (!phoneNumber && typeof phoneNumber !== 'string') {
    return false
  }

  const regex = /^[2-9]\d{2}-\d{3}-\d{4}$/
  return regex.test(phoneNumber)
}

export default checkPhoneNumber