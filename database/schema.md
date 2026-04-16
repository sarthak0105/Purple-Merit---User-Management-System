# Database Schema — Purple Merit

## Database: `purple-merit` (MongoDB Atlas)

---

## Collection: `permissions`

```
permissions
├── _id          ObjectId (auto)
├── name         String, required, unique, lowercase
│                Values: view_users | create_user | edit_user | delete_user |
│                        view_roles | create_role | edit_role | delete_role |
│                        view_dashboard | view_stats | view_settings | edit_settings
├── description  String, required
├── category     String, enum: [users, roles, dashboard, settings]
├── createdAt    Date (auto)
└── updatedAt    Date (auto)
```

---

## Collection: `roles`

```
roles
├── _id          ObjectId (auto)
├── name         String, required, unique, lowercase
│                Default values: admin | manager | user
├── description  String, required
├── permissions  [ObjectId] → ref: permissions
├── createdAt    Date (auto)
└── updatedAt    Date (auto)
```

**Virtual field:** `userCount` — computed by counting users with this role

---

## Collection: `users`

```
users
├── _id          ObjectId (auto)
├── name         String, required, min:2, max:50
├── email        String, required, unique, lowercase, validated
├── password     String, required, min:6, bcrypt hashed (select: false)
├── role         ObjectId → ref: roles, required
├── status       String, enum: [active, inactive, suspended], default: active
├── createdAt    Date (auto)
└── updatedAt    Date (auto)
```

**Note:** `password` field has `select: false` — never returned in API responses

---

## Indexes

```
permissions: { name: 1 }  unique
roles:       { name: 1 }  unique
users:       { email: 1 } unique
```

---

## Relationships

```
users.role      → roles._id       (Many-to-One)
roles.permissions → permissions._id (Many-to-Many)
```

---

## Seed Data

Run `npm run seed` in the `backend/` directory to populate:

### Permissions (12 total)

| name | category |
|------|----------|
| view_users | users |
| create_user | users |
| edit_user | users |
| delete_user | users |
| view_roles | roles |
| create_role | roles |
| edit_role | roles |
| delete_role | roles |
| view_dashboard | dashboard |
| view_stats | dashboard |
| view_settings | settings |
| edit_settings | settings |

### Roles (3 total)

| name | permissions |
|------|-------------|
| admin | All 12 |
| manager | view_users, edit_user, view_roles, view_dashboard, view_stats |
| user | view_dashboard |

### Users (3 total)

| name | email | password | role |
|------|-------|----------|------|
| John Admin | admin@example.com | password123 | admin |
| Jane Manager | manager@example.com | password123 | manager |
| Bob User | user@example.com | password123 | user |
