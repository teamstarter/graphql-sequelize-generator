export default async function callModelWebhook(
  modelName: string,
  webhooks: string[],
  action: string,
  context: any,
  data: any,
  callWebhook: Function
) {
  if (webhooks?.includes(action)) {
    await callWebhook({
      eventType: `${modelName}-${action}d`,
      context,
      data: {
        type: `${modelName}-${action}d`,
        data
      }
    })
  }
}
