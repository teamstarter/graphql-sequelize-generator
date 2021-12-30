import axios from 'axios'
import { capitalize } from '../synchronizeWithIntegromat'

export default async function addCreateModule(
  models: any,
  modelName: string,
  attributes: any,
  token: any,
  appName: string
) {
  const variable: any = {}
  let returnAttrinutes = ''
  attributes.forEach((attribute: string) => {
    if (
      !['createdAt', 'updatedAt', 'deletedAt', 'id'].includes(attribute) &&
      models[modelName].rawAttributes[attribute].type.constructor.key !==
        'VIRTUAL'
    ) {
      variable[attribute] = `{{${attribute}}}`
    }
    returnAttrinutes += `${attribute}\n    `
  })

  const data = JSON.stringify({
    name: `create${capitalize(modelName)}`,
    label: `Create ${capitalize(modelName)}`,
    type_id: 4,
    crud: 'create',
    description: `The create endpoint for the ${capitalize(modelName)}`
  })

  const config: any = {
    method: 'post',
    url: `https://api.integromat.com/v1/app/${appName}/1/module`,
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
      'x-imt-apps-sdk-version': '1.0.0'
    },
    data: data
  }

  try {
    const response = await axios(config)
    console.log(JSON.stringify(response.data))

    const queryString = JSON.stringify({
      url: '/platform/graphql',
      method: 'POST',
      qs: {},
      body: {
        operationName: `create${capitalize(modelName)}`,
        variables: {
          [modelName]: variable
        },
        query: `mutation create${capitalize(
          modelName
        )}($${modelName}: ${modelName}Input!) {\n  ${modelName}Create(${modelName}: $${modelName}) {\n    ${returnAttrinutes}__typename\n  }\n}\n`
      },
      headers: {
        authorization: '{{connection.token}}'
      },
      response: {
        output: '{{body}}'
      }
    })

    const configApi: any = {
      method: 'put',
      url: `https://api.integromat.com/v1/app/${appName}/1/module/create${capitalize(
        modelName
      )}/api`,
      headers: {
        Authorization: `Token ${token}`,
        'x-imt-apps-sdk-version': '1.0.0',
        'Content-Type': 'application/jsonc'
      },
      data: queryString
    }

    try {
      const response = await axios(configApi)
      console.log(JSON.stringify(response.data))
    } catch (error) {
      console.log(error.response.data)
    }

    const parameters = Object.keys(variable).map(attribute => {
      const attributeObject = models[modelName].rawAttributes[attribute]
      const parameter: any = {
        name: attribute,
        type: models[modelName].rawAttributes[attribute].type.constructor.key,
        label: capitalize(attribute),
        required: !models[modelName].rawAttributes[attribute].allowNull
      }

      if (attributeObject.validate && attributeObject.validate.isIn) {
        parameter['type'] = 'select'
        parameter['options'] = attributeObject.validate.isIn[0].map(
          (valid: any) => ({
            label: String(valid),
            value: valid
          })
        )
      }
      return parameter
    })

    const configExpect: any = {
      method: 'put',
      url: `https://api.integromat.com/v1/app/${appName}/1/module/create${capitalize(
        modelName
      )}/expect`,
      headers: {
        Authorization: `Token ${token}`,
        'x-imt-apps-sdk-version': '1.0.0',
        'Content-Type': 'application/jsonc'
      },
      data: JSON.stringify(parameters)
    }

    try {
      const response = await axios(configExpect)
      console.log(JSON.stringify(response.data))
    } catch (error) {
      console.log(error.response.data)
    }
  } catch (error) {
    console.log(error.response.data)
  }
}
