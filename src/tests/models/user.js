'use strict'
module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define(
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
      },
      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      freezeTableName: true
    }
  )

  User.associate = function(models) {
    // associations can be defined here
    models.user.belongsTo(models.company)
    models.user.belongsTo(models.department)
    models.user.hasMany(models.company, {
      as: 'managedCompanies',
      foreignKey: 'managerId'
    })
  }
  return User
}
