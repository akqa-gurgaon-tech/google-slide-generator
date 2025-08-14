-- Create theme_schema table for storing custom themes
-- Run this in your NeonDB database

CREATE TABLE IF NOT EXISTS theme_schema (
    id SERIAL PRIMARY KEY,
    theme_id TEXT UNIQUE NOT NULL,
    theme_desc TEXT,
    schema_str JSONB NOT NULL,
    created_by TEXT NOT NULL REFERENCES user_tokens(user_id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_theme_schema_theme_id ON theme_schema(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_schema_created_by ON theme_schema(created_by);
CREATE INDEX IF NOT EXISTS idx_theme_schema_created_at ON theme_schema(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE theme_schema IS 'Stores custom themes created by users';
COMMENT ON COLUMN theme_schema.id IS 'Auto-incrementing primary key';
COMMENT ON COLUMN theme_schema.theme_id IS 'Unique identifier for the theme (used in frontend)';
COMMENT ON COLUMN theme_schema.theme_desc IS 'Optional description of the theme';
COMMENT ON COLUMN theme_schema.schema_str IS 'JSON object containing the complete theme configuration';
COMMENT ON COLUMN theme_schema.created_by IS 'User ID who created this theme (foreign key to user_tokens)';
COMMENT ON COLUMN theme_schema.created_at IS 'Timestamp when the theme was created';
