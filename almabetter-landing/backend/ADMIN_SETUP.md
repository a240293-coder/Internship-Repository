# Admin Management Setup

## Database Changes

A new `admins` table has been created to separate regular admins from the super admin.

### For New Installations:
Run the main schema file:
```bash
mysql -u root -p your_database < backend/schema.sql
```

### For Existing Databases:
Run the migration script:
```bash
mysql -u root -p your_database < backend/migration_admins_table.sql
```

## Table Structure

### `super_admins` table
- Contains ONLY the super admin account
- Super admin credentials are never exposed via API
- Super admin manages their own credentials via backend scripts

### `admins` table  
- Contains all regular admin accounts
- Created by super admin via the admin panel
- Can be viewed and deleted by super admin

## Features

✅ Super admin is completely hidden from the admin list
✅ Regular admins stored in separate table for better organization
✅ Super admin can create/delete regular admins
✅ All admin actions are logged in `admin_activity_logs`
✅ Passwords are hashed with bcrypt

## API Endpoints

- `POST /api/admin/create-admin` - Create new admin
- `GET /api/admin/admins` - Get all regular admins
- `DELETE /api/admin/admins/:id` - Delete admin by ID
