# Authentication Manager

This app displays registered users' roles for a selected domain (e.g. `https://portal-dev.pedscommons.org`), and allows admins to manage permissions for users.

This app uses vite with the Javascript variant of React.

## Getting Started

`npm install` when opening the repo for the first time

`npm run dev` to start the development server

If the screen goes blank, please refresh the page and the error will resolve.

The Login page requires the authentication key, which is the `access_token`, found in the developer console -> Application while you are logged into your domain.

The authentication manager times out every 20 minutes when your authentication key expires.

To change the available environments, modify the `ENVIRONMENTS` variable in `Login.jsx`.

## Prerequisites

- Node.js >= 18
- npm >= 9

## Environment Variables

The available environments for authentication are defined in:

auth-manager-app/src/Login.jsx

Example configuration:

```js
const ENVIRONMENTS = {
  dev: "https://portal-dev.pedscommons.org",
  prod: "https://portal.pedscommons.org"
};
---


## Authentication Token (access_token)

The application requires an `access_token` to authenticate users.

Steps to obtain it:
1. Log in to the target portal (e.g. https://portal-dev.pedscommons.org)
2. Open browser Developer Tools
3. Go to **Application → Storage**
4. Copy the value of `access_token`
5. Paste it into the login prompt when requested

## Troubleshooting

### Blank screen after starting the app
- Refresh the page once
- Ensure `npm install` completed successfully

### Authentication timeout
- Sessions expire every 20 minutes
- Re-authenticate using a fresh `access_token`

### App does not start
- Confirm Node and npm versions
- Restart the dev server using `npm run dev`