const fs = require('fs/promises')
const path = require('path')

async function copyAssets() {
  await fs.cp(path.resolve('src/assets'), path.resolve('dist/assets'), { recursive: true })
  console.log('Assets copied to dist')
}

copyAssets()
