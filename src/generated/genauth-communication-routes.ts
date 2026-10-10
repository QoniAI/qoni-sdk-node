// Generated from reviewed server contracts. Do not edit.
export const genAuthCommunicationRoutes = [
  {
    "name": "agentMail.personas.create",
    "method": "POST",
    "path": "/api/v3/agent-personas",
    "queryKeys": [],
    "pathKeys": [],
    "idempotency": true,
    "revision": false,
    "inputFields": [
      {
        "name": "displayName",
        "required": true,
        "kind": "string"
      },
      {
        "name": "avatar",
        "required": false,
        "kind": "string"
      },
      {
        "name": "externalRef",
        "required": false,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.personas.list",
    "method": "GET",
    "path": "/api/v3/agent-personas",
    "queryKeys": [
      "keyword",
      "cursor",
      "limit"
    ],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "keyword",
        "required": false,
        "kind": "string"
      },
      {
        "name": "cursor",
        "required": false,
        "kind": "string"
      },
      {
        "name": "limit",
        "required": false,
        "kind": "number"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.personas.get",
    "method": "GET",
    "path": "/api/v3/agent-personas/{personaId}",
    "queryKeys": [],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.personas.update",
    "method": "PATCH",
    "path": "/api/v3/agent-personas/{personaId}",
    "queryKeys": [],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": false,
    "revision": true,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "displayName",
        "required": false,
        "kind": "string"
      },
      {
        "name": "avatar",
        "required": false
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentMail.providers.list",
    "method": "GET",
    "path": "/api/v3/agent-personas/provider-configs",
    "queryKeys": [
      "capability",
      "cursor",
      "limit"
    ],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "capability",
        "required": false,
        "kind": "string"
      },
      {
        "name": "cursor",
        "required": false,
        "kind": "string"
      },
      {
        "name": "limit",
        "required": false,
        "kind": "number"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.resources.list",
    "method": "GET",
    "path": "/api/v3/agent-personas/{personaId}/resources",
    "queryKeys": [
      "type",
      "status",
      "cursor",
      "limit"
    ],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "type",
        "required": false,
        "kind": "string"
      },
      {
        "name": "status",
        "required": false,
        "kind": "string"
      },
      {
        "name": "cursor",
        "required": false,
        "kind": "string"
      },
      {
        "name": "limit",
        "required": false,
        "kind": "number"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.resources.registerPhone",
    "method": "POST",
    "path": "/api/v3/agent-personas/{personaId}/phone-resources",
    "queryKeys": [],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": true,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "phone",
        "required": true,
        "kind": "string"
      },
      {
        "name": "label",
        "required": false,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.mailboxes.create",
    "method": "POST",
    "path": "/api/v3/agent-personas/{personaId}/mailboxes",
    "queryKeys": [],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": true,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "providerConfigId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "localPart",
        "required": false,
        "kind": "string"
      },
      {
        "name": "displayName",
        "required": false,
        "kind": "string"
      },
      {
        "name": "domain",
        "required": false,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.mailboxes.get",
    "method": "GET",
    "path": "/api/v3/agent-personas/{personaId}/mailboxes/{mailboxId}",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "mailboxId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "mailboxId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.operations.get",
    "method": "GET",
    "path": "/api/v3/agent-personas/operations/{operationId}",
    "queryKeys": [],
    "pathKeys": [
      "operationId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "operationId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.messages.list",
    "method": "GET",
    "path": "/api/v3/agent-personas/{personaId}/mailboxes/{mailboxId}/messages",
    "queryKeys": [
      "direction",
      "after",
      "before",
      "cursor",
      "limit"
    ],
    "pathKeys": [
      "personaId",
      "mailboxId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "mailboxId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "direction",
        "required": false,
        "kind": "string"
      },
      {
        "name": "after",
        "required": false,
        "kind": "string"
      },
      {
        "name": "before",
        "required": false,
        "kind": "string"
      },
      {
        "name": "cursor",
        "required": false,
        "kind": "string"
      },
      {
        "name": "limit",
        "required": false,
        "kind": "number"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.messages.send",
    "method": "POST",
    "path": "/api/v3/agent-personas/{personaId}/mailboxes/{mailboxId}/messages",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "mailboxId"
    ],
    "idempotency": true,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "mailboxId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "to",
        "required": true,
        "kind": "string"
      },
      {
        "name": "subject",
        "required": true,
        "kind": "string"
      },
      {
        "name": "text",
        "required": true,
        "kind": "string"
      },
      {
        "name": "externalRef",
        "required": false,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.messages.get",
    "method": "GET",
    "path": "/api/v3/agent-personas/{personaId}/mailboxes/{mailboxId}/messages/{messageId}",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "mailboxId",
      "messageId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "mailboxId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "messageId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.verifications.create",
    "method": "POST",
    "path": "/api/v3/agent-personas/{personaId}/mailboxes/{mailboxId}/verification-requests",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "mailboxId"
    ],
    "idempotency": true,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "mailboxId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "platformKey",
        "required": true,
        "kind": "string"
      },
      {
        "name": "externalRef",
        "required": true,
        "kind": "string"
      },
      {
        "name": "timeoutSeconds",
        "required": false,
        "kind": "number"
      },
      {
        "name": "templateId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "match",
        "required": false
      },
      {
        "name": "extract",
        "required": false
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.verifications.get",
    "method": "GET",
    "path": "/api/v3/agent-personas/{personaId}/mailboxes/{mailboxId}/verification-requests/{verificationRequestId}",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "mailboxId",
      "verificationRequestId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "mailboxId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "verificationRequestId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.verifications.cancel",
    "method": "POST",
    "path": "/api/v3/agent-personas/{personaId}/mailboxes/{mailboxId}/verification-requests/{verificationRequestId}/cancel",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "mailboxId",
      "verificationRequestId"
    ],
    "idempotency": true,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "mailboxId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "verificationRequestId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.externalAccounts.create",
    "method": "POST",
    "path": "/api/v3/agent-personas/{personaId}/external-accounts",
    "queryKeys": [],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": true,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "platformKey",
        "required": true,
        "kind": "string"
      },
      {
        "name": "externalRef",
        "required": true,
        "kind": "string"
      },
      {
        "name": "platformAccountId",
        "required": false
      },
      {
        "name": "platformScope",
        "required": false
      },
      {
        "name": "username",
        "required": false
      },
      {
        "name": "profileUrl",
        "required": false
      },
      {
        "name": "registrationResult",
        "required": true,
        "kind": "string"
      },
      {
        "name": "registeredAt",
        "required": false
      },
      {
        "name": "notes",
        "required": false
      },
      {
        "name": "bindings",
        "required": false,
        "kind": "array"
      },
      {
        "name": "recordStatus",
        "required": false,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.externalAccounts.list",
    "method": "GET",
    "path": "/api/v3/agent-personas/{personaId}/external-accounts",
    "queryKeys": [
      "platformKey",
      "resourceId",
      "recordStatus",
      "cursor",
      "limit"
    ],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "platformKey",
        "required": false,
        "kind": "string"
      },
      {
        "name": "resourceId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "recordStatus",
        "required": false,
        "kind": "string"
      },
      {
        "name": "cursor",
        "required": false,
        "kind": "string"
      },
      {
        "name": "limit",
        "required": false,
        "kind": "number"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.externalAccounts.get",
    "method": "GET",
    "path": "/api/v3/agent-personas/{personaId}/external-accounts/{accountId}",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "accountId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accountId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.externalAccounts.update",
    "method": "PATCH",
    "path": "/api/v3/agent-personas/{personaId}/external-accounts/{accountId}",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "accountId"
    ],
    "idempotency": false,
    "revision": true,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accountId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "platformAccountId",
        "required": false
      },
      {
        "name": "platformScope",
        "required": false
      },
      {
        "name": "username",
        "required": false
      },
      {
        "name": "profileUrl",
        "required": false
      },
      {
        "name": "registrationResult",
        "required": false,
        "kind": "string"
      },
      {
        "name": "registeredAt",
        "required": false
      },
      {
        "name": "notes",
        "required": false
      },
      {
        "name": "bindings",
        "required": false,
        "kind": "array"
      },
      {
        "name": "recordStatus",
        "required": false,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentMail.admin.providers.list",
    "method": "GET",
    "path": "/api/v3/agent-mail/admin/provider-configs",
    "queryKeys": [
      "cursor",
      "limit"
    ],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "cursor",
        "required": false,
        "kind": "string"
      },
      {
        "name": "limit",
        "required": false,
        "kind": "number"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.templates.list",
    "method": "GET",
    "path": "/api/v3/agent-mail/admin/templates",
    "queryKeys": [
      "cursor",
      "limit"
    ],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "cursor",
        "required": false,
        "kind": "string"
      },
      {
        "name": "limit",
        "required": false,
        "kind": "number"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.personas.list",
    "method": "GET",
    "path": "/api/v3/agent-mail/admin/personas",
    "queryKeys": [
      "cursor",
      "limit"
    ],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "cursor",
        "required": false,
        "kind": "string"
      },
      {
        "name": "limit",
        "required": false,
        "kind": "number"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.retainedPersonas.list",
    "method": "GET",
    "path": "/api/v3/agent-mail/admin/retained-personas",
    "queryKeys": [
      "cursor",
      "limit"
    ],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "cursor",
        "required": false,
        "kind": "string"
      },
      {
        "name": "limit",
        "required": false,
        "kind": "number"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.deletionJobs.list",
    "method": "GET",
    "path": "/api/v3/agent-mail/admin/deletion-jobs",
    "queryKeys": [
      "cursor",
      "limit"
    ],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "cursor",
        "required": false,
        "kind": "string"
      },
      {
        "name": "limit",
        "required": false,
        "kind": "number"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.operations.list",
    "method": "GET",
    "path": "/api/v3/agent-mail/admin/operations",
    "queryKeys": [
      "cursor",
      "limit"
    ],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "cursor",
        "required": false,
        "kind": "string"
      },
      {
        "name": "limit",
        "required": false,
        "kind": "number"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.events.list",
    "method": "GET",
    "path": "/api/v3/agent-mail/admin/events",
    "queryKeys": [
      "cursor",
      "limit"
    ],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "cursor",
        "required": false,
        "kind": "string"
      },
      {
        "name": "limit",
        "required": false,
        "kind": "number"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.audit.list",
    "method": "GET",
    "path": "/api/v3/agent-mail/admin/audit",
    "queryKeys": [
      "cursor",
      "limit"
    ],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "cursor",
        "required": false,
        "kind": "string"
      },
      {
        "name": "limit",
        "required": false,
        "kind": "number"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.providers.create",
    "method": "POST",
    "path": "/api/v3/agent-mail/admin/provider-configs",
    "queryKeys": [],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "name",
        "required": true,
        "kind": "string"
      },
      {
        "name": "providerType",
        "required": true,
        "kind": "string"
      },
      {
        "name": "providerAccountKey",
        "required": true,
        "kind": "string"
      },
      {
        "name": "namespaceKey",
        "required": true,
        "kind": "string"
      },
      {
        "name": "settings",
        "required": true,
        "kind": "object"
      },
      {
        "name": "apiKey",
        "required": true,
        "kind": "string"
      },
      {
        "name": "webhookSecret",
        "required": false,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.providers.update",
    "method": "PATCH",
    "path": "/api/v3/agent-mail/admin/provider-configs/{configId}",
    "queryKeys": [],
    "pathKeys": [
      "configId"
    ],
    "idempotency": false,
    "revision": true,
    "inputFields": [
      {
        "name": "name",
        "required": false,
        "kind": "string"
      },
      {
        "name": "settings",
        "required": false,
        "kind": "object"
      },
      {
        "name": "acceptNewMailboxes",
        "required": false,
        "kind": "boolean"
      },
      {
        "name": "serviceEnabled",
        "required": false,
        "kind": "boolean"
      },
      {
        "name": "configId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentMail.admin.providers.rotateCredentials",
    "method": "POST",
    "path": "/api/v3/agent-mail/admin/provider-configs/{configId}/credentials",
    "queryKeys": [],
    "pathKeys": [
      "configId"
    ],
    "idempotency": false,
    "revision": true,
    "inputFields": [
      {
        "name": "configId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "apiKey",
        "required": false,
        "kind": "string"
      },
      {
        "name": "webhookSecret",
        "required": false,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentMail.admin.providers.test",
    "method": "POST",
    "path": "/api/v3/agent-mail/admin/provider-configs/{configId}/test",
    "queryKeys": [],
    "pathKeys": [
      "configId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "configId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.templates.create",
    "method": "POST",
    "path": "/api/v3/agent-mail/admin/templates",
    "queryKeys": [],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "name",
        "required": true,
        "kind": "string"
      },
      {
        "name": "platformKey",
        "required": true,
        "kind": "string"
      },
      {
        "name": "match",
        "required": true
      },
      {
        "name": "extract",
        "required": true
      },
      {
        "name": "enabled",
        "required": false,
        "kind": "boolean"
      },
      {
        "name": "version",
        "required": false,
        "kind": "number"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.templates.update",
    "method": "PATCH",
    "path": "/api/v3/agent-mail/admin/templates/{templateId}",
    "queryKeys": [],
    "pathKeys": [
      "templateId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "name",
        "required": true,
        "kind": "string"
      },
      {
        "name": "platformKey",
        "required": true,
        "kind": "string"
      },
      {
        "name": "match",
        "required": true
      },
      {
        "name": "extract",
        "required": true
      },
      {
        "name": "enabled",
        "required": false,
        "kind": "boolean"
      },
      {
        "name": "version",
        "required": true,
        "kind": "number"
      },
      {
        "name": "templateId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.templates.test",
    "method": "POST",
    "path": "/api/v3/agent-mail/admin/templates/test",
    "queryKeys": [],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "match",
        "required": true
      },
      {
        "name": "extract",
        "required": true
      },
      {
        "name": "sender",
        "required": true,
        "kind": "string"
      },
      {
        "name": "subject",
        "required": true,
        "kind": "string"
      },
      {
        "name": "text",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.personas.create",
    "method": "POST",
    "path": "/api/v3/agent-mail/admin/personas",
    "queryKeys": [],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "displayName",
        "required": true,
        "kind": "string"
      },
      {
        "name": "avatar",
        "required": false,
        "kind": "string"
      },
      {
        "name": "externalRef",
        "required": false,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.personas.get",
    "method": "GET",
    "path": "/api/v3/agent-mail/admin/personas/{personaId}",
    "queryKeys": [],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.personas.registerPhone",
    "method": "POST",
    "path": "/api/v3/agent-mail/admin/personas/{personaId}/phone-resources",
    "queryKeys": [],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "phone",
        "required": true,
        "kind": "string"
      },
      {
        "name": "label",
        "required": false,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.personas.createExternalAccount",
    "method": "POST",
    "path": "/api/v3/agent-mail/admin/personas/{personaId}/external-accounts",
    "queryKeys": [],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "platformKey",
        "required": true,
        "kind": "string"
      },
      {
        "name": "externalRef",
        "required": true,
        "kind": "string"
      },
      {
        "name": "platformAccountId",
        "required": false
      },
      {
        "name": "platformScope",
        "required": false
      },
      {
        "name": "username",
        "required": false
      },
      {
        "name": "profileUrl",
        "required": false
      },
      {
        "name": "registrationResult",
        "required": true,
        "kind": "string"
      },
      {
        "name": "registeredAt",
        "required": false
      },
      {
        "name": "notes",
        "required": false
      },
      {
        "name": "bindings",
        "required": false,
        "kind": "array"
      },
      {
        "name": "recordStatus",
        "required": false,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.personas.setStatus",
    "method": "POST",
    "path": "/api/v3/agent-mail/admin/personas/{personaId}/status",
    "queryKeys": [],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": false,
    "revision": true,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "status",
        "required": true,
        "kind": "string"
      },
      {
        "name": "reason",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentMail.admin.personas.delete",
    "method": "POST",
    "path": "/api/v3/agent-mail/admin/personas/{personaId}/deletion-jobs",
    "queryKeys": [],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": false,
    "revision": true,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "reason",
        "required": true,
        "kind": "string"
      },
      {
        "name": "mode",
        "required": false,
        "kind": "string"
      },
      {
        "name": "mailboxIds",
        "required": false,
        "kind": "array"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentMail.admin.administrators.setPermissions",
    "method": "POST",
    "path": "/api/v3/agent-mail/admin/administrators/{administratorId}/permissions",
    "queryKeys": [],
    "pathKeys": [
      "administratorId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "administratorId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "actions",
        "required": true,
        "kind": "array"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.operations.reconcile",
    "method": "POST",
    "path": "/api/v3/agent-mail/admin/operations/{operationId}/reconcile",
    "queryKeys": [],
    "pathKeys": [
      "operationId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "operationId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.operations.resolveSend",
    "method": "POST",
    "path": "/api/v3/agent-mail/admin/operations/{operationId}/resolve-send",
    "queryKeys": [],
    "pathKeys": [
      "operationId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "operationId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "outcome",
        "required": true,
        "kind": "string"
      },
      {
        "name": "evidenceRef",
        "required": true,
        "kind": "string"
      },
      {
        "name": "providerMessageId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentMail.admin.health.get",
    "method": "GET",
    "path": "/api/v3/agent-mail/admin/health",
    "queryKeys": [],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.numbers.list",
    "method": "GET",
    "path": "/api/v3/agent-phone/personas/{personaId}/numbers",
    "queryKeys": [
      "q",
      "state",
      "page",
      "limit"
    ],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "q",
        "required": false,
        "kind": "string"
      },
      {
        "name": "state",
        "required": false,
        "kind": "string"
      },
      {
        "name": "page",
        "required": false,
        "kind": "number"
      },
      {
        "name": "limit",
        "required": false,
        "kind": "number"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.numbers.get",
    "method": "GET",
    "path": "/api/v3/agent-phone/personas/{personaId}/numbers/{resourceId}",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "resourceId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "resourceId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.numbers.messages",
    "method": "GET",
    "path": "/api/v3/agent-phone/personas/{personaId}/numbers/{resourceId}/messages",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "resourceId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "resourceId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.numbers.send",
    "method": "POST",
    "path": "/api/v3/agent-phone/personas/{personaId}/numbers/{resourceId}/sends",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "resourceId"
    ],
    "idempotency": true,
    "revision": false,
    "inputFields": [
      {
        "name": "resourceId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "to",
        "required": true,
        "kind": "string"
      },
      {
        "name": "body",
        "required": true,
        "kind": "string"
      },
      {
        "name": "maxCost",
        "required": true,
        "kind": "object"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.numbers.release",
    "method": "POST",
    "path": "/api/v3/agent-phone/personas/{personaId}/numbers/{resourceId}/releases",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "resourceId"
    ],
    "idempotency": true,
    "revision": true,
    "inputFields": [
      {
        "name": "resourceId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "reason",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentPhone.candidates.list",
    "method": "GET",
    "path": "/api/v3/agent-phone/personas/{personaId}/candidates",
    "queryKeys": [
      "providerConfigId",
      "country"
    ],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "providerConfigId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "country",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.catalog.list",
    "method": "GET",
    "path": "/api/v3/agent-phone/personas/{personaId}/catalog",
    "queryKeys": [
      "providerConfigId",
      "country"
    ],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "providerConfigId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "country",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.quotes.create",
    "method": "POST",
    "path": "/api/v3/agent-phone/personas/{personaId}/quotes",
    "queryKeys": [],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "kind",
        "required": true,
        "kind": "string"
      },
      {
        "name": "providerConfigId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "spec",
        "required": true,
        "kind": "object"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.numbers.acquire",
    "method": "POST",
    "path": "/api/v3/agent-phone/personas/{personaId}/number-acquisitions",
    "queryKeys": [],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": true,
    "revision": false,
    "inputFields": [
      {
        "name": "quoteId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "maxCost",
        "required": true,
        "kind": "object"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.activations.create",
    "method": "POST",
    "path": "/api/v3/agent-phone/personas/{personaId}/activations",
    "queryKeys": [],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": true,
    "revision": false,
    "inputFields": [
      {
        "name": "quoteId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "maxCost",
        "required": true,
        "kind": "object"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.activations.list",
    "method": "GET",
    "path": "/api/v3/agent-phone/personas/{personaId}/activations",
    "queryKeys": [],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.activations.get",
    "method": "GET",
    "path": "/api/v3/agent-phone/personas/{personaId}/activations/{taskId}",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "taskId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.activations.messages",
    "method": "GET",
    "path": "/api/v3/agent-phone/personas/{personaId}/activations/{taskId}/messages",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "taskId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.messages.content",
    "method": "GET",
    "path": "/api/v3/agent-phone/personas/{personaId}/messages/{messageId}/content",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "messageId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "messageId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.verifications.create",
    "method": "POST",
    "path": "/api/v3/agent-phone/personas/{personaId}/verifications",
    "queryKeys": [],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "resourceId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "service",
        "required": true,
        "kind": "string"
      },
      {
        "name": "timeoutSeconds",
        "required": false,
        "kind": "number"
      },
      {
        "name": "rules",
        "required": true,
        "kind": "object"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.verifications.list",
    "method": "GET",
    "path": "/api/v3/agent-phone/personas/{personaId}/verifications",
    "queryKeys": [
      "resourceId"
    ],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "resourceId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.verifications.get",
    "method": "GET",
    "path": "/api/v3/agent-phone/personas/{personaId}/verifications/{taskId}",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "taskId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.operations.list",
    "method": "GET",
    "path": "/api/v3/agent-phone/personas/{personaId}/operations",
    "queryKeys": [],
    "pathKeys": [
      "personaId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.operations.get",
    "method": "GET",
    "path": "/api/v3/agent-phone/personas/{personaId}/operations/{operationId}",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "operationId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "operationId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.verifications.candidates",
    "method": "GET",
    "path": "/api/v3/agent-phone/personas/{personaId}/verifications/{taskId}/candidates",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "taskId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.verifications.cancel",
    "method": "POST",
    "path": "/api/v3/agent-phone/personas/{personaId}/verifications/{taskId}/cancel",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "taskId"
    ],
    "idempotency": true,
    "revision": true,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentPhone.verifications.consume",
    "method": "POST",
    "path": "/api/v3/agent-phone/personas/{personaId}/verifications/{taskId}/consume",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "taskId"
    ],
    "idempotency": true,
    "revision": false,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "candidateId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.activations.candidates",
    "method": "GET",
    "path": "/api/v3/agent-phone/personas/{personaId}/activations/{taskId}/candidates",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "taskId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.activations.cancel",
    "method": "POST",
    "path": "/api/v3/agent-phone/personas/{personaId}/activations/{taskId}/cancel",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "taskId"
    ],
    "idempotency": true,
    "revision": true,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentPhone.activations.finish",
    "method": "POST",
    "path": "/api/v3/agent-phone/personas/{personaId}/activations/{taskId}/finish",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "taskId"
    ],
    "idempotency": true,
    "revision": true,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentPhone.activations.consume",
    "method": "POST",
    "path": "/api/v3/agent-phone/personas/{personaId}/activations/{taskId}/consume",
    "queryKeys": [],
    "pathKeys": [
      "personaId",
      "taskId"
    ],
    "idempotency": true,
    "revision": false,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "candidateId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "accessToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.numbers.list",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/numbers",
    "queryKeys": [
      "q",
      "state",
      "page",
      "limit",
      "personaId"
    ],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "q",
        "required": false,
        "kind": "string"
      },
      {
        "name": "state",
        "required": false,
        "kind": "string"
      },
      {
        "name": "page",
        "required": false,
        "kind": "number"
      },
      {
        "name": "limit",
        "required": false,
        "kind": "number"
      },
      {
        "name": "personaId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.numbers.get",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/numbers/{resourceId}",
    "queryKeys": [],
    "pathKeys": [
      "resourceId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "resourceId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.numbers.messages",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/numbers/{resourceId}/messages",
    "queryKeys": [],
    "pathKeys": [
      "resourceId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "resourceId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.numbers.send",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/numbers/{resourceId}/sends",
    "queryKeys": [],
    "pathKeys": [
      "resourceId"
    ],
    "idempotency": true,
    "revision": false,
    "inputFields": [
      {
        "name": "resourceId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "to",
        "required": true,
        "kind": "string"
      },
      {
        "name": "body",
        "required": true,
        "kind": "string"
      },
      {
        "name": "maxCost",
        "required": true,
        "kind": "object"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.numbers.release",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/numbers/{resourceId}/releases",
    "queryKeys": [],
    "pathKeys": [
      "resourceId"
    ],
    "idempotency": true,
    "revision": true,
    "inputFields": [
      {
        "name": "resourceId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "reason",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentPhone.admin.candidates.list",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/candidates",
    "queryKeys": [
      "providerConfigId",
      "country",
      "personaId"
    ],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "providerConfigId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "country",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.catalog.list",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/catalog",
    "queryKeys": [
      "providerConfigId",
      "country",
      "personaId"
    ],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "providerConfigId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "country",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.quotes.create",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/quotes",
    "queryKeys": [],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "kind",
        "required": true,
        "kind": "string"
      },
      {
        "name": "providerConfigId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "spec",
        "required": true,
        "kind": "object"
      },
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.numbers.acquire",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/number-acquisitions",
    "queryKeys": [],
    "pathKeys": [],
    "idempotency": true,
    "revision": false,
    "inputFields": [
      {
        "name": "quoteId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "maxCost",
        "required": true,
        "kind": "object"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.activations.create",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/activations",
    "queryKeys": [],
    "pathKeys": [],
    "idempotency": true,
    "revision": false,
    "inputFields": [
      {
        "name": "quoteId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "maxCost",
        "required": true,
        "kind": "object"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.activations.list",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/activations",
    "queryKeys": [
      "personaId"
    ],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.activations.get",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/activations/{taskId}",
    "queryKeys": [],
    "pathKeys": [
      "taskId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.activations.messages",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/activations/{taskId}/messages",
    "queryKeys": [],
    "pathKeys": [
      "taskId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.messages.content",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/messages/{messageId}/content",
    "queryKeys": [],
    "pathKeys": [
      "messageId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "messageId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.verifications.create",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/verifications",
    "queryKeys": [],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "resourceId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "service",
        "required": true,
        "kind": "string"
      },
      {
        "name": "timeoutSeconds",
        "required": false,
        "kind": "number"
      },
      {
        "name": "rules",
        "required": true,
        "kind": "object"
      },
      {
        "name": "personaId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.verifications.list",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/verifications",
    "queryKeys": [
      "resourceId",
      "personaId"
    ],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "resourceId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "personaId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.verifications.get",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/verifications/{taskId}",
    "queryKeys": [],
    "pathKeys": [
      "taskId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.operations.list",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/operations",
    "queryKeys": [
      "personaId"
    ],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.operations.get",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/operations/{operationId}",
    "queryKeys": [],
    "pathKeys": [
      "operationId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "operationId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.verifications.candidates",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/verifications/{taskId}/candidates",
    "queryKeys": [],
    "pathKeys": [
      "taskId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.verifications.cancel",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/verifications/{taskId}/cancel",
    "queryKeys": [],
    "pathKeys": [
      "taskId"
    ],
    "idempotency": true,
    "revision": true,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentPhone.admin.verifications.consume",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/verifications/{taskId}/consume",
    "queryKeys": [],
    "pathKeys": [
      "taskId"
    ],
    "idempotency": true,
    "revision": false,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "candidateId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.activations.candidates",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/activations/{taskId}/candidates",
    "queryKeys": [],
    "pathKeys": [
      "taskId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.activations.cancel",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/activations/{taskId}/cancel",
    "queryKeys": [],
    "pathKeys": [
      "taskId"
    ],
    "idempotency": true,
    "revision": true,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentPhone.admin.activations.finish",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/activations/{taskId}/finish",
    "queryKeys": [],
    "pathKeys": [
      "taskId"
    ],
    "idempotency": true,
    "revision": true,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentPhone.admin.activations.consume",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/activations/{taskId}/consume",
    "queryKeys": [],
    "pathKeys": [
      "taskId"
    ],
    "idempotency": true,
    "revision": false,
    "inputFields": [
      {
        "name": "taskId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "candidateId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.personas.list",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/personas",
    "queryKeys": [],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.personas.create",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/personas",
    "queryKeys": [],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "displayName",
        "required": true,
        "kind": "string"
      },
      {
        "name": "externalRef",
        "required": false,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.providers.list",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/providers",
    "queryKeys": [],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.providers.create",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/providers",
    "queryKeys": [],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "name",
        "required": true,
        "kind": "string"
      },
      {
        "name": "settings",
        "required": true,
        "kind": "object"
      },
      {
        "name": "provider",
        "required": true,
        "kind": "string"
      },
      {
        "name": "credentials",
        "required": true,
        "kind": "object"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.providers.update",
    "method": "PATCH",
    "path": "/api/v3/agent-phone/admin/providers/{configId}",
    "queryKeys": [],
    "pathKeys": [
      "configId"
    ],
    "idempotency": false,
    "revision": true,
    "inputFields": [
      {
        "name": "configId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "name",
        "required": false,
        "kind": "string"
      },
      {
        "name": "settings",
        "required": false,
        "kind": "object"
      },
      {
        "name": "enabled",
        "required": false,
        "kind": "boolean"
      },
      {
        "name": "credentials",
        "required": false,
        "kind": "object"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentPhone.admin.providers.test",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/providers/{configId}/test",
    "queryKeys": [],
    "pathKeys": [
      "configId"
    ],
    "idempotency": true,
    "revision": true,
    "inputFields": [
      {
        "name": "configId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "idempotencyKey",
        "required": true,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentPhone.admin.numbers.register",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/numbers/manual",
    "queryKeys": [],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "personaId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "phone",
        "required": true,
        "kind": "string"
      },
      {
        "name": "label",
        "required": false,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.numbers.update",
    "method": "PATCH",
    "path": "/api/v3/agent-phone/admin/numbers/{resourceId}",
    "queryKeys": [],
    "pathKeys": [
      "resourceId"
    ],
    "idempotency": false,
    "revision": true,
    "inputFields": [
      {
        "name": "resourceId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "label",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentPhone.admin.numbers.archive",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/numbers/{resourceId}/archive",
    "queryKeys": [],
    "pathKeys": [
      "resourceId"
    ],
    "idempotency": false,
    "revision": true,
    "inputFields": [
      {
        "name": "resourceId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "reason",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  },
  {
    "name": "agentPhone.admin.numbers.bindings",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/numbers/{resourceId}/bindings",
    "queryKeys": [],
    "pathKeys": [
      "resourceId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "resourceId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.operations.reconcile",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/operations/{operationId}/reconcile",
    "queryKeys": [],
    "pathKeys": [
      "operationId"
    ],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "operationId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "providerObjectId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "evidenceRef",
        "required": false,
        "kind": "string"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.policies.list",
    "method": "GET",
    "path": "/api/v3/agent-phone/admin/policies",
    "queryKeys": [],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.policies.create",
    "method": "POST",
    "path": "/api/v3/agent-phone/admin/policies",
    "queryKeys": [],
    "pathKeys": [],
    "idempotency": false,
    "revision": false,
    "inputFields": [
      {
        "name": "actorId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "actorType",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaIds",
        "required": true,
        "kind": "array"
      },
      {
        "name": "resourceIds",
        "required": true,
        "kind": "array"
      },
      {
        "name": "actions",
        "required": true,
        "kind": "array"
      },
      {
        "name": "enabled",
        "required": true,
        "kind": "boolean"
      },
      {
        "name": "limits",
        "required": false,
        "kind": "object"
      },
      {
        "name": "expiresAt",
        "required": false,
        "kind": "number"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      }
    ]
  },
  {
    "name": "agentPhone.admin.policies.update",
    "method": "PATCH",
    "path": "/api/v3/agent-phone/admin/policies/{policyId}",
    "queryKeys": [],
    "pathKeys": [
      "policyId"
    ],
    "idempotency": false,
    "revision": true,
    "inputFields": [
      {
        "name": "policyId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "actorId",
        "required": true,
        "kind": "string"
      },
      {
        "name": "actorType",
        "required": true,
        "kind": "string"
      },
      {
        "name": "personaIds",
        "required": true,
        "kind": "array"
      },
      {
        "name": "resourceIds",
        "required": true,
        "kind": "array"
      },
      {
        "name": "actions",
        "required": true,
        "kind": "array"
      },
      {
        "name": "enabled",
        "required": true,
        "kind": "boolean"
      },
      {
        "name": "limits",
        "required": false,
        "kind": "object"
      },
      {
        "name": "expiresAt",
        "required": false,
        "kind": "number"
      },
      {
        "name": "adminToken",
        "required": false,
        "kind": "string"
      },
      {
        "name": "userPoolId",
        "required": false,
        "kind": "string"
      },
      {
        "name": "revision",
        "required": true,
        "kind": "number"
      }
    ]
  }
] as const;
