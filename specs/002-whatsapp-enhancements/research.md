# Research: WhatsApp Enhancements

## 1. Rich Text Parsing (WhatsApp Markdown)
- **Decision**: Implement a custom, lightweight regex-based parser for WhatsApp markdown in the frontend.
- **Rationale**: WhatsApp's markdown rules are simple (`*bold*`, `_italic_`, `~strikethrough~`, ` ```code``` `, and lists). A heavy markdown library isn't strictly necessary and might not perfectly match WhatsApp's specific syntax (which differs slightly from standard Markdown). A simple custom hook or utility function using regex replacements will suffice and keep the bundle small.
- **Alternatives considered**: Using `react-markdown` or existing npm packages like `whatsapp-markdown`. These are viable but add unnecessary dependencies for a few simple text replacements.

## 2. Chat-Specific Settings Database Changes
- **Decision**: Remove `webhookUrl` and `accessToken` from the `Setting` global model and add them to the `Chat` model.
- **Rationale**: The requirements specify that these should be configured by each new chat and *not* globally. Storing them on the `Chat` model is the most direct implementation. This requires a Prisma migration.
- **Alternatives considered**: Keeping them globally as a fallback. Decided against it to strictly follow the requirement of "not configured globally".

## 3. UI Status Indicators
- **Decision**: Use standard icons (e.g., from `lucide-react` or similar existing icon set in the project) to represent Sent (single check), Delivered (double check grey), and Read (double check blue). Since WhatsApp UI uses these, we will map message `status` values to these icons.
- **Rationale**: `lucide-react` or inline SVGs are lightweight and easy to style with Tailwind CSS (which the project uses).
- **Alternatives considered**: Using image assets, but SVG icons are cleaner and easier to color (for the blue "read" status).

## 4. Multi-line Input
- **Decision**: Use a `<textarea>` instead of an `<input type="text">` for the message input. Handle the `onKeyDown` event to submit on `Enter` (without Shift/Ctrl) and add a newline on `Ctrl+Enter` or `Shift+Enter`.
- **Rationale**: Standard web practice. `textarea` natively supports multi-line. We just need to manage its height automatically or set a fixed max-height.
- **Alternatives considered**: `contenteditable` div, but it's overly complex for simple text input.
