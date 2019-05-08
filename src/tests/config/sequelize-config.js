module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './src/tests/data/main.db',
    logging: false
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  }
}
