# Fix Sanity API Token Permissions

The sync script is connecting to Sanity but the API token doesn't have write permissions.

## Quick Fix

1. **Go to Sanity Manage**: https://sanity.io/manage
2. **Select your project**
3. **Go to API > Tokens**
4. **Delete the current token** (or create a new one)
5. **Create a new token** with these settings:
   - **Name**: "Event Sync Token" (or any name)
   - **Permissions**: **Editor** (or **Admin** for full access)
   - **Expiration**: Optional (leave blank for no expiration)

6. **Copy the new token**

7. **Update `.env.local`**:
   ```bash
   SANITY_API_TOKEN=your_new_token_here
   ```

8. **Run sync again**:
   ```bash
   npm run sync:sanity
   ```

## Token Permission Levels

- **Viewer**: Read-only (won't work for syncing)
- **Editor**: Can create, update, delete documents ✅ (Use this)
- **Admin**: Full access (also works, but more than needed)

## Verify Token Works

After updating the token, the sync should work. You should see:
```
✅ Created: Event Name
```

instead of permission errors.

