# Database Theme Integration

## Overview

This document outlines the implementation of database persistence for custom themes in the Google Slide Generator application. Custom themes are now stored in the PostgreSQL database instead of localStorage, providing better data persistence, user isolation, and multi-device sync capabilities.

## Database Schema

### Table: `theme_schema`

```sql
CREATE TABLE theme_schema (
    id SERIAL PRIMARY KEY,
    theme_id TEXT UNIQUE NOT NULL,
    theme_desc TEXT,
    schema_str JSONB NOT NULL,
    created_by TEXT NOT NULL REFERENCES user_tokens(user_id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Field Descriptions

- **`id`**: Auto-incrementing primary key for internal database operations
- **`theme_id`**: Unique identifier used in the frontend (e.g., "custom-1234567890")
- **`theme_desc`**: Optional human-readable description of the theme
- **`schema_str`**: Complete theme configuration stored as JSONB
- **`created_by`**: Foreign key to `user_tokens.user_id` - ensures theme ownership
- **`created_at`**: Timestamp for creation tracking and ordering

### Indexes

```sql
CREATE INDEX idx_theme_schema_theme_id ON theme_schema(theme_id);
CREATE INDEX idx_theme_schema_created_by ON theme_schema(created_by);
CREATE INDEX idx_theme_schema_created_at ON theme_schema(created_at DESC);
```

## API Endpoints

### 1. Get User's Themes
```
GET /api/themes
```
**Description**: Retrieve all custom themes created by the authenticated user
**Authentication**: Required (session-based)
**Response**: 
```json
{
  "themes": [
    {
      "id": 1,
      "theme_id": "custom-1234567890",
      "theme_desc": "My Custom Theme",
      "schema_str": { /* theme object */ },
      "created_by": "user123",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Get Specific Theme
```
GET /api/themes/:themeId
```
**Description**: Retrieve a specific theme by theme_id
**Authentication**: Not required for reading
**Response**: 
```json
{
  "theme": {
    "id": 1,
    "theme_id": "custom-1234567890",
    "theme_desc": "My Custom Theme",
    "schema_str": { /* theme object */ },
    "created_by": "user123",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Create New Theme
```
POST /api/themes
```
**Description**: Create a new custom theme
**Authentication**: Required
**Request Body**:
```json
{
  "theme_id": "custom-1234567890",
  "theme_desc": "My Custom Theme",
  "schema_str": {
    "name": "My Theme",
    "description": "A beautiful custom theme",
    "colors": { /* color configuration */ },
    "typography": { /* typography configuration */ },
    "spacing": { /* spacing configuration */ },
    "effects": { /* effects configuration */ }
  }
}
```
**Response**: 
```json
{
  "message": "Theme created successfully",
  "theme": { /* created theme object */ }
}
```

### 4. Update Existing Theme
```
PUT /api/themes/:themeId
```
**Description**: Update an existing theme (only by owner)
**Authentication**: Required
**Request Body**:
```json
{
  "theme_desc": "Updated description",
  "schema_str": { /* updated theme object */ }
}
```
**Response**: 
```json
{
  "message": "Theme updated successfully",
  "theme": { /* updated theme object */ }
}
```

### 5. Delete Theme
```
DELETE /api/themes/:themeId
```
**Description**: Delete a theme (only by owner)
**Authentication**: Required
**Response**: 
```json
{
  "message": "Theme deleted successfully"
}
```

### 6. Check Theme Ownership
```
GET /api/themes/:themeId/ownership
```
**Description**: Check if the current user owns a specific theme
**Authentication**: Required
**Response**: 
```json
{
  "isOwner": true
}
```

## Backend Implementation

### Database Service Interface (`ThemeDBService`)

```typescript
interface ThemeDBService {
  createTheme(theme: Omit<CustomTheme, 'id' | 'created_at'>): Promise<CustomTheme>;
  getThemeById(themeId: string): Promise<CustomTheme | null>;
  getThemesByUser(userId: string): Promise<CustomTheme[]>;
  getAllThemes(): Promise<CustomTheme[]>;
  updateTheme(themeId: string, userId: string, updates: Partial<Pick<CustomTheme, 'theme_desc' | 'schema_str'>>): Promise<CustomTheme | null>;
  deleteTheme(themeId: string, userId: string): Promise<boolean>;
  isThemeOwner(themeId: string, userId: string): Promise<boolean>;
}
```

### CRUD Operations Implementation

The `NeonDBService` class implements all CRUD operations with:
- **User ownership validation**: Ensures users can only modify their own themes
- **JSON handling**: Automatic serialization/deserialization of theme objects
- **Error handling**: Proper error messages for various failure scenarios
- **Transaction safety**: Database operations are atomic

### Key Features

1. **User Isolation**: Each user can only access their own custom themes
2. **Ownership Validation**: Update and delete operations verify ownership
3. **Unique Constraints**: Prevents duplicate theme_id across the system
4. **JSONB Storage**: Efficient storage and querying of theme configuration
5. **Foreign Key Constraints**: Ensures data integrity with user_tokens table

## Frontend Integration

### ThemeManager Updates

The `ThemeManager` class has been updated to:
- **Load from Database**: `loadCustomThemes()` now fetches from API
- **Async Operations**: All CRUD operations are now asynchronous
- **Error Handling**: Proper error handling and user feedback
- **Fallback Support**: Graceful handling when database is unavailable

### API Integration Methods

```javascript
// Create theme
await themeManager.createCustomTheme(themeData)

// Update theme  
await themeManager.updateCustomTheme(themeId, themeData)

// Delete theme
await themeManager.deleteCustomTheme(themeId)

// Duplicate theme
await themeManager.duplicateTheme(sourceThemeId, newName)

// Load all themes
await themeManager.getAllAvailableThemes()
```

### Component Updates

All theme-related components have been updated to handle async operations:
- **ThemeDashboard**: Async theme loading, error handling
- **ThemeSelector**: Async theme operations with user feedback
- **ThemeCreator**: Async save/update operations

## Data Migration

### From localStorage to Database

For existing users with localStorage themes:
1. **One-time Migration**: Detect existing localStorage themes on first login
2. **Bulk Import**: Convert and save themes to database
3. **Cleanup**: Remove localStorage data after successful migration

### Theme Format Conversion

```javascript
// Convert database format to frontend format
convertDbThemeToTheme(dbTheme) {
  return {
    id: dbTheme.theme_id,
    name: dbTheme.schema_str.name,
    description: dbTheme.theme_desc || dbTheme.schema_str.description,
    category: 'custom',
    isDefault: false,
    isCustom: true,
    ...dbTheme.schema_str,
    dbId: dbTheme.id,
    createdBy: dbTheme.created_by,
    createdAt: dbTheme.created_at
  };
}

// Convert frontend format to database format
convertThemeToDbFormat(theme) {
  const { dbId, createdBy, createdAt, isCustom, isDefault, ...themeData } = theme;
  return {
    theme_id: theme.id,
    theme_desc: theme.description,
    schema_str: themeData
  };
}
```

## Security Considerations

### Authentication & Authorization
- **Session-based Auth**: All theme operations require valid user session
- **Ownership Validation**: Users can only modify their own themes
- **CSRF Protection**: Session-based authentication provides CSRF protection

### Data Validation
- **Input Validation**: All API endpoints validate required fields
- **SQL Injection Prevention**: Parameterized queries prevent SQL injection
- **JSON Validation**: JSONB storage with validation ensures data integrity

### Access Control
- **Read Access**: Anyone can read themes (for sharing in future)
- **Write Access**: Only theme creators can modify/delete
- **Admin Access**: Future admin endpoints for theme management

## Performance Optimizations

### Database Optimizations
- **Indexes**: Optimized queries with proper indexing
- **JSONB**: Efficient JSON storage and querying capabilities
- **Connection Pooling**: NeonDB connection pooling for scalability

### Frontend Optimizations
- **Caching**: Themes cached in memory after first load
- **Lazy Loading**: Themes loaded only when needed
- **Debounced Operations**: Prevent excessive API calls

## Error Handling

### Database Errors
- **Connection Errors**: Graceful fallback to default themes
- **Constraint Violations**: User-friendly error messages
- **Permission Errors**: Clear feedback for unauthorized operations

### Frontend Errors
- **Network Errors**: Retry mechanisms and user feedback
- **Validation Errors**: Form validation and error display
- **Loading States**: Proper loading indicators during operations

## Testing Strategy

### Unit Tests
- **Database Operations**: Test all CRUD operations
- **API Endpoints**: Test all endpoint functionality
- **Frontend Integration**: Test ThemeManager methods

### Integration Tests
- **End-to-End**: Complete theme lifecycle testing
- **User Workflows**: Test typical user scenarios
- **Error Scenarios**: Test error handling and recovery

### Performance Tests
- **Load Testing**: Test with multiple concurrent users
- **Data Volume**: Test with large numbers of themes
- **Response Times**: Ensure acceptable performance

## Future Enhancements

### Advanced Features
1. **Theme Sharing**: Public/private themes with sharing capabilities
2. **Theme Marketplace**: Community theme sharing platform
3. **Version Control**: Theme versioning and history
4. **Collaboration**: Multi-user theme editing
5. **Import/Export**: Enhanced theme portability

### Analytics & Insights
1. **Usage Tracking**: Theme usage analytics
2. **Popular Themes**: Trending themes dashboard
3. **Performance Metrics**: Theme performance monitoring

### Administration
1. **Admin Dashboard**: Theme management interface
2. **Content Moderation**: Review and approve public themes
3. **Usage Reports**: System usage and adoption metrics

---

This database integration provides a solid foundation for scalable, secure theme management while maintaining excellent user experience and data integrity.
