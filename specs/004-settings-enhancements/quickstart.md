# Quickstart Validation Guide

1. Start the application using Docker Compose:
   `docker-compose up --build`
2. Open the frontend UI and navigate to create a new chat.
3. Observe that the chat creation form now includes all setting attributes (webhook URL, etc.) with info hints.
4. Create the chat and verify that the "Chat Number" represents the recipient.
5. In the chat view, observe the default background color.
6. Click "Edit Settings" and change the background color, add tags, and set a webhook URL to `http://host.docker.internal:3000/webhook` (or similar local endpoint).
7. Save settings and verify the background color updates and tags are visible.
8. Trigger a webhook and verify the Docker backend successfully resolves and hits the local host endpoint.
