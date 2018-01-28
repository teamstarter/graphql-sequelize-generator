'use strict'
module.exports = function (sequelize, DataTypes) {
  var Department = sequelize.define(
    'department',
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

  Department.associate = function (models) {
    models.department.belongsTo(models.company)
    models.department.hasMany(models.user)
  }
  return Department
}
