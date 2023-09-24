function checkEmailAddress(emailAddress: string) {
  if (!emailAddress && typeof emailAddress !== 'string') {
    return false
  }

  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
  return regex.test(emailAddress)
}

export default checkEmailAddress