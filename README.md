# Frappe Local Auto-Login

A Chrome extension that logs you in to a **local or LAN** Frappe / ERPNext
development site automatically when you open `/app` or `/desk`.

## What it does

When you open `/app`, `/desk`, or `/login?redirect-to=/app…` (or `/desk…`) and you
are not logged in, it:

1. Checks the host is local: `localhost`, `*.localhost`, `127.x`, or a private
   network address (`10.x`, `172.16–31.x`, `192.168.x`). Anything else is ignored.
2. Calls `/api/method/ping` and continues only if the reply is
   `{"message":"pong"}`, so the passwords are never sent to a server that isn't Frappe.
3. Tries each saved password in order against `/api/method/login`, then takes you
   to the page you were heading for.

It makes one attempt per tab, so a wrong password can't loop or lock the account.

## Install

1. Clone or download this repository.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and choose this folder.
4. Open the extension's **Details → Extension options**, enter the username and
   one or more passwords (one per line), and click **Save**.

Credentials are stored in `chrome.storage.local` in your browser only. They are
not part of this repository.

## Warning

For development machines only. Don't use it with passwords for production servers.
