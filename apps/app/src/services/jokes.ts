import * as cheerio from 'cheerio'

export async function getRandomDadJoke() {
  const response = await fetch('https://icanhazdadjoke.com/')
  const html = await response.text()
  const $ = cheerio.load(html)
  return $('.card-content p.subtitle').text().trim()
}
