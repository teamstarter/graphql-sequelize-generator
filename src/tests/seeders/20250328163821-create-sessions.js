module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Running session seeder')
    const now = new Date()
    await queryInterface.bulkInsert('session', [
      {
        userId: 1,
        lastActiveAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: 2,
        lastActiveAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ])
    console.log('Session seeder completed')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('session', null, {})
  },
}
