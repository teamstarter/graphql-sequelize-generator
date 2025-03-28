const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const session = sequelize.define(
    'session',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lastActiveAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: 'session',
      timestamps: true,
    }
  )

  session.associate = (models) => {
    session.belongsTo(models.user, {
      foreignKey: 'userId',
      as: 'user',
    })
  }

  return session
}
