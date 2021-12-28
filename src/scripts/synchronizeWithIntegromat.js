const axios = require('axios')

const addCreateModule = require('./addModules/addCreateModule')
const addDeleteModule = require('./addModules/addDeleteModule')
const addReadModule = require('./addModules/addReadModule')
const addUpdateModule = require('./addModules/addUpdateModule')

const addModules = {
  read: addReadModule,
  create: addCreateModule,
  update: addUpdateModule,
  delete: addDeleteModule
}

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1)
}

function synchronizeWithIntegromat(models, token) {
  Object.keys(models.sequelize.models).forEach(modelName => {
    if (models[modelName]) {
      ;['read', 'create', 'update', 'delete'].forEach(action => {
        const attributes = Object.keys(models[modelName].rawAttributes)
        const config = {
          method: 'get',
          url: `https://api.integromat.com/v1/app/test-app-894954/1/module/${action}${capitalize(
            modelName
          )}`,
          headers: {
            Authorization: `Token ${token}`,
            'x-imt-apps-sdk-version': '1.3.8'
          }
        }
        axios(config)
          .then(function(response) {
            console.log(`Module "${response.data.label}" already exists.`)
          })
          .catch(function(error) {
            console.log(error.response.data)
            if (error.response.data.code === 'IM005') {
              addModules[action](models, modelName, attributes, token)
            }
          })
      })
    }
  })
}

module.exports = synchronizeWithIntegromat

// console.log(models.company.rawAttributes.name.validate.isIn[0])
