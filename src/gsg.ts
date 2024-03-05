#!/usr/bin/env node

import program from 'commander'
import synchronizeWithIntegromat from './scripts/synchronizeWithIntegromat'

program
  .command('export-to-integromat <configPath>')
  .description(
    'Synchronizes the given sequelize models to the integromat modules'
  )
  .action(async function (configPath) {
    let config: any = null
    try {
      config = require(configPath)
    } catch (e: any) {
      throw new Error('Could not load the given config.' + e.message)
    }

    if (!config) return

    const models = require(config.modelsPath)
    synchronizeWithIntegromat(models, config.token, config.appName)
  })

program.command('help', 'Display the help')

program.parse(process.argv)
