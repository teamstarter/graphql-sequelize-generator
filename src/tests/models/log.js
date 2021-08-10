'use strict'

module.exports = function(sequelize, DataTypes) {
  const Log = sequelize.define(
    'log',
    {
      message: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      freezeTableName: true
    }
  )
  return Log
}
