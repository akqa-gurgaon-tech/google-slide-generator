# Theme Database Integration Troubleshooting

## Issue Resolution Guide

### 1. ✅ **Fixed: API URL Issue**

**Problem**: Frontend was making API calls to `localhost:5173` instead of `localhost:5000`
**Solution**: Updated all API calls in ThemeManager.js to use `http://localhost:5000`

### 2. 🔍 **Next Steps to Verify Setup**

#### Step 1: Verify Backend Server is Running
Open terminal and make sure your backend server is running:
```bash
cd server
npm start
```
You should see: `🚀 Server running at http://localhost:5000`

#### Step 2: Verify Database Table Exists
Make sure you've created the `theme_schema` table in your NeonDB:

1. Connect to your NeonDB database
2. Run the SQL script from `database/create_theme_schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS theme_schema (
    id SERIAL PRIMARY KEY,
    theme_id TEXT UNIQUE NOT NULL,
    theme_desc TEXT,
    schema_str JSONB NOT NULL,
    created_by TEXT NOT NULL REFERENCES user_tokens(user_id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_theme_schema_theme_id ON theme_schema(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_schema_created_by ON theme_schema(created_by);
CREATE INDEX IF NOT EXISTS idx_theme_schema_created_at ON theme_schema(created_at DESC);
```

#### Step 3: Test Backend Connectivity
Open browser console and run:
```javascript
// Test backend connection
themeManager.testBackendConnection().then(result => console.log(result));
```

#### Step 4: Test Theme Debug Endpoint
Visit: `http://localhost:5000/api/themes/debug`

Expected responses:
- **If not logged in**: `{ "sessionValid": false, "needsLogin": true }`
- **If logged in but table missing**: `{ "error": "Theme debug failed", "needsTableCreation": true }`
- **If everything works**: `{ "sessionValid": true, "themeCount": 0, "themes": [] }`

### 3. 🐛 **Common Issues & Solutions**

#### Issue A: "404 Not Found" on API calls
**Cause**: Backend server not running or wrong URL
**Solution**: 
1. Start backend server: `cd server && npm start`
2. Verify URL is `http://localhost:5000/api/themes`

#### Issue B: "Authentication required" error
**Cause**: User not logged in or session expired
**Solution**: 
1. Make sure you're logged in to the application
2. Check session by visiting: `http://localhost:5000/auth/status`

#### Issue C: "relation theme_schema does not exist"
**Cause**: Database table not created
**Solution**: 
1. Connect to your NeonDB
2. Run the SQL script from `database/create_theme_schema.sql`

#### Issue D: CORS errors
**Cause**: CORS not properly configured
**Solution**: Backend already has CORS configured for `http://localhost:5173`

#### Issue E: Network errors
**Cause**: Connection issues between frontend and backend
**Solution**: 
1. Verify both servers are running
2. Check firewall/antivirus blocking connections
3. Try accessing `http://localhost:5000/auth/status` directly in browser

### 4. 🧪 **Testing the Complete Flow**

Once everything is set up, test the complete theme flow:

1. **Login** to the application
2. **Go to Presentations page** and click "🎨 Themes"
3. **Create a new theme** in the Theme Dashboard
4. **Check browser console** for any errors
5. **Verify in database** that the theme was saved

### 5. 📊 **Debug Commands**

#### Frontend Console Commands:
```javascript
// Test backend connection
await themeManager.testBackendConnection()

// Test theme loading
await themeManager.loadCustomThemes()

// Test getting all themes
await themeManager.getAllAvailableThemes()

// Check current session
fetch('http://localhost:5000/auth/status', {credentials: 'include'}).then(r => r.json()).then(console.log)
```

#### Backend Debug Endpoints:
- `GET http://localhost:5000/auth/status` - Check authentication
- `GET http://localhost:5000/api/themes/debug` - Debug theme functionality
- `GET http://localhost:5000/api/themes` - Get user themes (requires login)

### 6. 🔧 **Database Verification Queries**

Connect to your NeonDB and run:

```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'theme_schema';

-- Check table structure
\d theme_schema

-- Check if any themes exist
SELECT COUNT(*) FROM theme_schema;

-- Check themes for specific user (replace 'your_user_id')
SELECT * FROM theme_schema WHERE created_by = 'your_user_id';
```

### 7. ⚡ **Quick Fix Commands**

If you're still getting 404 errors, run these in browser console:

```javascript
// Force reload themes with debugging
themeManager.isLoading = false;
themeManager.customThemes = {};
await themeManager.loadCustomThemes();

// Check what's in themeManager
console.log('Active theme:', themeManager.activeTheme);
console.log('Custom themes:', themeManager.customThemes);
console.log('Is loading:', themeManager.isLoading);
```

### 8. 📝 **Next Steps After Fix**

1. Try creating a theme from the Theme Dashboard
2. Verify it appears in the theme list
3. Test editing and deleting themes
4. Check that themes persist after browser refresh

---

## Need Help?

If you're still having issues:

1. **Check browser console** for detailed error messages
2. **Check backend console** for server-side errors  
3. **Verify database connection** and table creation
4. **Test the debug endpoints** mentioned above

The most common issue is the database table not being created, so start there!
