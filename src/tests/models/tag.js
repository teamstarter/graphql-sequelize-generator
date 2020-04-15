'use strict'
module.exports = function (sequelize, DataTypes) {
  var Tag = sequelize.define(
    'tag',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    },
    {
      freezeTableName: true
    }
  )

  Tag.associate = function (models) {
    models.tag.belongsToMany(models.company, {
        as: 'companies',
        through: 'tagCompanyLink',
        foreignKey: 'tagId',
        otherKey: 'companyId'
      })
  }
  return Tag
}
