import { readFile, writeFile } from 'node:fs/promises'

const requested = process.argv[2]
if (requested !== 'broken' && requested !== 'repaired' && requested !== 'status') {
  process.stderr.write('usage: npm run demo:break, npm run demo:repair, or npm run demo:status\n')
  process.exitCode = 2
} else {
  const path = new URL('../src/demo/scenarios.ts', import.meta.url)
  const source = await readFile(path, 'utf8')
  const modeMatch = source.match(/CURRENT_SOURCE_MODE: SourceMode = '(broken|repaired)'/)
  const labelMatch = source.match(/CURRENT_SOURCE_LABEL = '([a-z-]+)'/)
  if (!modeMatch || !labelMatch) {
    throw new Error('could not find the demo source state declarations')
  }

  const currentMode = modeMatch[1]
  const currentLabel = labelMatch[1]
  if (requested === 'status') {
    process.stdout.write(`demo source: ${currentMode} (${currentLabel})\n`)
  } else if (currentMode === requested && currentLabel === `team-demo-${requested}`) {
    process.stdout.write(`demo source already ${requested} (${currentLabel})\n`)
  } else {
    const next = source
      .replace(
        `CURRENT_SOURCE_MODE: SourceMode = '${currentMode}'`,
        `CURRENT_SOURCE_MODE: SourceMode = '${requested}'`,
      )
      .replace(`CURRENT_SOURCE_LABEL = '${currentLabel}'`, `CURRENT_SOURCE_LABEL = 'team-demo-${requested}'`)
    await writeFile(path, next, 'utf8')
    process.stdout.write(`demo source changed from ${currentMode} to ${requested}\n`)
  }
}
