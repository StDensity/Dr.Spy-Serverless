CREATE TABLE activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Unique entry ID
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,  -- When data was collected
    active_players INTEGER  -- Number of active players at the time
);

-- Create an index on the timestamp column for faster queries
CREATE INDEX idx_timestamp ON activity (timestamp);
