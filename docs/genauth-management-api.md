# GenAuth 管理方法参考

初始化、常用功能和示例见 [GenAuth 管理 SDK](./genauth-management.md)。方法接收参数对象，返回 `Promise<QoniResponse<T>>`，业务结果在 `data` 中。第二参数可传 `{ signal }`。

| SDK 方法 | 功能 | Input | Result | HTTP | 路径 |
| --- | --- | --- | --- | --- | --- |
| `qoni.genauth.riskLists.addIp` | 创建 ip 名单 | `GenAuthAddInput` | `GenAuthAddResult` | POST | `/api/v3/ip-list` |
| `qoni.genauth.departments.addMembers` | 部门下添加成员 | `GenAuthAddDepartmentMembersInput` | `GenAuthAddDepartmentMembersResult` | POST | `/api/v3/add-department-members` |
| `qoni.genauth.devices.addDevice` | 新增设备 | `GenAuthAddDeviceInput` | `GenAuthAddDeviceResult` | POST | `/api/v3/add-device` |
| `qoni.genauth.groups.addMembers` | 添加分组成员 | `GenAuthAddGroupMembersInput` | `GenAuthAddGroupMembersResult` | POST | `/api/v3/add-group-members` |
| `qoni.genauth.invitations.addPolicyUserAttribution` | 添加邀请策略用户归属 | `GenAuthAddPolicyUserAttributionInput` | `GenAuthAddPolicyUserAttributionResult` | POST | `/api/v3/add-invitation-policy-user-attribution` |
| `qoni.genauth.invitations.addPolicyUserAttributionsBatch` | 批量添加邀请策略用户归属 | `GenAuthAddPolicyUserAttributionsBatchInput` | `GenAuthAddPolicyUserAttributionsBatchResult` | POST | `/api/v3/add-invitation-policy-user-attributions-batch` |
| `qoni.genauth.riskLists.addRiskListPolicy` | 创建风险策略 | `GenAuthAddRiskListPolicyInput` | `GenAuthAddRiskListPolicyResult` | POST | `/api/v3/risk-list-policy` |
| `qoni.genauth.tenants.addTenantDepartmentMembers` | 租户部门下添加成员 | `GenAuthAddTenantDepartmentMembersInput` | `GenAuthAddTenantDepartmentMembersResult` | POST | `/api/v3/add-tenant-department-members` |
| `qoni.genauth.tenants.addUsers` | 添加租户成员 | `GenAuthAddTenantUsersInput` | `GenAuthAddTenantUsersResult` | POST | `/api/v3/add-tenant-users` |
| `qoni.genauth.riskLists.addUser` | 创建用户名单 | `GenAuthAddUserInput` | `GenAuthAddUserResult` | POST | `/api/v3/user-list` |
| `qoni.genauth.whitelist.addWhitelist` | 创建注册白名单 | `GenAuthAddWhitelistInput` | `GenAuthAddWhitelistResult` | POST | `/api/v3/add-whitelist` |
| `qoni.genauth.whitelist.addWhitelistOfApp` | 创建应用注册白名单 | `GenAuthAddWhitelistOfAppInput` | `GenAuthAddWhitelistOfAppResult` | POST | `/api/v3/add-whitelist-of-app` |
| `qoni.genauth.invitations.approval` | 批量通过通用邀请的申请 | `GenAuthApprovalInput` | `GenAuthApprovalResult` | POST | `/api/v3/batch-approval-universal-invitation-applicants` |
| `qoni.genauth.applications.assignAsaAccount` | 分配 ASA 账号 | `GenAuthAssignAsaAccountInput` | `GenAuthAssignAsaAccountResult` | POST | `/api/v3/assign-asa-account` |
| `qoni.genauth.roles.assign` | 单个角色批量授权 | `GenAuthAssignRoleInput` | `GenAuthAssignRoleResult` | POST | `/api/v3/assign-role` |
| `qoni.genauth.roles.assignBatch` | 批量分配角色 | `GenAuthAssignRoleBatchInput` | `GenAuthAssignRoleBatchResult` | POST | `/api/v3/assign-role-batch` |
| `qoni.genauth.resources.associateTenantResource` | 关联/取消关联应用资源到租户 | `GenAuthAssociateTenantResourceInput` | `GenAuthAssociateTenantResourceResult` | POST | `/api/v3/associate-tenant-resource` |
| `qoni.genauth.applications.authorizeAccess` | 授权应用访问权限 | `GenAuthAuthorizeApplicationAccessInput` | `GenAuthAuthorizeApplicationAccessResult` | POST | `/api/v3/authorize-application-access` |
| `qoni.genauth.dataPermissions.authorizeDataPolicies` | 授权数据策略 | `GenAuthAuthorizeDataPoliciesInput` | `GenAuthAuthorizeDataPoliciesResult` | POST | `/api/v3/authorize-data-policies` |
| `qoni.genauth.permissions.authorize` | 授权资源 | `GenAuthAuthorizeResourcesInput` | `GenAuthAuthorizeResourcesResult` | POST | `/api/v3/authorize-resources` |
| `qoni.genauth.applications.batchApplicationsAuth` | 批量删除应用授权 | `GenAuthBatchApplicationsAuthInput` | `GenAuthBatchApplicationsAuthResult` | DELETE | `/api/v3/batch-applications-auth` |
| `qoni.genauth.invitations.batchBindPolicy` | 更新邀请名单，批量关联邀请策略 | `GenAuthBatchBindPolicyInput` | `GenAuthBatchBindPolicyResult` | POST | `/api/v3/update-invitation-roster-batch-bind-policy` |
| `qoni.genauth.dataPermissions.batchCreateDnef` | 批量创建树类型资源的扩展字段 | `GenAuthBatchCreateDnefInput` | `GenAuthBatchCreateDnefResult` | POST | `/api/v3/batch-create-dnef` |
| `qoni.genauth.resources.batchDeleteCommonResource` | 批量删除资源 | `GenAuthBatchDeleteCommonResourceInput` | `GenAuthBatchDeleteCommonResourceResult` | POST | `/api/v3/delete-common-resources-batch` |
| `qoni.genauth.invitations.batchDeleteInvitationPolicies` | 批量删除邀请策略 | `GenAuthBatchDeleteInvitationPoliciesInput` | `GenAuthBatchDeleteInvitationPoliciesResult` | POST | `/api/v3/delete-invitation-policies-batch` |
| `qoni.genauth.users.batchGetUserEncryptPassword` | 批量获取用户密码密文 | `GenAuthBatchGetUserEncryptPasswordInput` | `GenAuthBatchGetUserEncryptPasswordResult` | POST | `/api/v3/batch-get-user-encrypt-password` |
| `qoni.genauth.approvals.processBatch` | 批量处理审批 | `GenAuthBatchProcessApprovalInput` | `GenAuthBatchProcessApprovalResult` | PUT | `/api/v3/approval-batch-process` |
| `qoni.genauth.invitations.batchUnbindPolicy` | 更新邀请名单，根据策略 Id 批量解除关联 | `GenAuthBatchUnbindPolicyInput` | `GenAuthBatchUnbindPolicyResult` | POST | `/api/v3/update-invitation-roster-batch-unbind-policy` |
| `qoni.genauth.publicAccounts.bindPublicAccountOfRoles` | 公共账号绑定批量角色 | `GenAuthBindPublicAccountOfRolesInput` | `GenAuthBindPublicAccountOfRolesResult` | POST | `/api/v3/set-public-account-of-roles` |
| `qoni.genauth.publicAccounts.bindUsersPublicAccount` | 公共账号绑定批量用户 | `GenAuthBindUsersPublicAccountInput` | `GenAuthBindUsersPublicAccountResult` | POST | `/api/v3/set-public-account-of-users` |
| `qoni.genauth.sync.cancelSyncRiskOperation` | 取消同步风险操作 | `GenAuthCancelSyncRiskOperationInput` | `GenAuthCancelSyncRiskOperationResult` | POST | `/api/v3/cancel-sync-risk-operation` |
| `qoni.genauth.metadata.capture` | UEBA 上传 | `GenAuthCaptureInput` | `GenAuthCaptureResult` | POST | `/api/v3/metadata/ueba/capture` |
| `qoni.genauth.identityProviders.changeExtIdpConnAssociationState` | 租户关联身份源 | `GenAuthChangeExtIdpConnAssociationStateInput` | `GenAuthChangeExtIdpConnAssociationStateResult` | POST | `/api/v3/change-ext-idp-conn-association-state` |
| `qoni.genauth.identityProviders.changeExtIdpConnState` | 身份源连接开关 | `GenAuthChangeExtIdpConnStateInput` | `GenAuthChangeExtIdpConnStateResult` | POST | `/api/v3/change-ext-idp-conn-state` |
| `qoni.genauth.publicAccounts.changeIntoPublicAccount` | 个人账号转换为公共账号 | `GenAuthChangeIntoPublicAccountInput` | `GenAuthChangeIntoPublicAccountResult` | POST | `/api/v3/transfer-into-public-account` |
| `qoni.genauth.applications.changeUserpoolTenanExtIdpConnState` | 设置用户池多租户身份源连接 | `GenAuthChangeUserpoolTenanExtIdpConnStateInput` | `GenAuthChangeUserpoolTenanExtIdpConnStateResult` | POST | `/api/v3/change-userpool-tenant-ext-idp-conn-state` |
| `qoni.genauth.applications.changeUserpoolTenantExtIdpConnState` | 设置用户池多租户身份源连接 | `GenAuthChangeUserpoolTenantExtIdpConnStateInput` | `GenAuthChangeUserpoolTenantExtIdpConnStateResult` | POST | `/api/v3/change-userpool-tenant-ext-idp-conn-state` |
| `qoni.genauth.dataPermissions.checkDataPolicyExists` | 检查数据策略名称是否可用 | `GenAuthCheckDataPolicyExistsInput` | `GenAuthCheckDataPolicyExistsResult` | GET | `/api/v3/check-data-policy-exists` |
| `qoni.genauth.dataPermissions.checkDataResourceExists` | 检查数据资源 Code 或者名称是否可用 | `GenAuthCheckDataResourceExistsInput` | `GenAuthCheckDataResourceExistsResult` | GET | `/api/v3/check-data-resource-exists` |
| `qoni.genauth.applications.checkDomainAvailable` | 检测域名是否可用 | `GenAuthCheckDomainAvailableInput` | `GenAuthCheckDomainAvailableResult` | POST | `/api/v3/check-domain-available` |
| `qoni.genauth.dataPermissions.checkExternalUserPermission` | 判断外部用户权限 | `GenAuthCheckExternalUserPermissionInput` | `GenAuthCheckExternalUserPermissionResult` | POST | `/api/v3/check-external-user-permission` |
| `qoni.genauth.dataPermissions.checkM2mPermission` | 判断 m2m 权限 | `GenAuthCheckM2mPermissionInput` | `GenAuthCheckM2mPermissionResult` | POST | `/api/v3/check-m2m-permission` |
| `qoni.genauth.dataPermissions.checkM2mSameLevelPermission` | 判断 m2m 在树资源同层级下的权限（推荐） | `GenAuthCheckM2mSameLevelPermissionInput` | `GenAuthCheckM2mSameLevelPermissionResult` | POST | `/api/v3/check-m2m-same-level-permission` |
| `qoni.genauth.roles.checkMutualExclusion` | 检测角色互斥 | `GenAuthCheckMutualExclusionInput` | `GenAuthCheckMutualExclusionResult` | POST | `/api/v3/check-role-mutual-exclusion` |
| `qoni.genauth.roles.checkParamsNamespace` | 校验角色 Code 或者名称是否可用 | `GenAuthCheckParamsNamespaceInput` | `GenAuthCheckParamsNamespaceResult` | POST | `/api/v3/check-role-params` |
| `qoni.genauth.dataPermissions.checkPermission` | 判断用户权限（重点） | `GenAuthCheckPermissionInput` | `GenAuthCheckPermissionResult` | POST | `/api/v3/check-permission` |
| `qoni.genauth.dataPermissions.checkPermissionNamespaceExists` | 校验权限空间 Code 或者名称是否可用 | `GenAuthCheckPermissionNamespaceExistsInput` | `GenAuthCheckPermissionNamespaceExistsResult` | POST | `/api/v3/check-permission-namespace-exists` |
| `qoni.genauth.roles.checkRoleMutualExclusion` | 检测角色互斥 | `GenAuthCheckRoleMutualExclusionInput` | `GenAuthCheckRoleMutualExclusionResult` | POST | `/api/v3/check-role-mutual-exclusion` |
| `qoni.genauth.roles.checkRoleParams` | 校验角色 Code 或者名称是否可用 | `GenAuthCheckRoleParamsInput` | `GenAuthCheckRoleParamsResult` | POST | `/api/v3/check-role-params` |
| `qoni.genauth.users.checkSessionStatus` | 检查某个用户在应用下是否具备 Session 登录态 | `GenAuthCheckSessionStatusInput` | `GenAuthCheckSessionStatusResult` | POST | `/api/v3/check-session-status` |
| `qoni.genauth.dataPermissions.checkUserSameLevelPermission` | 判断用户在树资源同层级下的权限（推荐） | `GenAuthCheckUserSameLevelPermissionInput` | `GenAuthCheckUserSameLevelPermissionResult` | POST | `/api/v3/check-user-same-level-permission` |
| `qoni.genauth.approvals.listClosed` | 获取已办审批列表 | `GenAuthClosedListInput` | `GenAuthClosedListResult` | GET | `/api/v3/approval-closed-list` |
| `qoni.genauth.security.closeGlobalMfaSettings` | 关闭全局多因素认证配置 | `GenAuthCloseGlobalMfaSettingsInput` | `GenAuthCloseGlobalMfaSettingsResult` | POST | `/api/v3/disable-global-mfa-settings` |
| `qoni.genauth.email.configEmailProvider` | 配置第三方邮件服务 | `GenAuthConfigEmailProviderInput` | `GenAuthConfigEmailProviderResult` | POST | `/api/v3/config-email-provider` |
| `qoni.genauth.applications.copyAuthFlowConfig` | 复制编排配置 | `GenAuthCopyAuthFlowConfigInput` | `GenAuthCopyAuthFlowConfigResult` | POST | `/api/v3/copy-auth-flow-config` |
| `qoni.genauth.invitations.copyInvitationPolicyById` | 创建邀请策略副本 | `GenAuthCopyInvitationPolicyByIdInput` | `GenAuthCopyInvitationPolicyByIdResult` | POST | `/api/v3/copy-invitation-policy-by-id` |
| `qoni.genauth.metadata.copyOperate` | 复制自定义操作 | `GenAuthCopyOperateInput` | `GenAuthCopyOperateResult` | POST | `/api/v3/metadata/copy-operate` |
| `qoni.genauth.metadata.copyRowRelation` | 复制行关联关系 | `GenAuthCopyRowRelationInput` | `GenAuthCopyRowRelationResult` | POST | `/api/v3/metadata/copy-row-relation` |
| `qoni.genauth.accessKeys.create` | 创建协作管理员的 AK/SK | `GenAuthCreateAccessKeyInput` | `GenAuthCreateAccessKeyResult` | POST | `/api/v3/create-access-key` |
| `qoni.genauth.roles.createAdminRole` | 创建管理员角色 | `GenAuthCreateAdminRoleInput` | `GenAuthCreateAdminRoleResult` | POST | `/api/v3/create-admin-role` |
| `qoni.genauth.applications.create` | 创建应用 | `GenAuthCreateApplicationInput` | `GenAuthCreateApplicationResult` | POST | `/api/v3/create-application` |
| `qoni.genauth.dataPermissions.createArrayDataResource` | 创建数组数据资源 | `GenAuthCreateArrayDataResourceInput` | `GenAuthCreateArrayDataResourceResult` | POST | `/api/v3/create-array-data-resource` |
| `qoni.genauth.applications.createAsaAccount` | 创建 ASA 账号 | `GenAuthCreateAsaAccountInput` | `GenAuthCreateAsaAccountResult` | POST | `/api/v3/create-asa-account` |
| `qoni.genauth.applications.createAsaAccountBatch` | 批量创建 ASA 账号 | `GenAuthCreateAsaAccountBatchInput` | `GenAuthCreateAsaAccountBatchResult` | POST | `/api/v3/create-asa-accounts-batch` |
| `qoni.genauth.applications.createAsaAccountsBatch` | 批量创建 ASA 账号 | `GenAuthCreateAsaAccountsBatchInput` | `GenAuthCreateAsaAccountsBatchResult` | POST | `/api/v3/create-asa-accounts-batch` |
| `qoni.genauth.applications.createAuthFlowAppConfig` | 创建应用认证配置 | `GenAuthCreateAuthFlowAppConfigInput` | `GenAuthCreateAuthFlowAppConfigResult` | POST | `/api/v3/create-auth-flow-app-config` |
| `qoni.genauth.pipelines.createAuthFlowFunction` | 创建 AuthFlowFunction 函数 | `GenAuthCreateAuthFlowFunctionInput` | `GenAuthCreateAuthFlowFunctionResult` | POST | `/api/v3/create-auth-flow-function` |
| `qoni.genauth.dataPermissions.createDataPolicy` | 创建数据策略（重点） | `GenAuthCreateDataPolicyInput` | `GenAuthCreateDataPolicyResult` | POST | `/api/v3/create-data-policy` |
| `qoni.genauth.dataPermissions.createDataResource` | 创建数据资源（推荐、重点） | `GenAuthCreateDataResourceInput` | `GenAuthCreateDataResourceResult` | POST | `/api/v3/create-data-resource` |
| `qoni.genauth.dataPermissions.createDataResourceByArray` | 创建数组数据资源 | `GenAuthCreateDataResourceByArrayInput` | `GenAuthCreateDataResourceByArrayResult` | POST | `/api/v3/create-array-data-resource` |
| `qoni.genauth.dataPermissions.createDataResourceByString` | 创建字符串数据资源 | `GenAuthCreateDataResourceByStringInput` | `GenAuthCreateDataResourceByStringResult` | POST | `/api/v3/create-string-data-resource` |
| `qoni.genauth.dataPermissions.createDataResourceByTree` | 创建树数据资源 | `GenAuthCreateDataResourceByTreeInput` | `GenAuthCreateDataResourceByTreeResult` | POST | `/api/v3/create-tree-data-resource` |
| `qoni.genauth.departments.create` | 创建部门 | `GenAuthCreateDepartmentInput` | `GenAuthCreateDepartmentResult` | POST | `/api/v3/create-department` |
| `qoni.genauth.departments.createDepartmentTree` | 根据组织树批量创建部门 | `GenAuthCreateDepartmentTreeInput` | `GenAuthCreateDepartmentTreeResult` | POST | `/api/v3/create-department-tree` |
| `qoni.genauth.devices.createDevice` | 新增设备 | `GenAuthCreateDeviceInput` | `GenAuthCreateDeviceResult` | POST | `/api/v3/create-device` |
| `qoni.genauth.dataPermissions.createDnef` | 创建树类型资源的扩展字段 | `GenAuthCreateDnefInput` | `GenAuthCreateDnefResult` | POST | `/api/v3/create-dnef` |
| `qoni.genauth.dynamicGroups.create` | 创建动态分组 | `GenAuthCreateDynamicGroupInput` | `GenAuthCreateDynamicGroupResult` | POST | `/api/v3/create-dynamic-group` |
| `qoni.genauth.events.createEventApp` | 创建自定义事件应用 | `GenAuthCreateEventAppInput` | `GenAuthCreateEventAppResult` | POST | `/api/v3/create-event-app` |
| `qoni.genauth.identityProviders.create` | 创建身份源 | `GenAuthCreateExtIdpInput` | `GenAuthCreateExtIdpResult` | POST | `/api/v3/create-ext-idp` |
| `qoni.genauth.identityProviders.createConnection` | 在某个已有身份源下创建新连接 | `GenAuthCreateExtIdpConnInput` | `GenAuthCreateExtIdpConnResult` | POST | `/api/v3/create-ext-idp-conn` |
| `qoni.genauth.metadata.createField` | 创建数据对象的字段 | `GenAuthCreateFieldInput` | `GenAuthCreateFieldResult` | POST | `/api/v3/metadata/create-field` |
| `qoni.genauth.groups.create` | 创建分组 | `GenAuthCreateGroupInput` | `GenAuthCreateGroupResult` | POST | `/api/v3/create-group` |
| `qoni.genauth.groups.createGroupsBatch` | 批量创建分组 | `GenAuthCreateGroupsBatchInput` | `GenAuthCreateGroupsBatchResult` | POST | `/api/v3/create-groups-batch` |
| `qoni.genauth.invitations.createPolicy` | 创建邀请策略 | `GenAuthCreateInvitationPolicyInput` | `GenAuthCreateInvitationPolicyResult` | POST | `/api/v3/create-invitation-policy` |
| `qoni.genauth.invitations.createRoster` | 创建邀请名单 | `GenAuthCreateInvitationRosterInput` | `GenAuthCreateInvitationRosterResult` | POST | `/api/v3/create-invitation-roster` |
| `qoni.genauth.metadata.createModel` | 创建数据对象 | `GenAuthCreateModelInput` | `GenAuthCreateModelResult` | POST | `/api/v3/metadata/create-model` |
| `qoni.genauth.tenants.createMultipleTenantAdmin` | 创建多租户管理员用户 | `GenAuthCreateMultipleTenantAdminInput` | `GenAuthCreateMultipleTenantAdminResult` | POST | `/api/v3/create-multiple-tenant-admin` |
| `qoni.genauth.namespaces.create` | 创建权限分组 | `GenAuthCreateNamespaceInput` | `GenAuthCreateNamespaceResult` | POST | `/api/v3/create-namespace` |
| `qoni.genauth.namespaces.createBatch` | 批量创建权限分组 | `GenAuthCreateNamespacesBatchInput` | `GenAuthCreateNamespacesBatchResult` | POST | `/api/v3/create-namespaces-batch` |
| `qoni.genauth.metadata.createOperate` | 创建自定义操作 | `GenAuthCreateOperateInput` | `GenAuthCreateOperateResult` | POST | `/api/v3/metadata/create-operate` |
| `qoni.genauth.organizations.create` | 创建组织机构 | `GenAuthCreateOrganizationInput` | `GenAuthCreateOrganizationResult` | POST | `/api/v3/create-organization` |
| `qoni.genauth.groups.createOrUpdateGroup` | 创建或修改分组 | `GenAuthCreateOrUpdateGroupInput` | `GenAuthCreateOrUpdateGroupResult` | POST | `/api/v3/create-or-update-group` |
| `qoni.genauth.dataPermissions.createPermissionNamespace` | 创建权限空间 | `GenAuthCreatePermissionNamespaceInput` | `GenAuthCreatePermissionNamespaceResult` | POST | `/api/v3/create-permission-namespace` |
| `qoni.genauth.dataPermissions.createPermissionNamespacesBatch` | 批量创建权限空间 | `GenAuthCreatePermissionNamespacesBatchInput` | `GenAuthCreatePermissionNamespacesBatchResult` | POST | `/api/v3/create-permission-namespaces-batch` |
| `qoni.genauth.pipelines.create` | 创建 Pipeline 函数 | `GenAuthCreatePipelineFunctionInput` | `GenAuthCreatePipelineFunctionResult` | POST | `/api/v3/create-pipeline-function` |
| `qoni.genauth.positions.create` | 创建岗位 | `GenAuthCreatePostInput` | `GenAuthCreatePostResult` | POST | `/api/v3/create-post` |
| `qoni.genauth.applications.createProgrammaticAccessAccount` | 创建编程访问账号 | `GenAuthCreateProgrammaticAccessAccountInput` | `GenAuthCreateProgrammaticAccessAccountResult` | POST | `/api/v3/create-programmatic-access-account` |
| `qoni.genauth.publicAccounts.create` | 创建公共账号 | `GenAuthCreatePublicAccountInput` | `GenAuthCreatePublicAccountResult` | POST | `/api/v3/create-public-account` |
| `qoni.genauth.publicAccounts.createBatch` | 批量创建公共账号 | `GenAuthCreatePublicAccountsBatchInput` | `GenAuthCreatePublicAccountsBatchResult` | POST | `/api/v3/create-public-accounts-batch` |
| `qoni.genauth.resources.create` | 创建资源 | `GenAuthCreateResourceInput` | `GenAuthCreateResourceResult` | POST | `/api/v3/create-resource` |
| `qoni.genauth.resources.createBatch` | 批量创建资源 | `GenAuthCreateResourcesBatchInput` | `GenAuthCreateResourcesBatchResult` | POST | `/api/v3/create-resources-batch` |
| `qoni.genauth.roles.create` | 创建角色 | `GenAuthCreateRoleInput` | `GenAuthCreateRoleResult` | POST | `/api/v3/create-role` |
| `qoni.genauth.roles.createBatch` | 批量创建角色 | `GenAuthCreateRolesBatchInput` | `GenAuthCreateRolesBatchResult` | POST | `/api/v3/create-roles-batch` |
| `qoni.genauth.metadata.createRow` | 添加行 | `GenAuthCreateRowInput` | `GenAuthCreateRowResult` | POST | `/api/v3/metadata/create-row` |
| `qoni.genauth.metadata.createRowRelation` | 创建行关联数据 | `GenAuthCreateRowRelationInput` | `GenAuthCreateRowRelationResult` | POST | `/api/v3/metadata/create-row-relation` |
| `qoni.genauth.dataPermissions.createStringDataResource` | 创建字符串数据资源 | `GenAuthCreateStringDataResourceInput` | `GenAuthCreateStringDataResourceResult` | POST | `/api/v3/create-string-data-resource` |
| `qoni.genauth.sync.create` | 创建同步任务 | `GenAuthCreateSyncTaskInput` | `GenAuthCreateSyncTaskResult` | POST | `/api/v3/create-sync-task` |
| `qoni.genauth.tenants.create` | 创建租户 | `GenAuthCreateTenantInput` | `GenAuthCreateTenantResult` | POST | `/api/v3/create-tenant` |
| `qoni.genauth.tenants.createTenantCooperator` | 创建协调管理员 | `GenAuthCreateTenantCooperatorInput` | `GenAuthCreateTenantCooperatorResult` | POST | `/api/v3/create-tenant-cooperator` |
| `qoni.genauth.tenants.createTenantEnterpriseCertification` | 创建租户企业认证 | `GenAuthCreateTenantEnterpriseCertificationInput` | `GenAuthCreateTenantEnterpriseCertificationResult` | POST | `/api/v3/create-tenant-enterprise-certification` |
| `qoni.genauth.tenants.createTenantUser` | 创建租户成员 | `GenAuthCreateTenantUserInput` | `GenAuthCreateTenantUserResult` | POST | `/api/v3/create-tenant-user` |
| `qoni.genauth.dataPermissions.createTreeDataResource` | 创建树数据资源 | `GenAuthCreateTreeDataResourceInput` | `GenAuthCreateTreeDataResourceResult` | POST | `/api/v3/create-tree-data-resource` |
| `qoni.genauth.users.create` | 创建用户 | `GenAuthCreateUserInput` | `GenAuthCreateUserResult` | POST | `/api/v3/create-user` |
| `qoni.genauth.users.createBatch` | 批量创建用户 | `GenAuthCreateUsersBatchInput` | `GenAuthCreateUsersBatchResult` | POST | `/api/v3/create-users-batch` |
| `qoni.genauth.devices.createVerifyDevice` | 新增 verify 设备 | `GenAuthCreateVerifyDeviceInput` | `GenAuthCreateVerifyDeviceResult` | POST | `/api/v3/authing-verify/create-device` |
| `qoni.genauth.webhooks.create` | 创建 Webhook | `GenAuthCreateWebhookInput` | `GenAuthCreateWebhookResult` | POST | `/api/v3/create-webhook` |
| `qoni.genauth.sessions.deactivateAll` | 停用全部 Session | `GenAuthDeactivateAllSessionsInput` | `GenAuthDeactivateAllSessionsResult` | POST | `/api/v3/deactivate-all-sessions` |
| `qoni.genauth.sessions.deactivateBatch` | 批量停用 Session | `GenAuthDeactivateSessionsBatchInput` | `GenAuthDeactivateSessionsBatchResult` | POST | `/api/v3/deactivate-sessions-batch` |
| `qoni.genauth.events.defineEvent` | 定义自定义事件 | `GenAuthDefineEventInput` | `GenAuthDefineEventResult` | POST | `/api/v3/define-event` |
| `qoni.genauth.accessKeys.delete` | 删除协作管理员的 AK/SK | `GenAuthDeleteAccessKeyInput` | `GenAuthDeleteAccessKeyResult` | POST | `/api/v3/delete-access-key` |
| `qoni.genauth.roles.deleteAdminRoles` | 删除管理员自定义角色 | `GenAuthDeleteAdminRolesInput` | `GenAuthDeleteAdminRolesResult` | POST | `/api/v3/delete-admin-roles` |
| `qoni.genauth.roles.deleteAdminRolesBatch` | 删除管理员自定义角色 | `GenAuthDeleteAdminRolesBatchInput` | `GenAuthDeleteAdminRolesBatchResult` | POST | `/api/v3/delete-admin-roles` |
| `qoni.genauth.applications.delete` | 删除应用 | `GenAuthDeleteApplicationInput` | `GenAuthDeleteApplicationResult` | POST | `/api/v3/delete-application` |
| `qoni.genauth.applications.deleteAsaAccount` | 删除 ASA 账号 | `GenAuthDeleteAsaAccountInput` | `GenAuthDeleteAsaAccountResult` | POST | `/api/v3/delete-asa-account` |
| `qoni.genauth.applications.deleteAsaAccountBatch` | 批量删除 ASA 账号 | `GenAuthDeleteAsaAccountBatchInput` | `GenAuthDeleteAsaAccountBatchResult` | POST | `/api/v3/delete-asa-accounts-batch` |
| `qoni.genauth.applications.deleteAsaAccountsBatch` | 批量删除 ASA 账号 | `GenAuthDeleteAsaAccountsBatchInput` | `GenAuthDeleteAsaAccountsBatchResult` | POST | `/api/v3/delete-asa-accounts-batch` |
| `qoni.genauth.applications.deleteAuth` | 批量删除应用授权 | `GenAuthDeleteAuthInput` | `GenAuthDeleteAuthResult` | DELETE | `/api/v3/batch-applications-auth` |
| `qoni.genauth.applications.deleteAuthFlowConfig` | 删除编排配置 | `GenAuthDeleteAuthFlowConfigInput` | `GenAuthDeleteAuthFlowConfigResult` | POST | `/api/v3/delete-auth-flow-config` |
| `qoni.genauth.pipelines.deleteAuthFlowFunction` | 删除 AuthFlowFunction 函数 | `GenAuthDeleteAuthFlowFunctionInput` | `GenAuthDeleteAuthFlowFunctionResult` | POST | `/api/v3/delete-auth-flow-function` |
| `qoni.genauth.riskLists.deleteIp` | 删除 ip 名单 | `GenAuthDeleteByIdInput` | `GenAuthDeleteByIdResult` | DELETE | `/api/v3/ip-list/{id}` |
| `qoni.genauth.policies.deleteCommonAuthorizeBatch` | 批量删除常规资源授权列表 | `GenAuthDeleteCommonAuthorizeBatchInput` | `GenAuthDeleteCommonAuthorizeBatchResult` | DELETE | `/api/v3/delete-common-authorize-batch` |
| `qoni.genauth.resources.deleteCommonResourcesBatch` | 批量删除资源 | `GenAuthDeleteCommonResourcesBatchInput` | `GenAuthDeleteCommonResourcesBatchResult` | POST | `/api/v3/delete-common-resources-batch` |
| `qoni.genauth.customFields.delete` | 删除自定义字段定义 | `GenAuthDeleteCustomFieldsInput` | `GenAuthDeleteCustomFieldsResult` | POST | `/api/v3/delete-custom-fields` |
| `qoni.genauth.dataPermissions.deleteDataPolicy` | 删除数据策略 | `GenAuthDeleteDataPolicyInput` | `GenAuthDeleteDataPolicyResult` | POST | `/api/v3/delete-data-policy` |
| `qoni.genauth.dataPermissions.deleteDataResource` | 删除数据资源 | `GenAuthDeleteDataResourceInput` | `GenAuthDeleteDataResourceResult` | POST | `/api/v3/delete-data-resource` |
| `qoni.genauth.departments.delete` | 删除部门 | `GenAuthDeleteDepartmentInput` | `GenAuthDeleteDepartmentResult` | POST | `/api/v3/delete-department` |
| `qoni.genauth.departments.deleteDepartmentAndChilds` | 删除部门和子部门 | `GenAuthDeleteDepartmentAndChildsInput` | `GenAuthDeleteDepartmentAndChildsResult` | POST | `/api/v3/delete-department-and-childs` |
| `qoni.genauth.departments.deleteDepartmentSyncRelations` | 删除部门同步关联关系 | `GenAuthDeleteDepartmentSyncRelationsInput` | `GenAuthDeleteDepartmentSyncRelationsResult` | POST | `/api/v3/delete-department-sync-relations` |
| `qoni.genauth.devices.deleteDevice` | 移除绑定(用户详情页) | `GenAuthDeleteDeviceInput` | `GenAuthDeleteDeviceResult` | POST | `/api/v3/delete-device-by-user` |
| `qoni.genauth.dataPermissions.deleteDnef` | 删除树类型资源的扩展字段 | `GenAuthDeleteDnefInput` | `GenAuthDeleteDnefResult` | POST | `/api/v3/delete-dnef` |
| `qoni.genauth.identityProviders.delete` | 删除身份源 | `GenAuthDeleteExtIdpInput` | `GenAuthDeleteExtIdpResult` | POST | `/api/v3/delete-ext-idp` |
| `qoni.genauth.identityProviders.deleteConnection` | 删除身份源连接 | `GenAuthDeleteExtIdpConnInput` | `GenAuthDeleteExtIdpConnResult` | POST | `/api/v3/delete-ext-idp-conn` |
| `qoni.genauth.groups.deleteBatch` | 批量删除分组 | `GenAuthDeleteGroupsBatchInput` | `GenAuthDeleteGroupsBatchResult` | POST | `/api/v3/delete-groups-batch` |
| `qoni.genauth.invitations.deleteInvitationRoster` | 删除邀请名单 | `GenAuthDeleteInvitationRosterInput` | `GenAuthDeleteInvitationRosterResult` | POST | `/api/v3/delete-invitation-roster` |
| `qoni.genauth.invitations.deleteInvitationRosterBatch` | 批量删除邀请名单 | `GenAuthDeleteInvitationRosterBatchInput` | `GenAuthDeleteInvitationRosterBatchResult` | POST | `/api/v3/delete-invitation-rosters-batch` |
| `qoni.genauth.invitations.deleteInvitees` | 批量删除名单中的受邀人 | `GenAuthDeleteInviteesInput` | `GenAuthDeleteInviteesResult` | POST | `/api/v3/batch-delete-invitation-invitees` |
| `qoni.genauth.tenants.deleteMultipleTenantAdmin` | 删除多租户管理员用户 | `GenAuthDeleteMultipleTenantAdminInput` | `GenAuthDeleteMultipleTenantAdminResult` | POST | `/api/v3/delete-multiple-tenant-admin` |
| `qoni.genauth.namespaces.delete` | 删除权限分组信息 | `GenAuthDeleteNamespaceInput` | `GenAuthDeleteNamespaceResult` | POST | `/api/v3/delete-namespace` |
| `qoni.genauth.namespaces.deleteBatch` | 批量删除权限分组 | `GenAuthDeleteNamespacesBatchInput` | `GenAuthDeleteNamespacesBatchResult` | POST | `/api/v3/delete-namespaces-batch` |
| `qoni.genauth.organizations.delete` | 删除组织机构 | `GenAuthDeleteOrganizationInput` | `GenAuthDeleteOrganizationResult` | POST | `/api/v3/delete-organization` |
| `qoni.genauth.dataPermissions.deletePermissionNamespace` | 删除权限空间 | `GenAuthDeletePermissionNamespaceInput` | `GenAuthDeletePermissionNamespaceResult` | POST | `/api/v3/delete-permission-namespace` |
| `qoni.genauth.dataPermissions.deletePermissionNamespacesBatch` | 批量删除权限空间 | `GenAuthDeletePermissionNamespacesBatchInput` | `GenAuthDeletePermissionNamespacesBatchResult` | POST | `/api/v3/delete-permission-namespaces-batch` |
| `qoni.genauth.pipelines.delete` | 删除 Pipeline 函数 | `GenAuthDeletePipelineFunctionInput` | `GenAuthDeletePipelineFunctionResult` | POST | `/api/v3/delete-pipeline-function` |
| `qoni.genauth.applications.deleteProgrammaticAccessAccount` | 删除编程访问账号 | `GenAuthDeleteProgrammaticAccessAccountInput` | `GenAuthDeleteProgrammaticAccessAccountResult` | POST | `/api/v3/delete-programmatic-access-account` |
| `qoni.genauth.publicAccounts.deleteBatch` | 批量删除公共账号 | `GenAuthDeletePublicAccountsBatchInput` | `GenAuthDeletePublicAccountsBatchResult` | POST | `/api/v3/delete-public-accounts-batch` |
| `qoni.genauth.resources.delete` | 删除资源 | `GenAuthDeleteResourceInput` | `GenAuthDeleteResourceResult` | POST | `/api/v3/delete-resource` |
| `qoni.genauth.resources.deleteBatch` | 批量删除资源 | `GenAuthDeleteResourcesBatchInput` | `GenAuthDeleteResourcesBatchResult` | POST | `/api/v3/delete-resources-batch` |
| `qoni.genauth.riskLists.deleteRiskListPolicyById` | 删除风险策略 | `GenAuthDeleteRiskListPolicyByIdInput` | `GenAuthDeleteRiskListPolicyByIdResult` | DELETE | `/api/v3/risk-list-policy/{id}` |
| `qoni.genauth.roles.deleteRoles` | 跨权限分组（空间）删除角色 | `GenAuthDeleteRolesInput` | `GenAuthDeleteRolesResult` | POST | `/api/v3/multiple-namespace-delete-roles-batch` |
| `qoni.genauth.roles.deleteBatch` | 单个权限分组（权限空间）内删除角色 | `GenAuthDeleteRolesBatchInput` | `GenAuthDeleteRolesBatchResult` | POST | `/api/v3/delete-roles-batch` |
| `qoni.genauth.tenants.delete` | 删除租户 | `GenAuthDeleteTenantInput` | `GenAuthDeleteTenantResult` | POST | `/api/v3/delete-tenant` |
| `qoni.genauth.tenants.deleteTenantAdmin` | 取消设置租户管理员 | `GenAuthDeleteTenantAdminInput` | `GenAuthDeleteTenantAdminResult` | POST | `/api/v3/delete-tenant-admin` |
| `qoni.genauth.tenants.deleteTenantCooperator` | 删除协调管理员 | `GenAuthDeleteTenantCooperatorInput` | `GenAuthDeleteTenantCooperatorResult` | POST | `/api/v3/delete-tenant-cooperator` |
| `qoni.genauth.tenants.deleteTenantUser` | 批量移除租户成员 | `GenAuthDeleteTenantUserInput` | `GenAuthDeleteTenantUserResult` | POST | `/api/v3/delete-tenant-user` |
| `qoni.genauth.riskLists.deleteUser` | 删除用户名单 | `GenAuthDeleteUserListByIdInput` | `GenAuthDeleteUserListByIdResult` | DELETE | `/api/v3/user-list/{id}` |
| `qoni.genauth.users.deleteBatch` | 批量删除用户 | `GenAuthDeleteUsersBatchInput` | `GenAuthDeleteUsersBatchResult` | POST | `/api/v3/delete-users-batch` |
| `qoni.genauth.users.deleteUserSyncRelations` | 删除用户同步关联关系 | `GenAuthDeleteUserSyncRelationsInput` | `GenAuthDeleteUserSyncRelationsResult` | POST | `/api/v3/delete-user-sync-relations` |
| `qoni.genauth.webhooks.delete` | 删除 Webhook | `GenAuthDeleteWebhookInput` | `GenAuthDeleteWebhookResult` | POST | `/api/v3/delete-webhook` |
| `qoni.genauth.whitelist.deleteWhitelist` | 删除注册白名单 | `GenAuthDeleteWhitelistInput` | `GenAuthDeleteWhitelistResult` | POST | `/api/v3/delete-whitelist` |
| `qoni.genauth.whitelist.deleteWhitelistOfApp` | 删除应用注册白名单 | `GenAuthDeleteWhitelistOfAppInput` | `GenAuthDeleteWhitelistOfAppResult` | POST | `/api/v3/delete-whitelist-of-app` |
| `qoni.genauth.applications.detailAuthSubject` | 主体授权详情 | `GenAuthDetailAuthSubjectInput` | `GenAuthDetailAuthSubjectResult` | GET | `/api/v3/get-subject-auth-detail` |
| `qoni.genauth.applications.disabledAuthFlowApp` | 关闭编排 | `GenAuthDisabledAuthFlowAppInput` | `GenAuthDisabledAuthFlowAppResult` | POST | `/api/v3/disabled-auth-flow-app` |
| `qoni.genauth.devices.disableDevice` | 停用设备(用户详情页) | `GenAuthDisableDeviceInput` | `GenAuthDisableDeviceResult` | POST | `/api/v3/disable-device-by-user` |
| `qoni.genauth.security.disableGlobalMfaSettings` | 关闭全局多因素认证配置 | `GenAuthDisableGlobalMfaSettingsInput` | `GenAuthDisableGlobalMfaSettingsResult` | POST | `/api/v3/disable-global-mfa-settings` |
| `qoni.genauth.ldap.disableLdapServer` | 关闭 LDAP server 服务，关闭前必须先初始化 | `GenAuthDisableLdapServerInput` | `GenAuthDisableLdapServerResult` | POST | `/api/v3/disable-ldap-server` |
| `qoni.genauth.applications.disableProgrammaticAccessAccount` | 禁用编程访问账号 | `GenAuthDisableProgrammaticAccessAccountInput` | `GenAuthDisableProgrammaticAccessAccountResult` | POST | `/api/v3/disable-programmatic-access-account` |
| `qoni.genauth.dynamicGroups.dynamicGroupSearchPart` | 部门模糊查询 | `GenAuthDynamicGroupSearchPartInput` | `GenAuthDynamicGroupSearchPartResult` | POST | `/api/v3/dynamic-group-search-part` |
| `qoni.genauth.applications.enabledAuth` | 更新授权开关 | `GenAuthEnabledAuthInput` | `GenAuthEnabledAuthResult` | POST | `/api/v3/update-auth-enabled` |
| `qoni.genauth.applications.enabledAuthFlowApp` | 开启编排 | `GenAuthEnabledAuthFlowAppInput` | `GenAuthEnabledAuthFlowAppResult` | POST | `/api/v3/enabled-auth-flow-app` |
| `qoni.genauth.devices.enableDevice` | 启用设备(用户详情页) | `GenAuthEnableDeviceInput` | `GenAuthEnableDeviceResult` | POST | `/api/v3/enable-device-by-user` |
| `qoni.genauth.applications.enableProgrammaticAccessAccount` | 启用编程访问账号 | `GenAuthEnableProgrammaticAccessAccountInput` | `GenAuthEnableProgrammaticAccessAccountResult` | POST | `/api/v3/enable-programmatic-access-account` |
| `qoni.genauth.metadata.executeOperate` | 执行自定义操作 | `GenAuthExecuteOperateInput` | `GenAuthExecuteOperateResult` | POST | `/api/v3/metadata/execute-operate` |
| `qoni.genauth.metadata.exportMetadata` | 导出全部数据 | `GenAuthExportMetadataInput` | `GenAuthExportMetadataResult` | POST | `/api/v3/metadata/export` |
| `qoni.genauth.metadata.exportModel` | 导出数据对象 | `GenAuthExportModelInput` | `GenAuthExportModelResult` | POST | `/api/v3/metadata/export/model` |
| `qoni.genauth.invitations.exportUsers` | 导出名单内受邀人 | `GenAuthExportUsersInput` | `GenAuthExportUsersResult` | POST | `/api/v3/invitation-invitee/export` |
| `qoni.genauth.identityProviders.extIdpConnApps` | 身份源下应用的连接详情 | `GenAuthExtIdpConnAppsInput` | `GenAuthExtIdpConnAppsResult` | GET | `/api/v3/ext-idp-conn-apps` |
| `qoni.genauth.identityProviders.extIdpConnStateByApps` | 身份源下应用的连接详情 | `GenAuthExtIdpConnStateByAppsInput` | `GenAuthExtIdpConnStateByAppsResult` | GET | `/api/v3/ext-idp-conn-apps` |
| `qoni.genauth.invitations.filter` | 查询通用邀请申请列表 | `GenAuthFilterInput` | `GenAuthFilterResult` | POST | `/api/v3/filter-universal-invitation-applicants` |
| `qoni.genauth.invitations.filterUsers` | 查看名单内受邀人 | `GenAuthFilterUsersInput` | `GenAuthFilterUsersResult` | POST | `/api/v3/list-invitation-invitees` |
| `qoni.genauth.deviceRules.findAppLists` | 获取支持设备互斥生效范围的应用列表 | `GenAuthFindAppListsInput` | `GenAuthFindAppListsResult` | GET | `/api/v3/get-supported-device-exclusive-apps` |
| `qoni.genauth.riskLists.listIps` | 获取 ip 列表 | `GenAuthFindIpListInput` | `GenAuthFindIpListResult` | GET | `/api/v3/ip-list` |
| `qoni.genauth.devices.findLastLoginAppsByDeviceIds` | 最近登录应用 | `GenAuthFindLastLoginAppsByDeviceIdsInput` | `GenAuthFindLastLoginAppsByDeviceIdsResult` | POST | `/api/v3/get-last-login-apps-by-deviceIds` |
| `qoni.genauth.devices.findLastLoginAppsByDeviceIdsV2` | 最近登录应用 | `GenAuthFindLastLoginAppsByDeviceIdsV2Input` | `GenAuthFindLastLoginAppsByDeviceIdsV2Result` | POST | `/api/v3/get-last-login-apps-by-device-ids` |
| `qoni.genauth.riskLists.findRiskListPolicy` | 获取风险策略列表 | `GenAuthFindRiskListPolicyInput` | `GenAuthFindRiskListPolicyResult` | GET | `/api/v3/risk-list-policy` |
| `qoni.genauth.riskLists.listUsers` | 获取风险名单用户列表 | `GenAuthFindUserListInput` | `GenAuthFindUserListResult` | GET | `/api/v3/user-list` |
| `qoni.genauth.tenants.generateInviteTenantUserLink` | 生成一个邀请租户成员的链接 | `GenAuthGenerateInviteTenantUserLinkInput` | `GenAuthGenerateInviteTenantUserLinkResult` | POST | `/api/v3/generate-invite-tenant-user-link` |
| `qoni.genauth.invitations.generateUniversalInvitation` | 生成通用邀请链接 | `GenAuthGenerateUniversalInvitationInput` | `GenAuthGenerateUniversalInvitationResult` | POST | `/api/v3/generate-universal-invitation-link` |
| `qoni.genauth.accessKeys.getAccessKey` | 获取协作管理员 AK/SK 详细信息 | `GenAuthGetAccessKeyInput` | `GenAuthGetAccessKeyResult` | GET | `/api/v3/get-access-key` |
| `qoni.genauth.accessKeys.getAccessKeyList` | 获取协作管理员 AK/SK 列表 | `GenAuthGetAccessKeyListInput` | `GenAuthGetAccessKeyListResult` | GET | `/api/v3/list-access-key` |
| `qoni.genauth.auditLogs.list` | 获取管理员操作日志 | `GenAuthGetAdminAuditLogsInput` | `GenAuthGetAdminAuditLogsResult` | POST | `/api/v3/get-admin-audit-logs` |
| `qoni.genauth.departments.getAllDepartments` | 获取所有部门列表 | `GenAuthGetAllDepartmentsInput` | `GenAuthGetAllDepartmentsResult` | GET | `/api/v3/get-all-departments` |
| `qoni.genauth.groups.getAllGroups` | 获取所有分组 | `GenAuthGetAllGroupsInput` | `GenAuthGetAllGroupsResult` | GET | `/api/v3/get-all-groups` |
| `qoni.genauth.metadata.getAllMetadata` | 获取全部数据对象数据 | `GenAuthGetAllMetadataInput` | `GenAuthGetAllMetadataResult` | POST | `/api/v3/metadata/get-all-metadata` |
| `qoni.genauth.metadata.getAllMetadataRow` | 获取全部元数据行信息 | `GenAuthGetAllMetadataRowInput` | `GenAuthGetAllMetadataRowResult` | POST | `/api/v3/metadata/get-all-row-by-scrollid` |
| `qoni.genauth.billing.getAllRightsItem` | 获取所有权益 | `GenAuthGetAllRightsItemInput` | `GenAuthGetAllRightsItemResult` | GET | `/api/v3/get-all-rights-items` |
| `qoni.genauth.deviceRules.getAllValidScopeSettings` | 获取设备互斥生效范围配置 | `GenAuthGetAllValidScopeSettingsInput` | `GenAuthGetAllValidScopeSettingsResult` | GET | `/api/v3/get-device-exclusive-valid-scope-settings` |
| `qoni.genauth.deviceRules.getAllWhiteListSettings` | 获取设备互斥白名单配置 | `GenAuthGetAllWhiteListSettingsInput` | `GenAuthGetAllWhiteListSettingsResult` | GET | `/api/v3/get-device-exclusive-white-list-settings` |
| `qoni.genauth.applications.get` | 获取应用详情 | `GenAuthGetApplicationInput` | `GenAuthGetApplicationResult` | GET | `/api/v3/get-application` |
| `qoni.genauth.applications.getApplicationAccessControlUserList` | 获取应用访问控制用户列表 | `GenAuthGetApplicationAccessControlUserListInput` | `GenAuthGetApplicationAccessControlUserListResult` | POST | `/api/v3/get-application-access-control-user-list` |
| `qoni.genauth.applications.getApplicationPermissionStrategy` | 获取应用默认访问授权策略 | `GenAuthGetApplicationPermissionStrategyInput` | `GenAuthGetApplicationPermissionStrategyResult` | GET | `/api/v3/get-application-permission-strategy` |
| `qoni.genauth.applications.getSecret` | 获取应用密钥 | `GenAuthGetApplicationSecretInput` | `GenAuthGetApplicationSecretResult` | GET | `/api/v3/get-application-secret` |
| `qoni.genauth.applications.getApplicationSimpleInfo` | 获取应用简单信息 | `GenAuthGetApplicationSimpleInfoInput` | `GenAuthGetApplicationSimpleInfoResult` | GET | `/api/v3/get-application-simple-info` |
| `qoni.genauth.applications.getAsaAccount` | 获取 ASA 账号 | `GenAuthGetAsaAccountInput` | `GenAuthGetAsaAccountResult` | GET | `/api/v3/get-asa-account` |
| `qoni.genauth.applications.getAsaAccountAssignedTargets` | 获取 ASA 账号分配的主体列表 | `GenAuthGetAsaAccountAssignedTargetsInput` | `GenAuthGetAsaAccountAssignedTargetsResult` | GET | `/api/v3/get-asa-account-assigned-targets` |
| `qoni.genauth.applications.getAsaAccountBatch` | 批量获取 ASA 账号 | `GenAuthGetAsaAccountBatchInput` | `GenAuthGetAsaAccountBatchResult` | POST | `/api/v3/get-asa-accounts-batch` |
| `qoni.genauth.applications.getAsaAccountsBatch` | 批量获取 ASA 账号 | `GenAuthGetAsaAccountsBatchInput` | `GenAuthGetAsaAccountsBatchResult` | POST | `/api/v3/get-asa-accounts-batch` |
| `qoni.genauth.applications.getAssignedAccount` | 获取主体被分配的 ASA 账号 | `GenAuthGetAssignedAccountInput` | `GenAuthGetAssignedAccountResult` | GET | `/api/v3/get-assigned-account` |
| `qoni.genauth.applications.getAuthFlowConfig` | 获取指定编排配置 | `GenAuthGetAuthFlowConfigInput` | `GenAuthGetAuthFlowConfigResult` | GET | `/api/v3/get-auth-flow-config` |
| `qoni.genauth.applications.getAuthFlowConfigByAppId` | 获取应用编排配置列表 | `GenAuthGetAuthFlowConfigByAppIdInput` | `GenAuthGetAuthFlowConfigByAppIdResult` | GET | `/api/v3/get-auth-flow-config-by-app-id` |
| `qoni.genauth.pipelines.getAuthFlowFunction` | 获取 AuthFlowFunction 函数详情 | `GenAuthGetAuthFlowFunctionInput` | `GenAuthGetAuthFlowFunctionResult` | GET | `/api/v3/get-auth-flow-function` |
| `qoni.genauth.permissions.listResources` | 获取某个主体被授权的资源列表 | `GenAuthGetAuthorizedResourcesInput` | `GenAuthGetAuthorizedResourcesResult` | GET | `/api/v3/get-authorized-resources` |
| `qoni.genauth.ldap.getBindPwd` | 生成 LDAP Server 管理员密码 | `GenAuthGetBindPwdInput` | `GenAuthGetBindPwdResult` | GET | `/api/v3/get-ldap-server-random-pwd` |
| `qoni.genauth.applications.getCurrentAuthFlowConfig` | 获取当前编排配置 | `GenAuthGetCurrentAuthFlowConfigInput` | `GenAuthGetCurrentAuthFlowConfigResult` | GET | `/api/v3/get-current-auth-flow-config` |
| `qoni.genauth.billing.getCurrentPackageInfo` | 获取套餐详情 | `GenAuthGetCurrentPackageInfoInput` | `GenAuthGetCurrentPackageInfoResult` | GET | `/api/v3/get-current-package-info` |
| `qoni.genauth.customFields.getData` | 获取用户、分组、角色、组织机构的自定义字段值 | `GenAuthGetCustomDataInput` | `GenAuthGetCustomDataResult` | GET | `/api/v3/get-custom-data` |
| `qoni.genauth.customFields.get` | 获取自定义字段列表 | `GenAuthGetCustomFieldsInput` | `GenAuthGetCustomFieldsResult` | GET | `/api/v3/get-custom-fields` |
| `qoni.genauth.dataPermissions.getDataPolicy` | 获取数据策略详情 | `GenAuthGetDataPolicyInput` | `GenAuthGetDataPolicyResult` | GET | `/api/v3/get-data-policy` |
| `qoni.genauth.dataPermissions.getDataResource` | 获取数据资源详情 | `GenAuthGetDataResourceInput` | `GenAuthGetDataResourceResult` | GET | `/api/v3/get-data-resource` |
| `qoni.genauth.departments.get` | 获取部门信息 | `GenAuthGetDepartmentInput` | `GenAuthGetDepartmentResult` | GET | `/api/v3/get-department` |
| `qoni.genauth.departments.getDepartmentAllApp` | 部门被授权的应用列表 | `GenAuthGetDepartmentAllAppInput` | `GenAuthGetDepartmentAllAppResult` | POST | `/api/v3/get-department-available-app` |
| `qoni.genauth.departments.getDepartmentAvailableApp` | 部门被授权的应用列表 | `GenAuthGetDepartmentAvailableAppInput` | `GenAuthGetDepartmentAvailableAppResult` | POST | `/api/v3/get-department-available-app` |
| `qoni.genauth.departments.getById` | 根据部门id查询部门 | `GenAuthGetDepartmentByIdInput` | `GenAuthGetDepartmentByIdResult` | GET | `/api/v3/get-department-by-id` |
| `qoni.genauth.departments.getDepartmentSyncRelations` | 获取部门绑定的第三方同步关系 | `GenAuthGetDepartmentSyncRelationsInput` | `GenAuthGetDepartmentSyncRelationsResult` | GET | `/api/v3/get-department-sync-relations` |
| `qoni.genauth.approvals.get` | 获取审批详情 | `GenAuthGetDetailInput` | `GenAuthGetDetailResult` | GET | `/api/v3/approval` |
| `qoni.genauth.devices.getDeviceStatus` | 获取设备状态 | `GenAuthGetDeviceStatusInput` | `GenAuthGetDeviceStatusResult` | POST | `/api/v3/device-status` |
| `qoni.genauth.dynamicGroups.getDynamicGroupMatch` | 查询动态分组匹配规则 | `GenAuthGetDynamicGroupMatchInput` | `GenAuthGetDynamicGroupMatchResult` | GET | `/api/v3/get-dynamic-group-match` |
| `qoni.genauth.email.getEmailProvider` | 获取第三方邮件服务配置 | `GenAuthGetEmailProviderInput` | `GenAuthGetEmailProviderResult` | GET | `/api/v3/get-email-provider` |
| `qoni.genauth.email.getEmailTemplates` | 获取邮件模版列表 | `GenAuthGetEmailTemplatesInput` | `GenAuthGetEmailTemplatesResult` | GET | `/api/v3/get-email-templates` |
| `qoni.genauth.dataPermissions.getExternalUserResourceStruct` | 获取外部用户拥有指定资源的权限及资源结构信息 | `GenAuthGetExternalUserResourceStructInput` | `GenAuthGetExternalUserResourceStructResult` | POST | `/api/v3/get-external-user-resource-struct` |
| `qoni.genauth.identityProviders.get` | 获取身份源详情 | `GenAuthGetExtIdpInput` | `GenAuthGetExtIdpResult` | GET | `/api/v3/get-ext-idp` |
| `qoni.genauth.security.getGlobalMfaSettings` | 获取全局多因素认证配置 | `GenAuthGetGlobalMfaSettingsInput` | `GenAuthGetGlobalMfaSettingsResult` | GET | `/api/v3/get-global-mfa-settings` |
| `qoni.genauth.groups.get` | 获取分组详情 | `GenAuthGetGroupInput` | `GenAuthGetGroupResult` | GET | `/api/v3/get-group` |
| `qoni.genauth.groups.getGroupAuthorizedResources` | 获取分组被授权的资源列表 | `GenAuthGetGroupAuthorizedResourcesInput` | `GenAuthGetGroupAuthorizedResourcesResult` | GET | `/api/v3/get-group-authorized-resources` |
| `qoni.genauth.publicAccounts.getGroupsOfPublicAccount` | 获取公共账号分组列表 | `GenAuthGetGroupsOfPublicAccountInput` | `GenAuthGetGroupsOfPublicAccountResult` | GET | `/api/v3/get-groups-of-public-account` |
| `qoni.genauth.metadata.getImportTemplate` | 获取导入模板 | `GenAuthGetImportTemplateInput` | `GenAuthGetImportTemplateResult` | GET | `/api/v3/metadata/get-import-template` |
| `qoni.genauth.invitations.getInvitationRoster` | 获取邀请名单详情 | `GenAuthGetInvitationRosterInput` | `GenAuthGetInvitationRosterResult` | GET | `/api/v3/get-invitation-roster` |
| `qoni.genauth.invitations.getInviteEmailTemplate` | 获取邀请策略邮件模板 | `GenAuthGetInviteEmailTemplateInput` | `GenAuthGetInviteEmailTemplateResult` | POST | `/api/v3/get-invitation-policy-email-template` |
| `qoni.genauth.dataPermissions.getM2mPermissionList` | 获取 m2m 权限列表 | `GenAuthGetM2mPermissionListInput` | `GenAuthGetM2mPermissionListResult` | POST | `/api/v3/get-m2m-permission-list` |
| `qoni.genauth.dataPermissions.getM2mResourcePermissionList` | 获取m2m拥有某些资源的权限列表（推荐） | `GenAuthGetM2mResourcePermissionListInput` | `GenAuthGetM2mResourcePermissionListResult` | POST | `/api/v3/get-m2m-resource-permission-list` |
| `qoni.genauth.dataPermissions.getM2mResourceStruct` | 获取m2m拥有指定资源的权限及资源结构信息 | `GenAuthGetM2mResourceStructInput` | `GenAuthGetM2mResourceStructResult` | POST | `/api/v3/get-m2m-resource-struct` |
| `qoni.genauth.billing.getMauPeriodUsageHistory` | 获取 MAU 使用记录 | `GenAuthGetMauPeriodUsageHistoryInput` | `GenAuthGetMauPeriodUsageHistoryResult` | GET | `/api/v3/get-mau-period-usage-history` |
| `qoni.genauth.metadata.getMetadataGroupList` | 获取元数据关联群组信息 | `GenAuthGetMetadataGroupListInput` | `GenAuthGetMetadataGroupListResult` | POST | `/api/v3/metadata/group` |
| `qoni.genauth.users.getMfaStatus` | 获取用户 MFA 状态 | `GenAuthGetMfaStatusInput` | `GenAuthGetMfaStatusResult` | GET | `/api/v3/get-mfa-status` |
| `qoni.genauth.applications.getMfaTriggerData` | 获取应用下用户 MFA 触发数据 | `GenAuthGetMfaTriggerDataInput` | `GenAuthGetMfaTriggerDataResult` | GET | `/api/v3/get-mfa-trigger-data` |
| `qoni.genauth.metadata.getModel` | 获取数据对象详情 | `GenAuthGetModelInput` | `GenAuthGetModelResult` | GET | `/api/v3/metadata/get-model` |
| `qoni.genauth.tenants.getMultipleTenantAdmin` | 获取多租户管理员用户列表 | `GenAuthGetMultipleTenantAdminInput` | `GenAuthGetMultipleTenantAdminResult` | GET | `/api/v3/get-multiple-tenant-admin` |
| `qoni.genauth.namespaces.get` | 获取权限分组详情 | `GenAuthGetNamespaceInput` | `GenAuthGetNamespaceResult` | GET | `/api/v3/get-namespace` |
| `qoni.genauth.namespaces.getBatch` | 批量获取权限分组详情 | `GenAuthGetNamespacesBatchInput` | `GenAuthGetNamespacesBatchResult` | GET | `/api/v3/get-namespaces-batch` |
| `qoni.genauth.billing.getOrderDetail` | 获取订单详情 | `GenAuthGetOrderDetailInput` | `GenAuthGetOrderDetailResult` | GET | `/api/v3/get-order-detail` |
| `qoni.genauth.billing.getOrderPayDetail` | 获取订单支付明细 | `GenAuthGetOrderPayDetailInput` | `GenAuthGetOrderPayDetailResult` | GET | `/api/v3/get-order-pay-detail` |
| `qoni.genauth.billing.getOrders` | 获取订单列表 | `GenAuthGetOrdersInput` | `GenAuthGetOrdersResult` | GET | `/api/v3/get-orders` |
| `qoni.genauth.organizations.get` | 获取组织机构详情 | `GenAuthGetOrganizationInput` | `GenAuthGetOrganizationResult` | GET | `/api/v3/get-organization` |
| `qoni.genauth.organizations.getOrganizationBatch` | 批量获取组织机构详情 | `GenAuthGetOrganizationBatchInput` | `GenAuthGetOrganizationBatchResult` | GET | `/api/v3/get-organization-batch` |
| `qoni.genauth.organizations.getOrganizationsBatch` | 批量获取组织机构详情 | `GenAuthGetOrganizationsBatchInput` | `GenAuthGetOrganizationsBatchResult` | GET | `/api/v3/get-organization-batch` |
| `qoni.genauth.users.getOtpSecretByUser` | 获取用户绑定 OTP 的秘钥 | `GenAuthGetOtpSecretByUserInput` | `GenAuthGetOtpSecretByUserResult` | GET | `/api/v3/get-otp-secret-by-user` |
| `qoni.genauth.departments.getParent` | 获取父部门信息 | `GenAuthGetParentDepartmentInput` | `GenAuthGetParentDepartmentResult` | GET | `/api/v3/get-parent-department` |
| `qoni.genauth.dataPermissions.getPermissionNamespace` | 获取权限空间详情 | `GenAuthGetPermissionNamespaceInput` | `GenAuthGetPermissionNamespaceResult` | GET | `/api/v3/get-permission-namespace` |
| `qoni.genauth.dataPermissions.getPermissionNamespacesBatch` | 批量获取权限空间详情列表 | `GenAuthGetPermissionNamespacesBatchInput` | `GenAuthGetPermissionNamespacesBatchResult` | GET | `/api/v3/get-permission-namespaces-batch` |
| `qoni.genauth.pipelines.get` | 获取 Pipeline 函数详情 | `GenAuthGetPipelineFunctionInput` | `GenAuthGetPipelineFunctionResult` | GET | `/api/v3/get-pipeline-function` |
| `qoni.genauth.pipelines.getPipelineLogs` | 获取 Pipeline 日志 | `GenAuthGetPipelineLogsInput` | `GenAuthGetPipelineLogsResult` | GET | `/api/v3/get-pipeline-logs` |
| `qoni.genauth.invitations.getPolicyDetailById` | 获取邀请策略详情 | `GenAuthGetPolicyDetailByIdInput` | `GenAuthGetPolicyDetailByIdResult` | GET | `/api/v3/get-invitation-policy` |
| `qoni.genauth.invitations.getPolicyUserAttributionDetail` | 获取邀请策略用户归属详情 | `GenAuthGetPolicyUserAttributionDetailInput` | `GenAuthGetPolicyUserAttributionDetailResult` | GET | `/api/v3/get-invitation-policy-user-attribution` |
| `qoni.genauth.positions.get` | 获取岗位 | `GenAuthGetPostInput` | `GenAuthGetPostResult` | GET | `/api/v3/get-post` |
| `qoni.genauth.positions.getById` | 获取岗位信息 | `GenAuthGetPostByIdInput` | `GenAuthGetPostByIdResult` | POST | `/api/v3/get-post-by-id` |
| `qoni.genauth.publicAccounts.getPostOfPublicUser` | 获取公共账号的岗位 | `GenAuthGetPostOfPublicUserInput` | `GenAuthGetPostOfPublicUserResult` | GET | `/api/v3/get-post-of-public-account` |
| `qoni.genauth.publicAccounts.get` | 获取公共账号信息 | `GenAuthGetPublicAccountInput` | `GenAuthGetPublicAccountResult` | GET | `/api/v3/get-public-account` |
| `qoni.genauth.publicAccounts.getBatch` | 批量获取公共账号信息 | `GenAuthGetPublicAccountBatchInput` | `GenAuthGetPublicAccountBatchResult` | GET | `/api/v3/get-public-account-batch` |
| `qoni.genauth.publicAccounts.getPublicAccountDepartments` | 获取公共账号的部门列表 | `GenAuthGetPublicAccountDepartmentsInput` | `GenAuthGetPublicAccountDepartmentsResult` | GET | `/api/v3/get-departments-of-public-account` |
| `qoni.genauth.publicAccounts.getPublicAccountOfGroups` | 公共账号添加批量分组 | `GenAuthGetPublicAccountOfGroupsInput` | `GenAuthGetPublicAccountOfGroupsResult` | POST | `/api/v3/set-public-account-of-groups` |
| `qoni.genauth.publicAccounts.getPublicAccountRoles` | 获取公共账号的角色列表 | `GenAuthGetPublicAccountRolesInput` | `GenAuthGetPublicAccountRolesResult` | GET | `/api/v3/get-roles-of-public-account` |
| `qoni.genauth.publicAccounts.getPublicAccountsOfDepartment` | 获取部门的公共账号列表 | `GenAuthGetPublicAccountsOfDepartmentInput` | `GenAuthGetPublicAccountsOfDepartmentResult` | GET | `/api/v3/get-public-accounts-of-department` |
| `qoni.genauth.publicAccounts.getPublicAccountsOfGroup` | 获取分组的公共账号列表 | `GenAuthGetPublicAccountsOfGroupInput` | `GenAuthGetPublicAccountsOfGroupResult` | GET | `/api/v3/get-public-accounts-of-group` |
| `qoni.genauth.publicAccounts.getPublicAccountsOfPost` | 获取岗位的公共账号列表 | `GenAuthGetPublicAccountsOfPostInput` | `GenAuthGetPublicAccountsOfPostResult` | GET | `/api/v3/get-public-accounts-of-post` |
| `qoni.genauth.publicAccounts.getPublicAccountsOfRole` | 获取角色的公共账号列表 | `GenAuthGetPublicAccountsOfRoleInput` | `GenAuthGetPublicAccountsOfRoleResult` | GET | `/api/v3/get-public-accounts-of-role` |
| `qoni.genauth.publicAccounts.getPublicAccountsOfUser` | 获取用户的公共账号列表 | `GenAuthGetPublicAccountsOfUserInput` | `GenAuthGetPublicAccountsOfUserResult` | GET | `/api/v3/get-public-accounts-of-user` |
| `qoni.genauth.metadata.getRelationDetails` | 获取行关联数据 | `GenAuthGetRelationDetailsInput` | `GenAuthGetRelationDetailsResult` | GET | `/api/v3/metadata/get-row-relation-details` |
| `qoni.genauth.metadata.getRelationInfo` | 获取关联数据详情 | `GenAuthGetRelationInfoInput` | `GenAuthGetRelationInfoResult` | POST | `/api/v3/metadata/get-relation-info` |
| `qoni.genauth.metadata.getRelationValue` | 获取行关联数据 | `GenAuthGetRelationValueInput` | `GenAuthGetRelationValueResult` | GET | `/api/v3/metadata/get-row-relation` |
| `qoni.genauth.resources.get` | 获取资源详情 | `GenAuthGetResourceInput` | `GenAuthGetResourceResult` | GET | `/api/v3/get-resource` |
| `qoni.genauth.permissions.getResourceAuthorizedTargets` | 获取资源被授权的主体 | `GenAuthGetResourceAuthorizedTargetsInput` | `GenAuthGetResourceAuthorizedTargetsResult` | POST | `/api/v3/get-resource-authorized-targets` |
| `qoni.genauth.resources.getBatch` | 批量获取资源详情 | `GenAuthGetResourcesBatchInput` | `GenAuthGetResourcesBatchResult` | GET | `/api/v3/get-resources-batch` |
| `qoni.genauth.roles.get` | 获取角色详情 | `GenAuthGetRoleInput` | `GenAuthGetRoleResult` | GET | `/api/v3/get-role` |
| `qoni.genauth.roles.getRoleAuthorizedResources` | 获取角色被授权的资源列表 | `GenAuthGetRoleAuthorizedResourcesInput` | `GenAuthGetRoleAuthorizedResourcesResult` | GET | `/api/v3/get-role-authorized-resources` |
| `qoni.genauth.roles.getRolePolicyList` | 获取角色下所拥有的数据策略列表 | `GenAuthGetRolePolicyListInput` | `GenAuthGetRolePolicyListResult` | POST | `/api/v3/get-role-policy-list` |
| `qoni.genauth.metadata.getRow` | 获取数据对象行信息 | `GenAuthGetRowInput` | `GenAuthGetRowResult` | GET | `/api/v3/metadata/get-row` |
| `qoni.genauth.metadata.getRowBatch` | 批量获取行信息 | `GenAuthGetRowBatchInput` | `GenAuthGetRowBatchResult` | POST | `/get-row-batch` |
| `qoni.genauth.metadata.getRowByValue` | 根据属性值获取数据对象行信息 | `GenAuthGetRowByValueInput` | `GenAuthGetRowByValueResult` | GET | `/api/v3/metadata/get-row-by-value` |
| `qoni.genauth.deviceRules.getRuleSettings` | 获取设备互斥规则配置 | `GenAuthGetRuleSettingsInput` | `GenAuthGetRuleSettingsResult` | GET | `/api/v3/get-device-exclusive-rule-settings` |
| `qoni.genauth.security.get` | 获取安全配置 | `GenAuthGetSecuritySettingsInput` | `GenAuthGetSecuritySettingsResult` | GET | `/api/v3/get-security-settings` |
| `qoni.genauth.applications.getSubjectAuthDetail` | 主体授权详情 | `GenAuthGetSubjectAuthDetailInput` | `GenAuthGetSubjectAuthDetailResult` | GET | `/api/v3/get-subject-auth-detail` |
| `qoni.genauth.sync.getSyncJob` | 获取同步作业详情 | `GenAuthGetSyncJobInput` | `GenAuthGetSyncJobResult` | GET | `/api/v3/get-sync-job` |
| `qoni.genauth.sync.get` | 获取同步任务详情 | `GenAuthGetSyncTaskInput` | `GenAuthGetSyncTaskResult` | GET | `/api/v3/get-sync-task` |
| `qoni.genauth.tenants.get` | 获取租户详情 | `GenAuthGetTenantInput` | `GenAuthGetTenantResult` | GET | `/api/v3/get-tenant` |
| `qoni.genauth.tenants.getTenantByCode` | 获取租户详情 | `GenAuthGetTenantByCodeInput` | `GenAuthGetTenantByCodeResult` | GET | `/api/v3/get-tenant-by-code` |
| `qoni.genauth.tenants.getTenantCooperator` | 获取一个协调管理员 | `GenAuthGetTenantCooperatorInput` | `GenAuthGetTenantCooperatorResult` | GET | `/api/v3/get-tenant-cooperator` |
| `qoni.genauth.tenants.getTenantCooperatorMenu` | 获取一个协调管理员拥有的列表 | `GenAuthGetTenantCooperatorMenuInput` | `GenAuthGetTenantCooperatorMenuResult` | GET | `/api/v3/get-tenant-cooperator-menu` |
| `qoni.genauth.tenants.getTenantEnterpriseCertification` | 获取租户企业认证信息 | `GenAuthGetTenantEnterpriseCertificationInput` | `GenAuthGetTenantEnterpriseCertificationResult` | GET | `/api/v3/get-tenant-enterprise-certification` |
| `qoni.genauth.tenants.getTenantLittleInfo` | 获取租户一点点的信息 | `GenAuthGetTenantLittleInfoInput` | `GenAuthGetTenantLittleInfoResult` | GET | `/api/v3/get-tenant-little-info` |
| `qoni.genauth.tenants.getTenantUser` | 获取单个租户成员 | `GenAuthGetTenantUserInput` | `GenAuthGetTenantUserResult` | GET | `/api/v3/get-tenant-user` |
| `qoni.genauth.invitations.getUniversalInvitation` | 获取通用邀请配置 | `GenAuthGetUniversalInvitationInput` | `GenAuthGetUniversalInvitationResult` | GET | `/api/v3/get-universal-invitation-settings` |
| `qoni.genauth.billing.getUsageInfo` | 获取用量详情 | `GenAuthGetUsageInfoInput` | `GenAuthGetUsageInfoResult` | GET | `/api/v3/get-usage-info` |
| `qoni.genauth.users.get` | 获取用户信息 | `GenAuthGetUserInput` | `GenAuthGetUserResult` | GET | `/api/v3/get-user` |
| `qoni.genauth.users.getUserAccessibleApps` | 获取用户可访问的应用 | `GenAuthGetUserAccessibleAppsInput` | `GenAuthGetUserAccessibleAppsResult` | GET | `/api/v3/get-user-accessible-apps` |
| `qoni.genauth.auditLogs.listUserActions` | 获取用户行为日志 | `GenAuthGetUserActionLogsInput` | `GenAuthGetUserActionLogsResult` | POST | `/api/v3/get-user-action-logs` |
| `qoni.genauth.invitations.getUserAttributionMainDepartment` | 获取设置的用户归属主部门 | `GenAuthGetUserAttributionMainDepartmentInput` | `GenAuthGetUserAttributionMainDepartmentResult` | GET | `/api/v3/get-invitation-policy-user-attribution-main-department` |
| `qoni.genauth.users.getUserAuthorizedApps` | 获取用户授权的应用 | `GenAuthGetUserAuthorizedAppsInput` | `GenAuthGetUserAuthorizedAppsResult` | GET | `/api/v3/get-user-authorized-apps` |
| `qoni.genauth.users.listAuthorizedResources` | 获取用户被授权的所有资源 | `GenAuthGetUserAuthorizedResourcesInput` | `GenAuthGetUserAuthorizedResourcesResult` | GET | `/api/v3/get-user-authorized-resources` |
| `qoni.genauth.customFields.getUserBaseFields` | 获取用户内置字段列表 | `GenAuthGetUserBaseFieldsInput` | `GenAuthGetUserBaseFieldsResult` | GET | `/api/v3/get-user-base-fields` |
| `qoni.genauth.users.getBatch` | 批量获取用户信息 | `GenAuthGetUserBatchInput` | `GenAuthGetUserBatchResult` | GET | `/api/v3/get-user-batch` |
| `qoni.genauth.users.listDepartments` | 获取用户部门列表 | `GenAuthGetUserDepartmentsInput` | `GenAuthGetUserDepartmentsResult` | GET | `/api/v3/get-user-departments` |
| `qoni.genauth.users.getUserEncryptPasswordBatch` | 批量获取用户密码密文 | `GenAuthGetUserEncryptPasswordBatchInput` | `GenAuthGetUserEncryptPasswordBatchResult` | POST | `/api/v3/batch-get-user-encrypt-password` |
| `qoni.genauth.users.listGroups` | 获取用户分组列表 | `GenAuthGetUserGroupsInput` | `GenAuthGetUserGroupsResult` | GET | `/api/v3/get-user-groups` |
| `qoni.genauth.users.getUserIdentities` | 获取用户的外部身份源 | `GenAuthGetUserIdentitiesInput` | `GenAuthGetUserIdentitiesResult` | GET | `/api/v3/get-user-identities` |
| `qoni.genauth.users.getUserLoggedinApps` | 获取用户曾经登录过的应用 | `GenAuthGetUserLoggedinAppsInput` | `GenAuthGetUserLoggedinAppsResult` | GET | `/api/v3/get-user-loggedin-apps` |
| `qoni.genauth.users.getUserLoggedinIdentities` | 获取用户曾经登录过的身份源 | `GenAuthGetUserLoggedinIdentitiesInput` | `GenAuthGetUserLoggedinIdentitiesResult` | GET | `/api/v3/get-user-logged-in-identities` |
| `qoni.genauth.users.getUserLoggedInIdentities` | 获取用户曾经登录过的身份源 | `GenAuthGetUserLoggedInIdentitiesInput` | `GenAuthGetUserLoggedInIdentitiesResult` | GET | `/api/v3/get-user-logged-in-identities` |
| `qoni.genauth.users.getUserLoginHistory` | 获取用户的登录历史记录 | `GenAuthGetUserLoginHistoryInput` | `GenAuthGetUserLoginHistoryResult` | GET | `/api/v3/get-user-login-history` |
| `qoni.genauth.users.getUserMfaInfo` | 获取用户 MFA 绑定信息 | `GenAuthGetUserMfaInfoInput` | `GenAuthGetUserMfaInfoResult` | GET | `/api/v3/get-user-mfa-info` |
| `qoni.genauth.users.getUserMfaStatus` | 获取用户 MFA 状态 | `GenAuthGetUserMfaStatusInput` | `GenAuthGetUserMfaStatusResult` | GET | `/api/v3/get-mfa-status` |
| `qoni.genauth.users.getUserPasswordCiphertext` | 获取用户自定义加密的密码 | `GenAuthGetUserPasswordCiphertextInput` | `GenAuthGetUserPasswordCiphertextResult` | POST | `/api/v3/get-user-password-ciphertext` |
| `qoni.genauth.dataPermissions.getUserPermissionList` | 获取用户权限列表 | `GenAuthGetUserPermissionListInput` | `GenAuthGetUserPermissionListResult` | POST | `/api/v3/get-user-permission-list` |
| `qoni.genauth.positions.getUserPost` | 获取用户关联岗位 | `GenAuthGetUserPostInput` | `GenAuthGetUserPostResult` | GET | `/api/v3/get-user-post` |
| `qoni.genauth.positions.listUserPosts` | 获取用户关联岗位 | `GenAuthGetUserPostsInput` | `GenAuthGetUserPostsResult` | GET | `/api/v3/get-user-posts` |
| `qoni.genauth.users.getUserPrincipalAuthenticationInfo` | 获取用户实名认证信息 | `GenAuthGetUserPrincipalAuthenticationInfoInput` | `GenAuthGetUserPrincipalAuthenticationInfoResult` | GET | `/api/v3/get-user-principal-authentication-info` |
| `qoni.genauth.dataPermissions.getUserResourcePermissionList` | 获取用户拥有某些资源的权限列表（推荐） | `GenAuthGetUserResourcePermissionListInput` | `GenAuthGetUserResourcePermissionListResult` | POST | `/api/v3/get-user-resource-permission-list` |
| `qoni.genauth.dataPermissions.getUserResourceStruct` | 获取用户拥有指定资源的权限及资源结构信息 | `GenAuthGetUserResourceStructInput` | `GenAuthGetUserResourceStructResult` | POST | `/api/v3/get-user-resource-struct` |
| `qoni.genauth.users.listRoles` | 获取用户角色列表 | `GenAuthGetUserRolesInput` | `GenAuthGetUserRolesResult` | GET | `/api/v3/get-user-roles` |
| `qoni.genauth.publicAccounts.getUsersOfPublicAccount` | 公共账号的用户列表 | `GenAuthGetUsersOfPublicAccountInput` | `GenAuthGetUsersOfPublicAccountResult` | GET | `/api/v3/get-users-of-public-account` |
| `qoni.genauth.users.getUserSyncRelations` | 获取用户绑定的第三方同步关系 | `GenAuthGetUserSyncRelationsInput` | `GenAuthGetUserSyncRelationsResult` | GET | `/api/v3/get-user-sync-relations` |
| `qoni.genauth.devices.getVerifyConfigApp` | 获取 verify-config-app 列表 | `GenAuthGetVerifyConfigAppInput` | `GenAuthGetVerifyConfigAppResult` | GET | `/api/v3/verify-config-app` |
| `qoni.genauth.webhooks.get` | 获取 Webhook 详情 | `GenAuthGetWebhookInput` | `GenAuthGetWebhookResult` | GET | `/api/v3/get-webhook` |
| `qoni.genauth.webhooks.getWebhookEventList` | 获取 Webhook 事件列表 | `GenAuthGetWebhookEventListInput` | `GenAuthGetWebhookEventListResult` | GET | `/api/v3/get-webhook-event-list` |
| `qoni.genauth.webhooks.getWebhookLogs` | 获取 Webhook 日志 | `GenAuthGetWebhookLogsInput` | `GenAuthGetWebhookLogsResult` | POST | `/api/v3/get-webhook-logs` |
| `qoni.genauth.identityProviders.getWechatMpAccessTokenInfo` | 获取微信小程序、公众号 Access Token | `GenAuthGetWechatMpAccessTokenInfoInput` | `GenAuthGetWechatMpAccessTokenInfoResult` | POST | `/api/v3/get-weixin-access-token` |
| `qoni.genauth.identityProviders.getWeixinAccessToken` | 获取微信小程序、公众号 Access Token | `GenAuthGetWeixinAccessTokenInput` | `GenAuthGetWeixinAccessTokenResult` | POST | `/api/v3/get-weixin-access-token` |
| `qoni.genauth.users.hasAnyRole` | 判断用户是否有某个角色 | `GenAuthHasAnyRoleInput` | `GenAuthHasAnyRoleResult` | POST | `/api/v3/has-any-role` |
| `qoni.genauth.metadata.importMetadata` | 导入数据 | `GenAuthImportMetadataInput` | `GenAuthImportMetadataResult` | POST | `/api/v3/metadata/import` |
| `qoni.genauth.metadata.importModel` | 导入数据对象 | `GenAuthImportModelInput` | `GenAuthImportModelResult` | POST | `/api/v3/metadata/import/model` |
| `qoni.genauth.users.importOtp` | 导入用户的 OTP | `GenAuthImportOtpInput` | `GenAuthImportOtpResult` | POST | `/api/v3/import-otp` |
| `qoni.genauth.invitations.importTemplate` | 获取导入名单受邀人的模板 | `GenAuthImportTemplateInput` | `GenAuthImportTemplateResult` | GET | `/api/v3/invitation-invitee/template` |
| `qoni.genauth.tenants.importTenant` | 导入租户 | `GenAuthImportTenantInput` | `GenAuthImportTenantResult` | POST | `/api/v3/import-tenant` |
| `qoni.genauth.tenants.importTenantHistory` | 导入租户历史 | `GenAuthImportTenantHistoryInput` | `GenAuthImportTenantHistoryResult` | GET | `/api/v3/import-tenant-history` |
| `qoni.genauth.tenants.importTenantNotifyUser` | 导入租户通知用户列表 | `GenAuthImportTenantNotifyUserInput` | `GenAuthImportTenantNotifyUserResult` | GET | `/api/v3/import-tenant-notify-user` |
| `qoni.genauth.invitations.importUsers` | 导入名单受邀人 | `GenAuthImportUsersInput` | `GenAuthImportUsersResult` | POST | `/api/v3/invitation-invitee/import` |
| `qoni.genauth.permissions.isAllowed` | 判断用户是否对某个资源的某个操作有权限 | `GenAuthIsActionAllowedInput` | `GenAuthIsActionAllowedResult` | POST | `/api/v3/is-action-allowed` |
| `qoni.genauth.departments.isDepartmentInDepartment` | 判断部门是否在某个部门下 | `GenAuthIsDepartmentInDepartmentInput` | `GenAuthIsDepartmentInDepartmentResult` | GET | `/api/v3/is-department-in-department` |
| `qoni.genauth.users.exists` | 判断用户是否存在 | `GenAuthIsUserExistsInput` | `GenAuthIsUserExistsResult` | POST | `/api/v3/is-user-exists` |
| `qoni.genauth.departments.isUserInDepartment` | 判断用户是否在某个部门下 | `GenAuthIsUserInDepartmentInput` | `GenAuthIsUserInDepartmentResult` | GET | `/api/v3/is-user-in-department` |
| `qoni.genauth.publicAccounts.kickPublicAccounts` | 强制下线公共账号 | `GenAuthKickPublicAccountsInput` | `GenAuthKickPublicAccountsResult` | POST | `/api/v3/kick-public-accounts` |
| `qoni.genauth.users.kick` | 强制下线用户 | `GenAuthKickUsersInput` | `GenAuthKickUsersResult` | POST | `/api/v3/kick-users` |
| `qoni.genauth.users.linkIdentity` | 给用户绑定一个身份信息 | `GenAuthLinkIdentityInput` | `GenAuthLinkIdentityResult` | POST | `/api/v3/link-identity` |
| `qoni.genauth.accessKeys.listAccessKey` | 获取协作管理员 AK/SK 列表 | `GenAuthListAccessKeyInput` | `GenAuthListAccessKeyResult` | GET | `/api/v3/list-access-key` |
| `qoni.genauth.applications.listApplicationActiveUsers` | 获取应用当前登录用户 | `GenAuthListApplicationActiveUsersInput` | `GenAuthListApplicationActiveUsersResult` | POST | `/api/v3/list-application-active-users` |
| `qoni.genauth.applications.list` | 获取应用列表 | `GenAuthListApplicationsInput` | `GenAuthListApplicationsResult` | GET | `/api/v3/list-applications` |
| `qoni.genauth.applications.listApplicationsAuth` | 应用授权列表 | `GenAuthListApplicationsAuthInput` | `GenAuthListApplicationsAuthResult` | POST | `/api/v3/list-applications-auth` |
| `qoni.genauth.applications.listApplicationSimpleInfo` | 获取应用简单信息列表 | `GenAuthListApplicationSimpleInfoInput` | `GenAuthListApplicationSimpleInfoResult` | GET | `/api/v3/list-application-simple-info` |
| `qoni.genauth.users.listArchivedUsers` | 获取已归档的用户列表 | `GenAuthListArchivedUsersInput` | `GenAuthListArchivedUsersResult` | GET | `/api/v3/list-archived-users` |
| `qoni.genauth.applications.listAsaAccount` | 获取 ASA 账号列表 | `GenAuthListAsaAccountInput` | `GenAuthListAsaAccountResult` | GET | `/api/v3/list-asa-accounts` |
| `qoni.genauth.applications.listAsaAccounts` | 获取 ASA 账号列表 | `GenAuthListAsaAccountsInput` | `GenAuthListAsaAccountsResult` | GET | `/api/v3/list-asa-accounts` |
| `qoni.genauth.applications.listAuthApplication` | 应用授权列表 | `GenAuthListAuthApplicationInput` | `GenAuthListAuthApplicationResult` | POST | `/api/v3/list-applications-auth` |
| `qoni.genauth.applications.listAuthSubject` | 主体授权列表 | `GenAuthListAuthSubjectInput` | `GenAuthListAuthSubjectResult` | POST | `/api/v3/list-subject-auth` |
| `qoni.genauth.departments.listChildren` | 获取子部门列表 | `GenAuthListChildrenDepartmentsInput` | `GenAuthListChildrenDepartmentsResult` | GET | `/api/v3/list-children-departments` |
| `qoni.genauth.policies.listCommonAuthorize` | 常规资源授权列表 | `GenAuthListCommonAuthorizeInput` | `GenAuthListCommonAuthorizeResult` | GET | `/api/v3/list-common-authorize` |
| `qoni.genauth.resources.listCommonResource` | 分页获取常规资源列表 | `GenAuthListCommonResourceInput` | `GenAuthListCommonResourceResult` | GET | `/api/v3/list-common-resource` |
| `qoni.genauth.customFields.listCustFields` | 获取自定义字段列表 | `GenAuthListCustFieldsInput` | `GenAuthListCustFieldsResult` | GET | `/api/v3/list-custom-fields` |
| `qoni.genauth.customFields.list` | 获取自定义字段列表 | `GenAuthListCustomFieldsInput` | `GenAuthListCustomFieldsResult` | GET | `/api/v3/list-custom-fields` |
| `qoni.genauth.dataPermissions.listDataPolices` | 获取数据策略列表 | `GenAuthListDataPolicesInput` | `GenAuthListDataPolicesResult` | GET | `/api/v3/list-data-policies` |
| `qoni.genauth.dataPermissions.listDataPolicies` | 获取数据策略列表 | `GenAuthListDataPoliciesInput` | `GenAuthListDataPoliciesResult` | GET | `/api/v3/list-data-policies` |
| `qoni.genauth.dataPermissions.listDataPolicyTargets` | 获取数据策略授权的主体列表 | `GenAuthListDataPolicyTargetsInput` | `GenAuthListDataPolicyTargetsResult` | GET | `/api/v3/list-data-policy-targets` |
| `qoni.genauth.dataPermissions.listDataResources` | 获取数据资源列表 | `GenAuthListDataResourcesInput` | `GenAuthListDataResourcesResult` | GET | `/api/v3/list-data-resources` |
| `qoni.genauth.departments.listMemberIds` | 获取部门直属成员 ID 列表 | `GenAuthListDepartmentMemberIdsInput` | `GenAuthListDepartmentMemberIdsResult` | GET | `/api/v3/list-department-member-ids` |
| `qoni.genauth.departments.listMembers` | 获取部门成员列表 | `GenAuthListDepartmentMembersInput` | `GenAuthListDepartmentMembersResult` | GET | `/api/v3/list-department-members` |
| `qoni.genauth.dataPermissions.listDnef` | 获取树类型资源的扩展字段列表 | `GenAuthListDnefInput` | `GenAuthListDnefResult` | GET | `/api/v3/list-dnef` |
| `qoni.genauth.identityProviders.listEnabledExtIdpConnsByApp` | 根据应用 id 获取应用已启用的身份源连接列表 | `GenAuthListEnabledExtIdpConnsByAppInput` | `GenAuthListEnabledExtIdpConnsByAppResult` | GET | `/api/v3/list-enabled-ext-idp-conns-by-app` |
| `qoni.genauth.events.listEventApps` | 获取事件应用列表 | `GenAuthListEventAppsInput` | `GenAuthListEventAppsResult` | GET | `/api/v3/list-event-apps` |
| `qoni.genauth.events.listEvents` | 获取事件列表 | `GenAuthListEventsInput` | `GenAuthListEventsResult` | GET | `/api/v3/list-events` |
| `qoni.genauth.identityProviders.list` | 获取身份源列表 | `GenAuthListExtIdpInput` | `GenAuthListExtIdpResult` | GET | `/api/v3/list-ext-idp` |
| `qoni.genauth.identityProviders.listExtIdpConns` | 获取身份源连接列表 | `GenAuthListExtIdpConnsInput` | `GenAuthListExtIdpConnsResult` | GET | `/api/v3/list-ext-idp-conns` |
| `qoni.genauth.metadata.listField` | 获取数据对象字段列表 | `GenAuthListFieldInput` | `GenAuthListFieldResult` | GET | `/api/v3/metadata/list-field` |
| `qoni.genauth.groups.listMembers` | 获取分组成员列表 | `GenAuthListGroupMembersInput` | `GenAuthListGroupMembersResult` | GET | `/api/v3/list-group-members` |
| `qoni.genauth.groups.list` | 获取分组列表 | `GenAuthListGroupsInput` | `GenAuthListGroupsResult` | GET | `/api/v3/list-groups` |
| `qoni.genauth.invitations.listPolicies` | 获取邀请策略列表 | `GenAuthListInvitationPoliciesInput` | `GenAuthListInvitationPoliciesResult` | POST | `/api/v3/list-invitation-policies` |
| `qoni.genauth.invitations.listRosters` | 获取邀请名单列表 | `GenAuthListInvitationRosterInput` | `GenAuthListInvitationRosterResult` | POST | `/api/v3/list-invitation-rosters` |
| `qoni.genauth.invitations.listInvitationRostersByNonPolicyId` | 获取未关联策略的邀请名单列表 | `GenAuthListInvitationRostersByNonPolicyIdInput` | `GenAuthListInvitationRostersByNonPolicyIdResult` | POST | `/api/v3/list-invitation-rosters-by-no-policy-id` |
| `qoni.genauth.invitations.listInvitationRostersByPolicyId` | 根据策略 Id 获取邀请名单列表 | `GenAuthListInvitationRostersByPolicyIdInput` | `GenAuthListInvitationRostersByPolicyIdResult` | POST | `/api/v3/list-invitation-rosters-by-policy-id` |
| `qoni.genauth.tenants.listInviteTenantUserRecords` | 获取可访问的租户控制台列表 | `GenAuthListInviteTenantUserRecordsInput` | `GenAuthListInviteTenantUserRecordsResult` | GET | `/api/v3/list-invite-tenant-user-records` |
| `qoni.genauth.tenants.listInviteTennatUserRecords` | 获取可访问的租户控制台列表 | `GenAuthListInviteTennatUserRecordsInput` | `GenAuthListInviteTennatUserRecordsResult` | GET | `/api/v3/list-invite-tenant-user-records` |
| `qoni.genauth.metadata.listModel` | 获取数据对象列表 | `GenAuthListModelInput` | `GenAuthListModelResult` | GET | `/api/v3/metadata/list-model` |
| `qoni.genauth.tenants.listMultipleTenantAdmin` | 获取多租户管理员用户列表 | `GenAuthListMultipleTenantAdminInput` | `GenAuthListMultipleTenantAdminResult` | GET | `/api/v3/list-multiple-tenant-admins` |
| `qoni.genauth.tenants.listMultipleTenantAdmins` | 获取多租户管理员用户列表 | `GenAuthListMultipleTenantAdminsInput` | `GenAuthListMultipleTenantAdminsResult` | GET | `/api/v3/list-multiple-tenant-admins` |
| `qoni.genauth.namespaces.listRoles` | 分页权限分组下所有的角色列表 | `GenAuthListNamespaceRolesInput` | `GenAuthListNamespaceRolesResult` | GET | `/api/v3/list-namespace-roles` |
| `qoni.genauth.namespaces.list` | 分页获取权限分组列表 | `GenAuthListNamespacesInput` | `GenAuthListNamespacesResult` | GET | `/api/v3/list-namespaces` |
| `qoni.genauth.metadata.listOperate` | 操作管理列表(分页) | `GenAuthListOperateInput` | `GenAuthListOperateResult` | GET | `/api/v3/metadata/list-operate` |
| `qoni.genauth.metadata.listOperateAll` | 全部操作管理列表 | `GenAuthListOperateAllInput` | `GenAuthListOperateAllResult` | GET | `/api/v3/metadata/all-operate` |
| `qoni.genauth.organizations.list` | 获取组织机构列表 | `GenAuthListOrganizationsInput` | `GenAuthListOrganizationsResult` | GET | `/api/v3/list-organizations` |
| `qoni.genauth.dataPermissions.listPermissionNamespaceRoles` | 分页查询权限空间下所有的角色列表 | `GenAuthListPermissionNamespaceRolesInput` | `GenAuthListPermissionNamespaceRolesResult` | GET | `/api/v3/list-permission-namespace-roles` |
| `qoni.genauth.dataPermissions.listPermissionNamespaces` | 分页获取权限空间列表 | `GenAuthListPermissionNamespacesInput` | `GenAuthListPermissionNamespacesResult` | GET | `/api/v3/list-permission-namespaces` |
| `qoni.genauth.dataPermissions.listPermissionView` | 获取权限视图数据列表 | `GenAuthListPermissionViewInput` | `GenAuthListPermissionViewResult` | POST | `/api/v3/list-permission-view/data` |
| `qoni.genauth.dataPermissions.listPermissionViewData` | 获取权限视图数据列表 | `GenAuthListPermissionViewDataInput` | `GenAuthListPermissionViewDataResult` | POST | `/api/v3/list-permission-view/data` |
| `qoni.genauth.pipelines.list` | 获取 Pipeline 函数列表 | `GenAuthListPipelineFunctionsInput` | `GenAuthListPipelineFunctionsResult` | GET | `/api/v3/list-pipeline-functions` |
| `qoni.genauth.invitations.listPolicyUserAttributionDetail` | 获取邀请策略用户归属列表 | `GenAuthListPolicyUserAttributionDetailInput` | `GenAuthListPolicyUserAttributionDetailResult` | GET | `/api/v3/list-invitation-policy-user-attributions` |
| `qoni.genauth.applications.listProgrammaticAccessAccounts` | 获取编程访问账号列表 | `GenAuthListProgrammaticAccessAccountsInput` | `GenAuthListProgrammaticAccessAccountsResult` | GET | `/api/v3/list-programmatic-access-accounts` |
| `qoni.genauth.publicAccounts.list` | 获取/搜索公共账号列表 | `GenAuthListPublicAccountsInput` | `GenAuthListPublicAccountsResult` | POST | `/api/v3/list-public-accounts` |
| `qoni.genauth.invitations.listRegisterExtendsFields` | 获取策略流程配置补充信息的字段列表 | `GenAuthListRegisterExtendsFieldsInput` | `GenAuthListRegisterExtendsFieldsResult` | GET | `/api/v3/list-invitation-policy-extends-fields` |
| `qoni.genauth.resources.list` | 分页获取资源列表 | `GenAuthListResourcesInput` | `GenAuthListResourcesResult` | GET | `/api/v3/list-resources` |
| `qoni.genauth.dataPermissions.listResourceTargets` | 获取拥有某些资源权限的用户列表 | `GenAuthListResourceTargetsInput` | `GenAuthListResourceTargetsResult` | POST | `/api/v3/list-resource-targets` |
| `qoni.genauth.roles.listRoleAllMembers` | 获取角色下所有成员列表 | `GenAuthListRoleAllMembersInput` | `GenAuthListRoleAllMembersResult` | GET | `/api/v3/list-role-all-members` |
| `qoni.genauth.roles.listAssignments` | 获取角色授权列表 | `GenAuthListRoleAssignmentsInput` | `GenAuthListRoleAssignmentsResult` | GET | `/api/v3/list-role-assignments` |
| `qoni.genauth.roles.listRoleDepartments` | 获取角色的部门列表 | `GenAuthListRoleDepartmentsInput` | `GenAuthListRoleDepartmentsResult` | GET | `/api/v3/list-role-departments` |
| `qoni.genauth.roles.listMembers` | 获取角色成员列表 | `GenAuthListRoleMembersInput` | `GenAuthListRoleMembersResult` | GET | `/api/v3/list-role-members` |
| `qoni.genauth.roles.list` | 获取角色列表 | `GenAuthListRolesInput` | `GenAuthListRolesResult` | GET | `/api/v3/list-roles` |
| `qoni.genauth.metadata.listRow` | 数据对象高级搜索 | `GenAuthListRowInput` | `GenAuthListRowResult` | POST | `/api/v3/metadata/filter` |
| `qoni.genauth.sessions.list` | 获取 Session 列表 | `GenAuthListSessionsInput` | `GenAuthListSessionsResult` | POST | `/api/v3/list-sessions` |
| `qoni.genauth.sessions.listSessionsDetailByView` | 视图详情下的 Session 列表 | `GenAuthListSessionsDetailByViewInput` | `GenAuthListSessionsDetailByViewResult` | POST | `/api/v3/list-sessions-detail-by-view` |
| `qoni.genauth.dataPermissions.listSimpleDataPolices` | 获取数据策略简略信息列表 | `GenAuthListSimpleDataPolicesInput` | `GenAuthListSimpleDataPolicesResult` | GET | `/api/v3/list-simple-data-policies` |
| `qoni.genauth.dataPermissions.listSimpleDataPolicies` | 获取数据策略简略信息列表 | `GenAuthListSimpleDataPoliciesInput` | `GenAuthListSimpleDataPoliciesResult` | GET | `/api/v3/list-simple-data-policies` |
| `qoni.genauth.applications.listSubjectAuth` | 主体授权列表 | `GenAuthListSubjectAuthInput` | `GenAuthListSubjectAuthResult` | POST | `/api/v3/list-subject-auth` |
| `qoni.genauth.sync.listSyncJobLogs` | 获取同步作业详情 | `GenAuthListSyncJobLogsInput` | `GenAuthListSyncJobLogsResult` | GET | `/api/v3/list-sync-job-logs` |
| `qoni.genauth.sync.listSyncJobs` | 获取同步作业详情 | `GenAuthListSyncJobsInput` | `GenAuthListSyncJobsResult` | GET | `/api/v3/list-sync-jobs` |
| `qoni.genauth.sync.listSyncRiskOperations` | 获取同步风险操作列表 | `GenAuthListSyncRiskOperationsInput` | `GenAuthListSyncRiskOperationsResult` | GET | `/api/v3/list-sync-risk-operations` |
| `qoni.genauth.sync.list` | 获取同步任务列表 | `GenAuthListSyncTasksInput` | `GenAuthListSyncTasksResult` | GET | `/api/v3/list-sync-tasks` |
| `qoni.genauth.tenants.listTenantAdmin` | 获取租户管理员列表 | `GenAuthListTenantAdminInput` | `GenAuthListTenantAdminResult` | POST | `/api/v3/list-tenant-admin` |
| `qoni.genauth.applications.listTenantApplications` | 获取租户应用列表 | `GenAuthListTenantApplicationsInput` | `GenAuthListTenantApplicationsResult` | GET | `/api/v3/list-tenant-applications` |
| `qoni.genauth.tenants.listTenantCooperators` | 获取协作管理员用户列表 | `GenAuthListTenantCooperatorsInput` | `GenAuthListTenantCooperatorsResult` | GET | `/api/v3/list-tenant-cooperators` |
| `qoni.genauth.identityProviders.listTenantExtIdp` | 租户控制台获取身份源列表 | `GenAuthListTenantExtIdpInput` | `GenAuthListTenantExtIdpResult` | GET | `/api/v3/list-tenant-ext-idp` |
| `qoni.genauth.tenants.list` | 获取/搜索租户列表 | `GenAuthListTenantsInput` | `GenAuthListTenantsResult` | GET | `/api/v3/list-tenants` |
| `qoni.genauth.tenants.listUsers` | 获取/搜索租户成员列表 | `GenAuthListTenantUsersInput` | `GenAuthListTenantUsersResult` | POST | `/api/v3/list-tenant-users` |
| `qoni.genauth.customFields.listUserBaseFields` | 获取用户内置字段列表 | `GenAuthListUserBaseFieldsInput` | `GenAuthListUserBaseFieldsResult` | GET | `/api/v3/list-user-base-fields` |
| `qoni.genauth.users.list` | 获取/搜索用户列表 | `GenAuthListUsersInput` | `GenAuthListUsersResult` | POST | `/api/v3/list-users` |
| `qoni.genauth.users.listUsersLegacy` | 获取用户列表 | `GenAuthListUsersLegacyInput` | `GenAuthListUsersLegacyResult` | GET | `/api/v3/list-users` |
| `qoni.genauth.webhooks.list` | 获取 Webhook 列表 | `GenAuthListWebhooksInput` | `GenAuthListWebhooksResult` | GET | `/api/v3/list-webhooks` |
| `qoni.genauth.whitelist.listWhitelist` | 获取注册白名单列表 | `GenAuthListWhitelistInput` | `GenAuthListWhitelistResult` | GET | `/api/v3/list-whitelist` |
| `qoni.genauth.whitelist.listWhitelistOfApp` | 获取应用注册白名单列表 | `GenAuthListWhitelistOfAppInput` | `GenAuthListWhitelistOfAppResult` | GET | `/api/v3/list-whitelist-of-app` |
| `qoni.genauth.whitelist.listWhitelists` | 获取注册白名单列表 | `GenAuthListWhitelistsInput` | `GenAuthListWhitelistsResult` | GET | `/api/v3/list-whitelist` |
| `qoni.genauth.whitelist.listWhitelistsOfApp` | 获取应用注册白名单列表 | `GenAuthListWhitelistsOfAppInput` | `GenAuthListWhitelistsOfAppResult` | GET | `/api/v3/list-whitelist-of-app` |
| `qoni.genauth.approvals.logList` | 获取审批日志列表 | `GenAuthLogListInput` | `GenAuthLogListResult` | GET | `/api/v3/approval-log-list` |
| `qoni.genauth.roles.multipleNamespaceDeleteRolesBatch` | 跨权限分组（空间）删除角色 | `GenAuthMultipleNamespaceDeleteRolesBatchInput` | `GenAuthMultipleNamespaceDeleteRolesBatchResult` | POST | `/api/v3/multiple-namespace-delete-roles-batch` |
| `qoni.genauth.approvals.listPending` | 获取代办审批列表 | `GenAuthPendListInput` | `GenAuthPendListResult` | GET | `/api/v3/approval-pending-list` |
| `qoni.genauth.positions.list` | 岗位列表 | `GenAuthPostListInput` | `GenAuthPostListResult` | GET | `/api/v3/list-post` |
| `qoni.genauth.positions.listBatch` | 岗位列表 | `GenAuthPostListBatchInput` | `GenAuthPostListBatchResult` | POST | `/api/v3/list-post` |
| `qoni.genauth.dynamicGroups.previewDynamicGroup` | 动态分组预览 | `GenAuthPreviewDynamicGroupInput` | `GenAuthPreviewDynamicGroupResult` | POST | `/api/v3/preview-dynamic-group` |
| `qoni.genauth.email.previewEmailTemplate` | 预览邮件模版 | `GenAuthPreviewEmailTemplateInput` | `GenAuthPreviewEmailTemplateResult` | POST | `/api/v3/preview-email-template` |
| `qoni.genauth.approvals.process` | 处理单个审批 | `GenAuthProcessApprovalInput` | `GenAuthProcessApprovalResult` | PUT | `/api/v3/approval-process` |
| `qoni.genauth.events.pub` | 事件发布 | `GenAuthPubInput` | `GenAuthPubResult` | POST | `/api/v3/pub-event` |
| `qoni.genauth.events.pubUserEvent` | 认证端推送自定义事件 | `GenAuthPubUserEventInput` | `GenAuthPubUserEventResult` | POST | `/api/v3/pub-userEvent` |
| `qoni.genauth.ldap.queryLdapConfigInfo` | 获取 LDAP server 配置信息 | `GenAuthQueryLdapConfigInfoInput` | `GenAuthQueryLdapConfigInfoResult` | GET | `/api/v3/get-ldap-server-config` |
| `qoni.genauth.ldap.queryLdapLog` | LDAP server 日志查询 | `GenAuthQueryLdapLogInput` | `GenAuthQueryLdapLogResult` | GET | `/api/v3/get-ldap-server-log` |
| `qoni.genauth.ldap.queryLdapSubEntries` | LDAP server 根据 DN 查询下一级 | `GenAuthQueryLdapSubEntriesInput` | `GenAuthQueryLdapSubEntriesResult` | GET | `/api/v3/get-ldap-sub-entries` |
| `qoni.genauth.invitations.quickFilterInviteeList` | 快捷查询受邀人列表 | `GenAuthQuickFilterInviteeListInput` | `GenAuthQuickFilterInviteeListResult` | POST | `/api/v3/quick-filter-invitees` |
| `qoni.genauth.applications.refreshSecret` | 刷新应用密钥 | `GenAuthRefreshApplicationSecretInput` | `GenAuthRefreshApplicationSecretResult` | POST | `/api/v3/refresh-application-secret` |
| `qoni.genauth.applications.refreshProgrammaticAccessAccountSecret` | 刷新编程访问账号密钥 | `GenAuthRefreshProgrammaticAccessAccountSecretInput` | `GenAuthRefreshProgrammaticAccessAccountSecretResult` | POST | `/api/v3/refresh-programmatic-access-account-secret` |
| `qoni.genauth.invitations.reject` | 批量拒绝通用邀请的申请 | `GenAuthRejectInput` | `GenAuthRejectResult` | POST | `/api/v3/batch-reject-universal-invitation-applicant` |
| `qoni.genauth.metadata.relationSearch` | 关联关系模糊查询 | `GenAuthRelationSearchInput` | `GenAuthRelationSearchResult` | POST | `/api/v3/metadata/relation-search` |
| `qoni.genauth.metadata.remoteField` | 删除数据对象的字段 | `GenAuthRemoteFieldInput` | `GenAuthRemoteFieldResult` | POST | `/api/v3/metadata/remove-field` |
| `qoni.genauth.deviceRules.remove` | 移除设备互斥生效范围配置 | `GenAuthRemoveInput` | `GenAuthRemoveResult` | POST | `/api/v3/remove-device-exclusive-valid-scope-settings` |
| `qoni.genauth.departments.removeMembers` | 部门下删除成员 | `GenAuthRemoveDepartmentMembersInput` | `GenAuthRemoveDepartmentMembersResult` | POST | `/api/v3/remove-department-members` |
| `qoni.genauth.groups.removeMembers` | 批量移除分组成员 | `GenAuthRemoveGroupMembersInput` | `GenAuthRemoveGroupMembersResult` | POST | `/api/v3/remove-group-members` |
| `qoni.genauth.metadata.removeModel` | 删除数据对象 | `GenAuthRemoveModelInput` | `GenAuthRemoveModelResult` | POST | `/api/v3/metadata/remove-model` |
| `qoni.genauth.metadata.removeOperate` | 移除自定义操作 | `GenAuthRemoveOperateInput` | `GenAuthRemoveOperateResult` | POST | `/api/v3/metadata/remove-operate` |
| `qoni.genauth.invitations.removePolicyUserAttribution` | 删除邀请策略用户归属 | `GenAuthRemovePolicyUserAttributionInput` | `GenAuthRemovePolicyUserAttributionResult` | POST | `/api/v3/remove-invitation-policy-user-attribution` |
| `qoni.genauth.invitations.removePolicyUserAttributionsBatch` | 批量删除邀请策略用户归属 | `GenAuthRemovePolicyUserAttributionsBatchInput` | `GenAuthRemovePolicyUserAttributionsBatchResult` | POST | `/api/v3/remove-invitation-policy-user-attributions-batch` |
| `qoni.genauth.positions.delete` | 删除岗位 | `GenAuthRemovePostInput` | `GenAuthRemovePostResult` | POST | `/api/v3/remove-post` |
| `qoni.genauth.metadata.removeRelationValue` | 删除行关联数据 | `GenAuthRemoveRelationValueInput` | `GenAuthRemoveRelationValueResult` | POST | `/api/v3/metadata/remove-row-relation` |
| `qoni.genauth.metadata.removeRow` | 删除行 | `GenAuthRemoveRowInput` | `GenAuthRemoveRowResult` | POST | `/api/v3/metadata/remove-row` |
| `qoni.genauth.tenants.removeTenantDepartmentMembers` | 租户部门下删除成员 | `GenAuthRemoveTenantDepartmentMembersInput` | `GenAuthRemoveTenantDepartmentMembersResult` | POST | `/api/v3/remove-tenant-department-members` |
| `qoni.genauth.tenants.removeUsers` | 批量移除租户成员 | `GenAuthRemoveTenantUsersInput` | `GenAuthRemoveTenantUsersResult` | POST | `/api/v3/remove-tenant-users` |
| `qoni.genauth.invitations.removeUserAttributionMainDepartment` | 移除用户归属的主部门设置 | `GenAuthRemoveUserAttributionMainDepartmentInput` | `GenAuthRemoveUserAttributionMainDepartmentResult` | POST | `/api/v3/remove-invitation-policy-user-attribution-main-department` |
| `qoni.genauth.users.resetUserPrincipalAuthenticationInfo` | 删除用户实名认证信息 | `GenAuthResetUserPrincipalAuthenticationInfoInput` | `GenAuthResetUserPrincipalAuthenticationInfoResult` | POST | `/api/v3/reset-user-principal-authentication-info` |
| `qoni.genauth.publicAccounts.resignPublicAccountBatch` | 批量离职用户 | `GenAuthResignPublicAccountBatchInput` | `GenAuthResignPublicAccountBatchResult` | POST | `/api/v3/resign-public-account-batch` |
| `qoni.genauth.users.resign` | 离职用户 | `GenAuthResignUserInput` | `GenAuthResignUserResult` | POST | `/api/v3/resign-user` |
| `qoni.genauth.users.resignBatch` | 批量离职用户 | `GenAuthResignUserBatchInput` | `GenAuthResignUserBatchResult` | POST | `/api/v3/resign-user-batch` |
| `qoni.genauth.pipelines.reuploadPipelineFunction` | 重新上传 Pipeline 函数 | `GenAuthReuploadPipelineFunctionInput` | `GenAuthReuploadPipelineFunctionResult` | POST | `/api/v3/reupload-pipeline-function` |
| `qoni.genauth.invitations.revertRosterInvitation` | 撤回邀请 | `GenAuthRevertRosterInvitationInput` | `GenAuthRevertRosterInvitationResult` | POST | `/api/v3/revert-roster-invitation` |
| `qoni.genauth.invitations.revertRosterInvitationBatch` | 撤回邀请 | `GenAuthRevertRosterInvitationBatchInput` | `GenAuthRevertRosterInvitationBatchResult` | POST | `/api/v3/revert-roster-invitation-batch` |
| `qoni.genauth.tenants.reviewTenantEnterpriseCertification` | 审核户企业认证 | `GenAuthReviewTenantEnterpriseCertificationInput` | `GenAuthReviewTenantEnterpriseCertificationResult` | POST | `/api/v3/review-tenant-enterprise-certification` |
| `qoni.genauth.applications.revokeAccess` | 删除应用访问授权记录 | `GenAuthRevokeApplicationAccessInput` | `GenAuthRevokeApplicationAccessResult` | POST | `/api/v3/revoke-application-access` |
| `qoni.genauth.dataPermissions.revokeDataPolicy` | 删除数据策略授权 | `GenAuthRevokeDataPolicyInput` | `GenAuthRevokeDataPolicyResult` | POST | `/api/v3/revoke-data-policy` |
| `qoni.genauth.roles.revoke` | 移除分配的角色 | `GenAuthRevokeRoleInput` | `GenAuthRevokeRoleResult` | POST | `/api/v3/revoke-role` |
| `qoni.genauth.roles.revokeBatch` | 批量移除分配的角色 | `GenAuthRevokeRoleBatchInput` | `GenAuthRevokeRoleBatchResult` | POST | `/api/v3/revoke-role-batch` |
| `qoni.genauth.applications.saveAuthFlowConfig` | 创建编排配置 | `GenAuthSaveAuthFlowConfigInput` | `GenAuthSaveAuthFlowConfigResult` | POST | `/api/v3/save-auth-flow-config` |
| `qoni.genauth.deviceRules.saveInvitationPolicies` | 保存设备互斥生效范围配置 | `GenAuthSaveInvitationPoliciesInput` | `GenAuthSaveInvitationPoliciesResult` | POST | `/api/v3/save-device-exclusive-valid-scope-settings` |
| `qoni.genauth.ldap.saveLdapConfigInfo` | 初始化/重启 LDAP server | `GenAuthSaveLdapConfigInfoInput` | `GenAuthSaveLdapConfigInfoResult` | POST | `/api/v3/enable-ldap-server` |
| `qoni.genauth.departments.searchDepartmentMembers` | 搜索部门下的成员 | `GenAuthSearchDepartmentMembersInput` | `GenAuthSearchDepartmentMembersResult` | GET | `/api/v3/search-department-members` |
| `qoni.genauth.departments.searchDepartments` | 搜索部门 | `GenAuthSearchDepartmentsInput` | `GenAuthSearchDepartmentsResult` | POST | `/api/v3/search-departments` |
| `qoni.genauth.departments.searchDepartmentsList` | 搜索部门 | `GenAuthSearchDepartmentsListInput` | `GenAuthSearchDepartmentsListResult` | POST | `/api/v3/search-departments-list` |
| `qoni.genauth.organizations.searchOrganizations` | 搜索组织机构列表 | `GenAuthSearchOrganizationsInput` | `GenAuthSearchOrganizationsResult` | GET | `/api/v3/search-organizations` |
| `qoni.genauth.tenants.sendEmailBatch` | 导入租户通知邮箱用户 | `GenAuthSendEmailBatchInput` | `GenAuthSendEmailBatchResult` | POST | `/api/v3/send-email-batch` |
| `qoni.genauth.tenants.sendInviteTenantUserEmail` | 发送邀请租户用户邮件 | `GenAuthSendInviteTenantUserEmailInput` | `GenAuthSendInviteTenantUserEmailResult` | POST | `/api/v3/send-invite-tenant-user-email` |
| `qoni.genauth.invitations.sendRosterInvitation` | 根据邀请名单发送邀请 | `GenAuthSendRosterInvitationInput` | `GenAuthSendRosterInvitationResult` | POST | `/api/v3/send-roster-invitation` |
| `qoni.genauth.invitations.sendRosterInvitationBatch` | 批量发送邀请 | `GenAuthSendRosterInvitationBatchInput` | `GenAuthSendRosterInvitationBatchResult` | POST | `/api/v3/send-roster-invitation-batch` |
| `qoni.genauth.tenants.sendSmsBatch` | 导入租户短信通知用户 | `GenAuthSendSmsBatchInput` | `GenAuthSendSmsBatchResult` | POST | `/api/v3/send-sms-batch` |
| `qoni.genauth.users.sendUserResetPasswordEmailLink` | 发送用户忘记密码邮箱链接 | `GenAuthSendUserResetPasswordEmailLinkInput` | `GenAuthSendUserResetPasswordEmailLinkResult` | POST | `/api/v3/send-user-reset-password-email-link` |
| `qoni.genauth.users.sendUserResetPasswordRequest` | 根据用户信息发送重置密码请求 | `GenAuthSendUserResetPasswordRequestInput` | `GenAuthSendUserResetPasswordRequestResult` | POST | `/api/v3/send-user-reset-password-request` |
| `qoni.genauth.customFields.setData` | 设置自定义字段的值 | `GenAuthSetCustomDataInput` | `GenAuthSetCustomDataResult` | POST | `/api/v3/set-custom-data` |
| `qoni.genauth.customFields.set` | 创建/修改自定义字段定义 | `GenAuthSetCustomFieldsInput` | `GenAuthSetCustomFieldsResult` | POST | `/api/v3/set-custom-fields` |
| `qoni.genauth.users.setMfaStatus` | 设置用户 MFA 状态 | `GenAuthSetMfaStatusInput` | `GenAuthSetMfaStatusResult` | POST | `/api/v3/set-mfa-status` |
| `qoni.genauth.publicAccounts.setPublicAccountOfDepartments` | 设置公共账号所在部门 | `GenAuthSetPublicAccountOfDepartmentsInput` | `GenAuthSetPublicAccountOfDepartmentsResult` | POST | `/api/v3/set-public-account-of-departments` |
| `qoni.genauth.publicAccounts.setPublicAccountOfnPost` | 设置公共账号的岗位 | `GenAuthSetPublicAccountOfnPostInput` | `GenAuthSetPublicAccountOfnPostResult` | POST | `/api/v3/set-public-account-of-post` |
| `qoni.genauth.tenants.setTenantAdmin` | 设置租户管理员 | `GenAuthSetTenantAdminInput` | `GenAuthSetTenantAdminResult` | POST | `/api/v3/set-tenant-admin` |
| `qoni.genauth.invitations.setUserAttributionMainDepartment` | 设置用户归属的主部门 | `GenAuthSetUserAttributionMainDepartmentInput` | `GenAuthSetUserAttributionMainDepartmentResult` | POST | `/api/v3/set-invitation-policy-user-attribution-main-department` |
| `qoni.genauth.customFields.setUserBaseFields` | 修改用户内置字段配置 | `GenAuthSetUserBaseFieldsInput` | `GenAuthSetUserBaseFieldsResult` | POST | `/api/v3/set-user-base-fields` |
| `qoni.genauth.users.setDepartments` | 设置用户所在部门 | `GenAuthSetUserDepartmentsInput` | `GenAuthSetUserDepartmentsResult` | POST | `/api/v3/set-user-departments` |
| `qoni.genauth.users.setUserMfaBindSmsEmail` | 设置用户 MFA 绑定手机号或者邮箱 | `GenAuthSetUserMfaBindSmsEmailInput` | `GenAuthSetUserMfaBindSmsEmailResult` | POST | `/api/v3/set-user-mfa-bind-sms-email` |
| `qoni.genauth.publicAccounts.setuserOfPublicAccount` | 用户绑定批量公共账号 | `GenAuthSetuserOfPublicAccountInput` | `GenAuthSetuserOfPublicAccountResult` | POST | `/api/v3/set-user-of-public-accounts` |
| `qoni.genauth.positions.setUserPosts` | 用户设置岗位 | `GenAuthSetUserPostsInput` | `GenAuthSetUserPostsResult` | POST | `/api/v3/set-user-posts` |
| `qoni.genauth.users.setUsersMfaStatus` | 设置用户 MFA 状态 | `GenAuthSetUsersMfaStatusInput` | `GenAuthSetUsersMfaStatusResult` | POST | `/api/v3/set-mfa-status` |
| `qoni.genauth.sessions.statisticSessionsByApp` | 获取按应用统计的 Session 列表 | `GenAuthStatisticSessionsByAppInput` | `GenAuthStatisticSessionsByAppResult` | POST | `/api/v3/statistic-sessions-by-app` |
| `qoni.genauth.sessions.statisticSessionsByDevice` | 获取按设备统计的 Session 列表 | `GenAuthStatisticSessionsByDeviceInput` | `GenAuthStatisticSessionsByDeviceResult` | POST | `/api/v3/statistic-sessions-by-device` |
| `qoni.genauth.sessions.statisticSessionsByUser` | 获取按用户统计的 Session 列表 | `GenAuthStatisticSessionsByUserInput` | `GenAuthStatisticSessionsByUserResult` | POST | `/api/v3/statistic-sessions-by-user` |
| `qoni.genauth.devices.suspendDevice` | 挂起设备(用户详情页) | `GenAuthSuspendDeviceInput` | `GenAuthSuspendDeviceResult` | POST | `/api/v3/suspend-device-by-user` |
| `qoni.genauth.applications.switchAuthFlowConfig` | 切换编排配置 | `GenAuthSwitchAuthFlowConfigInput` | `GenAuthSwitchAuthFlowConfigResult` | POST | `/api/v3/switch-auth-flow-config` |
| `qoni.genauth.sync.triggerSyncRiskOperations` | 执行同步风险操作 | `GenAuthTriggerSyncRiskOperationsInput` | `GenAuthTriggerSyncRiskOperationsResult` | POST | `/api/v3/trigger-sync-risk-operations` |
| `qoni.genauth.sync.triggerSyncTask` | 执行同步任务 | `GenAuthTriggerSyncTaskInput` | `GenAuthTriggerSyncTaskResult` | POST | `/api/v3/trigger-sync-task` |
| `qoni.genauth.webhooks.triggerWebhook` | 手动触发 Webhook 执行 | `GenAuthTriggerWebhookInput` | `GenAuthTriggerWebhookResult` | POST | `/api/v3/trigger-webhook` |
| `qoni.genauth.applications.unassignAsaAccount` | 取消分配 ASA 账号 | `GenAuthUnassignAsaAccountInput` | `GenAuthUnassignAsaAccountResult` | POST | `/api/v3/unassign-asa-account` |
| `qoni.genauth.publicAccounts.unbindPublicAccountOfPost` | 解绑公共账号关联岗位 | `GenAuthUnbindPublicAccountOfPostInput` | `GenAuthUnbindPublicAccountOfPostResult` | POST | `/api/v3/unbind-public-account-of-post` |
| `qoni.genauth.publicAccounts.unbindUsersPublicAccount` | 公共账号解绑用户 | `GenAuthUnbindUsersPublicAccountInput` | `GenAuthUnbindUsersPublicAccountResult` | POST | `/api/v3/unbind-public-account-of-user` |
| `qoni.genauth.users.unlinkIdentity` | 解除绑定用户在身份源下的所有身份信息 | `GenAuthUnlinkIdentityInput` | `GenAuthUnlinkIdentityResult` | POST | `/api/v3/unlink-identity` |
| `qoni.genauth.accessKeys.update` | 更新一个管理员 AccessKey | `GenAuthUpdateAccessKeyInput` | `GenAuthUpdateAccessKeyResult` | POST | `/api/v3/update-access-key` |
| `qoni.genauth.applications.update` | 更新应用 | `GenAuthUpdateApplicationInput` | `GenAuthUpdateApplicationResult` | POST | `/api/v3/update-application` |
| `qoni.genauth.applications.updateApplicationMfaSettings` | 修改应用多因素认证配置 | `GenAuthUpdateApplicationMfaSettingsInput` | `GenAuthUpdateApplicationMfaSettingsResult` | POST | `/api/v3/update-application-mfa-settings` |
| `qoni.genauth.applications.updateApplicationPermissionStrategy` | 更新应用默认访问授权策略 | `GenAuthUpdateApplicationPermissionStrategyInput` | `GenAuthUpdateApplicationPermissionStrategyResult` | POST | `/api/v3/update-application-permission-strategy` |
| `qoni.genauth.applications.updateAsaAccount` | 更新 ASA 账号 | `GenAuthUpdateAsaAccountInput` | `GenAuthUpdateAsaAccountResult` | POST | `/api/v3/update-asa-account` |
| `qoni.genauth.applications.updateAuthEnabled` | 更新授权开关 | `GenAuthUpdateAuthEnabledInput` | `GenAuthUpdateAuthEnabledResult` | POST | `/api/v3/update-auth-enabled` |
| `qoni.genauth.applications.updateAuthFlowConfig` | 更新编排配置 | `GenAuthUpdateAuthFlowConfigInput` | `GenAuthUpdateAuthFlowConfigResult` | POST | `/api/v3/update-auth-flow-config` |
| `qoni.genauth.pipelines.updateAuthFlowFunction` | 修改 AuthFlowFunction 函数 | `GenAuthUpdateAuthFlowFunctionInput` | `GenAuthUpdateAuthFlowFunctionResult` | POST | `/api/v3/update-auth-flow-function` |
| `qoni.genauth.dataPermissions.updateDataPolicy` | 修改数据策略 | `GenAuthUpdateDataPolicyInput` | `GenAuthUpdateDataPolicyResult` | POST | `/api/v3/update-data-policy` |
| `qoni.genauth.dataPermissions.updateDataResource` | 修改数据资源 | `GenAuthUpdateDataResourceInput` | `GenAuthUpdateDataResourceResult` | POST | `/api/v3/update-data-resource` |
| `qoni.genauth.departments.update` | 修改部门 | `GenAuthUpdateDepartmentInput` | `GenAuthUpdateDepartmentResult` | POST | `/api/v3/update-department` |
| `qoni.genauth.departments.updateDepartmentStatus` | 更新部门状态 | `GenAuthUpdateDepartmentStatusInput` | `GenAuthUpdateDepartmentStatusResult` | POST | `/api/v3/update-department-status` |
| `qoni.genauth.dataPermissions.updateDnef` | 更新树类型资源的扩展字段 | `GenAuthUpdateDnefInput` | `GenAuthUpdateDnefResult` | POST | `/api/v3/update-dnef` |
| `qoni.genauth.dynamicGroups.update` | 编辑动态分组 | `GenAuthUpdateDynamicGroupInput` | `GenAuthUpdateDynamicGroupResult` | POST | `/api/v3/update-dynamic-group` |
| `qoni.genauth.email.updateEmailTemplate` | 修改邮件模版 | `GenAuthUpdateEmailTemplateInput` | `GenAuthUpdateEmailTemplateResult` | POST | `/api/v3/update-email-template` |
| `qoni.genauth.identityProviders.update` | 更新身份源配置 | `GenAuthUpdateExtIdpInput` | `GenAuthUpdateExtIdpResult` | POST | `/api/v3/update-ext-idp` |
| `qoni.genauth.identityProviders.updateConnection` | 更新身份源连接 | `GenAuthUpdateExtIdpConnInput` | `GenAuthUpdateExtIdpConnResult` | POST | `/api/v3/update-ext-idp-conn` |
| `qoni.genauth.metadata.updateField` | 更新数据对象的字段 | `GenAuthUpdateFieldInput` | `GenAuthUpdateFieldResult` | POST | `/api/v3/metadata/update-field` |
| `qoni.genauth.security.updateGlobalMfaSettings` | 修改全局多因素认证配置 | `GenAuthUpdateGlobalMfaSettingsInput` | `GenAuthUpdateGlobalMfaSettingsResult` | POST | `/api/v3/update-global-mfa-settings` |
| `qoni.genauth.groups.update` | 修改分组 | `GenAuthUpdateGroupInput` | `GenAuthUpdateGroupResult` | POST | `/api/v3/update-group` |
| `qoni.genauth.invitations.updateInvitationPolicy` | 更新邀请策略 | `GenAuthUpdateInvitationPolicyInput` | `GenAuthUpdateInvitationPolicyResult` | POST | `/api/v3/update-invitation-policy` |
| `qoni.genauth.invitations.updateInvitationRoster` | 更新邀请名单 | `GenAuthUpdateInvitationRosterInput` | `GenAuthUpdateInvitationRosterResult` | POST | `/api/v3/update-invitation-roster` |
| `qoni.genauth.invitations.updateInviteEmailTemplate` | 获取邀请策略邮件模板 | `GenAuthUpdateInviteEmailTemplateInput` | `GenAuthUpdateInviteEmailTemplateResult` | POST | `/api/v3/update-invitation-policy-email-template` |
| `qoni.genauth.ldap.updateLdapConfigInfo` | 更新 LDAP server 配置信息 | `GenAuthUpdateLdapConfigInfoInput` | `GenAuthUpdateLdapConfigInfoResult` | POST | `/api/v3/update-ldap-server-config` |
| `qoni.genauth.applications.updateLoginPageConfig` | 更新应用登录页配置 | `GenAuthUpdateLoginPageConfigInput` | `GenAuthUpdateLoginPageConfigResult` | POST | `/api/v3/update-login-page-config` |
| `qoni.genauth.metadata.updateModel` | 更新数据对象 | `GenAuthUpdateModelInput` | `GenAuthUpdateModelResult` | POST | `/api/v3/metadata/update-model` |
| `qoni.genauth.tenants.updateMultipleTenantAdmin` | 更新多租户管理员用户 | `GenAuthUpdateMultipleTenantAdminInput` | `GenAuthUpdateMultipleTenantAdminResult` | POST | `/api/v3/update-multiple-tenant-admin` |
| `qoni.genauth.namespaces.update` | 修改权限分组信息 | `GenAuthUpdateNamespaceInput` | `GenAuthUpdateNamespaceResult` | POST | `/api/v3/update-namespace` |
| `qoni.genauth.departments.updateNodeStatus` | 更新部门状态 | `GenAuthUpdateNodeStatusInput` | `GenAuthUpdateNodeStatusResult` | POST | `/api/v3/update-department-status` |
| `qoni.genauth.metadata.updateOperate` | 更新操作管理 | `GenAuthUpdateOperateInput` | `GenAuthUpdateOperateResult` | POST | `/api/v3/metadata/update-operate` |
| `qoni.genauth.organizations.update` | 修改组织机构 | `GenAuthUpdateOrganizationInput` | `GenAuthUpdateOrganizationResult` | POST | `/api/v3/update-organization` |
| `qoni.genauth.organizations.updateOrganizationStatus` | 更新组织机构状态 | `GenAuthUpdateOrganizationStatusInput` | `GenAuthUpdateOrganizationStatusResult` | POST | `/api/v3/update-organization-status` |
| `qoni.genauth.dataPermissions.updatePermissionNamespace` | 修改权限空间 | `GenAuthUpdatePermissionNamespaceInput` | `GenAuthUpdatePermissionNamespaceResult` | POST | `/api/v3/update-permission-namespace` |
| `qoni.genauth.pipelines.update` | 修改 Pipeline 函数 | `GenAuthUpdatePipelineFunctionInput` | `GenAuthUpdatePipelineFunctionResult` | POST | `/api/v3/update-pipeline-function` |
| `qoni.genauth.pipelines.updatePipelineOrder` | 修改 Pipeline 函数顺序 | `GenAuthUpdatePipelineOrderInput` | `GenAuthUpdatePipelineOrderResult` | POST | `/api/v3/update-pipeline-order` |
| `qoni.genauth.positions.update` | 更新岗位信息 | `GenAuthUpdatePostInput` | `GenAuthUpdatePostResult` | POST | `/api/v3/update-post` |
| `qoni.genauth.publicAccounts.update` | 修改公共账号资料 | `GenAuthUpdatePublicAccountInput` | `GenAuthUpdatePublicAccountResult` | POST | `/api/v3/update-public-account` |
| `qoni.genauth.publicAccounts.updatePublicAccountBatch` | 批量修改公共账号资料 | `GenAuthUpdatePublicAccountBatchInput` | `GenAuthUpdatePublicAccountBatchResult` | POST | `/api/v3/update-public-account-batch` |
| `qoni.genauth.invitations.updateRegisterExtendsFields` | 更新策略流程配置补充信息 | `GenAuthUpdateRegisterExtendsFieldsInput` | `GenAuthUpdateRegisterExtendsFieldsResult` | POST | `/api/v3/update-invitation-policy-extends-fields` |
| `qoni.genauth.resources.update` | 修改资源 | `GenAuthUpdateResourceInput` | `GenAuthUpdateResourceResult` | POST | `/api/v3/update-resource` |
| `qoni.genauth.roles.update` | 修改角色 | `GenAuthUpdateRoleInput` | `GenAuthUpdateRoleResult` | POST | `/api/v3/update-role` |
| `qoni.genauth.metadata.updateRow` | 更新行 | `GenAuthUpdateRowInput` | `GenAuthUpdateRowResult` | POST | `/api/v3/metadata/update-row` |
| `qoni.genauth.deviceRules.updateRuleSettings` | 更新设备互斥规则配置 | `GenAuthUpdateRuleSettingsInput` | `GenAuthUpdateRuleSettingsResult` | POST | `/api/v3/update-device-exclusive-rule-settings` |
| `qoni.genauth.security.update` | 修改安全配置 | `GenAuthUpdateSecuritySettingsInput` | `GenAuthUpdateSecuritySettingsResult` | POST | `/api/v3/update-security-settings` |
| `qoni.genauth.sync.update` | 修改同步任务 | `GenAuthUpdateSyncTaskInput` | `GenAuthUpdateSyncTaskResult` | POST | `/api/v3/update-sync-task` |
| `qoni.genauth.tenants.update` | 更新租户数据 | `GenAuthUpdateTenantInput` | `GenAuthUpdateTenantResult` | POST | `/api/v3/update-tenant` |
| `qoni.genauth.tenants.updateTenantCooperator` | 更新协调管理员 | `GenAuthUpdateTenantCooperatorInput` | `GenAuthUpdateTenantCooperatorResult` | POST | `/api/v3/update-tenant-cooperator` |
| `qoni.genauth.tenants.updateTenantEnterpriseCertification` | 修改租户企业认证 | `GenAuthUpdateTenantEnterpriseCertificationInput` | `GenAuthUpdateTenantEnterpriseCertificationResult` | POST | `/api/v3/update-tenant-enterprise-certification` |
| `qoni.genauth.applications.updateTenantQrCodeState` | 更新租户控制台扫码登录状态 | `GenAuthUpdateTenantQrCodeStateInput` | `GenAuthUpdateTenantQrCodeStateResult` | POST | `/api/v3/update-userpool-tenant-appqrcode-state` |
| `qoni.genauth.tenants.updateTenantUser` | 更新租户成员 | `GenAuthUpdateTenantUserInput` | `GenAuthUpdateTenantUserResult` | POST | `/api/v3/update-tenant-user` |
| `qoni.genauth.invitations.updateUniversalInvitation` | 更新通用邀请配置 | `GenAuthUpdateUniversalInvitationInput` | `GenAuthUpdateUniversalInvitationResult` | POST | `/api/v3/update-universal-invitation-settings` |
| `qoni.genauth.users.update` | 修改用户资料 | `GenAuthUpdateUserInput` | `GenAuthUpdateUserResult` | POST | `/api/v3/update-user` |
| `qoni.genauth.users.updateUserBatch` | 批量修改用户资料 | `GenAuthUpdateUserBatchInput` | `GenAuthUpdateUserBatchResult` | POST | `/api/v3/update-user-batch` |
| `qoni.genauth.applications.updateUserpoolTenantAppqrcodeState` | 更新租户控制台扫码登录状态 | `GenAuthUpdateUserpoolTenantAppqrcodeStateInput` | `GenAuthUpdateUserpoolTenantAppqrcodeStateResult` | POST | `/api/v3/update-userpool-tenant-appqrcode-state` |
| `qoni.genauth.applications.updateUserpoolTenantConfig` | 更新用户池租户配置信息 | `GenAuthUpdateUserpoolTenantConfigInput` | `GenAuthUpdateUserpoolTenantConfigResult` | POST | `/api/v3/update-userpool-tenant-config` |
| `qoni.genauth.applications.updateUserPoolTenantConfig` | 更新用户池租户配置信息 | `GenAuthUpdateUserPoolTenantConfigInput` | `GenAuthUpdateUserPoolTenantConfigResult` | POST | `/api/v3/update-userpool-tenant-config` |
| `qoni.genauth.webhooks.update` | 修改 Webhook 配置 | `GenAuthUpdateWebhookInput` | `GenAuthUpdateWebhookResult` | POST | `/api/v3/update-webhook` |
| `qoni.genauth.positions.userConnectionPost` | 用户关联岗位 | `GenAuthUserConnectionPostInput` | `GenAuthUserConnectionPostResult` | POST | `/api/v3/user-connection-post` |
| `qoni.genauth.users.userFieldDecrypt` | 用户属性解密 | `GenAuthUserFieldDecryptInput` | `GenAuthUserFieldDecryptResult` | POST | `/api/v3/users/field/decrypt` |
| `qoni.genauth.applications.userpollTenantConfig` | 获取用户池租户配置信息 | `GenAuthUserpollTenantConfigInput` | `GenAuthUserpollTenantConfigResult` | GET | `/api/v3/userpool-tenant-config` |
| `qoni.genauth.applications.userpoolTenantConfig` | 获取用户池租户配置信息 | `GenAuthUserpoolTenantConfigInput` | `GenAuthUserpoolTenantConfigResult` | GET | `/api/v3/userpool-tenant-config` |
| `qoni.genauth.users.usersFieldDecrypt` | 用户属性解密 | `GenAuthUsersFieldDecryptInput` | `GenAuthUsersFieldDecryptResult` | POST | `/api/v3/users/field/decrypt` |
| `qoni.genauth.events.verifyEvent` | 推送自定义事件 | `GenAuthVerifyEventInput` | `GenAuthVerifyEventResult` | POST | `/api/v3/pub-event` |
