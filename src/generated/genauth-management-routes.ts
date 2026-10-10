// Generated from Authing/authing-node-sdk 4.0.2 (cc9f6ed7e0f41542d94d2634fb4fa8a35a622a86) and GenAuth extensions.
// Upstream contract copyright (c) 2019-present Authing; MIT, see docs/authing-sdk-LICENSE.txt.
// Do not edit by hand. Authing wire names are intentionally preserved.
export const genAuthManagementRoutes = {
  "add": {
    "method": "POST",
    "path": "/api/v3/ip-list",
    "namespace": "riskLists",
    "alias": "addIp",
    "required": [
      {
        "name": "expireAt",
        "kind": "string"
      },
      {
        "name": "limitList",
        "kind": "array"
      },
      {
        "name": "removeType",
        "kind": "string"
      },
      {
        "name": "addType",
        "kind": "string"
      },
      {
        "name": "ipType",
        "kind": "string"
      },
      {
        "name": "ips",
        "kind": "string"
      }
    ]
  },
  "addDepartmentMembers": {
    "method": "POST",
    "path": "/api/v3/add-department-members",
    "namespace": "departments",
    "alias": "addMembers",
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      },
      {
        "name": "userIds",
        "kind": "array"
      },
      {
        "name": "departmentId",
        "kind": "string"
      }
    ]
  },
  "addDevice": {
    "method": "POST",
    "path": "/api/v3/add-device",
    "namespace": "devices",
    "required": [
      {
        "name": "customData",
        "kind": "value"
      },
      {
        "name": "type",
        "kind": "string"
      },
      {
        "name": "deviceUniqueId",
        "kind": "string"
      }
    ]
  },
  "addGroupMembers": {
    "method": "POST",
    "path": "/api/v3/add-group-members",
    "namespace": "groups",
    "alias": "addMembers",
    "required": [
      {
        "name": "userIds",
        "kind": "array",
        "minItems": 1
      },
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "addPolicyUserAttribution": {
    "method": "POST",
    "path": "/api/v3/add-invitation-policy-user-attribution",
    "namespace": "invitations",
    "required": [
      {
        "name": "targetType",
        "kind": "string"
      },
      {
        "name": "targetIdentifier",
        "kind": "string"
      },
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "addPolicyUserAttributionsBatch": {
    "method": "POST",
    "path": "/api/v3/add-invitation-policy-user-attributions-batch",
    "namespace": "invitations",
    "required": [
      {
        "name": "targets",
        "kind": "array"
      },
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "addRiskListPolicy": {
    "method": "POST",
    "path": "/api/v3/risk-list-policy",
    "namespace": "riskLists",
    "required": [
      {
        "name": "limitList",
        "kind": "string"
      },
      {
        "name": "action",
        "kind": "string"
      },
      {
        "name": "removeType",
        "kind": "string"
      },
      {
        "name": "eventStateType",
        "kind": "string"
      },
      {
        "name": "countThr",
        "kind": "number"
      },
      {
        "name": "timeRange",
        "kind": "number"
      },
      {
        "name": "userCond",
        "kind": "string"
      },
      {
        "name": "ipCond",
        "kind": "string"
      },
      {
        "name": "userRange",
        "kind": "string"
      },
      {
        "name": "ipRange",
        "kind": "string"
      },
      {
        "name": "optObject",
        "kind": "string"
      }
    ]
  },
  "addTenantDepartmentMembers": {
    "method": "POST",
    "path": "/api/v3/add-tenant-department-members",
    "namespace": "tenants",
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      },
      {
        "name": "departmentId",
        "kind": "string"
      }
    ]
  },
  "addTenantUsers": {
    "method": "POST",
    "path": "/api/v3/add-tenant-users",
    "namespace": "tenants",
    "alias": "addUsers",
    "required": [
      {
        "name": "tenantId",
        "kind": "string"
      },
      {
        "name": "linkUserIds",
        "kind": "array"
      }
    ]
  },
  "addUser": {
    "method": "POST",
    "path": "/api/v3/user-list",
    "namespace": "riskLists",
    "alias": "addUser",
    "required": [
      {
        "name": "expireAt",
        "kind": "number"
      },
      {
        "name": "limitList",
        "kind": "array"
      },
      {
        "name": "removeType",
        "kind": "string"
      },
      {
        "name": "addType",
        "kind": "string"
      },
      {
        "name": "userListType",
        "kind": "string"
      },
      {
        "name": "userIds",
        "kind": "array"
      }
    ]
  },
  "addWhitelist": {
    "method": "POST",
    "path": "/api/v3/add-whitelist",
    "namespace": "whitelist",
    "required": [
      {
        "name": "type",
        "kind": "value"
      }
    ]
  },
  "addWhitelistOfApp": {
    "method": "POST",
    "path": "/api/v3/add-whitelist-of-app",
    "namespace": "whitelist",
    "required": [
      {
        "name": "type",
        "kind": "value"
      },
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "approval": {
    "method": "POST",
    "path": "/api/v3/batch-approval-universal-invitation-applicants",
    "namespace": "invitations",
    "required": [
      {
        "name": "applicantIds",
        "kind": "array"
      }
    ]
  },
  "assignAsaAccount": {
    "method": "POST",
    "path": "/api/v3/assign-asa-account",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "accountId",
        "kind": "string"
      },
      {
        "name": "targets",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "assignRole": {
    "method": "POST",
    "path": "/api/v3/assign-role",
    "namespace": "roles",
    "alias": "assign",
    "required": [
      {
        "name": "code",
        "kind": "string"
      },
      {
        "name": "targets",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "assignRoleBatch": {
    "method": "POST",
    "path": "/api/v3/assign-role-batch",
    "namespace": "roles",
    "alias": "assignBatch",
    "required": [
      {
        "name": "roles",
        "kind": "array",
        "minItems": 1
      },
      {
        "name": "targets",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "associateTenantResource": {
    "method": "POST",
    "path": "/api/v3/associate-tenant-resource",
    "namespace": "resources",
    "required": [
      {
        "name": "code",
        "kind": "string"
      },
      {
        "name": "association",
        "kind": "value"
      }
    ]
  },
  "authorizeApplicationAccess": {
    "method": "POST",
    "path": "/api/v3/authorize-application-access",
    "namespace": "applications",
    "alias": "authorizeAccess",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "list",
        "kind": "array"
      }
    ]
  },
  "authorizeDataPolicies": {
    "method": "POST",
    "path": "/api/v3/authorize-data-policies",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "policyIds",
        "kind": "array",
        "minItems": 1
      },
      {
        "name": "targetList",
        "kind": "array"
      }
    ]
  },
  "authorizeResources": {
    "method": "POST",
    "path": "/api/v3/authorize-resources",
    "namespace": "permissions",
    "alias": "authorize",
    "required": [
      {
        "name": "list",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "batchApplicationsAuth": {
    "method": "DELETE",
    "path": "/api/v3/batch-applications-auth",
    "namespace": "applications",
    "queryKeys": [
      "authIds"
    ],
    "required": [
      {
        "name": "authIds",
        "kind": "array"
      }
    ]
  },
  "batchBindPolicy": {
    "method": "POST",
    "path": "/api/v3/update-invitation-roster-batch-bind-policy",
    "namespace": "invitations",
    "required": [
      {
        "name": "rosterIds",
        "kind": "array"
      },
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "batchCreateDnef": {
    "method": "POST",
    "path": "/api/v3/batch-create-dnef",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      }
    ]
  },
  "batchDeleteCommonResource": {
    "method": "POST",
    "path": "/api/v3/delete-common-resources-batch",
    "namespace": "resources",
    "required": [
      {
        "name": "ids",
        "kind": "array"
      }
    ]
  },
  "batchDeleteInvitationPolicies": {
    "method": "POST",
    "path": "/api/v3/delete-invitation-policies-batch",
    "namespace": "invitations",
    "required": [
      {
        "name": "policyIds",
        "kind": "array"
      }
    ]
  },
  "batchGetUserEncryptPassword": {
    "method": "POST",
    "path": "/api/v3/batch-get-user-encrypt-password",
    "namespace": "users",
    "required": [
      {
        "name": "userIds",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "batchProcessApproval": {
    "method": "PUT",
    "path": "/api/v3/approval-batch-process",
    "namespace": "approvals",
    "alias": "processBatch",
    "required": [
      {
        "name": "numbers",
        "kind": "array"
      }
    ]
  },
  "batchUnbindPolicy": {
    "method": "POST",
    "path": "/api/v3/update-invitation-roster-batch-unbind-policy",
    "namespace": "invitations",
    "required": [
      {
        "name": "rosterIds",
        "kind": "array"
      },
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "bindPublicAccountOfRoles": {
    "method": "POST",
    "path": "/api/v3/set-public-account-of-roles",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "roleIds",
        "kind": "array"
      },
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "bindUsersPublicAccount": {
    "method": "POST",
    "path": "/api/v3/set-public-account-of-users",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "publicAccountId",
        "kind": "string"
      },
      {
        "name": "userIds",
        "kind": "array"
      }
    ]
  },
  "cancelSyncRiskOperation": {
    "method": "POST",
    "path": "/api/v3/cancel-sync-risk-operation",
    "namespace": "sync",
    "required": [
      {
        "name": "syncRiskOperationIds",
        "kind": "string",
        "minItems": 1
      }
    ]
  },
  "capture": {
    "method": "POST",
    "path": "/api/v3/metadata/ueba/capture",
    "namespace": "metadata",
    "required": [
      {
        "name": "data",
        "kind": "value"
      }
    ]
  },
  "changeExtIdpConnAssociationState": {
    "method": "POST",
    "path": "/api/v3/change-ext-idp-conn-association-state",
    "namespace": "identityProviders",
    "required": [
      {
        "name": "id",
        "kind": "string"
      },
      {
        "name": "association",
        "kind": "value"
      }
    ]
  },
  "changeExtIdpConnState": {
    "method": "POST",
    "path": "/api/v3/change-ext-idp-conn-state",
    "namespace": "identityProviders",
    "required": [
      {
        "name": "id",
        "kind": "string"
      },
      {
        "name": "enabled",
        "kind": "value"
      }
    ]
  },
  "changeIntoPublicAccount": {
    "method": "POST",
    "path": "/api/v3/transfer-into-public-account",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "changeUserpoolTenanExtIdpConnState": {
    "method": "POST",
    "path": "/api/v3/change-userpool-tenant-ext-idp-conn-state",
    "namespace": "applications",
    "required": [
      {
        "name": "connIds",
        "kind": "array"
      },
      {
        "name": "enabled",
        "kind": "value"
      }
    ]
  },
  "changeUserpoolTenantExtIdpConnState": {
    "method": "POST",
    "path": "/api/v3/change-userpool-tenant-ext-idp-conn-state",
    "namespace": "applications",
    "required": [
      {
        "name": "connIds",
        "kind": "array"
      },
      {
        "name": "enabled",
        "kind": "value"
      }
    ]
  },
  "checkDataPolicyExists": {
    "method": "GET",
    "path": "/api/v3/check-data-policy-exists",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "policyName",
        "kind": "string"
      }
    ]
  },
  "checkDataResourceExists": {
    "method": "GET",
    "path": "/api/v3/check-data-resource-exists",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      }
    ]
  },
  "checkDomainAvailable": {
    "method": "POST",
    "path": "/api/v3/check-domain-available",
    "namespace": "applications",
    "required": [
      {
        "name": "domain",
        "kind": "string"
      }
    ]
  },
  "checkExternalUserPermission": {
    "method": "POST",
    "path": "/api/v3/check-external-user-permission",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "externalId",
        "kind": "string"
      },
      {
        "name": "action",
        "kind": "string"
      },
      {
        "name": "resources",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "checkM2mPermission": {
    "method": "POST",
    "path": "/api/v3/check-m2m-permission",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "accessKeyId",
        "kind": "string"
      },
      {
        "name": "action",
        "kind": "string"
      },
      {
        "name": "resources",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "checkM2mSameLevelPermission": {
    "method": "POST",
    "path": "/api/v3/check-m2m-same-level-permission",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "accessKeyId",
        "kind": "string"
      },
      {
        "name": "action",
        "kind": "string"
      },
      {
        "name": "resource",
        "kind": "string"
      },
      {
        "name": "resourceNodeCodes",
        "kind": "array"
      }
    ]
  },
  "checkMutualExclusion": {
    "method": "POST",
    "path": "/api/v3/check-role-mutual-exclusion",
    "namespace": "roles",
    "required": [
      {
        "name": "roles",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "checkParamsNamespace": {
    "method": "POST",
    "path": "/api/v3/check-role-params",
    "namespace": "roles",
    "required": [
      {
        "name": "namespace",
        "kind": "string"
      }
    ]
  },
  "checkPermission": {
    "method": "POST",
    "path": "/api/v3/check-permission",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "action",
        "kind": "string"
      },
      {
        "name": "resources",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "checkPermissionNamespaceExists": {
    "method": "POST",
    "path": "/api/v3/check-permission-namespace-exists",
    "namespace": "dataPermissions",
    "required": []
  },
  "checkRoleMutualExclusion": {
    "method": "POST",
    "path": "/api/v3/check-role-mutual-exclusion",
    "namespace": "roles",
    "required": [
      {
        "name": "roles",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "checkRoleParams": {
    "method": "POST",
    "path": "/api/v3/check-role-params",
    "namespace": "roles",
    "required": [
      {
        "name": "namespace",
        "kind": "string"
      }
    ]
  },
  "checkSessionStatus": {
    "method": "POST",
    "path": "/api/v3/check-session-status",
    "namespace": "users",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "checkUserSameLevelPermission": {
    "method": "POST",
    "path": "/api/v3/check-user-same-level-permission",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "action",
        "kind": "string"
      },
      {
        "name": "resource",
        "kind": "string"
      },
      {
        "name": "resourceNodeCodes",
        "kind": "array"
      }
    ]
  },
  "closedList": {
    "method": "GET",
    "path": "/api/v3/approval-closed-list",
    "namespace": "approvals",
    "alias": "listClosed",
    "defaults": {
      "pageNo": 1,
      "pageSize": 10
    },
    "required": []
  },
  "closeGlobalMfaSettings": {
    "method": "POST",
    "path": "/api/v3/disable-global-mfa-settings",
    "namespace": "security",
    "required": [
      {
        "name": "disableFactors",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "configEmailProvider": {
    "method": "POST",
    "path": "/api/v3/config-email-provider",
    "namespace": "email",
    "required": [
      {
        "name": "type",
        "kind": "string"
      },
      {
        "name": "enabled",
        "kind": "value"
      }
    ]
  },
  "copyAuthFlowConfig": {
    "method": "POST",
    "path": "/api/v3/copy-auth-flow-config",
    "namespace": "applications",
    "required": [
      {
        "name": "fromAppId",
        "kind": "value"
      },
      {
        "name": "flowId",
        "kind": "value"
      },
      {
        "name": "targetAppId",
        "kind": "value"
      }
    ]
  },
  "copyInvitationPolicyById": {
    "method": "POST",
    "path": "/api/v3/copy-invitation-policy-by-id",
    "namespace": "invitations",
    "required": [
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "copyOperate": {
    "method": "POST",
    "path": "/api/v3/metadata/copy-operate",
    "namespace": "metadata",
    "required": [
      {
        "name": "customConfig",
        "kind": "value"
      },
      {
        "name": "modelId",
        "kind": "string"
      },
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "copyRowRelation": {
    "method": "POST",
    "path": "/api/v3/metadata/copy-row-relation",
    "namespace": "metadata",
    "required": [
      {
        "name": "relationRowId",
        "kind": "string"
      },
      {
        "name": "rowId",
        "kind": "string"
      },
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "createAccessKey": {
    "method": "POST",
    "path": "/api/v3/create-access-key",
    "namespace": "accessKeys",
    "alias": "create",
    "required": [
      {
        "name": "type",
        "kind": "value"
      }
    ]
  },
  "createAdminRole": {
    "method": "POST",
    "path": "/api/v3/create-admin-role",
    "namespace": "roles",
    "required": [
      {
        "name": "code",
        "kind": "string"
      },
      {
        "name": "name",
        "kind": "string"
      }
    ]
  },
  "createApplication": {
    "method": "POST",
    "path": "/api/v3/create-application",
    "namespace": "applications",
    "alias": "create",
    "required": [
      {
        "name": "appName",
        "kind": "string"
      }
    ]
  },
  "createArrayDataResource": {
    "method": "POST",
    "path": "/api/v3/create-array-data-resource",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "resourceName",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      },
      {
        "name": "struct",
        "kind": "array",
        "minItems": 1
      },
      {
        "name": "actions",
        "kind": "array",
        "minItems": 0
      }
    ]
  },
  "createAsaAccount": {
    "method": "POST",
    "path": "/api/v3/create-asa-account",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "accountInfo",
        "kind": "value"
      }
    ]
  },
  "createAsaAccountBatch": {
    "method": "POST",
    "path": "/api/v3/create-asa-accounts-batch",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "list",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "createAsaAccountsBatch": {
    "method": "POST",
    "path": "/api/v3/create-asa-accounts-batch",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "list",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "createAuthFlowAppConfig": {
    "method": "POST",
    "path": "/api/v3/create-auth-flow-app-config",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "createAuthFlowFunction": {
    "method": "POST",
    "path": "/api/v3/create-auth-flow-function",
    "namespace": "pipelines",
    "required": [
      {
        "name": "funcName",
        "kind": "string"
      },
      {
        "name": "scene",
        "kind": "value"
      },
      {
        "name": "sourceCode",
        "kind": "string"
      }
    ]
  },
  "createDataPolicy": {
    "method": "POST",
    "path": "/api/v3/create-data-policy",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "policyName",
        "kind": "string"
      },
      {
        "name": "statementList",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "createDataResource": {
    "method": "POST",
    "path": "/api/v3/create-data-resource",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "resourceName",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      },
      {
        "name": "type",
        "kind": "value"
      },
      {
        "name": "struct",
        "kind": "value"
      },
      {
        "name": "actions",
        "kind": "array",
        "minItems": 0
      }
    ]
  },
  "createDataResourceByArray": {
    "method": "POST",
    "path": "/api/v3/create-array-data-resource",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "resourceName",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      },
      {
        "name": "struct",
        "kind": "array",
        "minItems": 1
      },
      {
        "name": "actions",
        "kind": "array",
        "minItems": 0
      }
    ]
  },
  "createDataResourceByString": {
    "method": "POST",
    "path": "/api/v3/create-string-data-resource",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "resourceName",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      },
      {
        "name": "struct",
        "kind": "string"
      },
      {
        "name": "actions",
        "kind": "array",
        "minItems": 0
      }
    ]
  },
  "createDataResourceByTree": {
    "method": "POST",
    "path": "/api/v3/create-tree-data-resource",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "resourceName",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      },
      {
        "name": "struct",
        "kind": "array",
        "minItems": 1
      },
      {
        "name": "actions",
        "kind": "array",
        "minItems": 0
      }
    ]
  },
  "createDepartment": {
    "method": "POST",
    "path": "/api/v3/create-department",
    "namespace": "departments",
    "alias": "create",
    "required": [
      {
        "name": "name",
        "kind": "string"
      },
      {
        "name": "organizationCode",
        "kind": "string"
      },
      {
        "name": "parentDepartmentId",
        "kind": "string"
      }
    ]
  },
  "createDepartmentTree": {
    "method": "POST",
    "path": "/api/v3/create-department-tree",
    "namespace": "departments",
    "required": [
      {
        "name": "name",
        "kind": "string"
      }
    ]
  },
  "createDevice": {
    "method": "POST",
    "path": "/api/v3/create-device",
    "namespace": "devices",
    "required": [
      {
        "name": "customData",
        "kind": "value"
      },
      {
        "name": "type",
        "kind": "string"
      },
      {
        "name": "deviceUniqueId",
        "kind": "string"
      }
    ]
  },
  "createDnef": {
    "method": "POST",
    "path": "/api/v3/create-dnef",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "key",
        "kind": "string"
      },
      {
        "name": "valueType",
        "kind": "value"
      },
      {
        "name": "label",
        "kind": "string"
      },
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      }
    ]
  },
  "createDynamicGroup": {
    "method": "POST",
    "path": "/api/v3/create-dynamic-group",
    "namespace": "dynamicGroups",
    "alias": "create",
    "required": [
      {
        "name": "name",
        "kind": "string"
      },
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "createEventApp": {
    "method": "POST",
    "path": "/api/v3/create-event-app",
    "namespace": "events",
    "required": [
      {
        "name": "logo",
        "kind": "string"
      },
      {
        "name": "name",
        "kind": "string"
      },
      {
        "name": "identifier",
        "kind": "string"
      }
    ]
  },
  "createExtIdp": {
    "method": "POST",
    "path": "/api/v3/create-ext-idp",
    "namespace": "identityProviders",
    "alias": "create",
    "required": [
      {
        "name": "name",
        "kind": "string"
      },
      {
        "name": "type",
        "kind": "value"
      }
    ]
  },
  "createExtIdpConn": {
    "method": "POST",
    "path": "/api/v3/create-ext-idp-conn",
    "namespace": "identityProviders",
    "alias": "createConnection",
    "required": [
      {
        "name": "extIdpId",
        "kind": "string"
      },
      {
        "name": "type",
        "kind": "value"
      },
      {
        "name": "identifier",
        "kind": "string"
      },
      {
        "name": "displayName",
        "kind": "string"
      },
      {
        "name": "fields",
        "kind": "value"
      }
    ]
  },
  "createField": {
    "method": "POST",
    "path": "/api/v3/metadata/create-field",
    "namespace": "metadata",
    "required": [
      {
        "name": "userVisible",
        "kind": "value"
      },
      {
        "name": "relationOptionalRange",
        "kind": "value"
      },
      {
        "name": "relationShowKey",
        "kind": "string"
      },
      {
        "name": "relationMultiple",
        "kind": "value"
      },
      {
        "name": "relationType",
        "kind": "string"
      },
      {
        "name": "forLogin",
        "kind": "value"
      },
      {
        "name": "fuzzySearch",
        "kind": "value"
      },
      {
        "name": "dropDown",
        "kind": "value"
      },
      {
        "name": "format",
        "kind": "number"
      },
      {
        "name": "regexp",
        "kind": "string"
      },
      {
        "name": "min",
        "kind": "number"
      },
      {
        "name": "max",
        "kind": "number"
      },
      {
        "name": "maxLength",
        "kind": "number"
      },
      {
        "name": "unique",
        "kind": "value"
      },
      {
        "name": "require",
        "kind": "value"
      },
      {
        "name": "default",
        "kind": "value"
      },
      {
        "name": "help",
        "kind": "string"
      },
      {
        "name": "editable",
        "kind": "value"
      },
      {
        "name": "show",
        "kind": "value"
      },
      {
        "name": "type",
        "kind": "string"
      },
      {
        "name": "key",
        "kind": "string"
      },
      {
        "name": "name",
        "kind": "string"
      },
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "createGroup": {
    "method": "POST",
    "path": "/api/v3/create-group",
    "namespace": "groups",
    "alias": "create",
    "required": [
      {
        "name": "code",
        "kind": "string"
      },
      {
        "name": "name",
        "kind": "string"
      }
    ]
  },
  "createGroupsBatch": {
    "method": "POST",
    "path": "/api/v3/create-groups-batch",
    "namespace": "groups",
    "required": [
      {
        "name": "list",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "createInvitationPolicy": {
    "method": "POST",
    "path": "/api/v3/create-invitation-policy",
    "namespace": "invitations",
    "alias": "createPolicy",
    "required": [
      {
        "name": "name",
        "kind": "string"
      }
    ]
  },
  "createInvitationRoster": {
    "method": "POST",
    "path": "/api/v3/create-invitation-roster",
    "namespace": "invitations",
    "alias": "createRoster",
    "required": [
      {
        "name": "name",
        "kind": "string"
      }
    ]
  },
  "createModel": {
    "method": "POST",
    "path": "/api/v3/metadata/create-model",
    "namespace": "metadata",
    "required": [
      {
        "name": "parentKey",
        "kind": "string"
      },
      {
        "name": "enable",
        "kind": "value"
      },
      {
        "name": "type",
        "kind": "string"
      },
      {
        "name": "description",
        "kind": "value"
      },
      {
        "name": "name",
        "kind": "string"
      }
    ]
  },
  "createMultipleTenantAdmin": {
    "method": "POST",
    "path": "/api/v3/create-multiple-tenant-admin",
    "namespace": "tenants",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "tenantIds",
        "kind": "array"
      }
    ]
  },
  "createNamespace": {
    "method": "POST",
    "path": "/api/v3/create-namespace",
    "namespace": "namespaces",
    "alias": "create",
    "required": [
      {
        "name": "code",
        "kind": "string"
      },
      {
        "name": "name",
        "kind": "string"
      }
    ]
  },
  "createNamespacesBatch": {
    "method": "POST",
    "path": "/api/v3/create-namespaces-batch",
    "namespace": "namespaces",
    "alias": "createBatch",
    "required": [
      {
        "name": "list",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "createOperate": {
    "method": "POST",
    "path": "/api/v3/metadata/create-operate",
    "namespace": "metadata",
    "required": [
      {
        "name": "show",
        "kind": "value"
      },
      {
        "name": "icon",
        "kind": "string"
      },
      {
        "name": "config",
        "kind": "value"
      },
      {
        "name": "operateName",
        "kind": "string"
      },
      {
        "name": "operateKey",
        "kind": "string"
      },
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "createOrganization": {
    "method": "POST",
    "path": "/api/v3/create-organization",
    "namespace": "organizations",
    "alias": "create",
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      },
      {
        "name": "organizationName",
        "kind": "string"
      }
    ]
  },
  "createOrUpdateGroup": {
    "method": "POST",
    "path": "/api/v3/create-or-update-group",
    "namespace": "groups",
    "required": [
      {
        "name": "code",
        "kind": "string"
      },
      {
        "name": "name",
        "kind": "string"
      }
    ]
  },
  "createPermissionNamespace": {
    "method": "POST",
    "path": "/api/v3/create-permission-namespace",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "code",
        "kind": "string"
      },
      {
        "name": "name",
        "kind": "string"
      }
    ]
  },
  "createPermissionNamespacesBatch": {
    "method": "POST",
    "path": "/api/v3/create-permission-namespaces-batch",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "list",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "createPipelineFunction": {
    "method": "POST",
    "path": "/api/v3/create-pipeline-function",
    "namespace": "pipelines",
    "alias": "create",
    "required": [
      {
        "name": "funcName",
        "kind": "string"
      },
      {
        "name": "scene",
        "kind": "value"
      },
      {
        "name": "sourceCode",
        "kind": "string"
      }
    ]
  },
  "createPost": {
    "method": "POST",
    "path": "/api/v3/create-post",
    "namespace": "positions",
    "alias": "create",
    "required": [
      {
        "name": "code",
        "kind": "string"
      },
      {
        "name": "name",
        "kind": "string"
      }
    ]
  },
  "createProgrammaticAccessAccount": {
    "method": "POST",
    "path": "/api/v3/create-programmatic-access-account",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "tokenLifetime",
        "kind": "number"
      }
    ]
  },
  "createPublicAccount": {
    "method": "POST",
    "path": "/api/v3/create-public-account",
    "namespace": "publicAccounts",
    "alias": "create",
    "required": []
  },
  "createPublicAccountsBatch": {
    "method": "POST",
    "path": "/api/v3/create-public-accounts-batch",
    "namespace": "publicAccounts",
    "alias": "createBatch",
    "required": [
      {
        "name": "list",
        "kind": "array"
      }
    ]
  },
  "createResource": {
    "method": "POST",
    "path": "/api/v3/create-resource",
    "namespace": "resources",
    "alias": "create",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "createResourcesBatch": {
    "method": "POST",
    "path": "/api/v3/create-resources-batch",
    "namespace": "resources",
    "alias": "createBatch",
    "required": [
      {
        "name": "list",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "createRole": {
    "method": "POST",
    "path": "/api/v3/create-role",
    "namespace": "roles",
    "alias": "create",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "createRolesBatch": {
    "method": "POST",
    "path": "/api/v3/create-roles-batch",
    "namespace": "roles",
    "alias": "createBatch",
    "required": [
      {
        "name": "list",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "createRow": {
    "method": "POST",
    "path": "/api/v3/metadata/create-row",
    "namespace": "metadata",
    "required": [
      {
        "name": "data",
        "kind": "value"
      },
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "createRowRelation": {
    "method": "POST",
    "path": "/api/v3/metadata/create-row-relation",
    "namespace": "metadata",
    "required": [
      {
        "name": "valueList",
        "kind": "array"
      },
      {
        "name": "rowId",
        "kind": "string"
      },
      {
        "name": "fieldId",
        "kind": "string"
      },
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "createStringDataResource": {
    "method": "POST",
    "path": "/api/v3/create-string-data-resource",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "resourceName",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      },
      {
        "name": "struct",
        "kind": "string"
      },
      {
        "name": "actions",
        "kind": "array",
        "minItems": 0
      }
    ]
  },
  "createSyncTask": {
    "method": "POST",
    "path": "/api/v3/create-sync-task",
    "namespace": "sync",
    "alias": "create",
    "required": [
      {
        "name": "syncTaskName",
        "kind": "string"
      },
      {
        "name": "syncTaskType",
        "kind": "value"
      },
      {
        "name": "clientConfig",
        "kind": "value"
      },
      {
        "name": "syncTaskFlow",
        "kind": "value"
      },
      {
        "name": "syncTaskTrigger",
        "kind": "value"
      },
      {
        "name": "provisioningScope",
        "kind": "value"
      },
      {
        "name": "fieldMapping",
        "kind": "array"
      },
      {
        "name": "timedScheduler",
        "kind": "value"
      }
    ]
  },
  "createTenant": {
    "method": "POST",
    "path": "/api/v3/create-tenant",
    "namespace": "tenants",
    "alias": "create",
    "required": [
      {
        "name": "name",
        "kind": "string"
      },
      {
        "name": "appIds",
        "kind": "array"
      }
    ]
  },
  "createTenantCooperator": {
    "method": "POST",
    "path": "/api/v3/create-tenant-cooperator",
    "namespace": "tenants",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "policies",
        "kind": "array"
      }
    ]
  },
  "createTenantEnterpriseCertification": {
    "method": "POST",
    "path": "/api/v3/create-tenant-enterprise-certification",
    "namespace": "tenants",
    "required": [
      {
        "name": "businessName",
        "kind": "string"
      },
      {
        "name": "businessLicense",
        "kind": "string"
      },
      {
        "name": "businessRegistrationName",
        "kind": "string"
      },
      {
        "name": "unifiedSocialCredit",
        "kind": "string"
      },
      {
        "name": "legalRepresentativeName",
        "kind": "string"
      },
      {
        "name": "nationalIdentificationNumber",
        "kind": "string"
      },
      {
        "name": "personalBankCardNumber",
        "kind": "string"
      },
      {
        "name": "bankReservedPhone",
        "kind": "string"
      },
      {
        "name": "tenantId",
        "kind": "string"
      }
    ]
  },
  "createTenantUser": {
    "method": "POST",
    "path": "/api/v3/create-tenant-user",
    "namespace": "tenants",
    "required": [
      {
        "name": "tenantId",
        "kind": "string"
      }
    ]
  },
  "createTreeDataResource": {
    "method": "POST",
    "path": "/api/v3/create-tree-data-resource",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "resourceName",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      },
      {
        "name": "struct",
        "kind": "array",
        "minItems": 1
      },
      {
        "name": "actions",
        "kind": "array",
        "minItems": 0
      }
    ]
  },
  "createUser": {
    "method": "POST",
    "path": "/api/v3/create-user",
    "namespace": "users",
    "alias": "create",
    "required": []
  },
  "createUsersBatch": {
    "method": "POST",
    "path": "/api/v3/create-users-batch",
    "namespace": "users",
    "alias": "createBatch",
    "required": [
      {
        "name": "list",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "createVerifyDevice": {
    "method": "POST",
    "path": "/api/v3/authing-verify/create-device",
    "namespace": "devices",
    "required": [
      {
        "name": "customData",
        "kind": "value"
      },
      {
        "name": "type",
        "kind": "string"
      },
      {
        "name": "deviceUniqueId",
        "kind": "string"
      }
    ]
  },
  "createWebhook": {
    "method": "POST",
    "path": "/api/v3/create-webhook",
    "namespace": "webhooks",
    "alias": "create",
    "required": [
      {
        "name": "name",
        "kind": "string"
      },
      {
        "name": "url",
        "kind": "string"
      },
      {
        "name": "events",
        "kind": "array"
      },
      {
        "name": "contentType",
        "kind": "value"
      }
    ]
  },
  "deactivateAllSessions": {
    "method": "POST",
    "path": "/api/v3/deactivate-all-sessions",
    "namespace": "sessions",
    "alias": "deactivateAll",
    "required": [
      {
        "name": "type",
        "kind": "value"
      }
    ]
  },
  "deactivateSessionsBatch": {
    "method": "POST",
    "path": "/api/v3/deactivate-sessions-batch",
    "namespace": "sessions",
    "alias": "deactivateBatch",
    "required": [
      {
        "name": "sessionIds",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "defineEvent": {
    "method": "POST",
    "path": "/api/v3/define-event",
    "namespace": "events",
    "required": [
      {
        "name": "eventDescription",
        "kind": "string"
      },
      {
        "name": "eventType",
        "kind": "string"
      }
    ]
  },
  "deleteAccessKey": {
    "method": "POST",
    "path": "/api/v3/delete-access-key",
    "namespace": "accessKeys",
    "alias": "delete",
    "required": [
      {
        "name": "accessKeyId",
        "kind": "string"
      }
    ]
  },
  "deleteAdminRoles": {
    "method": "POST",
    "path": "/api/v3/delete-admin-roles",
    "namespace": "roles",
    "required": [
      {
        "name": "codeList",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "deleteAdminRolesBatch": {
    "method": "POST",
    "path": "/api/v3/delete-admin-roles",
    "namespace": "roles",
    "required": [
      {
        "name": "codeList",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "deleteApplication": {
    "method": "POST",
    "path": "/api/v3/delete-application",
    "namespace": "applications",
    "alias": "delete",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "deleteAsaAccount": {
    "method": "POST",
    "path": "/api/v3/delete-asa-account",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "accountId",
        "kind": "string"
      }
    ]
  },
  "deleteAsaAccountBatch": {
    "method": "POST",
    "path": "/api/v3/delete-asa-accounts-batch",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "accountIds",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "deleteAsaAccountsBatch": {
    "method": "POST",
    "path": "/api/v3/delete-asa-accounts-batch",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "accountIds",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "deleteAuth": {
    "method": "DELETE",
    "path": "/api/v3/batch-applications-auth",
    "namespace": "applications",
    "queryKeys": [
      "authIds"
    ],
    "required": [
      {
        "name": "authIds",
        "kind": "array"
      }
    ]
  },
  "deleteAuthFlowConfig": {
    "method": "POST",
    "path": "/api/v3/delete-auth-flow-config",
    "namespace": "applications",
    "required": []
  },
  "deleteAuthFlowFunction": {
    "method": "POST",
    "path": "/api/v3/delete-auth-flow-function",
    "namespace": "pipelines",
    "required": [
      {
        "name": "funcId",
        "kind": "string"
      }
    ]
  },
  "deleteById": {
    "method": "DELETE",
    "path": "/api/v3/ip-list/{id}",
    "namespace": "riskLists",
    "alias": "deleteIp",
    "pathKeys": [
      "id"
    ],
    "required": [
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "deleteCommonAuthorizeBatch": {
    "method": "DELETE",
    "path": "/api/v3/delete-common-authorize-batch",
    "namespace": "policies",
    "required": []
  },
  "deleteCommonResourcesBatch": {
    "method": "POST",
    "path": "/api/v3/delete-common-resources-batch",
    "namespace": "resources",
    "required": [
      {
        "name": "ids",
        "kind": "array"
      }
    ]
  },
  "deleteCustomFields": {
    "method": "POST",
    "path": "/api/v3/delete-custom-fields",
    "namespace": "customFields",
    "alias": "delete",
    "required": [
      {
        "name": "list",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "deleteDataPolicy": {
    "method": "POST",
    "path": "/api/v3/delete-data-policy",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "deleteDataResource": {
    "method": "POST",
    "path": "/api/v3/delete-data-resource",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      }
    ]
  },
  "deleteDepartment": {
    "method": "POST",
    "path": "/api/v3/delete-department",
    "namespace": "departments",
    "alias": "delete",
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      },
      {
        "name": "departmentId",
        "kind": "string"
      }
    ]
  },
  "deleteDepartmentAndChilds": {
    "method": "POST",
    "path": "/api/v3/delete-department-and-childs",
    "namespace": "departments",
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      },
      {
        "name": "departmentId",
        "kind": "string"
      }
    ]
  },
  "deleteDepartmentSyncRelations": {
    "method": "POST",
    "path": "/api/v3/delete-department-sync-relations",
    "namespace": "departments",
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      },
      {
        "name": "departmentId",
        "kind": "string"
      },
      {
        "name": "provider",
        "kind": "string"
      }
    ]
  },
  "deleteDevice": {
    "method": "POST",
    "path": "/api/v3/delete-device-by-user",
    "namespace": "devices",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "deleteDnef": {
    "method": "POST",
    "path": "/api/v3/delete-dnef",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      },
      {
        "name": "key",
        "kind": "string"
      }
    ]
  },
  "deleteExtIdp": {
    "method": "POST",
    "path": "/api/v3/delete-ext-idp",
    "namespace": "identityProviders",
    "alias": "delete",
    "required": [
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "deleteExtIdpConn": {
    "method": "POST",
    "path": "/api/v3/delete-ext-idp-conn",
    "namespace": "identityProviders",
    "alias": "deleteConnection",
    "required": [
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "deleteGroupsBatch": {
    "method": "POST",
    "path": "/api/v3/delete-groups-batch",
    "namespace": "groups",
    "alias": "deleteBatch",
    "required": [
      {
        "name": "codeList",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "deleteInvitationRoster": {
    "method": "POST",
    "path": "/api/v3/delete-invitation-roster",
    "namespace": "invitations",
    "required": [
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "deleteInvitationRosterBatch": {
    "method": "POST",
    "path": "/api/v3/delete-invitation-rosters-batch",
    "namespace": "invitations",
    "required": [
      {
        "name": "ids",
        "kind": "array"
      }
    ]
  },
  "deleteInvitees": {
    "method": "POST",
    "path": "/api/v3/batch-delete-invitation-invitees",
    "namespace": "invitations",
    "required": [
      {
        "name": "inviteeIds",
        "kind": "array"
      },
      {
        "name": "rosterId",
        "kind": "string"
      }
    ]
  },
  "deleteMultipleTenantAdmin": {
    "method": "POST",
    "path": "/api/v3/delete-multiple-tenant-admin",
    "namespace": "tenants",
    "queryKeys": [
      "userId"
    ],
    "required": []
  },
  "deleteNamespace": {
    "method": "POST",
    "path": "/api/v3/delete-namespace",
    "namespace": "namespaces",
    "alias": "delete",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "deleteNamespacesBatch": {
    "method": "POST",
    "path": "/api/v3/delete-namespaces-batch",
    "namespace": "namespaces",
    "alias": "deleteBatch",
    "required": [
      {
        "name": "codeList",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "deleteOrganization": {
    "method": "POST",
    "path": "/api/v3/delete-organization",
    "namespace": "organizations",
    "alias": "delete",
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      }
    ]
  },
  "deletePermissionNamespace": {
    "method": "POST",
    "path": "/api/v3/delete-permission-namespace",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "deletePermissionNamespacesBatch": {
    "method": "POST",
    "path": "/api/v3/delete-permission-namespaces-batch",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "codes",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "deletePipelineFunction": {
    "method": "POST",
    "path": "/api/v3/delete-pipeline-function",
    "namespace": "pipelines",
    "alias": "delete",
    "required": [
      {
        "name": "funcId",
        "kind": "string"
      }
    ]
  },
  "deleteProgrammaticAccessAccount": {
    "method": "POST",
    "path": "/api/v3/delete-programmatic-access-account",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "accessKey",
        "kind": "string"
      }
    ]
  },
  "deletePublicAccountsBatch": {
    "method": "POST",
    "path": "/api/v3/delete-public-accounts-batch",
    "namespace": "publicAccounts",
    "alias": "deleteBatch",
    "required": [
      {
        "name": "userIds",
        "kind": "array"
      }
    ]
  },
  "deleteResource": {
    "method": "POST",
    "path": "/api/v3/delete-resource",
    "namespace": "resources",
    "alias": "delete",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "deleteResourcesBatch": {
    "method": "POST",
    "path": "/api/v3/delete-resources-batch",
    "namespace": "resources",
    "alias": "deleteBatch",
    "required": []
  },
  "deleteRiskListPolicyById": {
    "method": "DELETE",
    "path": "/api/v3/risk-list-policy/{id}",
    "namespace": "riskLists",
    "pathKeys": [
      "id"
    ],
    "required": [
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "deleteRoles": {
    "method": "POST",
    "path": "/api/v3/multiple-namespace-delete-roles-batch",
    "namespace": "roles",
    "required": [
      {
        "name": "roleList",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "deleteRolesBatch": {
    "method": "POST",
    "path": "/api/v3/delete-roles-batch",
    "namespace": "roles",
    "alias": "deleteBatch",
    "required": [
      {
        "name": "codeList",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "deleteTenant": {
    "method": "POST",
    "path": "/api/v3/delete-tenant",
    "namespace": "tenants",
    "alias": "delete",
    "required": [
      {
        "name": "tenantId",
        "kind": "string"
      }
    ]
  },
  "deleteTenantAdmin": {
    "method": "POST",
    "path": "/api/v3/delete-tenant-admin",
    "namespace": "tenants",
    "required": [
      {
        "name": "tenantId",
        "kind": "string"
      }
    ]
  },
  "deleteTenantCooperator": {
    "method": "POST",
    "path": "/api/v3/delete-tenant-cooperator",
    "namespace": "tenants",
    "queryKeys": [
      "userId"
    ],
    "required": []
  },
  "deleteTenantUser": {
    "method": "POST",
    "path": "/api/v3/delete-tenant-user",
    "namespace": "tenants",
    "required": [
      {
        "name": "tenantId",
        "kind": "string"
      }
    ]
  },
  "deleteUserListById": {
    "method": "DELETE",
    "path": "/api/v3/user-list/{id}",
    "namespace": "riskLists",
    "alias": "deleteUser",
    "pathKeys": [
      "id"
    ],
    "required": [
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "deleteUsersBatch": {
    "method": "POST",
    "path": "/api/v3/delete-users-batch",
    "namespace": "users",
    "alias": "deleteBatch",
    "required": [
      {
        "name": "userIds",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "deleteUserSyncRelations": {
    "method": "POST",
    "path": "/api/v3/delete-user-sync-relations",
    "namespace": "users",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "provider",
        "kind": "string"
      }
    ]
  },
  "deleteWebhook": {
    "method": "POST",
    "path": "/api/v3/delete-webhook",
    "namespace": "webhooks",
    "alias": "delete",
    "required": [
      {
        "name": "webhookIds",
        "kind": "array"
      }
    ]
  },
  "deleteWhitelist": {
    "method": "POST",
    "path": "/api/v3/delete-whitelist",
    "namespace": "whitelist",
    "required": [
      {
        "name": "type",
        "kind": "value"
      }
    ]
  },
  "deleteWhitelistOfApp": {
    "method": "POST",
    "path": "/api/v3/delete-whitelist-of-app",
    "namespace": "whitelist",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "type",
        "kind": "value"
      }
    ]
  },
  "detailAuthSubject": {
    "method": "GET",
    "path": "/api/v3/get-subject-auth-detail",
    "namespace": "applications",
    "required": [
      {
        "name": "targetId",
        "kind": "string"
      },
      {
        "name": "targetType",
        "kind": "value"
      },
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "disabledAuthFlowApp": {
    "method": "POST",
    "path": "/api/v3/disabled-auth-flow-app",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "disableDevice": {
    "method": "POST",
    "path": "/api/v3/disable-device-by-user",
    "namespace": "devices",
    "required": [
      {
        "name": "id",
        "kind": "string"
      },
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "disableGlobalMfaSettings": {
    "method": "POST",
    "path": "/api/v3/disable-global-mfa-settings",
    "namespace": "security",
    "required": [
      {
        "name": "disableFactors",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "disableLdapServer": {
    "method": "POST",
    "path": "/api/v3/disable-ldap-server",
    "namespace": "ldap",
    "required": [
      {
        "name": "enabled",
        "kind": "value"
      }
    ]
  },
  "disableProgrammaticAccessAccount": {
    "method": "POST",
    "path": "/api/v3/disable-programmatic-access-account",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "accessKey",
        "kind": "string"
      }
    ]
  },
  "dynamicGroupSearchPart": {
    "method": "POST",
    "path": "/api/v3/dynamic-group-search-part",
    "namespace": "dynamicGroups",
    "required": []
  },
  "enabledAuth": {
    "method": "POST",
    "path": "/api/v3/update-auth-enabled",
    "namespace": "applications",
    "required": [
      {
        "name": "id",
        "kind": "string"
      },
      {
        "name": "enabled",
        "kind": "value"
      }
    ]
  },
  "enabledAuthFlowApp": {
    "method": "POST",
    "path": "/api/v3/enabled-auth-flow-app",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "enableDevice": {
    "method": "POST",
    "path": "/api/v3/enable-device-by-user",
    "namespace": "devices",
    "required": [
      {
        "name": "id",
        "kind": "string"
      },
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "enableProgrammaticAccessAccount": {
    "method": "POST",
    "path": "/api/v3/enable-programmatic-access-account",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "accessKey",
        "kind": "string"
      }
    ]
  },
  "executeOperate": {
    "method": "POST",
    "path": "/api/v3/metadata/execute-operate",
    "namespace": "metadata",
    "required": [
      {
        "name": "customConfig",
        "kind": "value"
      },
      {
        "name": "modelId",
        "kind": "string"
      },
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "exportMetadata": {
    "method": "POST",
    "path": "/api/v3/metadata/export",
    "namespace": "metadata",
    "required": [
      {
        "name": "idList",
        "kind": "array"
      },
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "exportModel": {
    "method": "POST",
    "path": "/api/v3/metadata/export/model",
    "namespace": "metadata",
    "required": [
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "exportUsers": {
    "method": "POST",
    "path": "/api/v3/invitation-invitee/export",
    "namespace": "invitations",
    "required": [
      {
        "name": "rosterId",
        "kind": "string"
      }
    ]
  },
  "extIdpConnApps": {
    "method": "GET",
    "path": "/api/v3/ext-idp-conn-apps",
    "namespace": "identityProviders",
    "required": [
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "extIdpConnStateByApps": {
    "method": "GET",
    "path": "/api/v3/ext-idp-conn-apps",
    "namespace": "identityProviders",
    "required": [
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "filter": {
    "method": "POST",
    "path": "/api/v3/filter-universal-invitation-applicants",
    "namespace": "invitations",
    "required": []
  },
  "filterUsers": {
    "method": "POST",
    "path": "/api/v3/list-invitation-invitees",
    "namespace": "invitations",
    "required": [
      {
        "name": "rosterId",
        "kind": "string"
      }
    ]
  },
  "findAppLists": {
    "method": "GET",
    "path": "/api/v3/get-supported-device-exclusive-apps",
    "namespace": "deviceRules",
    "required": [
      {
        "name": "keyword",
        "kind": "string"
      }
    ]
  },
  "findIpList": {
    "method": "GET",
    "path": "/api/v3/ip-list",
    "namespace": "riskLists",
    "alias": "listIps",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "ipType",
        "kind": "string"
      }
    ]
  },
  "findLastLoginAppsByDeviceIds": {
    "method": "POST",
    "path": "/api/v3/get-last-login-apps-by-deviceIds",
    "namespace": "devices",
    "required": [
      {
        "name": "deviceIds",
        "kind": "array"
      }
    ]
  },
  "findLastLoginAppsByDeviceIdsV2": {
    "method": "POST",
    "path": "/api/v3/get-last-login-apps-by-device-ids",
    "namespace": "devices",
    "required": [
      {
        "name": "deviceIds",
        "kind": "array"
      }
    ]
  },
  "findRiskListPolicy": {
    "method": "GET",
    "path": "/api/v3/risk-list-policy",
    "namespace": "riskLists",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "optObject",
        "kind": "string"
      }
    ]
  },
  "findUserList": {
    "method": "GET",
    "path": "/api/v3/user-list",
    "namespace": "riskLists",
    "alias": "listUsers",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "userListType",
        "kind": "string"
      }
    ]
  },
  "generateInviteTenantUserLink": {
    "method": "POST",
    "path": "/api/v3/generate-invite-tenant-user-link",
    "namespace": "tenants",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "validityTerm",
        "kind": "string"
      }
    ]
  },
  "generateUniversalInvitation": {
    "method": "POST",
    "path": "/api/v3/generate-universal-invitation-link",
    "namespace": "invitations",
    "required": []
  },
  "getAccessKey": {
    "method": "GET",
    "path": "/api/v3/get-access-key",
    "namespace": "accessKeys",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "accessKeyId",
        "kind": "string"
      }
    ]
  },
  "getAccessKeyList": {
    "method": "GET",
    "path": "/api/v3/list-access-key",
    "namespace": "accessKeys",
    "required": []
  },
  "getAdminAuditLogs": {
    "method": "POST",
    "path": "/api/v3/get-admin-audit-logs",
    "namespace": "auditLogs",
    "alias": "list",
    "required": []
  },
  "getAllDepartments": {
    "method": "GET",
    "path": "/api/v3/get-all-departments",
    "namespace": "departments",
    "defaults": {
      "departmentId": "root",
      "departmentIdType": "department_id",
      "withCustomData": false
    },
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      }
    ]
  },
  "getAllGroups": {
    "method": "GET",
    "path": "/api/v3/get-all-groups",
    "namespace": "groups",
    "defaults": {
      "fetchMembers": false
    },
    "required": []
  },
  "getAllMetadata": {
    "method": "POST",
    "path": "/api/v3/metadata/get-all-metadata",
    "namespace": "metadata",
    "required": [
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "getAllMetadataRow": {
    "method": "POST",
    "path": "/api/v3/metadata/get-all-row-by-scrollid",
    "namespace": "metadata",
    "required": [
      {
        "name": "size",
        "kind": "number"
      },
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "getAllRightsItem": {
    "method": "GET",
    "path": "/api/v3/get-all-rights-items",
    "namespace": "billing",
    "required": []
  },
  "getAllValidScopeSettings": {
    "method": "GET",
    "path": "/api/v3/get-device-exclusive-valid-scope-settings",
    "namespace": "deviceRules",
    "required": []
  },
  "getAllWhiteListSettings": {
    "method": "GET",
    "path": "/api/v3/get-device-exclusive-white-list-settings",
    "namespace": "deviceRules",
    "required": []
  },
  "getApplication": {
    "method": "GET",
    "path": "/api/v3/get-application",
    "namespace": "applications",
    "alias": "get",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "getApplicationAccessControlUserList": {
    "method": "POST",
    "path": "/api/v3/get-application-access-control-user-list",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "isDirectUser",
        "kind": "value"
      }
    ]
  },
  "getApplicationPermissionStrategy": {
    "method": "GET",
    "path": "/api/v3/get-application-permission-strategy",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "getApplicationSecret": {
    "method": "GET",
    "path": "/api/v3/get-application-secret",
    "namespace": "applications",
    "alias": "getSecret",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "getApplicationSimpleInfo": {
    "method": "GET",
    "path": "/api/v3/get-application-simple-info",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "getAsaAccount": {
    "method": "GET",
    "path": "/api/v3/get-asa-account",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "accountId",
        "kind": "string"
      }
    ]
  },
  "getAsaAccountAssignedTargets": {
    "method": "GET",
    "path": "/api/v3/get-asa-account-assigned-targets",
    "namespace": "applications",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "accountId",
        "kind": "string"
      }
    ]
  },
  "getAsaAccountBatch": {
    "method": "POST",
    "path": "/api/v3/get-asa-accounts-batch",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "accountIds",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "getAsaAccountsBatch": {
    "method": "POST",
    "path": "/api/v3/get-asa-accounts-batch",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "accountIds",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "getAssignedAccount": {
    "method": "GET",
    "path": "/api/v3/get-assigned-account",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "targetType",
        "kind": "value"
      },
      {
        "name": "targetIdentifier",
        "kind": "string"
      }
    ]
  },
  "getAuthFlowConfig": {
    "method": "GET",
    "path": "/api/v3/get-auth-flow-config",
    "namespace": "applications",
    "required": [
      {
        "name": "flowId",
        "kind": "value"
      },
      {
        "name": "appId",
        "kind": "value"
      }
    ]
  },
  "getAuthFlowConfigByAppId": {
    "method": "GET",
    "path": "/api/v3/get-auth-flow-config-by-app-id",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "value"
      }
    ]
  },
  "getAuthFlowFunction": {
    "method": "GET",
    "path": "/api/v3/get-auth-flow-function",
    "namespace": "pipelines",
    "required": [
      {
        "name": "funcId",
        "kind": "string"
      }
    ]
  },
  "getAuthorizedResources": {
    "method": "GET",
    "path": "/api/v3/get-authorized-resources",
    "namespace": "permissions",
    "alias": "listResources",
    "defaults": {
      "withDenied": false
    },
    "required": [
      {
        "name": "targetType",
        "kind": "value"
      },
      {
        "name": "targetIdentifier",
        "kind": "string"
      }
    ]
  },
  "getBindPwd": {
    "method": "GET",
    "path": "/api/v3/get-ldap-server-random-pwd",
    "namespace": "ldap",
    "required": []
  },
  "getCurrentAuthFlowConfig": {
    "method": "GET",
    "path": "/api/v3/get-current-auth-flow-config",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "value"
      }
    ]
  },
  "getCurrentPackageInfo": {
    "method": "GET",
    "path": "/api/v3/get-current-package-info",
    "namespace": "billing",
    "required": []
  },
  "getCustomData": {
    "method": "GET",
    "path": "/api/v3/get-custom-data",
    "namespace": "customFields",
    "alias": "getData",
    "required": [
      {
        "name": "targetType",
        "kind": "value"
      },
      {
        "name": "targetIdentifier",
        "kind": "string"
      }
    ]
  },
  "getCustomFields": {
    "method": "GET",
    "path": "/api/v3/get-custom-fields",
    "namespace": "customFields",
    "alias": "get",
    "required": [
      {
        "name": "targetType",
        "kind": "value"
      }
    ]
  },
  "getDataPolicy": {
    "method": "GET",
    "path": "/api/v3/get-data-policy",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "getDataResource": {
    "method": "GET",
    "path": "/api/v3/get-data-resource",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      }
    ]
  },
  "getDepartment": {
    "method": "GET",
    "path": "/api/v3/get-department",
    "namespace": "departments",
    "alias": "get",
    "defaults": {
      "departmentIdType": "department_id",
      "withCustomData": false,
      "flatCustomData": false
    },
    "required": []
  },
  "getDepartmentAllApp": {
    "method": "POST",
    "path": "/api/v3/get-department-available-app",
    "namespace": "departments",
    "required": [
      {
        "name": "departmentId",
        "kind": "string"
      }
    ]
  },
  "getDepartmentAvailableApp": {
    "method": "POST",
    "path": "/api/v3/get-department-available-app",
    "namespace": "departments",
    "required": [
      {
        "name": "departmentId",
        "kind": "string"
      }
    ]
  },
  "getDepartmentById": {
    "method": "GET",
    "path": "/api/v3/get-department-by-id",
    "namespace": "departments",
    "alias": "getById",
    "defaults": {
      "withCustomData": false
    },
    "required": [
      {
        "name": "departmentId",
        "kind": "string"
      }
    ]
  },
  "getDepartmentSyncRelations": {
    "method": "GET",
    "path": "/api/v3/get-department-sync-relations",
    "namespace": "departments",
    "defaults": {
      "departmentIdType": "department_id",
      "withCustomData": false
    },
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      }
    ]
  },
  "getDetail": {
    "method": "GET",
    "path": "/api/v3/approval",
    "namespace": "approvals",
    "alias": "get",
    "required": [
      {
        "name": "number",
        "kind": "string"
      }
    ]
  },
  "getDeviceStatus": {
    "method": "POST",
    "path": "/api/v3/device-status",
    "namespace": "devices",
    "required": [
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "getDynamicGroupMatch": {
    "method": "GET",
    "path": "/api/v3/get-dynamic-group-match",
    "namespace": "dynamicGroups",
    "required": [
      {
        "name": "dynamicGroupId",
        "kind": "string"
      }
    ]
  },
  "getEmailProvider": {
    "method": "GET",
    "path": "/api/v3/get-email-provider",
    "namespace": "email",
    "required": []
  },
  "getEmailTemplates": {
    "method": "GET",
    "path": "/api/v3/get-email-templates",
    "namespace": "email",
    "required": []
  },
  "getExternalUserResourceStruct": {
    "method": "POST",
    "path": "/api/v3/get-external-user-resource-struct",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "externalId",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      }
    ]
  },
  "getExtIdp": {
    "method": "GET",
    "path": "/api/v3/get-ext-idp",
    "namespace": "identityProviders",
    "alias": "get",
    "required": [
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "getGlobalMfaSettings": {
    "method": "GET",
    "path": "/api/v3/get-global-mfa-settings",
    "namespace": "security",
    "required": []
  },
  "getGroup": {
    "method": "GET",
    "path": "/api/v3/get-group",
    "namespace": "groups",
    "alias": "get",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "getGroupAuthorizedResources": {
    "method": "GET",
    "path": "/api/v3/get-group-authorized-resources",
    "namespace": "groups",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "getGroupsOfPublicAccount": {
    "method": "GET",
    "path": "/api/v3/get-groups-of-public-account",
    "namespace": "publicAccounts",
    "defaults": {
      "userIdType": "user_id"
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getImportTemplate": {
    "method": "GET",
    "path": "/api/v3/metadata/get-import-template",
    "namespace": "metadata",
    "required": [
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "getInvitationRoster": {
    "method": "GET",
    "path": "/api/v3/get-invitation-roster",
    "namespace": "invitations",
    "defaults": {
      "withCreatorDetail": false,
      "withUserCount": false,
      "withAssignedPolicy": false
    },
    "required": [
      {
        "name": "rosterId",
        "kind": "string"
      }
    ]
  },
  "getInviteEmailTemplate": {
    "method": "POST",
    "path": "/api/v3/get-invitation-policy-email-template",
    "namespace": "invitations",
    "required": [
      {
        "name": "scene",
        "kind": "string"
      },
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "getM2mPermissionList": {
    "method": "POST",
    "path": "/api/v3/get-m2m-permission-list",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "accessKeyId",
        "kind": "string"
      }
    ]
  },
  "getM2mResourcePermissionList": {
    "method": "POST",
    "path": "/api/v3/get-m2m-resource-permission-list",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "accessKeyId",
        "kind": "string"
      },
      {
        "name": "resources",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "getM2mResourceStruct": {
    "method": "POST",
    "path": "/api/v3/get-m2m-resource-struct",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "accessKeyId",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      }
    ]
  },
  "getMauPeriodUsageHistory": {
    "method": "GET",
    "path": "/api/v3/get-mau-period-usage-history",
    "namespace": "billing",
    "required": [
      {
        "name": "startTime",
        "kind": "string"
      },
      {
        "name": "endTime",
        "kind": "string"
      }
    ]
  },
  "getMetadataGroupList": {
    "method": "POST",
    "path": "/api/v3/metadata/group",
    "namespace": "metadata",
    "required": [
      {
        "name": "groupId",
        "kind": "string"
      }
    ]
  },
  "getMfaStatus": {
    "method": "GET",
    "path": "/api/v3/get-mfa-status",
    "namespace": "users",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getMfaTriggerData": {
    "method": "GET",
    "path": "/api/v3/get-mfa-trigger-data",
    "namespace": "applications",
    "defaults": {
      "userIdType": "user_id"
    },
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getModel": {
    "method": "GET",
    "path": "/api/v3/metadata/get-model",
    "namespace": "metadata",
    "required": [
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "getMultipleTenantAdmin": {
    "method": "GET",
    "path": "/api/v3/get-multiple-tenant-admin",
    "namespace": "tenants",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getNamespace": {
    "method": "GET",
    "path": "/api/v3/get-namespace",
    "namespace": "namespaces",
    "alias": "get",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "getNamespacesBatch": {
    "method": "GET",
    "path": "/api/v3/get-namespaces-batch",
    "namespace": "namespaces",
    "alias": "getBatch",
    "required": [
      {
        "name": "codeList",
        "kind": "array",
        "minItems": 0
      }
    ]
  },
  "getOrderDetail": {
    "method": "GET",
    "path": "/api/v3/get-order-detail",
    "namespace": "billing",
    "required": [
      {
        "name": "orderNo",
        "kind": "string"
      }
    ]
  },
  "getOrderPayDetail": {
    "method": "GET",
    "path": "/api/v3/get-order-pay-detail",
    "namespace": "billing",
    "required": [
      {
        "name": "orderNo",
        "kind": "string"
      }
    ]
  },
  "getOrders": {
    "method": "GET",
    "path": "/api/v3/get-orders",
    "namespace": "billing",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": []
  },
  "getOrganization": {
    "method": "GET",
    "path": "/api/v3/get-organization",
    "namespace": "organizations",
    "alias": "get",
    "defaults": {
      "withCustomData": false,
      "withPost": false
    },
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      }
    ]
  },
  "getOrganizationBatch": {
    "method": "GET",
    "path": "/api/v3/get-organization-batch",
    "namespace": "organizations",
    "required": [
      {
        "name": "organizationCodeList",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "getOrganizationsBatch": {
    "method": "GET",
    "path": "/api/v3/get-organization-batch",
    "namespace": "organizations",
    "defaults": {
      "withCustomData": false,
      "withPost": false
    },
    "required": [
      {
        "name": "organizationCodeList",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "getOtpSecretByUser": {
    "method": "GET",
    "path": "/api/v3/get-otp-secret-by-user",
    "namespace": "users",
    "defaults": {
      "userIdType": "user_id"
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getParentDepartment": {
    "method": "GET",
    "path": "/api/v3/get-parent-department",
    "namespace": "departments",
    "alias": "getParent",
    "defaults": {
      "departmentIdType": "department_id",
      "withCustomData": false
    },
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      }
    ]
  },
  "getPermissionNamespace": {
    "method": "GET",
    "path": "/api/v3/get-permission-namespace",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "getPermissionNamespacesBatch": {
    "method": "GET",
    "path": "/api/v3/get-permission-namespaces-batch",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "codes",
        "kind": "array",
        "minItems": 0
      }
    ]
  },
  "getPipelineFunction": {
    "method": "GET",
    "path": "/api/v3/get-pipeline-function",
    "namespace": "pipelines",
    "alias": "get",
    "required": [
      {
        "name": "funcId",
        "kind": "string"
      }
    ]
  },
  "getPipelineLogs": {
    "method": "GET",
    "path": "/api/v3/get-pipeline-logs",
    "namespace": "pipelines",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "funcId",
        "kind": "string"
      }
    ]
  },
  "getPolicyDetailById": {
    "method": "GET",
    "path": "/api/v3/get-invitation-policy",
    "namespace": "invitations",
    "defaults": {
      "withCreatorDetail": false
    },
    "required": [
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "getPolicyUserAttributionDetail": {
    "method": "GET",
    "path": "/api/v3/get-invitation-policy-user-attribution",
    "namespace": "invitations",
    "required": [
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "getPost": {
    "method": "GET",
    "path": "/api/v3/get-post",
    "namespace": "positions",
    "alias": "get",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "getPostById": {
    "method": "POST",
    "path": "/api/v3/get-post-by-id",
    "namespace": "positions",
    "alias": "getById",
    "required": []
  },
  "getPostOfPublicUser": {
    "method": "GET",
    "path": "/api/v3/get-post-of-public-account",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getPublicAccount": {
    "method": "GET",
    "path": "/api/v3/get-public-account",
    "namespace": "publicAccounts",
    "alias": "get",
    "defaults": {
      "userIdType": "user_id",
      "withCustomData": false,
      "withDepartmentIds": false
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getPublicAccountBatch": {
    "method": "GET",
    "path": "/api/v3/get-public-account-batch",
    "namespace": "publicAccounts",
    "alias": "getBatch",
    "defaults": {
      "userIdType": "user_id",
      "withCustomData": false,
      "withDepartmentIds": false
    },
    "required": [
      {
        "name": "userIds",
        "kind": "array"
      }
    ]
  },
  "getPublicAccountDepartments": {
    "method": "GET",
    "path": "/api/v3/get-departments-of-public-account",
    "namespace": "publicAccounts",
    "defaults": {
      "userIdType": "user_id",
      "page": 1,
      "limit": 10,
      "withCustomData": false,
      "withDepartmentPaths": false,
      "sortBy": "JoinDepartmentAt",
      "orderBy": "Desc"
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getPublicAccountOfGroups": {
    "method": "POST",
    "path": "/api/v3/set-public-account-of-groups",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "groupIds",
        "kind": "array"
      },
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getPublicAccountRoles": {
    "method": "GET",
    "path": "/api/v3/get-roles-of-public-account",
    "namespace": "publicAccounts",
    "defaults": {
      "userIdType": "user_id",
      "namespace": "default"
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getPublicAccountsOfDepartment": {
    "method": "GET",
    "path": "/api/v3/get-public-accounts-of-department",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "departmentId",
        "kind": "string"
      }
    ]
  },
  "getPublicAccountsOfGroup": {
    "method": "GET",
    "path": "/api/v3/get-public-accounts-of-group",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "groupId",
        "kind": "string"
      }
    ]
  },
  "getPublicAccountsOfPost": {
    "method": "GET",
    "path": "/api/v3/get-public-accounts-of-post",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "postId",
        "kind": "string"
      }
    ]
  },
  "getPublicAccountsOfRole": {
    "method": "GET",
    "path": "/api/v3/get-public-accounts-of-role",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "roleId",
        "kind": "string"
      }
    ]
  },
  "getPublicAccountsOfUser": {
    "method": "GET",
    "path": "/api/v3/get-public-accounts-of-user",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getRelationDetails": {
    "method": "GET",
    "path": "/api/v3/metadata/get-row-relation-details",
    "namespace": "metadata",
    "required": []
  },
  "getRelationInfo": {
    "method": "POST",
    "path": "/api/v3/metadata/get-relation-info",
    "namespace": "metadata",
    "required": [
      {
        "name": "idList",
        "kind": "array"
      },
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "getRelationValue": {
    "method": "GET",
    "path": "/api/v3/metadata/get-row-relation",
    "namespace": "metadata",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "modelId",
        "kind": "string"
      },
      {
        "name": "fieldId",
        "kind": "string"
      },
      {
        "name": "rowId",
        "kind": "string"
      }
    ]
  },
  "getResource": {
    "method": "GET",
    "path": "/api/v3/get-resource",
    "namespace": "resources",
    "alias": "get",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "getResourceAuthorizedTargets": {
    "method": "POST",
    "path": "/api/v3/get-resource-authorized-targets",
    "namespace": "permissions",
    "required": [
      {
        "name": "resource",
        "kind": "string"
      }
    ]
  },
  "getResourcesBatch": {
    "method": "GET",
    "path": "/api/v3/get-resources-batch",
    "namespace": "resources",
    "alias": "getBatch",
    "required": [
      {
        "name": "codeList",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "getRole": {
    "method": "GET",
    "path": "/api/v3/get-role",
    "namespace": "roles",
    "alias": "get",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "getRoleAuthorizedResources": {
    "method": "GET",
    "path": "/api/v3/get-role-authorized-resources",
    "namespace": "roles",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "getRolePolicyList": {
    "method": "POST",
    "path": "/api/v3/get-role-policy-list",
    "namespace": "roles",
    "required": [
      {
        "name": "code",
        "kind": "string"
      },
      {
        "name": "namespaceCode",
        "kind": "string"
      }
    ]
  },
  "getRow": {
    "method": "GET",
    "path": "/api/v3/metadata/get-row",
    "namespace": "metadata",
    "defaults": {
      "showFieldId": "false"
    },
    "required": [
      {
        "name": "modelId",
        "kind": "string"
      },
      {
        "name": "rowId",
        "kind": "string"
      }
    ]
  },
  "getRowBatch": {
    "method": "POST",
    "path": "/get-row-batch",
    "namespace": "metadata",
    "required": [
      {
        "name": "rowIds",
        "kind": "array"
      },
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "getRowByValue": {
    "method": "GET",
    "path": "/api/v3/metadata/get-row-by-value",
    "namespace": "metadata",
    "defaults": {
      "showFieldId": "false"
    },
    "required": [
      {
        "name": "modelId",
        "kind": "string"
      },
      {
        "name": "key",
        "kind": "string"
      },
      {
        "name": "value",
        "kind": "string"
      }
    ]
  },
  "getRuleSettings": {
    "method": "GET",
    "path": "/api/v3/get-device-exclusive-rule-settings",
    "namespace": "deviceRules",
    "required": []
  },
  "getSecuritySettings": {
    "method": "GET",
    "path": "/api/v3/get-security-settings",
    "namespace": "security",
    "alias": "get",
    "required": []
  },
  "getSubjectAuthDetail": {
    "method": "GET",
    "path": "/api/v3/get-subject-auth-detail",
    "namespace": "applications",
    "required": [
      {
        "name": "targetId",
        "kind": "string"
      },
      {
        "name": "targetType",
        "kind": "value"
      },
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "getSyncJob": {
    "method": "GET",
    "path": "/api/v3/get-sync-job",
    "namespace": "sync",
    "required": [
      {
        "name": "syncJobId",
        "kind": "number"
      }
    ]
  },
  "getSyncTask": {
    "method": "GET",
    "path": "/api/v3/get-sync-task",
    "namespace": "sync",
    "alias": "get",
    "required": [
      {
        "name": "syncTaskId",
        "kind": "number"
      }
    ]
  },
  "getTenant": {
    "method": "GET",
    "path": "/api/v3/get-tenant",
    "namespace": "tenants",
    "alias": "get",
    "required": [
      {
        "name": "tenantId",
        "kind": "string"
      }
    ]
  },
  "getTenantByCode": {
    "method": "GET",
    "path": "/api/v3/get-tenant-by-code",
    "namespace": "tenants",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "getTenantCooperator": {
    "method": "GET",
    "path": "/api/v3/get-tenant-cooperator",
    "namespace": "tenants",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getTenantCooperatorMenu": {
    "method": "GET",
    "path": "/api/v3/get-tenant-cooperator-menu",
    "namespace": "tenants",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getTenantEnterpriseCertification": {
    "method": "GET",
    "path": "/api/v3/get-tenant-enterprise-certification",
    "namespace": "tenants",
    "queryAliases": {
      "tenantId": "tenant_id"
    },
    "required": [
      {
        "name": "tenant_id",
        "kind": "value"
      }
    ]
  },
  "getTenantLittleInfo": {
    "method": "GET",
    "path": "/api/v3/get-tenant-little-info",
    "namespace": "tenants",
    "required": [
      {
        "name": "tenantId",
        "kind": "string"
      }
    ]
  },
  "getTenantUser": {
    "method": "GET",
    "path": "/api/v3/get-tenant-user",
    "namespace": "tenants",
    "required": [
      {
        "name": "tenantId",
        "kind": "string"
      }
    ]
  },
  "getUniversalInvitation": {
    "method": "GET",
    "path": "/api/v3/get-universal-invitation-settings",
    "namespace": "invitations",
    "defaults": {
      "withDepartmentDetail": false
    },
    "required": []
  },
  "getUsageInfo": {
    "method": "GET",
    "path": "/api/v3/get-usage-info",
    "namespace": "billing",
    "required": []
  },
  "getUser": {
    "method": "GET",
    "path": "/api/v3/get-user",
    "namespace": "users",
    "alias": "get",
    "defaults": {
      "userIdType": "user_id",
      "flatCustomData": false,
      "withCustomData": false,
      "withPost": false,
      "withIdentities": false,
      "withDepartmentIds": false
    },
    "required": []
  },
  "getUserAccessibleApps": {
    "method": "GET",
    "path": "/api/v3/get-user-accessible-apps",
    "namespace": "users",
    "defaults": {
      "userIdType": "user_id"
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getUserActionLogs": {
    "method": "POST",
    "path": "/api/v3/get-user-action-logs",
    "namespace": "auditLogs",
    "alias": "listUserActions",
    "required": []
  },
  "getUserAttributionMainDepartment": {
    "method": "GET",
    "path": "/api/v3/get-invitation-policy-user-attribution-main-department",
    "namespace": "invitations",
    "required": [
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "getUserAuthorizedApps": {
    "method": "GET",
    "path": "/api/v3/get-user-authorized-apps",
    "namespace": "users",
    "defaults": {
      "userIdType": "user_id"
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getUserAuthorizedResources": {
    "method": "GET",
    "path": "/api/v3/get-user-authorized-resources",
    "namespace": "users",
    "alias": "listAuthorizedResources",
    "defaults": {
      "userIdType": "user_id"
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getUserBaseFields": {
    "method": "GET",
    "path": "/api/v3/get-user-base-fields",
    "namespace": "customFields",
    "required": []
  },
  "getUserBatch": {
    "method": "GET",
    "path": "/api/v3/get-user-batch",
    "namespace": "users",
    "alias": "getBatch",
    "defaults": {
      "userIdType": "user_id",
      "withCustomData": false,
      "flatCustomData": false,
      "withIdentities": false,
      "withDepartmentIds": false
    },
    "required": [
      {
        "name": "userIds",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "getUserDepartments": {
    "method": "GET",
    "path": "/api/v3/get-user-departments",
    "namespace": "users",
    "alias": "listDepartments",
    "defaults": {
      "userIdType": "user_id",
      "page": 1,
      "limit": 10,
      "withCustomData": false,
      "withDepartmentPaths": false,
      "sortBy": "JoinDepartmentAt",
      "orderBy": "Desc"
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getUserEncryptPasswordBatch": {
    "method": "POST",
    "path": "/api/v3/batch-get-user-encrypt-password",
    "namespace": "users",
    "required": [
      {
        "name": "userIds",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "getUserGroups": {
    "method": "GET",
    "path": "/api/v3/get-user-groups",
    "namespace": "users",
    "alias": "listGroups",
    "defaults": {
      "userIdType": "user_id"
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getUserIdentities": {
    "method": "GET",
    "path": "/api/v3/get-user-identities",
    "namespace": "users",
    "defaults": {
      "userIdType": "user_id"
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getUserLoggedinApps": {
    "method": "GET",
    "path": "/api/v3/get-user-loggedin-apps",
    "namespace": "users",
    "defaults": {
      "userIdType": "user_id"
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getUserLoggedinIdentities": {
    "method": "GET",
    "path": "/api/v3/get-user-logged-in-identities",
    "namespace": "users",
    "defaults": {
      "userIdType": "user_id"
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getUserLoggedInIdentities": {
    "method": "GET",
    "path": "/api/v3/get-user-logged-in-identities",
    "namespace": "users",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getUserLoginHistory": {
    "method": "GET",
    "path": "/api/v3/get-user-login-history",
    "namespace": "users",
    "defaults": {
      "userIdType": "user_id",
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "end",
        "kind": "number"
      }
    ]
  },
  "getUserMfaInfo": {
    "method": "GET",
    "path": "/api/v3/get-user-mfa-info",
    "namespace": "users",
    "defaults": {
      "userIdType": "user_id"
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getUserMfaStatus": {
    "method": "GET",
    "path": "/api/v3/get-mfa-status",
    "namespace": "users",
    "defaults": {
      "userIdType": "user_id"
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getUserPasswordCiphertext": {
    "method": "POST",
    "path": "/api/v3/get-user-password-ciphertext",
    "namespace": "users",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getUserPermissionList": {
    "method": "POST",
    "path": "/api/v3/get-user-permission-list",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "userIds",
        "kind": "array"
      }
    ]
  },
  "getUserPost": {
    "method": "GET",
    "path": "/api/v3/get-user-post",
    "namespace": "positions",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getUserPosts": {
    "method": "GET",
    "path": "/api/v3/get-user-posts",
    "namespace": "positions",
    "alias": "listUserPosts",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getUserPrincipalAuthenticationInfo": {
    "method": "GET",
    "path": "/api/v3/get-user-principal-authentication-info",
    "namespace": "users",
    "defaults": {
      "userIdType": "user_id"
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getUserResourcePermissionList": {
    "method": "POST",
    "path": "/api/v3/get-user-resource-permission-list",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "resources",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "getUserResourceStruct": {
    "method": "POST",
    "path": "/api/v3/get-user-resource-struct",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      }
    ]
  },
  "getUserRoles": {
    "method": "GET",
    "path": "/api/v3/get-user-roles",
    "namespace": "users",
    "alias": "listRoles",
    "defaults": {
      "userIdType": "user_id"
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getUsersOfPublicAccount": {
    "method": "GET",
    "path": "/api/v3/get-users-of-public-account",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "publicAccountId",
        "kind": "string"
      }
    ]
  },
  "getUserSyncRelations": {
    "method": "GET",
    "path": "/api/v3/get-user-sync-relations",
    "namespace": "users",
    "defaults": {
      "userIdType": "user_id"
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "getVerifyConfigApp": {
    "method": "GET",
    "path": "/api/v3/verify-config-app",
    "namespace": "devices",
    "required": []
  },
  "getWebhook": {
    "method": "GET",
    "path": "/api/v3/get-webhook",
    "namespace": "webhooks",
    "alias": "get",
    "required": [
      {
        "name": "webhookId",
        "kind": "string"
      }
    ]
  },
  "getWebhookEventList": {
    "method": "GET",
    "path": "/api/v3/get-webhook-event-list",
    "namespace": "webhooks",
    "required": []
  },
  "getWebhookLogs": {
    "method": "POST",
    "path": "/api/v3/get-webhook-logs",
    "namespace": "webhooks",
    "required": [
      {
        "name": "webhookId",
        "kind": "string"
      }
    ]
  },
  "getWechatMpAccessTokenInfo": {
    "method": "POST",
    "path": "/api/v3/get-weixin-access-token",
    "namespace": "identityProviders",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "appSecret",
        "kind": "string"
      }
    ]
  },
  "getWeixinAccessToken": {
    "method": "POST",
    "path": "/api/v3/get-weixin-access-token",
    "namespace": "identityProviders",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "appSecret",
        "kind": "string"
      }
    ]
  },
  "hasAnyRole": {
    "method": "POST",
    "path": "/api/v3/has-any-role",
    "namespace": "users",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "roles",
        "kind": "array"
      }
    ]
  },
  "importMetadata": {
    "method": "POST",
    "path": "/api/v3/metadata/import",
    "namespace": "metadata",
    "required": [
      {
        "name": "file",
        "kind": "string"
      },
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "importModel": {
    "method": "POST",
    "path": "/api/v3/metadata/import/model",
    "namespace": "metadata",
    "required": [
      {
        "name": "file",
        "kind": "string"
      }
    ]
  },
  "importOtp": {
    "method": "POST",
    "path": "/api/v3/import-otp",
    "namespace": "users",
    "required": [
      {
        "name": "list",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "importTemplate": {
    "method": "GET",
    "path": "/api/v3/invitation-invitee/template",
    "namespace": "invitations",
    "required": []
  },
  "importTenant": {
    "method": "POST",
    "path": "/api/v3/import-tenant",
    "namespace": "tenants",
    "required": [
      {
        "name": "excelUrl",
        "kind": "string"
      }
    ]
  },
  "importTenantHistory": {
    "method": "GET",
    "path": "/api/v3/import-tenant-history",
    "namespace": "tenants",
    "required": []
  },
  "importTenantNotifyUser": {
    "method": "GET",
    "path": "/api/v3/import-tenant-notify-user",
    "namespace": "tenants",
    "required": []
  },
  "importUsers": {
    "method": "POST",
    "path": "/api/v3/invitation-invitee/import",
    "namespace": "invitations",
    "required": [
      {
        "name": "rosterId",
        "kind": "string"
      },
      {
        "name": "file",
        "kind": "string"
      }
    ]
  },
  "isActionAllowed": {
    "method": "POST",
    "path": "/api/v3/is-action-allowed",
    "namespace": "permissions",
    "alias": "isAllowed",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "action",
        "kind": "string"
      },
      {
        "name": "resource",
        "kind": "string"
      }
    ]
  },
  "isDepartmentInDepartment": {
    "method": "GET",
    "path": "/api/v3/is-department-in-department",
    "namespace": "departments",
    "required": [
      {
        "name": "departmentId",
        "kind": "string"
      },
      {
        "name": "organizationCode",
        "kind": "string"
      },
      {
        "name": "parentDepartmentId",
        "kind": "string"
      }
    ]
  },
  "isUserExists": {
    "method": "POST",
    "path": "/api/v3/is-user-exists",
    "namespace": "users",
    "alias": "exists",
    "required": []
  },
  "isUserInDepartment": {
    "method": "GET",
    "path": "/api/v3/is-user-in-department",
    "namespace": "departments",
    "defaults": {
      "departmentIdType": "department_id",
      "includeChildrenDepartments": false
    },
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "organizationCode",
        "kind": "string"
      },
      {
        "name": "departmentId",
        "kind": "string"
      }
    ]
  },
  "kickPublicAccounts": {
    "method": "POST",
    "path": "/api/v3/kick-public-accounts",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "appIds",
        "kind": "array"
      },
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "kickUsers": {
    "method": "POST",
    "path": "/api/v3/kick-users",
    "namespace": "users",
    "alias": "kick",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "linkIdentity": {
    "method": "POST",
    "path": "/api/v3/link-identity",
    "namespace": "users",
    "required": [
      {
        "name": "identifier",
        "kind": "string"
      },
      {
        "name": "extIdpId",
        "kind": "string"
      },
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "userIdInIdp",
        "kind": "string"
      }
    ]
  },
  "listAccessKey": {
    "method": "GET",
    "path": "/api/v3/list-access-key",
    "namespace": "accessKeys",
    "required": []
  },
  "listApplicationActiveUsers": {
    "method": "POST",
    "path": "/api/v3/list-application-active-users",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "listApplications": {
    "method": "GET",
    "path": "/api/v3/list-applications",
    "namespace": "applications",
    "alias": "list",
    "defaults": {
      "page": 1,
      "limit": 10,
      "isIntegrateApp": false,
      "isSelfBuiltApp": false,
      "ssoEnabled": false
    },
    "required": []
  },
  "listApplicationsAuth": {
    "method": "POST",
    "path": "/api/v3/list-applications-auth",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "listApplicationSimpleInfo": {
    "method": "GET",
    "path": "/api/v3/list-application-simple-info",
    "namespace": "applications",
    "defaults": {
      "page": 1,
      "limit": 10,
      "isIntegrateApp": false,
      "isSelfBuiltApp": false,
      "ssoEnabled": false
    },
    "required": []
  },
  "listArchivedUsers": {
    "method": "GET",
    "path": "/api/v3/list-archived-users",
    "namespace": "users",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": []
  },
  "listAsaAccount": {
    "method": "GET",
    "path": "/api/v3/list-asa-accounts",
    "namespace": "applications",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "listAsaAccounts": {
    "method": "GET",
    "path": "/api/v3/list-asa-accounts",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "listAuthApplication": {
    "method": "POST",
    "path": "/api/v3/list-applications-auth",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "listAuthSubject": {
    "method": "POST",
    "path": "/api/v3/list-subject-auth",
    "namespace": "applications",
    "required": [
      {
        "name": "targetId",
        "kind": "string"
      },
      {
        "name": "targetType",
        "kind": "value"
      }
    ]
  },
  "listChildrenDepartments": {
    "method": "GET",
    "path": "/api/v3/list-children-departments",
    "namespace": "departments",
    "alias": "listChildren",
    "defaults": {
      "departmentIdType": "department_id",
      "excludeVirtualNode": false,
      "onlyVirtualNode": false,
      "withCustomData": false
    },
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      },
      {
        "name": "departmentId",
        "kind": "string"
      }
    ]
  },
  "listCommonAuthorize": {
    "method": "GET",
    "path": "/api/v3/list-common-authorize",
    "namespace": "policies",
    "required": []
  },
  "listCommonResource": {
    "method": "GET",
    "path": "/api/v3/list-common-resource",
    "namespace": "resources",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": []
  },
  "listCustFields": {
    "method": "GET",
    "path": "/api/v3/list-custom-fields",
    "namespace": "customFields",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": []
  },
  "listCustomFields": {
    "method": "GET",
    "path": "/api/v3/list-custom-fields",
    "namespace": "customFields",
    "alias": "list",
    "required": []
  },
  "listDataPolices": {
    "method": "GET",
    "path": "/api/v3/list-data-policies",
    "namespace": "dataPermissions",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": []
  },
  "listDataPolicies": {
    "method": "GET",
    "path": "/api/v3/list-data-policies",
    "namespace": "dataPermissions",
    "required": []
  },
  "listDataPolicyTargets": {
    "method": "GET",
    "path": "/api/v3/list-data-policy-targets",
    "namespace": "dataPermissions",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "listDataResources": {
    "method": "GET",
    "path": "/api/v3/list-data-resources",
    "namespace": "dataPermissions",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": []
  },
  "listDepartmentMemberIds": {
    "method": "GET",
    "path": "/api/v3/list-department-member-ids",
    "namespace": "departments",
    "alias": "listMemberIds",
    "defaults": {
      "departmentIdType": "department_id"
    },
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      }
    ]
  },
  "listDepartmentMembers": {
    "method": "GET",
    "path": "/api/v3/list-department-members",
    "namespace": "departments",
    "alias": "listMembers",
    "defaults": {
      "sortBy": "JoinDepartmentAt",
      "orderBy": "Desc",
      "departmentIdType": "department_id",
      "includeChildrenDepartments": false,
      "page": 1,
      "limit": 10,
      "withCustomData": false,
      "withIdentities": false,
      "withDepartmentIds": false
    },
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      },
      {
        "name": "departmentId",
        "kind": "string"
      }
    ]
  },
  "listDnef": {
    "method": "GET",
    "path": "/api/v3/list-dnef",
    "namespace": "dataPermissions",
    "defaults": {
      "startIndex": 1,
      "maxSize": 10
    },
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      }
    ]
  },
  "listEnabledExtIdpConnsByApp": {
    "method": "GET",
    "path": "/api/v3/list-enabled-ext-idp-conns-by-app",
    "namespace": "identityProviders",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "listEventApps": {
    "method": "GET",
    "path": "/api/v3/list-event-apps",
    "namespace": "events",
    "required": []
  },
  "listEvents": {
    "method": "GET",
    "path": "/api/v3/list-events",
    "namespace": "events",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": []
  },
  "listExtIdp": {
    "method": "GET",
    "path": "/api/v3/list-ext-idp",
    "namespace": "identityProviders",
    "alias": "list",
    "required": []
  },
  "listExtIdpConns": {
    "method": "GET",
    "path": "/api/v3/list-ext-idp-conns",
    "namespace": "identityProviders",
    "required": [
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "listField": {
    "method": "GET",
    "path": "/api/v3/metadata/list-field",
    "namespace": "metadata",
    "required": [
      {
        "name": "modelId",
        "kind": "string"
      },
      {
        "name": "from",
        "kind": "string"
      }
    ]
  },
  "listGroupMembers": {
    "method": "GET",
    "path": "/api/v3/list-group-members",
    "namespace": "groups",
    "alias": "listMembers",
    "defaults": {
      "page": 1,
      "limit": 10,
      "withCustomData": false,
      "withIdentities": false,
      "withDepartmentIds": false,
      "flatCustomData": false
    },
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "listGroups": {
    "method": "GET",
    "path": "/api/v3/list-groups",
    "namespace": "groups",
    "alias": "list",
    "defaults": {
      "page": 1,
      "limit": 10,
      "flatCustomData": false
    },
    "required": []
  },
  "listInvitationPolicies": {
    "method": "POST",
    "path": "/api/v3/list-invitation-policies",
    "namespace": "invitations",
    "alias": "listPolicies",
    "required": []
  },
  "listInvitationRoster": {
    "method": "POST",
    "path": "/api/v3/list-invitation-rosters",
    "namespace": "invitations",
    "alias": "listRosters",
    "required": []
  },
  "listInvitationRostersByNonPolicyId": {
    "method": "POST",
    "path": "/api/v3/list-invitation-rosters-by-no-policy-id",
    "namespace": "invitations",
    "required": []
  },
  "listInvitationRostersByPolicyId": {
    "method": "POST",
    "path": "/api/v3/list-invitation-rosters-by-policy-id",
    "namespace": "invitations",
    "required": [
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "listInviteTenantUserRecords": {
    "method": "GET",
    "path": "/api/v3/list-invite-tenant-user-records",
    "namespace": "tenants",
    "required": []
  },
  "listInviteTennatUserRecords": {
    "method": "GET",
    "path": "/api/v3/list-invite-tenant-user-records",
    "namespace": "tenants",
    "required": []
  },
  "listModel": {
    "method": "GET",
    "path": "/api/v3/metadata/list-model",
    "namespace": "metadata",
    "required": []
  },
  "listMultipleTenantAdmin": {
    "method": "GET",
    "path": "/api/v3/list-multiple-tenant-admins",
    "namespace": "tenants",
    "required": []
  },
  "listMultipleTenantAdmins": {
    "method": "GET",
    "path": "/api/v3/list-multiple-tenant-admins",
    "namespace": "tenants",
    "required": []
  },
  "listNamespaceRoles": {
    "method": "GET",
    "path": "/api/v3/list-namespace-roles",
    "namespace": "namespaces",
    "alias": "listRoles",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "listNamespaces": {
    "method": "GET",
    "path": "/api/v3/list-namespaces",
    "namespace": "namespaces",
    "alias": "list",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": []
  },
  "listOperate": {
    "method": "GET",
    "path": "/api/v3/metadata/list-operate",
    "namespace": "metadata",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "listOperateAll": {
    "method": "GET",
    "path": "/api/v3/metadata/all-operate",
    "namespace": "metadata",
    "required": [
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "listOrganizations": {
    "method": "GET",
    "path": "/api/v3/list-organizations",
    "namespace": "organizations",
    "alias": "list",
    "defaults": {
      "page": 1,
      "limit": 10,
      "fetchAll": false,
      "withCustomData": false,
      "withPost": false
    },
    "required": []
  },
  "listPermissionNamespaceRoles": {
    "method": "GET",
    "path": "/api/v3/list-permission-namespace-roles",
    "namespace": "dataPermissions",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "listPermissionNamespaces": {
    "method": "GET",
    "path": "/api/v3/list-permission-namespaces",
    "namespace": "dataPermissions",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": []
  },
  "listPermissionView": {
    "method": "POST",
    "path": "/api/v3/list-permission-view/data",
    "namespace": "dataPermissions",
    "required": []
  },
  "listPermissionViewData": {
    "method": "POST",
    "path": "/api/v3/list-permission-view/data",
    "namespace": "dataPermissions",
    "required": []
  },
  "listPipelineFunctions": {
    "method": "GET",
    "path": "/api/v3/list-pipeline-functions",
    "namespace": "pipelines",
    "alias": "list",
    "required": []
  },
  "listPolicyUserAttributionDetail": {
    "method": "GET",
    "path": "/api/v3/list-invitation-policy-user-attributions",
    "namespace": "invitations",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "policyId",
        "kind": "string"
      },
      {
        "name": "targetType",
        "kind": "string"
      }
    ]
  },
  "listProgrammaticAccessAccounts": {
    "method": "GET",
    "path": "/api/v3/list-programmatic-access-accounts",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "listPublicAccounts": {
    "method": "POST",
    "path": "/api/v3/list-public-accounts",
    "namespace": "publicAccounts",
    "alias": "list",
    "required": []
  },
  "listRegisterExtendsFields": {
    "method": "GET",
    "path": "/api/v3/list-invitation-policy-extends-fields",
    "namespace": "invitations",
    "required": [
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "listResources": {
    "method": "GET",
    "path": "/api/v3/list-resources",
    "namespace": "resources",
    "alias": "list",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": []
  },
  "listResourceTargets": {
    "method": "POST",
    "path": "/api/v3/list-resource-targets",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "actions",
        "kind": "array",
        "minItems": 1
      },
      {
        "name": "resources",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "listRoleAllMembers": {
    "method": "GET",
    "path": "/api/v3/list-role-all-members",
    "namespace": "roles",
    "required": [
      {
        "name": "roleCode",
        "kind": "string"
      },
      {
        "name": "namespaceCode",
        "kind": "string"
      }
    ]
  },
  "listRoleAssignments": {
    "method": "GET",
    "path": "/api/v3/list-role-assignments",
    "namespace": "roles",
    "alias": "listAssignments",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "roleCode",
        "kind": "string"
      }
    ]
  },
  "listRoleDepartments": {
    "method": "GET",
    "path": "/api/v3/list-role-departments",
    "namespace": "roles",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "listRoleMembers": {
    "method": "GET",
    "path": "/api/v3/list-role-members",
    "namespace": "roles",
    "alias": "listMembers",
    "defaults": {
      "page": 1,
      "limit": 10,
      "withCustomData": false,
      "withIdentities": false,
      "withDepartmentIds": false
    },
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "listRoles": {
    "method": "GET",
    "path": "/api/v3/list-roles",
    "namespace": "roles",
    "alias": "list",
    "defaults": {
      "page": 1,
      "limit": 10,
      "namespace": "default"
    },
    "required": []
  },
  "listRow": {
    "method": "POST",
    "path": "/api/v3/metadata/filter",
    "namespace": "metadata",
    "required": [
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "listSessions": {
    "method": "POST",
    "path": "/api/v3/list-sessions",
    "namespace": "sessions",
    "alias": "list",
    "required": []
  },
  "listSessionsDetailByView": {
    "method": "POST",
    "path": "/api/v3/list-sessions-detail-by-view",
    "namespace": "sessions",
    "required": [
      {
        "name": "type",
        "kind": "value"
      },
      {
        "name": "viewId",
        "kind": "string"
      }
    ]
  },
  "listSimpleDataPolices": {
    "method": "GET",
    "path": "/api/v3/list-simple-data-policies",
    "namespace": "dataPermissions",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": []
  },
  "listSimpleDataPolicies": {
    "method": "GET",
    "path": "/api/v3/list-simple-data-policies",
    "namespace": "dataPermissions",
    "required": []
  },
  "listSubjectAuth": {
    "method": "POST",
    "path": "/api/v3/list-subject-auth",
    "namespace": "applications",
    "required": [
      {
        "name": "targetId",
        "kind": "string"
      },
      {
        "name": "targetType",
        "kind": "value"
      }
    ]
  },
  "listSyncJobLogs": {
    "method": "GET",
    "path": "/api/v3/list-sync-job-logs",
    "namespace": "sync",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "syncJobId",
        "kind": "number"
      }
    ]
  },
  "listSyncJobs": {
    "method": "GET",
    "path": "/api/v3/list-sync-jobs",
    "namespace": "sync",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "syncTaskId",
        "kind": "number"
      }
    ]
  },
  "listSyncRiskOperations": {
    "method": "GET",
    "path": "/api/v3/list-sync-risk-operations",
    "namespace": "sync",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": [
      {
        "name": "syncTaskId",
        "kind": "number"
      }
    ]
  },
  "listSyncTasks": {
    "method": "GET",
    "path": "/api/v3/list-sync-tasks",
    "namespace": "sync",
    "alias": "list",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": []
  },
  "listTenantAdmin": {
    "method": "POST",
    "path": "/api/v3/list-tenant-admin",
    "namespace": "tenants",
    "required": []
  },
  "listTenantApplications": {
    "method": "GET",
    "path": "/api/v3/list-tenant-applications",
    "namespace": "applications",
    "required": []
  },
  "listTenantCooperators": {
    "method": "GET",
    "path": "/api/v3/list-tenant-cooperators",
    "namespace": "tenants",
    "required": []
  },
  "listTenantExtIdp": {
    "method": "GET",
    "path": "/api/v3/list-tenant-ext-idp",
    "namespace": "identityProviders",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": []
  },
  "listTenants": {
    "method": "GET",
    "path": "/api/v3/list-tenants",
    "namespace": "tenants",
    "alias": "list",
    "required": []
  },
  "listTenantUsers": {
    "method": "POST",
    "path": "/api/v3/list-tenant-users",
    "namespace": "tenants",
    "alias": "listUsers",
    "required": []
  },
  "listUserBaseFields": {
    "method": "GET",
    "path": "/api/v3/list-user-base-fields",
    "namespace": "customFields",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": []
  },
  "listUsers": {
    "method": "POST",
    "path": "/api/v3/list-users",
    "namespace": "users",
    "alias": "list",
    "required": []
  },
  "listUsersLegacy": {
    "method": "GET",
    "path": "/api/v3/list-users",
    "namespace": "users",
    "defaults": {
      "page": 1,
      "limit": 10,
      "withCustomData": false,
      "withPost": false,
      "withIdentities": false,
      "withDepartmentIds": false,
      "withUserPasswordExpireTime": false
    },
    "required": []
  },
  "listWebhooks": {
    "method": "GET",
    "path": "/api/v3/list-webhooks",
    "namespace": "webhooks",
    "alias": "list",
    "defaults": {
      "page": 1,
      "limit": 10
    },
    "required": []
  },
  "listWhitelist": {
    "method": "GET",
    "path": "/api/v3/list-whitelist",
    "namespace": "whitelist",
    "required": [
      {
        "name": "type",
        "kind": "value"
      }
    ]
  },
  "listWhitelistOfApp": {
    "method": "GET",
    "path": "/api/v3/list-whitelist-of-app",
    "namespace": "whitelist",
    "required": [
      {
        "name": "type",
        "kind": "value"
      },
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "listWhitelists": {
    "method": "GET",
    "path": "/api/v3/list-whitelist",
    "namespace": "whitelist",
    "required": [
      {
        "name": "type",
        "kind": "value"
      }
    ]
  },
  "listWhitelistsOfApp": {
    "method": "GET",
    "path": "/api/v3/list-whitelist-of-app",
    "namespace": "whitelist",
    "required": [
      {
        "name": "type",
        "kind": "value"
      },
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "logList": {
    "method": "GET",
    "path": "/api/v3/approval-log-list",
    "namespace": "approvals",
    "defaults": {
      "pageNo": 1,
      "pageSize": 10
    },
    "required": []
  },
  "multipleNamespaceDeleteRolesBatch": {
    "method": "POST",
    "path": "/api/v3/multiple-namespace-delete-roles-batch",
    "namespace": "roles",
    "required": [
      {
        "name": "roleList",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "pendList": {
    "method": "GET",
    "path": "/api/v3/approval-pending-list",
    "namespace": "approvals",
    "alias": "listPending",
    "defaults": {
      "pageNo": 1,
      "pageSize": 10
    },
    "required": []
  },
  "postList": {
    "method": "GET",
    "path": "/api/v3/list-post",
    "namespace": "positions",
    "alias": "list",
    "defaults": {
      "page": 1,
      "limit": 10,
      "flatCustomData": false,
      "metadataNoFieldId": false
    },
    "required": []
  },
  "postListBatch": {
    "method": "POST",
    "path": "/api/v3/list-post",
    "namespace": "positions",
    "alias": "listBatch",
    "required": []
  },
  "previewDynamicGroup": {
    "method": "POST",
    "path": "/api/v3/preview-dynamic-group",
    "namespace": "dynamicGroups",
    "required": []
  },
  "previewEmailTemplate": {
    "method": "POST",
    "path": "/api/v3/preview-email-template",
    "namespace": "email",
    "required": [
      {
        "name": "type",
        "kind": "string"
      }
    ]
  },
  "processApproval": {
    "method": "PUT",
    "path": "/api/v3/approval-process",
    "namespace": "approvals",
    "alias": "process",
    "required": [
      {
        "name": "number",
        "kind": "string"
      }
    ]
  },
  "pub": {
    "method": "POST",
    "path": "/api/v3/pub-event",
    "namespace": "events",
    "required": [
      {
        "name": "eventType",
        "kind": "string"
      },
      {
        "name": "eventData",
        "kind": "value"
      }
    ]
  },
  "pubUserEvent": {
    "method": "POST",
    "path": "/api/v3/pub-userEvent",
    "namespace": "events",
    "required": [
      {
        "name": "eventType",
        "kind": "string"
      },
      {
        "name": "eventData",
        "kind": "value"
      }
    ]
  },
  "queryLdapConfigInfo": {
    "method": "GET",
    "path": "/api/v3/get-ldap-server-config",
    "namespace": "ldap",
    "required": []
  },
  "queryLdapLog": {
    "method": "GET",
    "path": "/api/v3/get-ldap-server-log",
    "namespace": "ldap",
    "required": [
      {
        "name": "type",
        "kind": "number"
      },
      {
        "name": "page",
        "kind": "number"
      },
      {
        "name": "limit",
        "kind": "number"
      }
    ]
  },
  "queryLdapSubEntries": {
    "method": "GET",
    "path": "/api/v3/get-ldap-sub-entries",
    "namespace": "ldap",
    "required": [
      {
        "name": "page",
        "kind": "number"
      },
      {
        "name": "limit",
        "kind": "number"
      }
    ]
  },
  "quickFilterInviteeList": {
    "method": "POST",
    "path": "/api/v3/quick-filter-invitees",
    "namespace": "invitations",
    "required": []
  },
  "refreshApplicationSecret": {
    "method": "POST",
    "path": "/api/v3/refresh-application-secret",
    "namespace": "applications",
    "alias": "refreshSecret",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "refreshProgrammaticAccessAccountSecret": {
    "method": "POST",
    "path": "/api/v3/refresh-programmatic-access-account-secret",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "accessKey",
        "kind": "string"
      }
    ]
  },
  "reject": {
    "method": "POST",
    "path": "/api/v3/batch-reject-universal-invitation-applicant",
    "namespace": "invitations",
    "required": [
      {
        "name": "applicantIds",
        "kind": "array"
      }
    ]
  },
  "relationSearch": {
    "method": "POST",
    "path": "/api/v3/metadata/relation-search",
    "namespace": "metadata",
    "required": [
      {
        "name": "fieldId",
        "kind": "string"
      },
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "remoteField": {
    "method": "POST",
    "path": "/api/v3/metadata/remove-field",
    "namespace": "metadata",
    "required": [
      {
        "name": "modelId",
        "kind": "string"
      },
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "remove": {
    "method": "POST",
    "path": "/api/v3/remove-device-exclusive-valid-scope-settings",
    "namespace": "deviceRules",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "removeDepartmentMembers": {
    "method": "POST",
    "path": "/api/v3/remove-department-members",
    "namespace": "departments",
    "alias": "removeMembers",
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      },
      {
        "name": "userIds",
        "kind": "array"
      },
      {
        "name": "departmentId",
        "kind": "string"
      }
    ]
  },
  "removeGroupMembers": {
    "method": "POST",
    "path": "/api/v3/remove-group-members",
    "namespace": "groups",
    "alias": "removeMembers",
    "required": [
      {
        "name": "userIds",
        "kind": "array",
        "minItems": 1
      },
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "removeModel": {
    "method": "POST",
    "path": "/api/v3/metadata/remove-model",
    "namespace": "metadata",
    "required": [
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "removeOperate": {
    "method": "POST",
    "path": "/api/v3/metadata/remove-operate",
    "namespace": "metadata",
    "required": [
      {
        "name": "customConfig",
        "kind": "value"
      },
      {
        "name": "modelId",
        "kind": "string"
      },
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "removePolicyUserAttribution": {
    "method": "POST",
    "path": "/api/v3/remove-invitation-policy-user-attribution",
    "namespace": "invitations",
    "required": [
      {
        "name": "targetType",
        "kind": "string"
      },
      {
        "name": "targetIdentifier",
        "kind": "string"
      },
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "removePolicyUserAttributionsBatch": {
    "method": "POST",
    "path": "/api/v3/remove-invitation-policy-user-attributions-batch",
    "namespace": "invitations",
    "required": [
      {
        "name": "targets",
        "kind": "array"
      },
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "removePost": {
    "method": "POST",
    "path": "/api/v3/remove-post",
    "namespace": "positions",
    "alias": "delete",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "removeRelationValue": {
    "method": "POST",
    "path": "/api/v3/metadata/remove-row-relation",
    "namespace": "metadata",
    "required": [
      {
        "name": "value",
        "kind": "string"
      },
      {
        "name": "fieldIds",
        "kind": "array"
      },
      {
        "name": "rowId",
        "kind": "string"
      },
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "removeRow": {
    "method": "POST",
    "path": "/api/v3/metadata/remove-row",
    "namespace": "metadata",
    "required": [
      {
        "name": "rowIdList",
        "kind": "array"
      },
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "removeTenantDepartmentMembers": {
    "method": "POST",
    "path": "/api/v3/remove-tenant-department-members",
    "namespace": "tenants",
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      },
      {
        "name": "departmentId",
        "kind": "string"
      }
    ]
  },
  "removeTenantUsers": {
    "method": "POST",
    "path": "/api/v3/remove-tenant-users",
    "namespace": "tenants",
    "alias": "removeUsers",
    "required": [
      {
        "name": "tenantId",
        "kind": "string"
      }
    ]
  },
  "removeUserAttributionMainDepartment": {
    "method": "POST",
    "path": "/api/v3/remove-invitation-policy-user-attribution-main-department",
    "namespace": "invitations",
    "required": [
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "resetUserPrincipalAuthenticationInfo": {
    "method": "POST",
    "path": "/api/v3/reset-user-principal-authentication-info",
    "namespace": "users",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "resignPublicAccountBatch": {
    "method": "POST",
    "path": "/api/v3/resign-public-account-batch",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "userIds",
        "kind": "array"
      }
    ]
  },
  "resignUser": {
    "method": "POST",
    "path": "/api/v3/resign-user",
    "namespace": "users",
    "alias": "resign",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "resignUserBatch": {
    "method": "POST",
    "path": "/api/v3/resign-user-batch",
    "namespace": "users",
    "alias": "resignBatch",
    "required": [
      {
        "name": "userIds",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "reuploadPipelineFunction": {
    "method": "POST",
    "path": "/api/v3/reupload-pipeline-function",
    "namespace": "pipelines",
    "required": [
      {
        "name": "funcId",
        "kind": "string"
      }
    ]
  },
  "revertRosterInvitation": {
    "method": "POST",
    "path": "/api/v3/revert-roster-invitation",
    "namespace": "invitations",
    "required": [
      {
        "name": "inviteeId",
        "kind": "string"
      },
      {
        "name": "rosterId",
        "kind": "string"
      }
    ]
  },
  "revertRosterInvitationBatch": {
    "method": "POST",
    "path": "/api/v3/revert-roster-invitation-batch",
    "namespace": "invitations",
    "required": [
      {
        "name": "inviteeIds",
        "kind": "array"
      }
    ]
  },
  "reviewTenantEnterpriseCertification": {
    "method": "POST",
    "path": "/api/v3/review-tenant-enterprise-certification",
    "namespace": "tenants",
    "required": [
      {
        "name": "tenantId",
        "kind": "string"
      },
      {
        "name": "enterpriseCertificationStatus",
        "kind": "value"
      }
    ]
  },
  "revokeApplicationAccess": {
    "method": "POST",
    "path": "/api/v3/revoke-application-access",
    "namespace": "applications",
    "alias": "revokeAccess",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "list",
        "kind": "array"
      }
    ]
  },
  "revokeDataPolicy": {
    "method": "POST",
    "path": "/api/v3/revoke-data-policy",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "policyId",
        "kind": "string"
      },
      {
        "name": "targetIdentifier",
        "kind": "string"
      },
      {
        "name": "targetType",
        "kind": "value"
      }
    ]
  },
  "revokeRole": {
    "method": "POST",
    "path": "/api/v3/revoke-role",
    "namespace": "roles",
    "alias": "revoke",
    "required": [
      {
        "name": "code",
        "kind": "string"
      },
      {
        "name": "targets",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "revokeRoleBatch": {
    "method": "POST",
    "path": "/api/v3/revoke-role-batch",
    "namespace": "roles",
    "alias": "revokeBatch",
    "required": [
      {
        "name": "roles",
        "kind": "array",
        "minItems": 1
      },
      {
        "name": "targets",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "saveAuthFlowConfig": {
    "method": "POST",
    "path": "/api/v3/save-auth-flow-config",
    "namespace": "applications",
    "required": []
  },
  "saveInvitationPolicies": {
    "method": "POST",
    "path": "/api/v3/save-device-exclusive-valid-scope-settings",
    "namespace": "deviceRules",
    "required": [
      {
        "name": "appIds",
        "kind": "array"
      }
    ]
  },
  "saveLdapConfigInfo": {
    "method": "POST",
    "path": "/api/v3/enable-ldap-server",
    "namespace": "ldap",
    "required": [
      {
        "name": "ldapDomain",
        "kind": "string"
      }
    ]
  },
  "searchDepartmentMembers": {
    "method": "GET",
    "path": "/api/v3/search-department-members",
    "namespace": "departments",
    "defaults": {
      "page": 1,
      "limit": 10,
      "departmentIdType": "department_id",
      "includeChildrenDepartments": false,
      "withCustomData": false,
      "withIdentities": false,
      "withDepartmentIds": false
    },
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      },
      {
        "name": "departmentId",
        "kind": "string"
      },
      {
        "name": "keywords",
        "kind": "string"
      }
    ]
  },
  "searchDepartments": {
    "method": "POST",
    "path": "/api/v3/search-departments",
    "namespace": "departments",
    "required": [
      {
        "name": "keywords",
        "kind": "string"
      },
      {
        "name": "organizationCode",
        "kind": "string"
      }
    ]
  },
  "searchDepartmentsList": {
    "method": "POST",
    "path": "/api/v3/search-departments-list",
    "namespace": "departments",
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      }
    ]
  },
  "searchOrganizations": {
    "method": "GET",
    "path": "/api/v3/search-organizations",
    "namespace": "organizations",
    "defaults": {
      "page": 1,
      "limit": 10,
      "withCustomData": false
    },
    "required": [
      {
        "name": "keywords",
        "kind": "string"
      }
    ]
  },
  "sendEmailBatch": {
    "method": "POST",
    "path": "/api/v3/send-email-batch",
    "namespace": "tenants",
    "required": [
      {
        "name": "users",
        "kind": "array"
      },
      {
        "name": "importId",
        "kind": "number"
      }
    ]
  },
  "sendInviteTenantUserEmail": {
    "method": "POST",
    "path": "/api/v3/send-invite-tenant-user-email",
    "namespace": "tenants",
    "required": [
      {
        "name": "recordIds",
        "kind": "array"
      }
    ]
  },
  "sendRosterInvitation": {
    "method": "POST",
    "path": "/api/v3/send-roster-invitation",
    "namespace": "invitations",
    "required": [
      {
        "name": "rosterId",
        "kind": "string"
      }
    ]
  },
  "sendRosterInvitationBatch": {
    "method": "POST",
    "path": "/api/v3/send-roster-invitation-batch",
    "namespace": "invitations",
    "required": [
      {
        "name": "inviteeIds",
        "kind": "array"
      },
      {
        "name": "rosterId",
        "kind": "string"
      }
    ]
  },
  "sendSmsBatch": {
    "method": "POST",
    "path": "/api/v3/send-sms-batch",
    "namespace": "tenants",
    "required": [
      {
        "name": "users",
        "kind": "array"
      },
      {
        "name": "importId",
        "kind": "number"
      }
    ]
  },
  "sendUserResetPasswordEmailLink": {
    "method": "POST",
    "path": "/api/v3/send-user-reset-password-email-link",
    "namespace": "users",
    "required": [
      {
        "name": "users",
        "kind": "array"
      }
    ]
  },
  "sendUserResetPasswordRequest": {
    "method": "POST",
    "path": "/api/v3/send-user-reset-password-request",
    "namespace": "users",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "setCustomData": {
    "method": "POST",
    "path": "/api/v3/set-custom-data",
    "namespace": "customFields",
    "alias": "setData",
    "required": [
      {
        "name": "targetType",
        "kind": "value"
      },
      {
        "name": "targetIdentifier",
        "kind": "string"
      },
      {
        "name": "list",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "setCustomFields": {
    "method": "POST",
    "path": "/api/v3/set-custom-fields",
    "namespace": "customFields",
    "alias": "set",
    "required": [
      {
        "name": "list",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "setMfaStatus": {
    "method": "POST",
    "path": "/api/v3/set-mfa-status",
    "namespace": "users",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "mfaTriggerData",
        "kind": "value"
      }
    ]
  },
  "setPublicAccountOfDepartments": {
    "method": "POST",
    "path": "/api/v3/set-public-account-of-departments",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "departments",
        "kind": "array"
      }
    ]
  },
  "setPublicAccountOfnPost": {
    "method": "POST",
    "path": "/api/v3/set-public-account-of-post",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "postId",
        "kind": "string"
      }
    ]
  },
  "setTenantAdmin": {
    "method": "POST",
    "path": "/api/v3/set-tenant-admin",
    "namespace": "tenants",
    "required": [
      {
        "name": "tenantId",
        "kind": "string"
      }
    ]
  },
  "setUserAttributionMainDepartment": {
    "method": "POST",
    "path": "/api/v3/set-invitation-policy-user-attribution-main-department",
    "namespace": "invitations",
    "required": [
      {
        "name": "policyId",
        "kind": "string"
      },
      {
        "name": "departmentId",
        "kind": "string"
      }
    ]
  },
  "setUserBaseFields": {
    "method": "POST",
    "path": "/api/v3/set-user-base-fields",
    "namespace": "customFields",
    "required": [
      {
        "name": "list",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "setUserDepartments": {
    "method": "POST",
    "path": "/api/v3/set-user-departments",
    "namespace": "users",
    "alias": "setDepartments",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "departments",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "setUserMfaBindSmsEmail": {
    "method": "POST",
    "path": "/api/v3/set-user-mfa-bind-sms-email",
    "namespace": "users",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "mfaType",
        "kind": "value"
      }
    ]
  },
  "setuserOfPublicAccount": {
    "method": "POST",
    "path": "/api/v3/set-user-of-public-accounts",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "publicAccountIds",
        "kind": "array"
      }
    ]
  },
  "setUserPosts": {
    "method": "POST",
    "path": "/api/v3/set-user-posts",
    "namespace": "positions",
    "alias": "setUserPosts",
    "required": [
      {
        "name": "postIds",
        "kind": "array"
      },
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "setUsersMfaStatus": {
    "method": "POST",
    "path": "/api/v3/set-mfa-status",
    "namespace": "users",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "mfaTriggerData",
        "kind": "value"
      }
    ]
  },
  "statisticSessionsByApp": {
    "method": "POST",
    "path": "/api/v3/statistic-sessions-by-app",
    "namespace": "sessions",
    "required": []
  },
  "statisticSessionsByDevice": {
    "method": "POST",
    "path": "/api/v3/statistic-sessions-by-device",
    "namespace": "sessions",
    "required": []
  },
  "statisticSessionsByUser": {
    "method": "POST",
    "path": "/api/v3/statistic-sessions-by-user",
    "namespace": "sessions",
    "required": []
  },
  "suspendDevice": {
    "method": "POST",
    "path": "/api/v3/suspend-device-by-user",
    "namespace": "devices",
    "required": [
      {
        "name": "endTime",
        "kind": "string"
      },
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "switchAuthFlowConfig": {
    "method": "POST",
    "path": "/api/v3/switch-auth-flow-config",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "value"
      },
      {
        "name": "flowId",
        "kind": "value"
      }
    ]
  },
  "triggerSyncRiskOperations": {
    "method": "POST",
    "path": "/api/v3/trigger-sync-risk-operations",
    "namespace": "sync",
    "required": [
      {
        "name": "syncRiskOperationIds",
        "kind": "string",
        "minItems": 1
      }
    ]
  },
  "triggerSyncTask": {
    "method": "POST",
    "path": "/api/v3/trigger-sync-task",
    "namespace": "sync",
    "required": [
      {
        "name": "syncTaskId",
        "kind": "number"
      }
    ]
  },
  "triggerWebhook": {
    "method": "POST",
    "path": "/api/v3/trigger-webhook",
    "namespace": "webhooks",
    "required": [
      {
        "name": "webhookId",
        "kind": "string"
      }
    ]
  },
  "unassignAsaAccount": {
    "method": "POST",
    "path": "/api/v3/unassign-asa-account",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "accountId",
        "kind": "string"
      },
      {
        "name": "targets",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "unbindPublicAccountOfPost": {
    "method": "POST",
    "path": "/api/v3/unbind-public-account-of-post",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "postId",
        "kind": "string"
      }
    ]
  },
  "unbindUsersPublicAccount": {
    "method": "POST",
    "path": "/api/v3/unbind-public-account-of-user",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "publicAccountId",
        "kind": "string"
      }
    ]
  },
  "unlinkIdentity": {
    "method": "POST",
    "path": "/api/v3/unlink-identity",
    "namespace": "users",
    "required": [
      {
        "name": "extIdpId",
        "kind": "string"
      },
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "updateAccessKey": {
    "method": "POST",
    "path": "/api/v3/update-access-key",
    "namespace": "accessKeys",
    "alias": "update",
    "required": [
      {
        "name": "accessKeyId",
        "kind": "string"
      },
      {
        "name": "enable",
        "kind": "value"
      }
    ]
  },
  "updateApplication": {
    "method": "POST",
    "path": "/api/v3/update-application",
    "namespace": "applications",
    "alias": "update",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "updateApplicationMfaSettings": {
    "method": "POST",
    "path": "/api/v3/update-application-mfa-settings",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      }
    ]
  },
  "updateApplicationPermissionStrategy": {
    "method": "POST",
    "path": "/api/v3/update-application-permission-strategy",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "permissionStrategy",
        "kind": "value"
      }
    ]
  },
  "updateAsaAccount": {
    "method": "POST",
    "path": "/api/v3/update-asa-account",
    "namespace": "applications",
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "accountId",
        "kind": "string"
      },
      {
        "name": "accountInfo",
        "kind": "value"
      }
    ]
  },
  "updateAuthEnabled": {
    "method": "POST",
    "path": "/api/v3/update-auth-enabled",
    "namespace": "applications",
    "required": [
      {
        "name": "id",
        "kind": "string"
      },
      {
        "name": "enabled",
        "kind": "value"
      }
    ]
  },
  "updateAuthFlowConfig": {
    "method": "POST",
    "path": "/api/v3/update-auth-flow-config",
    "namespace": "applications",
    "required": []
  },
  "updateAuthFlowFunction": {
    "method": "POST",
    "path": "/api/v3/update-auth-flow-function",
    "namespace": "pipelines",
    "required": [
      {
        "name": "funcId",
        "kind": "string"
      }
    ]
  },
  "updateDataPolicy": {
    "method": "POST",
    "path": "/api/v3/update-data-policy",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "updateDataResource": {
    "method": "POST",
    "path": "/api/v3/update-data-resource",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      }
    ]
  },
  "updateDepartment": {
    "method": "POST",
    "path": "/api/v3/update-department",
    "namespace": "departments",
    "alias": "update",
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      },
      {
        "name": "departmentId",
        "kind": "string"
      }
    ]
  },
  "updateDepartmentStatus": {
    "method": "POST",
    "path": "/api/v3/update-department-status",
    "namespace": "departments",
    "required": [
      {
        "name": "departmentId",
        "kind": "string"
      },
      {
        "name": "status",
        "kind": "value"
      }
    ]
  },
  "updateDnef": {
    "method": "POST",
    "path": "/api/v3/update-dnef",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "namespaceCode",
        "kind": "string"
      },
      {
        "name": "resourceCode",
        "kind": "string"
      },
      {
        "name": "key",
        "kind": "string"
      }
    ]
  },
  "updateDynamicGroup": {
    "method": "POST",
    "path": "/api/v3/update-dynamic-group",
    "namespace": "dynamicGroups",
    "alias": "update",
    "required": [
      {
        "name": "id",
        "kind": "string"
      },
      {
        "name": "name",
        "kind": "string"
      },
      {
        "name": "description",
        "kind": "string"
      },
      {
        "name": "match",
        "kind": "value"
      }
    ]
  },
  "updateEmailTemplate": {
    "method": "POST",
    "path": "/api/v3/update-email-template",
    "namespace": "email",
    "required": [
      {
        "name": "type",
        "kind": "string"
      },
      {
        "name": "customizeEnabled",
        "kind": "value"
      },
      {
        "name": "name",
        "kind": "string"
      },
      {
        "name": "subject",
        "kind": "string"
      },
      {
        "name": "sender",
        "kind": "string"
      },
      {
        "name": "content",
        "kind": "string"
      }
    ]
  },
  "updateExtIdp": {
    "method": "POST",
    "path": "/api/v3/update-ext-idp",
    "namespace": "identityProviders",
    "alias": "update",
    "required": [
      {
        "name": "name",
        "kind": "string"
      },
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "updateExtIdpConn": {
    "method": "POST",
    "path": "/api/v3/update-ext-idp-conn",
    "namespace": "identityProviders",
    "alias": "updateConnection",
    "required": [
      {
        "name": "id",
        "kind": "string"
      },
      {
        "name": "fields",
        "kind": "value"
      }
    ]
  },
  "updateField": {
    "method": "POST",
    "path": "/api/v3/metadata/update-field",
    "namespace": "metadata",
    "required": [
      {
        "name": "userVisible",
        "kind": "value"
      },
      {
        "name": "relationOptionalRange",
        "kind": "value"
      },
      {
        "name": "relationShowKey",
        "kind": "string"
      },
      {
        "name": "forLogin",
        "kind": "value"
      },
      {
        "name": "fuzzySearch",
        "kind": "value"
      },
      {
        "name": "dropDown",
        "kind": "array"
      },
      {
        "name": "format",
        "kind": "number"
      },
      {
        "name": "regexp",
        "kind": "string"
      },
      {
        "name": "min",
        "kind": "number"
      },
      {
        "name": "max",
        "kind": "number"
      },
      {
        "name": "maxLength",
        "kind": "number"
      },
      {
        "name": "unique",
        "kind": "value"
      },
      {
        "name": "require",
        "kind": "value"
      },
      {
        "name": "default",
        "kind": "value"
      },
      {
        "name": "help",
        "kind": "string"
      },
      {
        "name": "editable",
        "kind": "value"
      },
      {
        "name": "show",
        "kind": "value"
      },
      {
        "name": "name",
        "kind": "string"
      },
      {
        "name": "modelId",
        "kind": "string"
      },
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "updateGlobalMfaSettings": {
    "method": "POST",
    "path": "/api/v3/update-global-mfa-settings",
    "namespace": "security",
    "required": [
      {
        "name": "enabledFactors",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "updateGroup": {
    "method": "POST",
    "path": "/api/v3/update-group",
    "namespace": "groups",
    "alias": "update",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "updateInvitationPolicy": {
    "method": "POST",
    "path": "/api/v3/update-invitation-policy",
    "namespace": "invitations",
    "required": [
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "updateInvitationRoster": {
    "method": "POST",
    "path": "/api/v3/update-invitation-roster",
    "namespace": "invitations",
    "required": [
      {
        "name": "rosterId",
        "kind": "string"
      }
    ]
  },
  "updateInviteEmailTemplate": {
    "method": "POST",
    "path": "/api/v3/update-invitation-policy-email-template",
    "namespace": "invitations",
    "required": [
      {
        "name": "type",
        "kind": "string"
      },
      {
        "name": "customizeEnabled",
        "kind": "value"
      },
      {
        "name": "name",
        "kind": "string"
      },
      {
        "name": "subject",
        "kind": "string"
      },
      {
        "name": "sender",
        "kind": "string"
      },
      {
        "name": "content",
        "kind": "string"
      }
    ]
  },
  "updateLdapConfigInfo": {
    "method": "POST",
    "path": "/api/v3/update-ldap-server-config",
    "namespace": "ldap",
    "required": []
  },
  "updateLoginPageConfig": {
    "method": "POST",
    "path": "/api/v3/update-login-page-config",
    "namespace": "applications",
    "queryKeys": [
      "tenantId"
    ],
    "required": [
      {
        "name": "appId",
        "kind": "string"
      },
      {
        "name": "update",
        "kind": "value"
      }
    ]
  },
  "updateModel": {
    "method": "POST",
    "path": "/api/v3/metadata/update-model",
    "namespace": "metadata",
    "required": [
      {
        "name": "showFieldKey",
        "kind": "string"
      },
      {
        "name": "config",
        "kind": "value"
      },
      {
        "name": "fieldOrder",
        "kind": "string"
      },
      {
        "name": "type",
        "kind": "string"
      },
      {
        "name": "parentKey",
        "kind": "string"
      },
      {
        "name": "enable",
        "kind": "value"
      },
      {
        "name": "description",
        "kind": "value"
      },
      {
        "name": "name",
        "kind": "string"
      },
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "updateMultipleTenantAdmin": {
    "method": "POST",
    "path": "/api/v3/update-multiple-tenant-admin",
    "namespace": "tenants",
    "queryKeys": [
      "userId"
    ],
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "tenantIds",
        "kind": "array"
      }
    ]
  },
  "updateNamespace": {
    "method": "POST",
    "path": "/api/v3/update-namespace",
    "namespace": "namespaces",
    "alias": "update",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "updateNodeStatus": {
    "method": "POST",
    "path": "/api/v3/update-department-status",
    "namespace": "departments",
    "required": [
      {
        "name": "departmentId",
        "kind": "string"
      },
      {
        "name": "status",
        "kind": "value"
      }
    ]
  },
  "updateOperate": {
    "method": "POST",
    "path": "/api/v3/metadata/update-operate",
    "namespace": "metadata",
    "required": [
      {
        "name": "icon",
        "kind": "string"
      },
      {
        "name": "config",
        "kind": "value"
      },
      {
        "name": "operateName",
        "kind": "string"
      },
      {
        "name": "operateKey",
        "kind": "string"
      },
      {
        "name": "show",
        "kind": "value"
      },
      {
        "name": "modelId",
        "kind": "string"
      },
      {
        "name": "id",
        "kind": "string"
      }
    ]
  },
  "updateOrganization": {
    "method": "POST",
    "path": "/api/v3/update-organization",
    "namespace": "organizations",
    "alias": "update",
    "required": [
      {
        "name": "organizationCode",
        "kind": "string"
      }
    ]
  },
  "updateOrganizationStatus": {
    "method": "POST",
    "path": "/api/v3/update-organization-status",
    "namespace": "organizations",
    "required": [
      {
        "name": "rootNodeId",
        "kind": "string"
      }
    ]
  },
  "updatePermissionNamespace": {
    "method": "POST",
    "path": "/api/v3/update-permission-namespace",
    "namespace": "dataPermissions",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "updatePipelineFunction": {
    "method": "POST",
    "path": "/api/v3/update-pipeline-function",
    "namespace": "pipelines",
    "alias": "update",
    "required": [
      {
        "name": "funcId",
        "kind": "string"
      }
    ]
  },
  "updatePipelineOrder": {
    "method": "POST",
    "path": "/api/v3/update-pipeline-order",
    "namespace": "pipelines",
    "required": [
      {
        "name": "scene",
        "kind": "value"
      },
      {
        "name": "order",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "updatePost": {
    "method": "POST",
    "path": "/api/v3/update-post",
    "namespace": "positions",
    "alias": "update",
    "required": [
      {
        "name": "code",
        "kind": "string"
      },
      {
        "name": "name",
        "kind": "string"
      }
    ]
  },
  "updatePublicAccount": {
    "method": "POST",
    "path": "/api/v3/update-public-account",
    "namespace": "publicAccounts",
    "alias": "update",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "updatePublicAccountBatch": {
    "method": "POST",
    "path": "/api/v3/update-public-account-batch",
    "namespace": "publicAccounts",
    "required": [
      {
        "name": "list",
        "kind": "array"
      }
    ]
  },
  "updateRegisterExtendsFields": {
    "method": "POST",
    "path": "/api/v3/update-invitation-policy-extends-fields",
    "namespace": "invitations",
    "required": [
      {
        "name": "extendsField",
        "kind": "value"
      },
      {
        "name": "action",
        "kind": "string"
      },
      {
        "name": "policyId",
        "kind": "string"
      }
    ]
  },
  "updateResource": {
    "method": "POST",
    "path": "/api/v3/update-resource",
    "namespace": "resources",
    "alias": "update",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "updateRole": {
    "method": "POST",
    "path": "/api/v3/update-role",
    "namespace": "roles",
    "alias": "update",
    "required": [
      {
        "name": "code",
        "kind": "string"
      }
    ]
  },
  "updateRow": {
    "method": "POST",
    "path": "/api/v3/metadata/update-row",
    "namespace": "metadata",
    "required": [
      {
        "name": "data",
        "kind": "value"
      },
      {
        "name": "rowId",
        "kind": "string"
      },
      {
        "name": "modelId",
        "kind": "string"
      }
    ]
  },
  "updateRuleSettings": {
    "method": "POST",
    "path": "/api/v3/update-device-exclusive-rule-settings",
    "namespace": "deviceRules",
    "required": [
      {
        "name": "rule",
        "kind": "string"
      }
    ]
  },
  "updateSecuritySettings": {
    "method": "POST",
    "path": "/api/v3/update-security-settings",
    "namespace": "security",
    "alias": "update",
    "required": []
  },
  "updateSyncTask": {
    "method": "POST",
    "path": "/api/v3/update-sync-task",
    "namespace": "sync",
    "alias": "update",
    "required": [
      {
        "name": "syncTaskId",
        "kind": "number"
      }
    ]
  },
  "updateTenant": {
    "method": "POST",
    "path": "/api/v3/update-tenant",
    "namespace": "tenants",
    "alias": "update",
    "required": [
      {
        "name": "tenantId",
        "kind": "string"
      }
    ]
  },
  "updateTenantCooperator": {
    "method": "POST",
    "path": "/api/v3/update-tenant-cooperator",
    "namespace": "tenants",
    "queryKeys": [
      "userId"
    ],
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "apiAuthorized",
        "kind": "value"
      },
      {
        "name": "policies",
        "kind": "array"
      }
    ]
  },
  "updateTenantEnterpriseCertification": {
    "method": "POST",
    "path": "/api/v3/update-tenant-enterprise-certification",
    "namespace": "tenants",
    "required": [
      {
        "name": "businessName",
        "kind": "string"
      },
      {
        "name": "businessLicense",
        "kind": "string"
      },
      {
        "name": "businessRegistrationName",
        "kind": "string"
      },
      {
        "name": "unifiedSocialCredit",
        "kind": "string"
      },
      {
        "name": "legalRepresentativeName",
        "kind": "string"
      },
      {
        "name": "nationalIdentificationNumber",
        "kind": "string"
      },
      {
        "name": "personalBankCardNumber",
        "kind": "string"
      },
      {
        "name": "bankReservedPhone",
        "kind": "string"
      },
      {
        "name": "tenantId",
        "kind": "string"
      }
    ]
  },
  "updateTenantQrCodeState": {
    "method": "POST",
    "path": "/api/v3/update-userpool-tenant-appqrcode-state",
    "namespace": "applications",
    "required": [
      {
        "name": "enabled",
        "kind": "value"
      }
    ]
  },
  "updateTenantUser": {
    "method": "POST",
    "path": "/api/v3/update-tenant-user",
    "namespace": "tenants",
    "required": [
      {
        "name": "tenantId",
        "kind": "string"
      },
      {
        "name": "updates",
        "kind": "value"
      }
    ]
  },
  "updateUniversalInvitation": {
    "method": "POST",
    "path": "/api/v3/update-universal-invitation-settings",
    "namespace": "invitations",
    "required": []
  },
  "updateUser": {
    "method": "POST",
    "path": "/api/v3/update-user",
    "namespace": "users",
    "alias": "update",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      }
    ]
  },
  "updateUserBatch": {
    "method": "POST",
    "path": "/api/v3/update-user-batch",
    "namespace": "users",
    "required": [
      {
        "name": "list",
        "kind": "array",
        "minItems": 1
      }
    ]
  },
  "updateUserpoolTenantAppqrcodeState": {
    "method": "POST",
    "path": "/api/v3/update-userpool-tenant-appqrcode-state",
    "namespace": "applications",
    "required": [
      {
        "name": "enabled",
        "kind": "value"
      }
    ]
  },
  "updateUserpoolTenantConfig": {
    "method": "POST",
    "path": "/api/v3/update-userpool-tenant-config",
    "namespace": "applications",
    "required": [
      {
        "name": "update",
        "kind": "value"
      }
    ]
  },
  "updateUserPoolTenantConfig": {
    "method": "POST",
    "path": "/api/v3/update-userpool-tenant-config",
    "namespace": "applications",
    "required": [
      {
        "name": "update",
        "kind": "value"
      }
    ]
  },
  "updateWebhook": {
    "method": "POST",
    "path": "/api/v3/update-webhook",
    "namespace": "webhooks",
    "alias": "update",
    "required": [
      {
        "name": "webhookId",
        "kind": "string"
      }
    ]
  },
  "userConnectionPost": {
    "method": "POST",
    "path": "/api/v3/user-connection-post",
    "namespace": "positions",
    "required": [
      {
        "name": "userId",
        "kind": "string"
      },
      {
        "name": "postId",
        "kind": "string"
      }
    ]
  },
  "userFieldDecrypt": {
    "method": "POST",
    "path": "/api/v3/users/field/decrypt",
    "namespace": "users",
    "required": [
      {
        "name": "privateKey",
        "kind": "string"
      },
      {
        "name": "data",
        "kind": "array"
      }
    ]
  },
  "userpollTenantConfig": {
    "method": "GET",
    "path": "/api/v3/userpool-tenant-config",
    "namespace": "applications",
    "required": []
  },
  "userpoolTenantConfig": {
    "method": "GET",
    "path": "/api/v3/userpool-tenant-config",
    "namespace": "applications",
    "required": []
  },
  "usersFieldDecrypt": {
    "method": "POST",
    "path": "/api/v3/users/field/decrypt",
    "namespace": "users",
    "required": [
      {
        "name": "privateKey",
        "kind": "string"
      },
      {
        "name": "data",
        "kind": "array"
      }
    ]
  },
  "verifyEvent": {
    "method": "POST",
    "path": "/api/v3/pub-event",
    "namespace": "events",
    "required": [
      {
        "name": "eventType",
        "kind": "string"
      },
      {
        "name": "eventData",
        "kind": "value"
      }
    ]
  }
} as const;
