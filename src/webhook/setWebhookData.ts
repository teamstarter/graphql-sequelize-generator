export default function setWebhookData(defaultData: any) {
  const hook = (f: Function) => {
    defaultData.data = f(defaultData.data)
  }
  return hook
}
