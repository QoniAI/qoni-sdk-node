# GenAuth management API catalog

Generated primarily from [Authing/authing-node-sdk 4.0.2](https://github.com/Authing/authing-node-sdk/tree/cc9f6ed7e0f41542d94d2634fb4fa8a35a622a86), with checked GenAuth server extensions. 591 JSON management methods across 35 namespaces: all 496 official JSON methods plus 95 GenAuth extension/compatibility names. Actual deployment support, feature gates and entitlement checks can vary. Multiple method names can map to the same endpoint.

Call the flat Authing-compatible names through `qoni.genauth.management`, or use the domain namespaces. Methods accept one input object and use the Qoni management-token exchange, returning `{ data, meta }`. The upstream MIT notice is in [authing-sdk-LICENSE.txt](./authing-sdk-LICENSE.txt).

| Namespace | Method | Alias | HTTP | Path | Contract origin | Description |
| --- | --- | --- | --- | --- | --- | --- |
| riskLists | add | addIp | POST | /api/v3/ip-list | authing-sdk | 创建 ip 名单 |
| departments | addDepartmentMembers | addMembers | POST | /api/v3/add-department-members | authing-sdk | 部门下添加成员 |
| devices | addDevice |  | POST | /api/v3/add-device | authing-sdk | 新增设备 |
| groups | addGroupMembers | addMembers | POST | /api/v3/add-group-members | authing-sdk | 添加分组成员 |
| invitations | addPolicyUserAttribution |  | POST | /api/v3/add-invitation-policy-user-attribution | authing-sdk | 添加邀请策略用户归属 |
| invitations | addPolicyUserAttributionsBatch |  | POST | /api/v3/add-invitation-policy-user-attributions-batch | authing-sdk | 批量添加邀请策略用户归属 |
| riskLists | addRiskListPolicy |  | POST | /api/v3/risk-list-policy | authing-sdk | 创建风险策略 |
| tenants | addTenantDepartmentMembers |  | POST | /api/v3/add-tenant-department-members | authing-sdk | 租户部门下添加成员 |
| tenants | addTenantUsers | addUsers | POST | /api/v3/add-tenant-users | authing-sdk | 添加租户成员 |
| riskLists | addUser | addUser | POST | /api/v3/user-list | authing-sdk | 创建用户名单 |
| whitelist | addWhitelist |  | POST | /api/v3/add-whitelist | authing-sdk | 创建注册白名单 |
| whitelist | addWhitelistOfApp |  | POST | /api/v3/add-whitelist-of-app | authing-sdk | 创建应用注册白名单 |
| invitations | approval |  | POST | /api/v3/batch-approval-universal-invitation-applicants | authing-sdk | 批量通过通用邀请的申请 |
| applications | assignAsaAccount |  | POST | /api/v3/assign-asa-account | authing-sdk | 分配 ASA 账号 |
| roles | assignRole | assign | POST | /api/v3/assign-role | authing-sdk | 单个角色批量授权 |
| roles | assignRoleBatch | assignBatch | POST | /api/v3/assign-role-batch | authing-sdk | 批量分配角色 |
| resources | associateTenantResource |  | POST | /api/v3/associate-tenant-resource | authing-sdk | 关联/取消关联应用资源到租户 |
| applications | authorizeApplicationAccess | authorizeAccess | POST | /api/v3/authorize-application-access | authing-sdk | 授权应用访问权限 |
| dataPermissions | authorizeDataPolicies |  | POST | /api/v3/authorize-data-policies | authing-sdk | 授权数据策略 |
| permissions | authorizeResources | authorize | POST | /api/v3/authorize-resources | authing-sdk | 授权资源 |
| applications | batchApplicationsAuth |  | DELETE | /api/v3/batch-applications-auth | genauth-extension | 批量删除应用授权 |
| invitations | batchBindPolicy |  | POST | /api/v3/update-invitation-roster-batch-bind-policy | authing-sdk | 更新邀请名单，批量关联邀请策略 |
| dataPermissions | batchCreateDnef |  | POST | /api/v3/batch-create-dnef | authing-sdk | 批量创建树类型资源的扩展字段 |
| resources | batchDeleteCommonResource |  | POST | /api/v3/delete-common-resources-batch | authing-sdk | 批量删除资源 |
| invitations | batchDeleteInvitationPolicies |  | POST | /api/v3/delete-invitation-policies-batch | authing-sdk | 批量删除邀请策略 |
| users | batchGetUserEncryptPassword |  | POST | /api/v3/batch-get-user-encrypt-password | genauth-extension | 批量获取用户密码密文 |
| approvals | batchProcessApproval | processBatch | PUT | /api/v3/approval-batch-process | authing-sdk | 批量处理审批 |
| invitations | batchUnbindPolicy |  | POST | /api/v3/update-invitation-roster-batch-unbind-policy | authing-sdk | 更新邀请名单，根据策略 Id 批量解除关联 |
| publicAccounts | bindPublicAccountOfRoles |  | POST | /api/v3/set-public-account-of-roles | authing-sdk | 公共账号绑定批量角色 |
| publicAccounts | bindUsersPublicAccount |  | POST | /api/v3/set-public-account-of-users | authing-sdk | 公共账号绑定批量用户 |
| sync | cancelSyncRiskOperation |  | POST | /api/v3/cancel-sync-risk-operation | authing-sdk | 取消同步风险操作 |
| metadata | capture |  | POST | /api/v3/metadata/ueba/capture | authing-sdk | UEBA 上传 |
| identityProviders | changeExtIdpConnAssociationState |  | POST | /api/v3/change-ext-idp-conn-association-state | authing-sdk | 租户关联身份源 |
| identityProviders | changeExtIdpConnState |  | POST | /api/v3/change-ext-idp-conn-state | authing-sdk | 身份源连接开关 |
| publicAccounts | changeIntoPublicAccount |  | POST | /api/v3/transfer-into-public-account | authing-sdk | 个人账号转换为公共账号 |
| applications | changeUserpoolTenanExtIdpConnState |  | POST | /api/v3/change-userpool-tenant-ext-idp-conn-state | authing-sdk | 设置用户池多租户身份源连接 |
| applications | changeUserpoolTenantExtIdpConnState |  | POST | /api/v3/change-userpool-tenant-ext-idp-conn-state | genauth-extension | 设置用户池多租户身份源连接 |
| dataPermissions | checkDataPolicyExists |  | GET | /api/v3/check-data-policy-exists | authing-sdk | 检查数据策略名称是否可用 |
| dataPermissions | checkDataResourceExists |  | GET | /api/v3/check-data-resource-exists | authing-sdk | 检查数据资源 Code 或者名称是否可用 |
| applications | checkDomainAvailable |  | POST | /api/v3/check-domain-available | authing-sdk | 检测域名是否可用 |
| dataPermissions | checkExternalUserPermission |  | POST | /api/v3/check-external-user-permission | authing-sdk | 判断外部用户权限 |
| dataPermissions | checkM2mPermission |  | POST | /api/v3/check-m2m-permission | genauth-extension | 判断 m2m 权限 |
| dataPermissions | checkM2mSameLevelPermission |  | POST | /api/v3/check-m2m-same-level-permission | genauth-extension | 判断 m2m 在树资源同层级下的权限（推荐） |
| roles | checkMutualExclusion |  | POST | /api/v3/check-role-mutual-exclusion | authing-sdk | 检测角色互斥 |
| roles | checkParamsNamespace |  | POST | /api/v3/check-role-params | authing-sdk | 校验角色 Code 或者名称是否可用 |
| dataPermissions | checkPermission |  | POST | /api/v3/check-permission | authing-sdk | 判断用户权限（重点） |
| dataPermissions | checkPermissionNamespaceExists |  | POST | /api/v3/check-permission-namespace-exists | authing-sdk | 校验权限空间 Code 或者名称是否可用 |
| roles | checkRoleMutualExclusion |  | POST | /api/v3/check-role-mutual-exclusion | genauth-extension | 检测角色互斥 |
| roles | checkRoleParams |  | POST | /api/v3/check-role-params | genauth-extension | 校验角色 Code 或者名称是否可用 |
| users | checkSessionStatus |  | POST | /api/v3/check-session-status | authing-sdk | 检查某个用户在应用下是否具备 Session 登录态 |
| dataPermissions | checkUserSameLevelPermission |  | POST | /api/v3/check-user-same-level-permission | authing-sdk | 判断用户在树资源同层级下的权限（推荐） |
| approvals | closedList | listClosed | GET | /api/v3/approval-closed-list | authing-sdk | 获取已办审批列表 |
| security | closeGlobalMfaSettings |  | POST | /api/v3/disable-global-mfa-settings | authing-sdk | 关闭全局多因素认证配置 |
| email | configEmailProvider |  | POST | /api/v3/config-email-provider | authing-sdk | 配置第三方邮件服务 |
| applications | copyAuthFlowConfig |  | POST | /api/v3/copy-auth-flow-config | genauth-extension | 复制编排配置 |
| invitations | copyInvitationPolicyById |  | POST | /api/v3/copy-invitation-policy-by-id | authing-sdk | 创建邀请策略副本 |
| metadata | copyOperate |  | POST | /api/v3/metadata/copy-operate | authing-sdk | 复制自定义操作 |
| metadata | copyRowRelation |  | POST | /api/v3/metadata/copy-row-relation | authing-sdk | 复制行关联关系 |
| accessKeys | createAccessKey | create | POST | /api/v3/create-access-key | authing-sdk | 创建协作管理员的 AK/SK |
| roles | createAdminRole |  | POST | /api/v3/create-admin-role | authing-sdk | 创建管理员角色 |
| applications | createApplication | create | POST | /api/v3/create-application | authing-sdk | 创建应用 |
| dataPermissions | createArrayDataResource |  | POST | /api/v3/create-array-data-resource | genauth-extension | 创建数组数据资源 |
| applications | createAsaAccount |  | POST | /api/v3/create-asa-account | authing-sdk | 创建 ASA 账号 |
| applications | createAsaAccountBatch |  | POST | /api/v3/create-asa-accounts-batch | authing-sdk | 批量创建 ASA 账号 |
| applications | createAsaAccountsBatch |  | POST | /api/v3/create-asa-accounts-batch | genauth-extension | 批量创建 ASA 账号 |
| applications | createAuthFlowAppConfig |  | POST | /api/v3/create-auth-flow-app-config | genauth-extension | 创建应用认证配置 |
| pipelines | createAuthFlowFunction |  | POST | /api/v3/create-auth-flow-function | genauth-extension | 创建 AuthFlowFunction 函数 |
| dataPermissions | createDataPolicy |  | POST | /api/v3/create-data-policy | authing-sdk | 创建数据策略（重点） |
| dataPermissions | createDataResource |  | POST | /api/v3/create-data-resource | authing-sdk | 创建数据资源（推荐、重点） |
| dataPermissions | createDataResourceByArray |  | POST | /api/v3/create-array-data-resource | authing-sdk | 创建数组数据资源 |
| dataPermissions | createDataResourceByString |  | POST | /api/v3/create-string-data-resource | authing-sdk | 创建字符串数据资源 |
| dataPermissions | createDataResourceByTree |  | POST | /api/v3/create-tree-data-resource | authing-sdk | 创建树数据资源 |
| departments | createDepartment | create | POST | /api/v3/create-department | authing-sdk | 创建部门 |
| departments | createDepartmentTree |  | POST | /api/v3/create-department-tree | authing-sdk | 根据组织树批量创建部门 |
| devices | createDevice |  | POST | /api/v3/create-device | authing-sdk | 新增设备 |
| dataPermissions | createDnef |  | POST | /api/v3/create-dnef | authing-sdk | 创建树类型资源的扩展字段 |
| dynamicGroups | createDynamicGroup | create | POST | /api/v3/create-dynamic-group | genauth-extension | 创建动态分组 |
| events | createEventApp |  | POST | /api/v3/create-event-app | authing-sdk | 创建自定义事件应用 |
| identityProviders | createExtIdp | create | POST | /api/v3/create-ext-idp | authing-sdk | 创建身份源 |
| identityProviders | createExtIdpConn | createConnection | POST | /api/v3/create-ext-idp-conn | authing-sdk | 在某个已有身份源下创建新连接 |
| metadata | createField |  | POST | /api/v3/metadata/create-field | authing-sdk | 创建数据对象的字段 |
| groups | createGroup | create | POST | /api/v3/create-group | authing-sdk | 创建分组 |
| groups | createGroupsBatch |  | POST | /api/v3/create-groups-batch | authing-sdk | 批量创建分组 |
| invitations | createInvitationPolicy | createPolicy | POST | /api/v3/create-invitation-policy | authing-sdk | 创建邀请策略 |
| invitations | createInvitationRoster | createRoster | POST | /api/v3/create-invitation-roster | authing-sdk | 创建邀请名单 |
| metadata | createModel |  | POST | /api/v3/metadata/create-model | authing-sdk | 创建数据对象 |
| tenants | createMultipleTenantAdmin |  | POST | /api/v3/create-multiple-tenant-admin | authing-sdk | 创建多租户管理员用户 |
| namespaces | createNamespace | create | POST | /api/v3/create-namespace | authing-sdk | 创建权限分组 |
| namespaces | createNamespacesBatch | createBatch | POST | /api/v3/create-namespaces-batch | authing-sdk | 批量创建权限分组 |
| metadata | createOperate |  | POST | /api/v3/metadata/create-operate | authing-sdk | 创建自定义操作 |
| organizations | createOrganization | create | POST | /api/v3/create-organization | authing-sdk | 创建组织机构 |
| groups | createOrUpdateGroup |  | POST | /api/v3/create-or-update-group | authing-sdk | 创建或修改分组 |
| dataPermissions | createPermissionNamespace |  | POST | /api/v3/create-permission-namespace | authing-sdk | 创建权限空间 |
| dataPermissions | createPermissionNamespacesBatch |  | POST | /api/v3/create-permission-namespaces-batch | authing-sdk | 批量创建权限空间 |
| pipelines | createPipelineFunction | create | POST | /api/v3/create-pipeline-function | authing-sdk | 创建 Pipeline 函数 |
| positions | createPost | create | POST | /api/v3/create-post | authing-sdk | 创建岗位 |
| applications | createProgrammaticAccessAccount |  | POST | /api/v3/create-programmatic-access-account | genauth-extension | 创建编程访问账号 |
| publicAccounts | createPublicAccount | create | POST | /api/v3/create-public-account | authing-sdk | 创建公共账号 |
| publicAccounts | createPublicAccountsBatch | createBatch | POST | /api/v3/create-public-accounts-batch | authing-sdk | 批量创建公共账号 |
| resources | createResource | create | POST | /api/v3/create-resource | authing-sdk | 创建资源 |
| resources | createResourcesBatch | createBatch | POST | /api/v3/create-resources-batch | authing-sdk | 批量创建资源 |
| roles | createRole | create | POST | /api/v3/create-role | authing-sdk | 创建角色 |
| roles | createRolesBatch | createBatch | POST | /api/v3/create-roles-batch | authing-sdk | 批量创建角色 |
| metadata | createRow |  | POST | /api/v3/metadata/create-row | authing-sdk | 添加行 |
| metadata | createRowRelation |  | POST | /api/v3/metadata/create-row-relation | authing-sdk | 创建行关联数据 |
| dataPermissions | createStringDataResource |  | POST | /api/v3/create-string-data-resource | genauth-extension | 创建字符串数据资源 |
| sync | createSyncTask | create | POST | /api/v3/create-sync-task | authing-sdk | 创建同步任务 |
| tenants | createTenant | create | POST | /api/v3/create-tenant | authing-sdk | 创建租户 |
| tenants | createTenantCooperator |  | POST | /api/v3/create-tenant-cooperator | authing-sdk | 创建协调管理员 |
| tenants | createTenantEnterpriseCertification |  | POST | /api/v3/create-tenant-enterprise-certification | authing-sdk | 创建租户企业认证 |
| tenants | createTenantUser |  | POST | /api/v3/create-tenant-user | authing-sdk | 创建租户成员 |
| dataPermissions | createTreeDataResource |  | POST | /api/v3/create-tree-data-resource | genauth-extension | 创建树数据资源 |
| users | createUser | create | POST | /api/v3/create-user | authing-sdk | 创建用户 |
| users | createUsersBatch | createBatch | POST | /api/v3/create-users-batch | authing-sdk | 批量创建用户 |
| devices | createVerifyDevice |  | POST | /api/v3/authing-verify/create-device | authing-sdk | 新增 verify 设备 |
| webhooks | createWebhook | create | POST | /api/v3/create-webhook | authing-sdk | 创建 Webhook |
| sessions | deactivateAllSessions | deactivateAll | POST | /api/v3/deactivate-all-sessions | genauth-extension | 停用全部 Session |
| sessions | deactivateSessionsBatch | deactivateBatch | POST | /api/v3/deactivate-sessions-batch | genauth-extension | 批量停用 Session |
| events | defineEvent |  | POST | /api/v3/define-event | authing-sdk | 定义自定义事件 |
| accessKeys | deleteAccessKey | delete | POST | /api/v3/delete-access-key | authing-sdk | 删除协作管理员的 AK/SK |
| roles | deleteAdminRoles |  | POST | /api/v3/delete-admin-roles | genauth-extension | 删除管理员自定义角色 |
| roles | deleteAdminRolesBatch |  | POST | /api/v3/delete-admin-roles | authing-sdk | 删除管理员自定义角色 |
| applications | deleteApplication | delete | POST | /api/v3/delete-application | authing-sdk | 删除应用 |
| applications | deleteAsaAccount |  | POST | /api/v3/delete-asa-account | authing-sdk | 删除 ASA 账号 |
| applications | deleteAsaAccountBatch |  | POST | /api/v3/delete-asa-accounts-batch | authing-sdk | 批量删除 ASA 账号 |
| applications | deleteAsaAccountsBatch |  | POST | /api/v3/delete-asa-accounts-batch | genauth-extension | 批量删除 ASA 账号 |
| applications | deleteAuth |  | DELETE | /api/v3/batch-applications-auth | authing-sdk | 批量删除应用授权 |
| applications | deleteAuthFlowConfig |  | POST | /api/v3/delete-auth-flow-config | genauth-extension | 删除编排配置 |
| pipelines | deleteAuthFlowFunction |  | POST | /api/v3/delete-auth-flow-function | genauth-extension | 删除 AuthFlowFunction 函数 |
| riskLists | deleteById | deleteIp | DELETE | /api/v3/ip-list/{id} | authing-sdk | 删除 ip 名单 |
| policies | deleteCommonAuthorizeBatch |  | DELETE | /api/v3/delete-common-authorize-batch | genauth-extension | 批量删除常规资源授权列表 |
| resources | deleteCommonResourcesBatch |  | POST | /api/v3/delete-common-resources-batch | genauth-extension | 批量删除资源 |
| customFields | deleteCustomFields | delete | POST | /api/v3/delete-custom-fields | authing-sdk | 删除自定义字段定义 |
| dataPermissions | deleteDataPolicy |  | POST | /api/v3/delete-data-policy | authing-sdk | 删除数据策略 |
| dataPermissions | deleteDataResource |  | POST | /api/v3/delete-data-resource | authing-sdk | 删除数据资源 |
| departments | deleteDepartment | delete | POST | /api/v3/delete-department | authing-sdk | 删除部门 |
| departments | deleteDepartmentAndChilds |  | POST | /api/v3/delete-department-and-childs | genauth-extension | 删除部门和子部门 |
| departments | deleteDepartmentSyncRelations |  | POST | /api/v3/delete-department-sync-relations | authing-sdk | 删除部门同步关联关系 |
| devices | deleteDevice |  | POST | /api/v3/delete-device-by-user | authing-sdk | 移除绑定(用户详情页) |
| dataPermissions | deleteDnef |  | POST | /api/v3/delete-dnef | authing-sdk | 删除树类型资源的扩展字段 |
| identityProviders | deleteExtIdp | delete | POST | /api/v3/delete-ext-idp | authing-sdk | 删除身份源 |
| identityProviders | deleteExtIdpConn | deleteConnection | POST | /api/v3/delete-ext-idp-conn | authing-sdk | 删除身份源连接 |
| groups | deleteGroupsBatch | deleteBatch | POST | /api/v3/delete-groups-batch | authing-sdk | 批量删除分组 |
| invitations | deleteInvitationRoster |  | POST | /api/v3/delete-invitation-roster | authing-sdk | 删除邀请名单 |
| invitations | deleteInvitationRosterBatch |  | POST | /api/v3/delete-invitation-rosters-batch | authing-sdk | 批量删除邀请名单 |
| invitations | deleteInvitees |  | POST | /api/v3/batch-delete-invitation-invitees | authing-sdk | 批量删除名单中的受邀人 |
| tenants | deleteMultipleTenantAdmin |  | POST | /api/v3/delete-multiple-tenant-admin | genauth-extension | 删除多租户管理员用户 |
| namespaces | deleteNamespace | delete | POST | /api/v3/delete-namespace | authing-sdk | 删除权限分组信息 |
| namespaces | deleteNamespacesBatch | deleteBatch | POST | /api/v3/delete-namespaces-batch | authing-sdk | 批量删除权限分组 |
| organizations | deleteOrganization | delete | POST | /api/v3/delete-organization | authing-sdk | 删除组织机构 |
| dataPermissions | deletePermissionNamespace |  | POST | /api/v3/delete-permission-namespace | authing-sdk | 删除权限空间 |
| dataPermissions | deletePermissionNamespacesBatch |  | POST | /api/v3/delete-permission-namespaces-batch | authing-sdk | 批量删除权限空间 |
| pipelines | deletePipelineFunction | delete | POST | /api/v3/delete-pipeline-function | authing-sdk | 删除 Pipeline 函数 |
| applications | deleteProgrammaticAccessAccount |  | POST | /api/v3/delete-programmatic-access-account | genauth-extension | 删除编程访问账号 |
| publicAccounts | deletePublicAccountsBatch | deleteBatch | POST | /api/v3/delete-public-accounts-batch | authing-sdk | 批量删除公共账号 |
| resources | deleteResource | delete | POST | /api/v3/delete-resource | authing-sdk | 删除资源 |
| resources | deleteResourcesBatch | deleteBatch | POST | /api/v3/delete-resources-batch | authing-sdk | 批量删除资源 |
| riskLists | deleteRiskListPolicyById |  | DELETE | /api/v3/risk-list-policy/{id} | authing-sdk | 删除风险策略 |
| roles | deleteRoles |  | POST | /api/v3/multiple-namespace-delete-roles-batch | authing-sdk | 跨权限分组（空间）删除角色 |
| roles | deleteRolesBatch | deleteBatch | POST | /api/v3/delete-roles-batch | authing-sdk | 单个权限分组（权限空间）内删除角色 |
| tenants | deleteTenant | delete | POST | /api/v3/delete-tenant | authing-sdk | 删除租户 |
| tenants | deleteTenantAdmin |  | POST | /api/v3/delete-tenant-admin | authing-sdk | 取消设置租户管理员 |
| tenants | deleteTenantCooperator |  | POST | /api/v3/delete-tenant-cooperator | genauth-extension | 删除协调管理员 |
| tenants | deleteTenantUser |  | POST | /api/v3/delete-tenant-user | authing-sdk | 批量移除租户成员 |
| riskLists | deleteUserListById | deleteUser | DELETE | /api/v3/user-list/{id} | authing-sdk | 删除用户名单 |
| users | deleteUsersBatch | deleteBatch | POST | /api/v3/delete-users-batch | authing-sdk | 批量删除用户 |
| users | deleteUserSyncRelations |  | POST | /api/v3/delete-user-sync-relations | authing-sdk | 删除用户同步关联关系 |
| webhooks | deleteWebhook | delete | POST | /api/v3/delete-webhook | authing-sdk | 删除 Webhook |
| whitelist | deleteWhitelist |  | POST | /api/v3/delete-whitelist | authing-sdk | 删除注册白名单 |
| whitelist | deleteWhitelistOfApp |  | POST | /api/v3/delete-whitelist-of-app | authing-sdk | 删除应用注册白名单 |
| applications | detailAuthSubject |  | GET | /api/v3/get-subject-auth-detail | authing-sdk | 主体授权详情 |
| applications | disabledAuthFlowApp |  | POST | /api/v3/disabled-auth-flow-app | genauth-extension | 关闭编排 |
| devices | disableDevice |  | POST | /api/v3/disable-device-by-user | authing-sdk | 停用设备(用户详情页) |
| security | disableGlobalMfaSettings |  | POST | /api/v3/disable-global-mfa-settings | genauth-extension | 关闭全局多因素认证配置 |
| ldap | disableLdapServer |  | POST | /api/v3/disable-ldap-server | authing-sdk | 关闭 LDAP server 服务，关闭前必须先初始化 |
| applications | disableProgrammaticAccessAccount |  | POST | /api/v3/disable-programmatic-access-account | genauth-extension | 禁用编程访问账号 |
| dynamicGroups | dynamicGroupSearchPart |  | POST | /api/v3/dynamic-group-search-part | genauth-extension | 部门模糊查询 |
| applications | enabledAuth |  | POST | /api/v3/update-auth-enabled | authing-sdk | 更新授权开关 |
| applications | enabledAuthFlowApp |  | POST | /api/v3/enabled-auth-flow-app | genauth-extension | 开启编排 |
| devices | enableDevice |  | POST | /api/v3/enable-device-by-user | authing-sdk | 启用设备(用户详情页) |
| applications | enableProgrammaticAccessAccount |  | POST | /api/v3/enable-programmatic-access-account | genauth-extension | 启用编程访问账号 |
| metadata | executeOperate |  | POST | /api/v3/metadata/execute-operate | authing-sdk | 执行自定义操作 |
| metadata | exportMetadata |  | POST | /api/v3/metadata/export | authing-sdk | 导出全部数据 |
| metadata | exportModel |  | POST | /api/v3/metadata/export/model | authing-sdk | 导出数据对象 |
| invitations | exportUsers |  | POST | /api/v3/invitation-invitee/export | authing-sdk | 导出名单内受邀人 |
| identityProviders | extIdpConnApps |  | GET | /api/v3/ext-idp-conn-apps | genauth-extension | 身份源下应用的连接详情 |
| identityProviders | extIdpConnStateByApps |  | GET | /api/v3/ext-idp-conn-apps | authing-sdk | 身份源下应用的连接详情 |
| invitations | filter |  | POST | /api/v3/filter-universal-invitation-applicants | authing-sdk | 查询通用邀请申请列表 |
| invitations | filterUsers |  | POST | /api/v3/list-invitation-invitees | authing-sdk | 查看名单内受邀人 |
| deviceRules | findAppLists |  | GET | /api/v3/get-supported-device-exclusive-apps | authing-sdk | 获取支持设备互斥生效范围的应用列表 |
| riskLists | findIpList | listIps | GET | /api/v3/ip-list | authing-sdk | 获取 ip 列表 |
| devices | findLastLoginAppsByDeviceIds |  | POST | /api/v3/get-last-login-apps-by-deviceIds | authing-sdk | 最近登录应用 |
| devices | findLastLoginAppsByDeviceIdsV2 |  | POST | /api/v3/get-last-login-apps-by-device-ids | authing-sdk | 最近登录应用 |
| riskLists | findRiskListPolicy |  | GET | /api/v3/risk-list-policy | authing-sdk | 获取风险策略列表 |
| riskLists | findUserList | listUsers | GET | /api/v3/user-list | authing-sdk | 获取风险名单用户列表 |
| tenants | generateInviteTenantUserLink |  | POST | /api/v3/generate-invite-tenant-user-link | authing-sdk | 生成一个邀请租户成员的链接 |
| invitations | generateUniversalInvitation |  | POST | /api/v3/generate-universal-invitation-link | authing-sdk | 生成通用邀请链接 |
| accessKeys | getAccessKey |  | GET | /api/v3/get-access-key | authing-sdk | 获取协作管理员 AK/SK 详细信息 |
| accessKeys | getAccessKeyList |  | GET | /api/v3/list-access-key | authing-sdk | 获取协作管理员 AK/SK 列表 |
| auditLogs | getAdminAuditLogs | list | POST | /api/v3/get-admin-audit-logs | authing-sdk | 获取管理员操作日志 |
| departments | getAllDepartments |  | GET | /api/v3/get-all-departments | authing-sdk | 获取所有部门列表 |
| groups | getAllGroups |  | GET | /api/v3/get-all-groups | authing-sdk | 获取所有分组 |
| metadata | getAllMetadata |  | POST | /api/v3/metadata/get-all-metadata | authing-sdk | 获取全部数据对象数据 |
| metadata | getAllMetadataRow |  | POST | /api/v3/metadata/get-all-row-by-scrollid | authing-sdk | 获取全部元数据行信息 |
| billing | getAllRightsItem |  | GET | /api/v3/get-all-rights-items | authing-sdk | 获取所有权益 |
| deviceRules | getAllValidScopeSettings |  | GET | /api/v3/get-device-exclusive-valid-scope-settings | authing-sdk | 获取设备互斥生效范围配置 |
| deviceRules | getAllWhiteListSettings |  | GET | /api/v3/get-device-exclusive-white-list-settings | authing-sdk | 获取设备互斥白名单配置 |
| applications | getApplication | get | GET | /api/v3/get-application | authing-sdk | 获取应用详情 |
| applications | getApplicationAccessControlUserList |  | POST | /api/v3/get-application-access-control-user-list | genauth-extension | 获取应用访问控制用户列表 |
| applications | getApplicationPermissionStrategy |  | GET | /api/v3/get-application-permission-strategy | authing-sdk | 获取应用默认访问授权策略 |
| applications | getApplicationSecret | getSecret | GET | /api/v3/get-application-secret | authing-sdk | 获取应用密钥 |
| applications | getApplicationSimpleInfo |  | GET | /api/v3/get-application-simple-info | authing-sdk | 获取应用简单信息 |
| applications | getAsaAccount |  | GET | /api/v3/get-asa-account | authing-sdk | 获取 ASA 账号 |
| applications | getAsaAccountAssignedTargets |  | GET | /api/v3/get-asa-account-assigned-targets | authing-sdk | 获取 ASA 账号分配的主体列表 |
| applications | getAsaAccountBatch |  | POST | /api/v3/get-asa-accounts-batch | authing-sdk | 批量获取 ASA 账号 |
| applications | getAsaAccountsBatch |  | POST | /api/v3/get-asa-accounts-batch | genauth-extension | 批量获取 ASA 账号 |
| applications | getAssignedAccount |  | GET | /api/v3/get-assigned-account | authing-sdk | 获取主体被分配的 ASA 账号 |
| applications | getAuthFlowConfig |  | GET | /api/v3/get-auth-flow-config | genauth-extension | 获取指定编排配置 |
| applications | getAuthFlowConfigByAppId |  | GET | /api/v3/get-auth-flow-config-by-app-id | genauth-extension | 获取应用编排配置列表 |
| pipelines | getAuthFlowFunction |  | GET | /api/v3/get-auth-flow-function | genauth-extension | 获取 AuthFlowFunction 函数详情 |
| permissions | getAuthorizedResources | listResources | GET | /api/v3/get-authorized-resources | authing-sdk | 获取某个主体被授权的资源列表 |
| ldap | getBindPwd |  | GET | /api/v3/get-ldap-server-random-pwd | authing-sdk | 生成 LDAP Server 管理员密码 |
| applications | getCurrentAuthFlowConfig |  | GET | /api/v3/get-current-auth-flow-config | genauth-extension | 获取当前编排配置 |
| billing | getCurrentPackageInfo |  | GET | /api/v3/get-current-package-info | authing-sdk | 获取套餐详情 |
| customFields | getCustomData | getData | GET | /api/v3/get-custom-data | authing-sdk | 获取用户、分组、角色、组织机构的自定义字段值 |
| customFields | getCustomFields | get | GET | /api/v3/get-custom-fields | authing-sdk | 获取自定义字段列表 |
| dataPermissions | getDataPolicy |  | GET | /api/v3/get-data-policy | authing-sdk | 获取数据策略详情 |
| dataPermissions | getDataResource |  | GET | /api/v3/get-data-resource | authing-sdk | 获取数据资源详情 |
| departments | getDepartment | get | GET | /api/v3/get-department | authing-sdk | 获取部门信息 |
| departments | getDepartmentAllApp |  | POST | /api/v3/get-department-available-app | authing-sdk | 部门被授权的应用列表 |
| departments | getDepartmentAvailableApp |  | POST | /api/v3/get-department-available-app | genauth-extension | 部门被授权的应用列表 |
| departments | getDepartmentById | getById | GET | /api/v3/get-department-by-id | authing-sdk | 根据部门id查询部门 |
| departments | getDepartmentSyncRelations |  | GET | /api/v3/get-department-sync-relations | authing-sdk | 获取部门绑定的第三方同步关系 |
| approvals | getDetail | get | GET | /api/v3/approval | authing-sdk | 获取审批详情 |
| devices | getDeviceStatus |  | POST | /api/v3/device-status | authing-sdk | 获取设备状态 |
| dynamicGroups | getDynamicGroupMatch |  | GET | /api/v3/get-dynamic-group-match | genauth-extension | 查询动态分组匹配规则 |
| email | getEmailProvider |  | GET | /api/v3/get-email-provider | authing-sdk | 获取第三方邮件服务配置 |
| email | getEmailTemplates |  | GET | /api/v3/get-email-templates | authing-sdk | 获取邮件模版列表 |
| dataPermissions | getExternalUserResourceStruct |  | POST | /api/v3/get-external-user-resource-struct | authing-sdk | 获取外部用户拥有指定资源的权限及资源结构信息 |
| identityProviders | getExtIdp | get | GET | /api/v3/get-ext-idp | authing-sdk | 获取身份源详情 |
| security | getGlobalMfaSettings |  | GET | /api/v3/get-global-mfa-settings | authing-sdk | 获取全局多因素认证配置 |
| groups | getGroup | get | GET | /api/v3/get-group | authing-sdk | 获取分组详情 |
| groups | getGroupAuthorizedResources |  | GET | /api/v3/get-group-authorized-resources | authing-sdk | 获取分组被授权的资源列表 |
| publicAccounts | getGroupsOfPublicAccount |  | GET | /api/v3/get-groups-of-public-account | authing-sdk | 获取公共账号分组列表 |
| metadata | getImportTemplate |  | GET | /api/v3/metadata/get-import-template | authing-sdk | 获取导入模板 |
| invitations | getInvitationRoster |  | GET | /api/v3/get-invitation-roster | authing-sdk | 获取邀请名单详情 |
| invitations | getInviteEmailTemplate |  | POST | /api/v3/get-invitation-policy-email-template | authing-sdk | 获取邀请策略邮件模板 |
| dataPermissions | getM2mPermissionList |  | POST | /api/v3/get-m2m-permission-list | genauth-extension | 获取 m2m 权限列表 |
| dataPermissions | getM2mResourcePermissionList |  | POST | /api/v3/get-m2m-resource-permission-list | genauth-extension | 获取m2m拥有某些资源的权限列表（推荐） |
| dataPermissions | getM2mResourceStruct |  | POST | /api/v3/get-m2m-resource-struct | genauth-extension | 获取m2m拥有指定资源的权限及资源结构信息 |
| billing | getMauPeriodUsageHistory |  | GET | /api/v3/get-mau-period-usage-history | authing-sdk | 获取 MAU 使用记录 |
| metadata | getMetadataGroupList |  | POST | /api/v3/metadata/group | authing-sdk | 获取元数据关联群组信息 |
| users | getMfaStatus |  | GET | /api/v3/get-mfa-status | genauth-extension | 获取用户 MFA 状态 |
| applications | getMfaTriggerData |  | GET | /api/v3/get-mfa-trigger-data | authing-sdk | 获取应用下用户 MFA 触发数据 |
| metadata | getModel |  | GET | /api/v3/metadata/get-model | authing-sdk | 获取数据对象详情 |
| tenants | getMultipleTenantAdmin |  | GET | /api/v3/get-multiple-tenant-admin | authing-sdk | 获取多租户管理员用户列表 |
| namespaces | getNamespace | get | GET | /api/v3/get-namespace | authing-sdk | 获取权限分组详情 |
| namespaces | getNamespacesBatch | getBatch | GET | /api/v3/get-namespaces-batch | authing-sdk | 批量获取权限分组详情 |
| billing | getOrderDetail |  | GET | /api/v3/get-order-detail | authing-sdk | 获取订单详情 |
| billing | getOrderPayDetail |  | GET | /api/v3/get-order-pay-detail | authing-sdk | 获取订单支付明细 |
| billing | getOrders |  | GET | /api/v3/get-orders | authing-sdk | 获取订单列表 |
| organizations | getOrganization | get | GET | /api/v3/get-organization | authing-sdk | 获取组织机构详情 |
| organizations | getOrganizationBatch |  | GET | /api/v3/get-organization-batch | genauth-extension | 批量获取组织机构详情 |
| organizations | getOrganizationsBatch |  | GET | /api/v3/get-organization-batch | authing-sdk | 批量获取组织机构详情 |
| users | getOtpSecretByUser |  | GET | /api/v3/get-otp-secret-by-user | authing-sdk | 获取用户绑定 OTP 的秘钥 |
| departments | getParentDepartment | getParent | GET | /api/v3/get-parent-department | authing-sdk | 获取父部门信息 |
| dataPermissions | getPermissionNamespace |  | GET | /api/v3/get-permission-namespace | authing-sdk | 获取权限空间详情 |
| dataPermissions | getPermissionNamespacesBatch |  | GET | /api/v3/get-permission-namespaces-batch | authing-sdk | 批量获取权限空间详情列表 |
| pipelines | getPipelineFunction | get | GET | /api/v3/get-pipeline-function | authing-sdk | 获取 Pipeline 函数详情 |
| pipelines | getPipelineLogs |  | GET | /api/v3/get-pipeline-logs | authing-sdk | 获取 Pipeline 日志 |
| invitations | getPolicyDetailById |  | GET | /api/v3/get-invitation-policy | authing-sdk | 获取邀请策略详情 |
| invitations | getPolicyUserAttributionDetail |  | GET | /api/v3/get-invitation-policy-user-attribution | authing-sdk | 获取邀请策略用户归属详情 |
| positions | getPost | get | GET | /api/v3/get-post | authing-sdk | 获取岗位 |
| positions | getPostById | getById | POST | /api/v3/get-post-by-id | authing-sdk | 获取岗位信息 |
| publicAccounts | getPostOfPublicUser |  | GET | /api/v3/get-post-of-public-account | authing-sdk | 获取公共账号的岗位 |
| publicAccounts | getPublicAccount | get | GET | /api/v3/get-public-account | authing-sdk | 获取公共账号信息 |
| publicAccounts | getPublicAccountBatch | getBatch | GET | /api/v3/get-public-account-batch | authing-sdk | 批量获取公共账号信息 |
| publicAccounts | getPublicAccountDepartments |  | GET | /api/v3/get-departments-of-public-account | authing-sdk | 获取公共账号的部门列表 |
| publicAccounts | getPublicAccountOfGroups |  | POST | /api/v3/set-public-account-of-groups | authing-sdk | 公共账号添加批量分组 |
| publicAccounts | getPublicAccountRoles |  | GET | /api/v3/get-roles-of-public-account | authing-sdk | 获取公共账号的角色列表 |
| publicAccounts | getPublicAccountsOfDepartment |  | GET | /api/v3/get-public-accounts-of-department | authing-sdk | 获取部门的公共账号列表 |
| publicAccounts | getPublicAccountsOfGroup |  | GET | /api/v3/get-public-accounts-of-group | authing-sdk | 获取分组的公共账号列表 |
| publicAccounts | getPublicAccountsOfPost |  | GET | /api/v3/get-public-accounts-of-post | authing-sdk | 获取岗位的公共账号列表 |
| publicAccounts | getPublicAccountsOfRole |  | GET | /api/v3/get-public-accounts-of-role | authing-sdk | 获取角色的公共账号列表 |
| publicAccounts | getPublicAccountsOfUser |  | GET | /api/v3/get-public-accounts-of-user | authing-sdk | 获取用户的公共账号列表 |
| metadata | getRelationDetails |  | GET | /api/v3/metadata/get-row-relation-details | authing-sdk | 获取行关联数据 |
| metadata | getRelationInfo |  | POST | /api/v3/metadata/get-relation-info | authing-sdk | 获取关联数据详情 |
| metadata | getRelationValue |  | GET | /api/v3/metadata/get-row-relation | authing-sdk | 获取行关联数据 |
| resources | getResource | get | GET | /api/v3/get-resource | authing-sdk | 获取资源详情 |
| permissions | getResourceAuthorizedTargets |  | POST | /api/v3/get-resource-authorized-targets | authing-sdk | 获取资源被授权的主体 |
| resources | getResourcesBatch | getBatch | GET | /api/v3/get-resources-batch | authing-sdk | 批量获取资源详情 |
| roles | getRole | get | GET | /api/v3/get-role | authing-sdk | 获取角色详情 |
| roles | getRoleAuthorizedResources |  | GET | /api/v3/get-role-authorized-resources | authing-sdk | 获取角色被授权的资源列表 |
| roles | getRolePolicyList |  | POST | /api/v3/get-role-policy-list | genauth-extension | 获取角色下所拥有的数据策略列表 |
| metadata | getRow |  | GET | /api/v3/metadata/get-row | authing-sdk | 获取数据对象行信息 |
| metadata | getRowBatch |  | POST | /get-row-batch | authing-sdk | 批量获取行信息 |
| metadata | getRowByValue |  | GET | /api/v3/metadata/get-row-by-value | authing-sdk | 根据属性值获取数据对象行信息 |
| deviceRules | getRuleSettings |  | GET | /api/v3/get-device-exclusive-rule-settings | authing-sdk | 获取设备互斥规则配置 |
| security | getSecuritySettings | get | GET | /api/v3/get-security-settings | authing-sdk | 获取安全配置 |
| applications | getSubjectAuthDetail |  | GET | /api/v3/get-subject-auth-detail | genauth-extension | 主体授权详情 |
| sync | getSyncJob |  | GET | /api/v3/get-sync-job | authing-sdk | 获取同步作业详情 |
| sync | getSyncTask | get | GET | /api/v3/get-sync-task | authing-sdk | 获取同步任务详情 |
| tenants | getTenant | get | GET | /api/v3/get-tenant | authing-sdk | 获取租户详情 |
| tenants | getTenantByCode |  | GET | /api/v3/get-tenant-by-code | authing-sdk | 获取租户详情 |
| tenants | getTenantCooperator |  | GET | /api/v3/get-tenant-cooperator | authing-sdk | 获取一个协调管理员 |
| tenants | getTenantCooperatorMenu |  | GET | /api/v3/get-tenant-cooperator-menu | authing-sdk | 获取一个协调管理员拥有的列表 |
| tenants | getTenantEnterpriseCertification |  | GET | /api/v3/get-tenant-enterprise-certification | authing-sdk | 获取租户企业认证信息 |
| tenants | getTenantLittleInfo |  | GET | /api/v3/get-tenant-little-info | authing-sdk | 获取租户一点点的信息 |
| tenants | getTenantUser |  | GET | /api/v3/get-tenant-user | authing-sdk | 获取单个租户成员 |
| invitations | getUniversalInvitation |  | GET | /api/v3/get-universal-invitation-settings | authing-sdk | 获取通用邀请配置 |
| billing | getUsageInfo |  | GET | /api/v3/get-usage-info | authing-sdk | 获取用量详情 |
| users | getUser | get | GET | /api/v3/get-user | authing-sdk | 获取用户信息 |
| users | getUserAccessibleApps |  | GET | /api/v3/get-user-accessible-apps | authing-sdk | 获取用户可访问的应用 |
| auditLogs | getUserActionLogs | listUserActions | POST | /api/v3/get-user-action-logs | authing-sdk | 获取用户行为日志 |
| invitations | getUserAttributionMainDepartment |  | GET | /api/v3/get-invitation-policy-user-attribution-main-department | authing-sdk | 获取设置的用户归属主部门 |
| users | getUserAuthorizedApps |  | GET | /api/v3/get-user-authorized-apps | authing-sdk | 获取用户授权的应用 |
| users | getUserAuthorizedResources | listAuthorizedResources | GET | /api/v3/get-user-authorized-resources | authing-sdk | 获取用户被授权的所有资源 |
| customFields | getUserBaseFields |  | GET | /api/v3/get-user-base-fields | authing-sdk | 获取用户内置字段列表 |
| users | getUserBatch | getBatch | GET | /api/v3/get-user-batch | authing-sdk | 批量获取用户信息 |
| users | getUserDepartments | listDepartments | GET | /api/v3/get-user-departments | authing-sdk | 获取用户部门列表 |
| users | getUserEncryptPasswordBatch |  | POST | /api/v3/batch-get-user-encrypt-password | authing-sdk | 批量获取用户密码密文 |
| users | getUserGroups | listGroups | GET | /api/v3/get-user-groups | authing-sdk | 获取用户分组列表 |
| users | getUserIdentities |  | GET | /api/v3/get-user-identities | authing-sdk | 获取用户的外部身份源 |
| users | getUserLoggedinApps |  | GET | /api/v3/get-user-loggedin-apps | authing-sdk | 获取用户曾经登录过的应用 |
| users | getUserLoggedinIdentities |  | GET | /api/v3/get-user-logged-in-identities | authing-sdk | 获取用户曾经登录过的身份源 |
| users | getUserLoggedInIdentities |  | GET | /api/v3/get-user-logged-in-identities | genauth-extension | 获取用户曾经登录过的身份源 |
| users | getUserLoginHistory |  | GET | /api/v3/get-user-login-history | authing-sdk | 获取用户的登录历史记录 |
| users | getUserMfaInfo |  | GET | /api/v3/get-user-mfa-info | authing-sdk | 获取用户 MFA 绑定信息 |
| users | getUserMfaStatus |  | GET | /api/v3/get-mfa-status | authing-sdk | 获取用户 MFA 状态 |
| users | getUserPasswordCiphertext |  | POST | /api/v3/get-user-password-ciphertext | authing-sdk | 获取用户自定义加密的密码 |
| dataPermissions | getUserPermissionList |  | POST | /api/v3/get-user-permission-list | authing-sdk | 获取用户权限列表 |
| positions | getUserPost |  | GET | /api/v3/get-user-post | authing-sdk | 获取用户关联岗位 |
| positions | getUserPosts | listUserPosts | GET | /api/v3/get-user-posts | authing-sdk | 获取用户关联岗位 |
| users | getUserPrincipalAuthenticationInfo |  | GET | /api/v3/get-user-principal-authentication-info | authing-sdk | 获取用户实名认证信息 |
| dataPermissions | getUserResourcePermissionList |  | POST | /api/v3/get-user-resource-permission-list | authing-sdk | 获取用户拥有某些资源的权限列表（推荐） |
| dataPermissions | getUserResourceStruct |  | POST | /api/v3/get-user-resource-struct | authing-sdk | 获取用户拥有指定资源的权限及资源结构信息 |
| users | getUserRoles | listRoles | GET | /api/v3/get-user-roles | authing-sdk | 获取用户角色列表 |
| publicAccounts | getUsersOfPublicAccount |  | GET | /api/v3/get-users-of-public-account | authing-sdk | 公共账号的用户列表 |
| users | getUserSyncRelations |  | GET | /api/v3/get-user-sync-relations | authing-sdk | 获取用户绑定的第三方同步关系 |
| devices | getVerifyConfigApp |  | GET | /api/v3/verify-config-app | authing-sdk | 获取 verify-config-app 列表 |
| webhooks | getWebhook | get | GET | /api/v3/get-webhook | authing-sdk | 获取 Webhook 详情 |
| webhooks | getWebhookEventList |  | GET | /api/v3/get-webhook-event-list | authing-sdk | 获取 Webhook 事件列表 |
| webhooks | getWebhookLogs |  | POST | /api/v3/get-webhook-logs | authing-sdk | 获取 Webhook 日志 |
| identityProviders | getWechatMpAccessTokenInfo |  | POST | /api/v3/get-weixin-access-token | authing-sdk | 获取微信小程序、公众号 Access Token |
| identityProviders | getWeixinAccessToken |  | POST | /api/v3/get-weixin-access-token | genauth-extension | 获取微信小程序、公众号 Access Token |
| users | hasAnyRole |  | POST | /api/v3/has-any-role | authing-sdk | 判断用户是否有某个角色 |
| metadata | importMetadata |  | POST | /api/v3/metadata/import | authing-sdk | 导入数据 |
| metadata | importModel |  | POST | /api/v3/metadata/import/model | authing-sdk | 导入数据对象 |
| users | importOtp |  | POST | /api/v3/import-otp | authing-sdk | 导入用户的 OTP |
| invitations | importTemplate |  | GET | /api/v3/invitation-invitee/template | authing-sdk | 获取导入名单受邀人的模板 |
| tenants | importTenant |  | POST | /api/v3/import-tenant | authing-sdk | 导入租户 |
| tenants | importTenantHistory |  | GET | /api/v3/import-tenant-history | authing-sdk | 导入租户历史 |
| tenants | importTenantNotifyUser |  | GET | /api/v3/import-tenant-notify-user | authing-sdk | 导入租户通知用户列表 |
| invitations | importUsers |  | POST | /api/v3/invitation-invitee/import | authing-sdk | 导入名单受邀人 |
| permissions | isActionAllowed | isAllowed | POST | /api/v3/is-action-allowed | authing-sdk | 判断用户是否对某个资源的某个操作有权限 |
| departments | isDepartmentInDepartment |  | GET | /api/v3/is-department-in-department | genauth-extension | 判断部门是否在某个部门下 |
| users | isUserExists | exists | POST | /api/v3/is-user-exists | authing-sdk | 判断用户是否存在 |
| departments | isUserInDepartment |  | GET | /api/v3/is-user-in-department | authing-sdk | 判断用户是否在某个部门下 |
| publicAccounts | kickPublicAccounts |  | POST | /api/v3/kick-public-accounts | authing-sdk | 强制下线公共账号 |
| users | kickUsers | kick | POST | /api/v3/kick-users | authing-sdk | 强制下线用户 |
| users | linkIdentity |  | POST | /api/v3/link-identity | authing-sdk | 给用户绑定一个身份信息 |
| accessKeys | listAccessKey |  | GET | /api/v3/list-access-key | genauth-extension | 获取协作管理员 AK/SK 列表 |
| applications | listApplicationActiveUsers |  | POST | /api/v3/list-application-active-users | authing-sdk | 获取应用当前登录用户 |
| applications | listApplications | list | GET | /api/v3/list-applications | authing-sdk | 获取应用列表 |
| applications | listApplicationsAuth |  | POST | /api/v3/list-applications-auth | genauth-extension | 应用授权列表 |
| applications | listApplicationSimpleInfo |  | GET | /api/v3/list-application-simple-info | authing-sdk | 获取应用简单信息列表 |
| users | listArchivedUsers |  | GET | /api/v3/list-archived-users | authing-sdk | 获取已归档的用户列表 |
| applications | listAsaAccount |  | GET | /api/v3/list-asa-accounts | authing-sdk | 获取 ASA 账号列表 |
| applications | listAsaAccounts |  | GET | /api/v3/list-asa-accounts | genauth-extension | 获取 ASA 账号列表 |
| applications | listAuthApplication |  | POST | /api/v3/list-applications-auth | authing-sdk | 应用授权列表 |
| applications | listAuthSubject |  | POST | /api/v3/list-subject-auth | authing-sdk | 主体授权列表 |
| departments | listChildrenDepartments | listChildren | GET | /api/v3/list-children-departments | authing-sdk | 获取子部门列表 |
| policies | listCommonAuthorize |  | GET | /api/v3/list-common-authorize | genauth-extension | 常规资源授权列表 |
| resources | listCommonResource |  | GET | /api/v3/list-common-resource | authing-sdk | 分页获取常规资源列表 |
| customFields | listCustFields |  | GET | /api/v3/list-custom-fields | authing-sdk | 获取自定义字段列表 |
| customFields | listCustomFields | list | GET | /api/v3/list-custom-fields | genauth-extension | 获取自定义字段列表 |
| dataPermissions | listDataPolices |  | GET | /api/v3/list-data-policies | authing-sdk | 获取数据策略列表 |
| dataPermissions | listDataPolicies |  | GET | /api/v3/list-data-policies | genauth-extension | 获取数据策略列表 |
| dataPermissions | listDataPolicyTargets |  | GET | /api/v3/list-data-policy-targets | authing-sdk | 获取数据策略授权的主体列表 |
| dataPermissions | listDataResources |  | GET | /api/v3/list-data-resources | authing-sdk | 获取数据资源列表 |
| departments | listDepartmentMemberIds | listMemberIds | GET | /api/v3/list-department-member-ids | authing-sdk | 获取部门直属成员 ID 列表 |
| departments | listDepartmentMembers | listMembers | GET | /api/v3/list-department-members | authing-sdk | 获取部门成员列表 |
| dataPermissions | listDnef |  | GET | /api/v3/list-dnef | authing-sdk | 获取树类型资源的扩展字段列表 |
| identityProviders | listEnabledExtIdpConnsByApp |  | GET | /api/v3/list-enabled-ext-idp-conns-by-app | genauth-extension | 根据应用 id 获取应用已启用的身份源连接列表 |
| events | listEventApps |  | GET | /api/v3/list-event-apps | authing-sdk | 获取事件应用列表 |
| events | listEvents |  | GET | /api/v3/list-events | authing-sdk | 获取事件列表 |
| identityProviders | listExtIdp | list | GET | /api/v3/list-ext-idp | authing-sdk | 获取身份源列表 |
| identityProviders | listExtIdpConns |  | GET | /api/v3/list-ext-idp-conns | genauth-extension | 获取身份源连接列表 |
| metadata | listField |  | GET | /api/v3/metadata/list-field | authing-sdk | 获取数据对象字段列表 |
| groups | listGroupMembers | listMembers | GET | /api/v3/list-group-members | authing-sdk | 获取分组成员列表 |
| groups | listGroups | list | GET | /api/v3/list-groups | authing-sdk | 获取分组列表 |
| invitations | listInvitationPolicies | listPolicies | POST | /api/v3/list-invitation-policies | authing-sdk | 获取邀请策略列表 |
| invitations | listInvitationRoster | listRosters | POST | /api/v3/list-invitation-rosters | authing-sdk | 获取邀请名单列表 |
| invitations | listInvitationRostersByNonPolicyId |  | POST | /api/v3/list-invitation-rosters-by-no-policy-id | authing-sdk | 获取未关联策略的邀请名单列表 |
| invitations | listInvitationRostersByPolicyId |  | POST | /api/v3/list-invitation-rosters-by-policy-id | authing-sdk | 根据策略 Id 获取邀请名单列表 |
| tenants | listInviteTenantUserRecords |  | GET | /api/v3/list-invite-tenant-user-records | genauth-extension | 获取可访问的租户控制台列表 |
| tenants | listInviteTennatUserRecords |  | GET | /api/v3/list-invite-tenant-user-records | authing-sdk | 获取可访问的租户控制台列表 |
| metadata | listModel |  | GET | /api/v3/metadata/list-model | authing-sdk | 获取数据对象列表 |
| tenants | listMultipleTenantAdmin |  | GET | /api/v3/list-multiple-tenant-admins | authing-sdk | 获取多租户管理员用户列表 |
| tenants | listMultipleTenantAdmins |  | GET | /api/v3/list-multiple-tenant-admins | genauth-extension | 获取多租户管理员用户列表 |
| namespaces | listNamespaceRoles | listRoles | GET | /api/v3/list-namespace-roles | authing-sdk | 分页权限分组下所有的角色列表 |
| namespaces | listNamespaces | list | GET | /api/v3/list-namespaces | authing-sdk | 分页获取权限分组列表 |
| metadata | listOperate |  | GET | /api/v3/metadata/list-operate | authing-sdk | 操作管理列表(分页) |
| metadata | listOperateAll |  | GET | /api/v3/metadata/all-operate | authing-sdk | 全部操作管理列表 |
| organizations | listOrganizations | list | GET | /api/v3/list-organizations | authing-sdk | 获取组织机构列表 |
| dataPermissions | listPermissionNamespaceRoles |  | GET | /api/v3/list-permission-namespace-roles | authing-sdk | 分页查询权限空间下所有的角色列表 |
| dataPermissions | listPermissionNamespaces |  | GET | /api/v3/list-permission-namespaces | authing-sdk | 分页获取权限空间列表 |
| dataPermissions | listPermissionView |  | POST | /api/v3/list-permission-view/data | authing-sdk | 获取权限视图数据列表 |
| dataPermissions | listPermissionViewData |  | POST | /api/v3/list-permission-view/data | genauth-extension | 获取权限视图数据列表 |
| pipelines | listPipelineFunctions | list | GET | /api/v3/list-pipeline-functions | authing-sdk | 获取 Pipeline 函数列表 |
| invitations | listPolicyUserAttributionDetail |  | GET | /api/v3/list-invitation-policy-user-attributions | authing-sdk | 获取邀请策略用户归属列表 |
| applications | listProgrammaticAccessAccounts |  | GET | /api/v3/list-programmatic-access-accounts | genauth-extension | 获取编程访问账号列表 |
| publicAccounts | listPublicAccounts | list | POST | /api/v3/list-public-accounts | authing-sdk | 获取/搜索公共账号列表 |
| invitations | listRegisterExtendsFields |  | GET | /api/v3/list-invitation-policy-extends-fields | authing-sdk | 获取策略流程配置补充信息的字段列表 |
| resources | listResources | list | GET | /api/v3/list-resources | authing-sdk | 分页获取资源列表 |
| dataPermissions | listResourceTargets |  | POST | /api/v3/list-resource-targets | authing-sdk | 获取拥有某些资源权限的用户列表 |
| roles | listRoleAllMembers |  | GET | /api/v3/list-role-all-members | genauth-extension | 获取角色下所有成员列表 |
| roles | listRoleAssignments | listAssignments | GET | /api/v3/list-role-assignments | authing-sdk | 获取角色授权列表 |
| roles | listRoleDepartments |  | GET | /api/v3/list-role-departments | authing-sdk | 获取角色的部门列表 |
| roles | listRoleMembers | listMembers | GET | /api/v3/list-role-members | authing-sdk | 获取角色成员列表 |
| roles | listRoles | list | GET | /api/v3/list-roles | authing-sdk | 获取角色列表 |
| metadata | listRow |  | POST | /api/v3/metadata/filter | authing-sdk | 数据对象高级搜索 |
| sessions | listSessions | list | POST | /api/v3/list-sessions | genauth-extension | 获取 Session 列表 |
| sessions | listSessionsDetailByView |  | POST | /api/v3/list-sessions-detail-by-view | genauth-extension | 视图详情下的 Session 列表 |
| dataPermissions | listSimpleDataPolices |  | GET | /api/v3/list-simple-data-policies | authing-sdk | 获取数据策略简略信息列表 |
| dataPermissions | listSimpleDataPolicies |  | GET | /api/v3/list-simple-data-policies | genauth-extension | 获取数据策略简略信息列表 |
| applications | listSubjectAuth |  | POST | /api/v3/list-subject-auth | genauth-extension | 主体授权列表 |
| sync | listSyncJobLogs |  | GET | /api/v3/list-sync-job-logs | authing-sdk | 获取同步作业详情 |
| sync | listSyncJobs |  | GET | /api/v3/list-sync-jobs | authing-sdk | 获取同步作业详情 |
| sync | listSyncRiskOperations |  | GET | /api/v3/list-sync-risk-operations | authing-sdk | 获取同步风险操作列表 |
| sync | listSyncTasks | list | GET | /api/v3/list-sync-tasks | authing-sdk | 获取同步任务列表 |
| tenants | listTenantAdmin |  | POST | /api/v3/list-tenant-admin | authing-sdk | 获取租户管理员列表 |
| applications | listTenantApplications |  | GET | /api/v3/list-tenant-applications | authing-sdk | 获取租户应用列表 |
| tenants | listTenantCooperators |  | GET | /api/v3/list-tenant-cooperators | authing-sdk | 获取协作管理员用户列表 |
| identityProviders | listTenantExtIdp |  | GET | /api/v3/list-tenant-ext-idp | authing-sdk | 租户控制台获取身份源列表 |
| tenants | listTenants | list | GET | /api/v3/list-tenants | authing-sdk | 获取/搜索租户列表 |
| tenants | listTenantUsers | listUsers | POST | /api/v3/list-tenant-users | authing-sdk | 获取/搜索租户成员列表 |
| customFields | listUserBaseFields |  | GET | /api/v3/list-user-base-fields | authing-sdk | 获取用户内置字段列表 |
| users | listUsers | list | POST | /api/v3/list-users | authing-sdk | 获取/搜索用户列表 |
| users | listUsersLegacy |  | GET | /api/v3/list-users | authing-sdk | 获取用户列表 |
| webhooks | listWebhooks | list | GET | /api/v3/list-webhooks | authing-sdk | 获取 Webhook 列表 |
| whitelist | listWhitelist |  | GET | /api/v3/list-whitelist | genauth-extension | 获取注册白名单列表 |
| whitelist | listWhitelistOfApp |  | GET | /api/v3/list-whitelist-of-app | genauth-extension | 获取应用注册白名单列表 |
| whitelist | listWhitelists |  | GET | /api/v3/list-whitelist | authing-sdk | 获取注册白名单列表 |
| whitelist | listWhitelistsOfApp |  | GET | /api/v3/list-whitelist-of-app | authing-sdk | 获取应用注册白名单列表 |
| approvals | logList |  | GET | /api/v3/approval-log-list | authing-sdk | 获取审批日志列表 |
| roles | multipleNamespaceDeleteRolesBatch |  | POST | /api/v3/multiple-namespace-delete-roles-batch | genauth-extension | 跨权限分组（空间）删除角色 |
| approvals | pendList | listPending | GET | /api/v3/approval-pending-list | authing-sdk | 获取代办审批列表 |
| positions | postList | list | GET | /api/v3/list-post | authing-sdk | 岗位列表 |
| positions | postListBatch | listBatch | POST | /api/v3/list-post | authing-sdk | 岗位列表 |
| dynamicGroups | previewDynamicGroup |  | POST | /api/v3/preview-dynamic-group | genauth-extension | 动态分组预览 |
| email | previewEmailTemplate |  | POST | /api/v3/preview-email-template | authing-sdk | 预览邮件模版 |
| approvals | processApproval | process | PUT | /api/v3/approval-process | authing-sdk | 处理单个审批 |
| events | pub |  | POST | /api/v3/pub-event | authing-sdk | 事件发布 |
| events | pubUserEvent |  | POST | /api/v3/pub-userEvent | authing-sdk | 认证端推送自定义事件 |
| ldap | queryLdapConfigInfo |  | GET | /api/v3/get-ldap-server-config | authing-sdk | 获取 LDAP server 配置信息 |
| ldap | queryLdapLog |  | GET | /api/v3/get-ldap-server-log | authing-sdk | LDAP server 日志查询 |
| ldap | queryLdapSubEntries |  | GET | /api/v3/get-ldap-sub-entries | authing-sdk | LDAP server 根据 DN 查询下一级 |
| invitations | quickFilterInviteeList |  | POST | /api/v3/quick-filter-invitees | authing-sdk | 快捷查询受邀人列表 |
| applications | refreshApplicationSecret | refreshSecret | POST | /api/v3/refresh-application-secret | authing-sdk | 刷新应用密钥 |
| applications | refreshProgrammaticAccessAccountSecret |  | POST | /api/v3/refresh-programmatic-access-account-secret | genauth-extension | 刷新编程访问账号密钥 |
| invitations | reject |  | POST | /api/v3/batch-reject-universal-invitation-applicant | authing-sdk | 批量拒绝通用邀请的申请 |
| metadata | relationSearch |  | POST | /api/v3/metadata/relation-search | authing-sdk | 关联关系模糊查询 |
| metadata | remoteField |  | POST | /api/v3/metadata/remove-field | authing-sdk | 删除数据对象的字段 |
| deviceRules | remove |  | POST | /api/v3/remove-device-exclusive-valid-scope-settings | authing-sdk | 移除设备互斥生效范围配置 |
| departments | removeDepartmentMembers | removeMembers | POST | /api/v3/remove-department-members | authing-sdk | 部门下删除成员 |
| groups | removeGroupMembers | removeMembers | POST | /api/v3/remove-group-members | authing-sdk | 批量移除分组成员 |
| metadata | removeModel |  | POST | /api/v3/metadata/remove-model | authing-sdk | 删除数据对象 |
| metadata | removeOperate |  | POST | /api/v3/metadata/remove-operate | authing-sdk | 移除自定义操作 |
| invitations | removePolicyUserAttribution |  | POST | /api/v3/remove-invitation-policy-user-attribution | authing-sdk | 删除邀请策略用户归属 |
| invitations | removePolicyUserAttributionsBatch |  | POST | /api/v3/remove-invitation-policy-user-attributions-batch | authing-sdk | 批量删除邀请策略用户归属 |
| positions | removePost | delete | POST | /api/v3/remove-post | authing-sdk | 删除岗位 |
| metadata | removeRelationValue |  | POST | /api/v3/metadata/remove-row-relation | authing-sdk | 删除行关联数据 |
| metadata | removeRow |  | POST | /api/v3/metadata/remove-row | authing-sdk | 删除行 |
| tenants | removeTenantDepartmentMembers |  | POST | /api/v3/remove-tenant-department-members | authing-sdk | 租户部门下删除成员 |
| tenants | removeTenantUsers | removeUsers | POST | /api/v3/remove-tenant-users | authing-sdk | 批量移除租户成员 |
| invitations | removeUserAttributionMainDepartment |  | POST | /api/v3/remove-invitation-policy-user-attribution-main-department | authing-sdk | 移除用户归属的主部门设置 |
| users | resetUserPrincipalAuthenticationInfo |  | POST | /api/v3/reset-user-principal-authentication-info | authing-sdk | 删除用户实名认证信息 |
| publicAccounts | resignPublicAccountBatch |  | POST | /api/v3/resign-public-account-batch | authing-sdk | 批量离职用户 |
| users | resignUser | resign | POST | /api/v3/resign-user | authing-sdk | 离职用户 |
| users | resignUserBatch | resignBatch | POST | /api/v3/resign-user-batch | authing-sdk | 批量离职用户 |
| pipelines | reuploadPipelineFunction |  | POST | /api/v3/reupload-pipeline-function | authing-sdk | 重新上传 Pipeline 函数 |
| invitations | revertRosterInvitation |  | POST | /api/v3/revert-roster-invitation | authing-sdk | 撤回邀请 |
| invitations | revertRosterInvitationBatch |  | POST | /api/v3/revert-roster-invitation-batch | authing-sdk | 撤回邀请 |
| tenants | reviewTenantEnterpriseCertification |  | POST | /api/v3/review-tenant-enterprise-certification | authing-sdk | 审核户企业认证 |
| applications | revokeApplicationAccess | revokeAccess | POST | /api/v3/revoke-application-access | authing-sdk | 删除应用访问授权记录 |
| dataPermissions | revokeDataPolicy |  | POST | /api/v3/revoke-data-policy | authing-sdk | 删除数据策略授权 |
| roles | revokeRole | revoke | POST | /api/v3/revoke-role | authing-sdk | 移除分配的角色 |
| roles | revokeRoleBatch | revokeBatch | POST | /api/v3/revoke-role-batch | authing-sdk | 批量移除分配的角色 |
| applications | saveAuthFlowConfig |  | POST | /api/v3/save-auth-flow-config | genauth-extension | 创建编排配置 |
| deviceRules | saveInvitationPolicies |  | POST | /api/v3/save-device-exclusive-valid-scope-settings | authing-sdk | 保存设备互斥生效范围配置 |
| ldap | saveLdapConfigInfo |  | POST | /api/v3/enable-ldap-server | authing-sdk | 初始化/重启 LDAP server |
| departments | searchDepartmentMembers |  | GET | /api/v3/search-department-members | authing-sdk | 搜索部门下的成员 |
| departments | searchDepartments |  | POST | /api/v3/search-departments | authing-sdk | 搜索部门 |
| departments | searchDepartmentsList |  | POST | /api/v3/search-departments-list | authing-sdk | 搜索部门 |
| organizations | searchOrganizations |  | GET | /api/v3/search-organizations | authing-sdk | 搜索组织机构列表 |
| tenants | sendEmailBatch |  | POST | /api/v3/send-email-batch | authing-sdk | 导入租户通知邮箱用户 |
| tenants | sendInviteTenantUserEmail |  | POST | /api/v3/send-invite-tenant-user-email | authing-sdk | 发送邀请租户用户邮件 |
| invitations | sendRosterInvitation |  | POST | /api/v3/send-roster-invitation | authing-sdk | 根据邀请名单发送邀请 |
| invitations | sendRosterInvitationBatch |  | POST | /api/v3/send-roster-invitation-batch | authing-sdk | 批量发送邀请 |
| tenants | sendSmsBatch |  | POST | /api/v3/send-sms-batch | authing-sdk | 导入租户短信通知用户 |
| users | sendUserResetPasswordEmailLink |  | POST | /api/v3/send-user-reset-password-email-link | genauth-extension | 发送用户忘记密码邮箱链接 |
| users | sendUserResetPasswordRequest |  | POST | /api/v3/send-user-reset-password-request | genauth-extension | 根据用户信息发送重置密码请求 |
| customFields | setCustomData | setData | POST | /api/v3/set-custom-data | authing-sdk | 设置自定义字段的值 |
| customFields | setCustomFields | set | POST | /api/v3/set-custom-fields | authing-sdk | 创建/修改自定义字段定义 |
| users | setMfaStatus |  | POST | /api/v3/set-mfa-status | genauth-extension | 设置用户 MFA 状态 |
| publicAccounts | setPublicAccountOfDepartments |  | POST | /api/v3/set-public-account-of-departments | authing-sdk | 设置公共账号所在部门 |
| publicAccounts | setPublicAccountOfnPost |  | POST | /api/v3/set-public-account-of-post | authing-sdk | 设置公共账号的岗位 |
| tenants | setTenantAdmin |  | POST | /api/v3/set-tenant-admin | authing-sdk | 设置租户管理员 |
| invitations | setUserAttributionMainDepartment |  | POST | /api/v3/set-invitation-policy-user-attribution-main-department | authing-sdk | 设置用户归属的主部门 |
| customFields | setUserBaseFields |  | POST | /api/v3/set-user-base-fields | authing-sdk | 修改用户内置字段配置 |
| users | setUserDepartments | setDepartments | POST | /api/v3/set-user-departments | authing-sdk | 设置用户所在部门 |
| users | setUserMfaBindSmsEmail |  | POST | /api/v3/set-user-mfa-bind-sms-email | genauth-extension | 设置用户 MFA 绑定手机号或者邮箱 |
| publicAccounts | setuserOfPublicAccount |  | POST | /api/v3/set-user-of-public-accounts | authing-sdk | 用户绑定批量公共账号 |
| positions | setUserPosts | setUserPosts | POST | /api/v3/set-user-posts | authing-sdk | 用户设置岗位 |
| users | setUsersMfaStatus |  | POST | /api/v3/set-mfa-status | authing-sdk | 设置用户 MFA 状态 |
| sessions | statisticSessionsByApp |  | POST | /api/v3/statistic-sessions-by-app | genauth-extension | 获取按应用统计的 Session 列表 |
| sessions | statisticSessionsByDevice |  | POST | /api/v3/statistic-sessions-by-device | genauth-extension | 获取按设备统计的 Session 列表 |
| sessions | statisticSessionsByUser |  | POST | /api/v3/statistic-sessions-by-user | genauth-extension | 获取按用户统计的 Session 列表 |
| devices | suspendDevice |  | POST | /api/v3/suspend-device-by-user | authing-sdk | 挂起设备(用户详情页) |
| applications | switchAuthFlowConfig |  | POST | /api/v3/switch-auth-flow-config | genauth-extension | 切换编排配置 |
| sync | triggerSyncRiskOperations |  | POST | /api/v3/trigger-sync-risk-operations | authing-sdk | 执行同步风险操作 |
| sync | triggerSyncTask |  | POST | /api/v3/trigger-sync-task | authing-sdk | 执行同步任务 |
| webhooks | triggerWebhook |  | POST | /api/v3/trigger-webhook | authing-sdk | 手动触发 Webhook 执行 |
| applications | unassignAsaAccount |  | POST | /api/v3/unassign-asa-account | authing-sdk | 取消分配 ASA 账号 |
| publicAccounts | unbindPublicAccountOfPost |  | POST | /api/v3/unbind-public-account-of-post | authing-sdk | 解绑公共账号关联岗位 |
| publicAccounts | unbindUsersPublicAccount |  | POST | /api/v3/unbind-public-account-of-user | authing-sdk | 公共账号解绑用户 |
| users | unlinkIdentity |  | POST | /api/v3/unlink-identity | authing-sdk | 解除绑定用户在身份源下的所有身份信息 |
| accessKeys | updateAccessKey | update | POST | /api/v3/update-access-key | authing-sdk | 更新一个管理员 AccessKey |
| applications | updateApplication | update | POST | /api/v3/update-application | authing-sdk | 更新应用 |
| applications | updateApplicationMfaSettings |  | POST | /api/v3/update-application-mfa-settings | authing-sdk | 修改应用多因素认证配置 |
| applications | updateApplicationPermissionStrategy |  | POST | /api/v3/update-application-permission-strategy | authing-sdk | 更新应用默认访问授权策略 |
| applications | updateAsaAccount |  | POST | /api/v3/update-asa-account | authing-sdk | 更新 ASA 账号 |
| applications | updateAuthEnabled |  | POST | /api/v3/update-auth-enabled | genauth-extension | 更新授权开关 |
| applications | updateAuthFlowConfig |  | POST | /api/v3/update-auth-flow-config | genauth-extension | 更新编排配置 |
| pipelines | updateAuthFlowFunction |  | POST | /api/v3/update-auth-flow-function | genauth-extension | 修改 AuthFlowFunction 函数 |
| dataPermissions | updateDataPolicy |  | POST | /api/v3/update-data-policy | authing-sdk | 修改数据策略 |
| dataPermissions | updateDataResource |  | POST | /api/v3/update-data-resource | authing-sdk | 修改数据资源 |
| departments | updateDepartment | update | POST | /api/v3/update-department | authing-sdk | 修改部门 |
| departments | updateDepartmentStatus |  | POST | /api/v3/update-department-status | genauth-extension | 更新部门状态 |
| dataPermissions | updateDnef |  | POST | /api/v3/update-dnef | authing-sdk | 更新树类型资源的扩展字段 |
| dynamicGroups | updateDynamicGroup | update | POST | /api/v3/update-dynamic-group | genauth-extension | 编辑动态分组 |
| email | updateEmailTemplate |  | POST | /api/v3/update-email-template | authing-sdk | 修改邮件模版 |
| identityProviders | updateExtIdp | update | POST | /api/v3/update-ext-idp | authing-sdk | 更新身份源配置 |
| identityProviders | updateExtIdpConn | updateConnection | POST | /api/v3/update-ext-idp-conn | authing-sdk | 更新身份源连接 |
| metadata | updateField |  | POST | /api/v3/metadata/update-field | authing-sdk | 更新数据对象的字段 |
| security | updateGlobalMfaSettings |  | POST | /api/v3/update-global-mfa-settings | authing-sdk | 修改全局多因素认证配置 |
| groups | updateGroup | update | POST | /api/v3/update-group | authing-sdk | 修改分组 |
| invitations | updateInvitationPolicy |  | POST | /api/v3/update-invitation-policy | authing-sdk | 更新邀请策略 |
| invitations | updateInvitationRoster |  | POST | /api/v3/update-invitation-roster | authing-sdk | 更新邀请名单 |
| invitations | updateInviteEmailTemplate |  | POST | /api/v3/update-invitation-policy-email-template | authing-sdk | 获取邀请策略邮件模板 |
| ldap | updateLdapConfigInfo |  | POST | /api/v3/update-ldap-server-config | authing-sdk | 更新 LDAP server 配置信息 |
| applications | updateLoginPageConfig |  | POST | /api/v3/update-login-page-config | authing-sdk | 更新应用登录页配置 |
| metadata | updateModel |  | POST | /api/v3/metadata/update-model | authing-sdk | 更新数据对象 |
| tenants | updateMultipleTenantAdmin |  | POST | /api/v3/update-multiple-tenant-admin | genauth-extension | 更新多租户管理员用户 |
| namespaces | updateNamespace | update | POST | /api/v3/update-namespace | authing-sdk | 修改权限分组信息 |
| departments | updateNodeStatus |  | POST | /api/v3/update-department-status | authing-sdk | 更新部门状态 |
| metadata | updateOperate |  | POST | /api/v3/metadata/update-operate | authing-sdk | 更新操作管理 |
| organizations | updateOrganization | update | POST | /api/v3/update-organization | authing-sdk | 修改组织机构 |
| organizations | updateOrganizationStatus |  | POST | /api/v3/update-organization-status | authing-sdk | 更新组织机构状态 |
| dataPermissions | updatePermissionNamespace |  | POST | /api/v3/update-permission-namespace | authing-sdk | 修改权限空间 |
| pipelines | updatePipelineFunction | update | POST | /api/v3/update-pipeline-function | authing-sdk | 修改 Pipeline 函数 |
| pipelines | updatePipelineOrder |  | POST | /api/v3/update-pipeline-order | authing-sdk | 修改 Pipeline 函数顺序 |
| positions | updatePost | update | POST | /api/v3/update-post | authing-sdk | 更新岗位信息 |
| publicAccounts | updatePublicAccount | update | POST | /api/v3/update-public-account | authing-sdk | 修改公共账号资料 |
| publicAccounts | updatePublicAccountBatch |  | POST | /api/v3/update-public-account-batch | authing-sdk | 批量修改公共账号资料 |
| invitations | updateRegisterExtendsFields |  | POST | /api/v3/update-invitation-policy-extends-fields | authing-sdk | 更新策略流程配置补充信息 |
| resources | updateResource | update | POST | /api/v3/update-resource | authing-sdk | 修改资源 |
| roles | updateRole | update | POST | /api/v3/update-role | authing-sdk | 修改角色 |
| metadata | updateRow |  | POST | /api/v3/metadata/update-row | authing-sdk | 更新行 |
| deviceRules | updateRuleSettings |  | POST | /api/v3/update-device-exclusive-rule-settings | authing-sdk | 更新设备互斥规则配置 |
| security | updateSecuritySettings | update | POST | /api/v3/update-security-settings | authing-sdk | 修改安全配置 |
| sync | updateSyncTask | update | POST | /api/v3/update-sync-task | authing-sdk | 修改同步任务 |
| tenants | updateTenant | update | POST | /api/v3/update-tenant | authing-sdk | 更新租户数据 |
| tenants | updateTenantCooperator |  | POST | /api/v3/update-tenant-cooperator | genauth-extension | 更新协调管理员 |
| tenants | updateTenantEnterpriseCertification |  | POST | /api/v3/update-tenant-enterprise-certification | authing-sdk | 修改租户企业认证 |
| applications | updateTenantQrCodeState |  | POST | /api/v3/update-userpool-tenant-appqrcode-state | authing-sdk | 更新租户控制台扫码登录状态 |
| tenants | updateTenantUser |  | POST | /api/v3/update-tenant-user | authing-sdk | 更新租户成员 |
| invitations | updateUniversalInvitation |  | POST | /api/v3/update-universal-invitation-settings | authing-sdk | 更新通用邀请配置 |
| users | updateUser | update | POST | /api/v3/update-user | authing-sdk | 修改用户资料 |
| users | updateUserBatch |  | POST | /api/v3/update-user-batch | authing-sdk | 批量修改用户资料 |
| applications | updateUserpoolTenantAppqrcodeState |  | POST | /api/v3/update-userpool-tenant-appqrcode-state | genauth-extension | 更新租户控制台扫码登录状态 |
| applications | updateUserpoolTenantConfig |  | POST | /api/v3/update-userpool-tenant-config | genauth-extension | 更新用户池租户配置信息 |
| applications | updateUserPoolTenantConfig |  | POST | /api/v3/update-userpool-tenant-config | authing-sdk | 更新用户池租户配置信息 |
| webhooks | updateWebhook | update | POST | /api/v3/update-webhook | authing-sdk | 修改 Webhook 配置 |
| positions | userConnectionPost |  | POST | /api/v3/user-connection-post | authing-sdk | 用户关联岗位 |
| users | userFieldDecrypt |  | POST | /api/v3/users/field/decrypt | authing-sdk | 用户属性解密 |
| applications | userpollTenantConfig |  | GET | /api/v3/userpool-tenant-config | authing-sdk | 获取用户池租户配置信息 |
| applications | userpoolTenantConfig |  | GET | /api/v3/userpool-tenant-config | genauth-extension | 获取用户池租户配置信息 |
| users | usersFieldDecrypt |  | POST | /api/v3/users/field/decrypt | genauth-extension | 用户属性解密 |
| events | verifyEvent |  | POST | /api/v3/pub-event | authing-sdk | 推送自定义事件 |

## Official helpers outside the JSON surface

| Method | Reason |
| --- | --- |
| makeRequest | raw transport escape hatch |
| upload | multipart file upload; official method omits the file payload |
| reconnect | WebSocket event subscription, outside JSON management |
| initWebSocket | WebSocket event subscription, outside JSON management |
| sub | WebSocket event subscription, outside JSON management |
