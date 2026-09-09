# Browser handoff (unreleased)

This checkout adds typed login/control responses. These changes are not in
the published 0.4.3 package. Mock tests verify the SDK contract; they do not
prove that a deployment grants browser-control or Profile permissions.

## Two different workflows

| Workflow | SDK entry | Result | Completion |
| --- | --- | --- | --- |
| Take over the browser of an existing run | `doAnything.api.intervene({ kind: "take_control", ... })` | `data.standalone_control_url`, `control_token_expires_at`, `status` (wire case) | Explicit `release_control`, then observe the original run |
| Refresh an offered control interaction | `interaction.refreshControl()` | `BrowserControl` (camelCase) | Replace the displayed URL; do not create another run |
| Sign in to an offered site using a persistent Profile | `interaction.openLogin({ siteId, profileId })` | `LoginSession`: `liveUrl`, `sessionId`, `profileId`, `siteId` | Confirm/save the login session through the Profile service, verify persistence, then `confirmSignedIn()` |

`connectControl()` only works if the server explicitly offers `connect_control`.
Current Do Anything control events offer refresh/release, not connect: use
`api.intervene` to initiate control. `confirmSignedIn()` requests an agent
re-check; it does not save cookies or prove login success.

A Profile is persisted browser state, not a running browser. A login session
may be a separate writer session on that Profile. Reusing its Profile ID is
not the same as taking over the browser of the original run. Profile IDs are
scoped to the authorized user/project/environment; an ID from a different
deployment cannot simply be pasted into hosted Qoni.

## Server-side TypeScript controller

The host application must authenticate its own user and resolve that user's
owned run before calling these functions. Never accept arbitrary user/run IDs
from an unauthenticated frontend. This module does not supply application
authentication, HTTP routes, or a UI framework.

```ts
import { Qoni, QoniScopes } from "@qoniai/qoni";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

const qoni = new Qoni({
  accessKey: required("QONI_ACCESS_KEY"),
  secretKey: required("QONI_SECRET_KEY"),
});

export async function browserController(verifiedUserId: string, ownedRunId: string) {
  const grant = await qoni.delegateToken({
    userId: verifiedUserId,
    products: ["doAnything"],
    scopes: [QoniScopes.BROWSER_CONTROL],
  });
  const token = grant.data.token;
  if (!token) throw new Error("Delegation did not return a token");
  const run = await qoni.doAnything.attach(ownedRunId, { token });

  async function viewer(kind: "take_control" | "refresh_control_url") {
    const response = await qoni.doAnything.api.intervene<{
      standalone_control_url: string;
      control_token_expires_at: string;
      status: string;
    }>({ token, runId: run.id, kind });
    console.log(JSON.stringify({ stage: kind, status: response.data.status }));
    return {
      url: response.data.standalone_control_url,
      expiresAt: response.data.control_token_expires_at,
      status: response.data.status,
    };
  }

  return {
    open: () => viewer("take_control"),
    refresh: () => viewer("refresh_control_url"),
    release: async () => {
      await qoni.doAnything.api.intervene({ token, runId: run.id, kind: "release_control" });
      const state = await run.status();
      console.log(JSON.stringify({ stage: "control_released", status: state.status }));
      return state.status;
    },
    run,
  };
}
```

Call `open` after the browser exists. Send its result only to the authenticated
owner's frontend with `Cache-Control: no-store`. Render `url` as the Viewer.
Call `release` only after the user explicitly finishes. Continue observing
`run.events()` or `run.wait()`; release does not mean the task succeeded.
Keep server-side streaming alive independently of individual UI requests.

Response shape example **(synthetic, not production evidence)**:

```json
{
  "url": "https://www.browserbase.com/example-viewer",
  "expiresAt": "2026-09-10T00:00:00Z",
  "status": "pending_take_control"
}
```

The pending status is not an acknowledgement that the agent has stopped.
Honor the deployment's authoritative handoff state before simultaneous
human/agent input. A timeout after opening is ambiguous: refresh/read the
same run rather than blindly retrying a state-changing request.

## Embed the Viewer

[Browserbase Live View](https://docs.browserbase.com/platform/browser/observability/session-live-view)
supports interactive embedding. It is not a promise of raw VNC/RFB support.
Both Python and TypeScript backends can return the same frontend DTO above.

```html
<iframe id="browser-viewer" title="Secure browser login"
  sandbox="allow-scripts allow-same-origin"
  referrerpolicy="no-referrer"
  style="width:100%;height:640px;border:0"></iframe>
```

```js
const frame = document.getElementById("browser-viewer");

function showViewer(ticket) {
  const url = new URL(ticket.url);
  if (url.protocol !== "https:" || url.origin !== "https://www.browserbase.com"
      || url.username || url.password) {
    throw new Error("Unexpected Viewer origin");
  }
  frame.src = url.href;
}

window.addEventListener("message", (event) => {
  if (event.source !== frame.contentWindow
      || event.origin !== "https://www.browserbase.com") return;
  if (event.data === "browserbase-disconnected") {
    frame.removeAttribute("src");
    document.dispatchEvent(new Event("viewer-needs-refresh"));
  }
});
```

`showViewer` receives the authenticated application response, never a URL
parameter supplied by an arbitrary third party. Wire `viewer-needs-refresh`
to a user-visible reconnect action calling the controller's `refresh`.
Do not automatically release control on a transient iframe disconnect.
Clear the iframe when the interaction resolves/expires or the user leaves.
If hosting a Qoni wrapper instead of Browserbase, configure its exact trusted
origin in both checks and the application's `frame-src` CSP.

## Permissions and persistence

- Browser control needs an explicitly authorized `webagent.browser:control`
  grant in addition to the Do Anything product grant. Login needs
  `webagent.workspace:write`. The SDK now requests the relevant scope at
  token exchange; it cannot grant authority denied by the platform.
- Ordinary product bundles are unchanged. Do not silently expand every
  user's credential. A 403 is not an invitation to use another user's key.
- Pass an owned `profileId` to `openLogin`; omitting it permits the backend's
  creation/upsert behavior. A single offered site may be inferred, but
  multiple sites require an explicit selection.
- Persistent login must hold the Profile writer lease through browser close
  and storage flush. Verify in a fresh read-only session before marking the
  login persisted. An iframe load, `postMessage`, or user click is not proof.
- Keep AK/SK, Browserbase API keys, CDP URLs, cookies, and Viewer links out of
  frontend bundles, logs, analytics, published examples, and localStorage.
  The live Viewer link itself necessarily reaches the authorized user's
  browser; treat it as a session credential, not a public share link.
- Direct CDP access is a separate privileged capability. This change does
  not expose a provider-wide Browserbase key or add a public CDP gateway.

The Profile confirm/state lifecycle is still a backend integration requirement,
not a newly implemented SDK namespace in this patch. Production permissions,
agent/human mutual exclusion, and persistence require end-to-end acceptance
before treating this as a complete hosted login feature.
