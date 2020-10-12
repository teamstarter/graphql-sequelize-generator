'use strict'

module.exports = function(sequelize, DataTypes) {
  let Log = sequelize.define(
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
