const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')

const args = process.argv.slice(2)
const command = args[0]
const fileName = args[1]

if (!fileName || !command) {
  console.error('Usage: node record.js <command> <file-name>')
  process.exit(1)
}

if (command !== 'record') {
  console.error('Only "record" command is supported.')
  process.exit(1)
}

if (!fileName.endsWith('.spec.js')) {
  console.error('File name must end with .spec.js')
  process.exit(1)
}

const outputDir = path.join(__dirname, 'tests')
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

const outputPath = path.join(outputDir, fileName)

if (fs.existsSync(outputPath)) {
  console.error(`File already exists: ${outputPath}`)
  process.exit(1)
}

function convertToPlaywrightTest(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const lines = raw.split('\n')
  const actionLines = lines.filter(line => {
    const t = line.trim()
    return t.startsWith('await page.') || t.startsWith('await expect(')
  })
  const testName = path.basename(filePath, '.spec.js')
  const body = actionLines.map(l => '  ' + l.trim()).join('\n')
  const converted = `import { test, expect } from '@playwright/test';

test('${testName}', async ({ page }) => {
${body}
});
`
  fs.writeFileSync(filePath, converted, 'utf8')
  console.log('Script converted to Playwright test format.')
  return converted
}

function postToRails(testId, content, railsUrl) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ content })
    const url = new URL(`/api/record_callbacks/${testId}/script_content`, railsUrl)
    const lib = url.protocol === 'https:' ? https : http

    console.log(`Posting to: ${url.toString()}`)
    console.log(`Content length: ${payload.length}`)

    const req = lib.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      res => {
        let body = ''
        res.on('data', chunk => (body += chunk))
        res.on('end', () => {
          console.log(`Response status: ${res.statusCode}`)
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('✅ Script saved to Rails DB:', body)
            resolve()
          } else {
            reject(new Error(`Rails responded ${res.statusCode}: ${body}`))
          }
        })
      }
    )

    req.on('error', err => {
      console.error('Request error:', err.message)
      reject(err)
    })

    req.write(payload)
    req.end()
  })
}

console.log('Recording started...')

const playwrightProcess = spawn(
  'npx',
  ['playwright', 'codegen', '--target=javascript', `--output=${outputPath}`, 'about:blank'],
  { stdio: 'inherit', shell: true }
)

playwrightProcess.on('close', async (eCode) => {
  if (eCode !== 0 && eCode !== null) {
    console.error(`Recording failed. Exit code: ${eCode}`)
    process.exit(eCode)
  }

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
    console.error('No script file generated — nothing to save.')
    process.exit(1)
  }

  console.log('Converting to Playwright test format...')
  const converted = convertToPlaywrightTest(outputPath)

  const testId   = process.env.TEST_ID
  const railsUrl = process.env.RAILS_URL || 'http://localhost:3000'

  console.log(`TEST_ID: ${testId}`)
  console.log(`RAILS_URL: ${railsUrl}`)

  if (!testId) {
    console.error('❌ TEST_ID environment variable not set')
    process.exit(1)
  }

  try {
    await postToRails(testId, converted, railsUrl)
  } catch (err) {
    console.error('❌ Failed to save script to Rails:', err.message)
    process.exit(1)
  }

  console.log('✅ Done - script saved successfully')
  process.exit(0)
})

playwrightProcess.on('error', err => {
  console.error('Error starting Playwright:', err)
  process.exit(1)
})

process.on('SIGINT',  () => { playwrightProcess.kill(); process.exit(130) })
process.on('SIGTERM', () => { playwrightProcess.kill(); process.exit(143) })