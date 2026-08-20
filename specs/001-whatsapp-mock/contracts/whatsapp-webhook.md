# Contract: Meta WhatsApp Webhook Payload Contract

This contract defines the HTTP `POST` payload format dispatched by the WhatsApp Mock backend to the integration service's `webhookUrl` whenever a user sends a text message from the React UI.

---

## Webhook Dispatch Request

- **Method**: `POST`
- **Target URL**: Configured in Settings (`webhookUrl`, e.g., `http://host.docker.internal:8000/api/whatsapp/webhook`)
- **Headers**:
  - `Content-Type: application/json`
  - `User-Agent: WhatsApp-Mock-Dispatcher/1.0`

### Payload Structure (Text Message Event)

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "200000000000002",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15550001111",
              "phone_number_id": "100000000000001"
            },
            "contacts": [
              {
                "profile": {
                  "name": "WhatsApp Business User"
                },
                "wa_id": "15550001111"
              }
            ],
            "messages": [
              {
                "from": "15550001111",
                "id": "wamid.HBgLMjAxMjM0NTY3ODkwFQIAERgSQUU1REI4ODRBRTRFNEMyODg0AA==",
                "timestamp": "1724190000",
                "text": {
                  "body": "Text message content entered in UI"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### Expected Response from Receiver
- **HTTP Status**: `200 OK` (or 2xx)
- **Response Body**: Any JSON response or string (e.g. `{"status":"received"}`).
