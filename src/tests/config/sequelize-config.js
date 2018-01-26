module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './src/tests/data/main.db',
    logging: false,
    operatorsAliases: false
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    operatorsAliases: false
  }
}
