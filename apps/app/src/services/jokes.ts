export async function getRandomDadJoke() {
  const response = await fetch('https://icanhazdadjoke.com/', {
    headers: {
      Accept: 'text/plain',
      'User-Agent':
        'daily-dad-jokes-ig (https://github.com/amir-ziaei/daily-dad-jokes-ig)',
    },
  })
  return (await response.text()).trim()
}
