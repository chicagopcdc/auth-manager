# Authentication Manager

This application allows administrators to manage user permissions and view registered roles for selected domains (e.g., `https://portal-dev.pedscommons.org`).

## Prerequisites
* **Node.js**: v18.0.0 or higher (recommended)
* **npm**: v9.0.0 or higher

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Launch development server**:
   ```bash
   npm run dev
   ```

## Authentication

To use the manager, you need an `access_token` from your target domain:

1. **Log in** to your domain (e.g., the PEDS portal).
2. **Open Developer Tools** (F12) -> **Application** tab.
3. **Locate the `access_token`** in Local Storage or Cookies.
4. **Paste this token** into the Login page of the Authentication Manager.

> **Note**: The session automatically expires every **20 minutes**. You will need to refresh your token from the source domain once it times out.

## Configuration

To add or change available environments, modify the `ENVIRONMENTS` constant within the source code:
`src/components/Login.jsx` (or the corresponding login component file).

## Troubleshooting

* **Blank Screen**: If the application displays a blank screen on load, please refresh the page. This is a known state-initialization issue.
* **Auth Errors**: Ensure your `access_token` is still active and hasn't expired on the main domain. If problems persist, try clearing your browser's local storage for the manager's tab.
