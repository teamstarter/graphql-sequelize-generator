import axios from 'axios'
import { capitalize } from '../synchronizeWithIntegromat'

export default function addDeleteModule(
  models: any,
  modelName: any,
  attributes: any,
  token: any
) {
  const data = JSON.stringify({
    name: `delete${capitalize(modelName)}`,
    label: `Delete ${capitalize(modelName)}`,
    type_id: 4,
    crud: 'delete',
    description: `The delete endpoint for the ${capitalize(modelName)}`
  })

  const config: any = {
    method: 'post',
    url: `https://api.integromat.com/v1/app/test-app-894954/1/module`,
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
      'x-imt-apps-sdk-version': '1.0.0'
    },
    data: data
  }

  axios(config)
    .then(function(response) {
      console.log(JSON.stringify(response.data))

      const queryString = JSON.stringify({
        url: '/platform/graphql',
        method: 'POST',
        qs: {},
        body: {
          operationName: `delete${capitalize(modelName)}`,
          variables: {
            id: '{{id}}'
          },
          query: `mutation delete${capitalize(
            modelName
          )}($id: Int!) {\n  ${modelName}Delete(id: $id) \n}\n`
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
        url: `https://api.integromat.com/v1/app/test-app-894954/1/module/delete${capitalize(
          modelName
        )}/api`,
        headers: {
          Authorization: `Token ${token}`,
          'x-imt-apps-sdk-version': '1.0.0',
          'Content-Type': 'application/jsonc'
        },
        data: queryString
      }

      axios(configApi)
        .then(function(response) {
          console.log(JSON.stringify(response.data))
        })
        .catch(function(error) {
          console.log(error)
        })

      const parameters = [
        {
          name: 'id',
          type: 'integer',
          label: `${modelName} Id`,
          required: true
        }
      ]

      const configExpect: any = {
        method: 'put',
        url: `https://api.integromat.com/v1/app/test-app-894954/1/module/delete${capitalize(
          modelName
        )}/expect`,
        headers: {
          Authorization: `Token ${token}`,
          'x-imt-apps-sdk-version': '1.0.0',
          'Content-Type': 'application/jsonc'
        },
        data: JSON.stringify(parameters)
      }

      axios(configExpect)
        .then(function(response) {
          console.log(JSON.stringify(response.data))
        })
        .catch(function(error) {
          console.log(error)
        })
    })
    .catch(function(error) {
      console.log(error)
    })
}
