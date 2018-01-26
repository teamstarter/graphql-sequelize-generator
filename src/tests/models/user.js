'use strict'
module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define(
    'user',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      freezeTableName: true
    }
  )

  User.associate = function (models) {
    // associations can be defined here
    models.user.belongsTo(models.company)
  }
  return User
}
