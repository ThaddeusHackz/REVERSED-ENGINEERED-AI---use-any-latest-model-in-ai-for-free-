import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import chromium, { inflate, setupLambdaEnvironment } from '@sparticuz/chromium'
import { chromium as playwright } from 'playwright-core'

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const outputDir = new URL('../.cache/screenshots/', import.meta.url)
await mkdir(outputDir, { recursive: true })

// The minimal development container is Debian rather than Amazon Linux, so
// load the runtime libraries bundled with Chromium explicitly.
if (!existsSync(join(tmpdir(), 'al2023', 'lib', 'libnspr4.so'))) {
  await inflate(join(process.cwd(), 'node_modules/@sparticuz/chromium/bin/al2023.tar.br'))
}
setupLambdaEnvironment(join(tmpdir(), 'al2023', 'lib'))

const browser = await playwright.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  headless: true,
})
const runtimeErrors = []
const consoleErrors = []
const results = []

async function makePage(viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 })
  page.on('pageerror', error => runtimeErrors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  return page
}

async function capture(page, name, fullPage = false) {
  await page.screenshot({ path: new URL(`${name}.png`, outputDir).pathname, fullPage })
  results.push(await page.evaluate(() => ({
    page: location.pathname,
    title: document.title,
    viewport: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    text: document.querySelector('h1')?.textContent ?? '',
  })))
}

try {
  const desktop = await makePage({ width: 1440, height: 1000 })
  await desktop.goto(baseUrl, { waitUntil: 'networkidle' })
  await desktop.locator('.hero-title').waitFor()
  await capture(desktop, 'landing-desktop')
  await desktop.screenshot({ path: new URL('landing-full.png', outputDir).pathname, fullPage: true })

  await desktop.goto(`${baseUrl}/app`, { waitUntil: 'domcontentloaded' })
  await desktop.locator('.chat-empty h1').waitFor()
  await desktop.waitForTimeout(1800)
  await capture(desktop, 'studio-desktop')

  await desktop.getByRole('button', { name: 'Images', exact: true }).click()
  await desktop.locator('.capability-header h1').waitFor()
  await capture(desktop, 'images-desktop')
  await desktop.getByRole('button', { name: 'Audio', exact: true }).click()
  await desktop.locator('.capability-tabs').waitFor()
  await desktop.getByRole('button', { name: 'Speech to text', exact: true }).click()
  results.push({ audioTab: await desktop.locator('.capability-tabs .active').textContent() })

  // This Chromium build runs in single-process mode; resize the same page
  // instead of closing the last tab and opening a new browser context.
  const mobile = desktop
  await mobile.setViewportSize({ width: 390, height: 844 })
  await mobile.goto(baseUrl, { waitUntil: 'networkidle' })
  await capture(mobile, 'landing-mobile')
  await mobile.goto(`${baseUrl}/app`, { waitUntil: 'domcontentloaded' })
  await mobile.locator('.chat-empty h1').waitFor()
  await capture(mobile, 'studio-mobile')
  await mobile.getByRole('button', { name: 'Open sidebar' }).click()
  await mobile.locator('.studio-sidebar.is-open').waitFor()
  await mobile.waitForTimeout(300)
  await mobile.screenshot({ path: new URL('studio-mobile-sidebar.png', outputDir).pathname })
} finally {
  await browser.close()
}

const report = { results, runtimeErrors, consoleErrors }
await writeFile(new URL('report.json', outputDir), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
if (runtimeErrors.length) process.exitCode = 1
