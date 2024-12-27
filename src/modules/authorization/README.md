# Authorization Module

## Overview

The Authorization Module is responsible for handling access control and permissions within the application. It ensures that users have the appropriate permissions to perform actions on various resources by leveraging policies and guards.

## Components

### 1. PolicyHandlerStorage

The `PolicyHandlerStorage` class is used to store and retrieve policy handlers. It maintains a collection of handlers using a `Map` where the key is the handler class type and the value is the handler instance.

#### Example Usage

```typescript
const storage = new PolicyHandlerStorage();
storage.add(SomePolicyHandlerClass, somePolicyHandlerInstance);
const handler = storage.get(SomePolicyHandlerClass);
```

### 2. PoliciesGuard

The `PoliciesGuard` class implements the `CanActivate` interface to determine if a request should be allowed based on the policies defined for the route. It retrieves policy handlers using the `PolicyHandlerStorage` and executes them.

#### Example Usage

```typescript
@Injectable()
export class SomeGuardedService {
  @UseGuards(PoliciesGuard)
  someMethod() {
    // method implementation
  }
}
```

### 3. Role Guards

Role guards are used to check if a user has the required role to access a resource. There are several role guards implemented:

- **OwnerRoleGuard**: Checks if the user is an owner of the team.
- **AdminRoleGuard**: Checks if the user is an admin or owner of the team.
- **AuthTeamGuard**: Checks if the user is a member of the team.

#### Example Usage

```typescript
@UseGuards(OwnerRoleGuard)
someOwnerProtectedMethod() {
  // method implementation
}
```

### 4. Policy Decorator

The `Policies` decorator is used to attach policy handlers to routes. It uses metadata to store the handlers which can then be retrieved by the `PoliciesGuard`.

#### Example Usage

```typescript
@Policies(SomePolicyHandlerClass)
someProtectedMethod() {
  // method implementation
}
```

### 5. CaslAbilityFactory

The `CaslAbilityFactory` class is responsible for creating abilities for users based on their permissions. It uses the `@casl/ability` library to define and build abilities.

#### Example Usage

```typescript
const abilityFactory = new CaslAbilityFactory(permissions);
const userAbility = abilityFactory.createForUser();
```

### 6. AuthorizationService

The `AuthorizationService` class provides methods to check if a user is allowed to perform an action on a subject. It uses the `CaslAbilityFactory` to create abilities and check permissions.

#### Example Usage

```typescript
@Injectable()
export class SomeService {
  constructor(private readonly authorizationService: AuthorizationService) {}

  someMethod(user: User, action: AppAction, subject: AppSubjects) {
    if (this.authorizationService.isAllowed(user, action, subject)) {
      // perform action
    } else {
      // handle unauthorized access
    }
  }
}
```

## Summary

The Authorization Module provides a robust framework for handling access control and permissions within the application. By using policies, guards, and role-based checks, it ensures that users have the appropriate permissions to perform actions on various resources. The module is highly configurable and can be extended to meet the specific needs of the application.