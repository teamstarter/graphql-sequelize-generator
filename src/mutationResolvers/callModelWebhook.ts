import { WebhookType, WebhookTypeList } from '../types/types'

export default async function callModelWebhook(
  modelName: string,
  webhooks: WebhookTypeList | undefined,
  action: WebhookType,
  context: any,
  data: any,
  callWebhook: Function
) {
  if (webhooks?.includes(action)) {
    await callWebhook({
      eventType: `${modelName}-${action}d`,
      context,
      data,
    })
  }
}
