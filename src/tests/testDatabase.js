const path = require('path')
const fs = require('fs')
const Umzug = require('umzug')
const models = require('./models')
const sequelize = models.sequelize

const umzugOptions = (path) => ({
  storage: 'sequelize',
  storageOptions: {
    sequelize,
  },
  migrations: {
    params: [
      sequelize.getQueryInterface(), // queryInterface
      sequelize.constructor, // DataTypes
      function () {
        throw new Error(
          'Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.'
        )
      },
    ],
    path,
    pattern: /\.js$/,
  },
})

// Array containing the filenames of the migrations files without extensions, sorted chronologically.
const migrationFiles = fs
  .readdirSync('./src/tests/migrations/')
  .sort()
  .map((f) => path.basename(f, '.js'))

// Array containing the filenames of the seeders files without extensions, sorted chronologically.
const seederFiles = fs
  .readdirSync('./src/tests/seeders/')
  .sort()
  .map((f) => path.basename(f, '.js'))

// Instances of Umzug for migrations and seeders
const umzugMigrations = new Umzug(umzugOptions('./src/tests/migrations'))
const umzugSeeders = new Umzug(umzugOptions('./src/tests/seeders'))

exports.migrateDatabase = () =>
  umzugMigrations.up({
    migrations: migrationFiles,
  })

exports.seedDatabase = () =>
  umzugSeeders.up({
    migrations: seederFiles,
  })

exports.deleteTables = () => sequelize.getQueryInterface().dropAllTables()
