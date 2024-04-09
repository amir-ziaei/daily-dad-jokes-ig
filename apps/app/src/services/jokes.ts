export async function getRandomDadJoke() {
  const response = await fetch('https://icanhazdadjoke.com/', {
    headers: { Accept: 'text/plain' },
  })
  return (await response.text()).trim()
}
