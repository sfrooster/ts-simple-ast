---
title: Namespaces
---

## Namespaces

Namespaces (or modules) can be retrieved from source files or other namespaces:

```typescript
const namespaces = sourceFile.getNamespaces();
const namespace1 = sourceFile.getNamespace("Namespace1");
const firstNamespaceWithClass = sourceFile.getNamespace(n => n.getClasses().length > 0);
```

Most of the information you can get about namespaces is covered in other sections.

Note: Although it's a compile error, you can also retreive namespaces from function bodies.

### Add/Insert

You can add or insert namespaces to a source file or namespace by calling `addNamespace()`, `addNamespaces()`, `insertNamespace()`, or `insertNamespaces()`.

```typescript
const namespaceDeclaration = sourceFile.addNamespace({
    name: "NamespaceName"
});
```

### Module or namespace?

Check for the keyword you want:

```typescript
namespaceDeclaration.hasModuleKeyword(); // returns: boolean
namespaceDeclaration.hasNamespaceKeyword(); // returns: boolean
```

Or set one or the other:

```typescript
namespaceDeclaration.setHasModuleKeyword(); // optionally pass in a boolean
namespaceDeclaration.setHasNamespaceKeyword();
```

Or get the keyword:

```typescript
namespaceDeclaration.getDeclarationTypeKeyword(); // returns: the module or namespace keyword
```
