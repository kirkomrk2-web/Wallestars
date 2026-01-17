---
name: wallestars-database-ops
description: Database operations for Wallestars using Supabase, PostgreSQL, and Redis. Use when managing database connections, performing migrations, executing queries, handling caching, or setting up database backups and replication.
---

# Wallestars Database Operations

Comprehensive database management for Supabase (PostgreSQL), Redis caching, and data operations.

## Database Stack

### Primary: Supabase (PostgreSQL)
- Hosted PostgreSQL with REST API
- Real-time subscriptions
- Row-level security (RLS)
- Built-in authentication

### Caching: Redis
- In-memory data store
- Session management
- Rate limiting
- Job queues

### ORM: SQLAlchemy + Supabase Client

## Supabase Operations

### Connection Setup

```python
from supabase import create_client, Client

url = "https://your-project.supabase.co"
key = "your-anon-key"
supabase: Client = create_client(url, key)
```

### Basic CRUD

```python
# Create
data = supabase.table('users').insert({
    "email": "user@example.com",
    "name": "John Doe"
}).execute()

# Read
users = supabase.table('users').select("*").execute()

# Read with filter
user = supabase.table('users').select("*").eq('email', 'user@example.com').execute()

# Update
supabase.table('users').update({
    "name": "Jane Doe"
}).eq('id', user_id).execute()

# Delete
supabase.table('users').delete().eq('id', user_id).execute()
```

### Advanced Queries

```python
# Complex filtering
results = supabase.table('posts') \
    .select("*") \
    .gt('created_at', '2024-01-01') \
    .eq('status', 'published') \
    .order('created_at', desc=True) \
    .limit(10) \
    .execute()

# Joins
results = supabase.table('posts') \
    .select("*, users(name, email)") \
    .execute()

# Full-text search
results = supabase.table('posts') \
    .select("*") \
    .text_search('title', 'wallestars') \
    .execute()

# Pagination
page_size = 20
page = 2
results = supabase.table('posts') \
    .select("*") \
    .range((page-1)*page_size, page*page_size-1) \
    .execute()
```

### Real-time Subscriptions

```python
def on_insert(payload):
    print(f"New record: {payload['new']}")

def on_update(payload):
    print(f"Updated: {payload['new']}")

def on_delete(payload):
    print(f"Deleted: {payload['old']}")

# Subscribe to table changes
supabase.table('posts') \
    .on('INSERT', on_insert) \
    .on('UPDATE', on_update) \
    .on('DELETE', on_delete) \
    .subscribe()
```

### Row-Level Security

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own data"
ON users
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
ON users
FOR UPDATE
USING (auth.uid() = id);

-- Policy: Public read access
CREATE POLICY "Public read access"
ON posts
FOR SELECT
USING (status = 'published');
```

## PostgreSQL Direct Access

### Using psycopg2

```python
import psycopg2
from psycopg2.extras import RealDictCursor

conn = psycopg2.connect(
    host="db.your-project.supabase.co",
    database="postgres",
    user="postgres",
    password="your-password",
    port=5432
)

# Execute query
cursor = conn.cursor(cursor_factory=RealDictCursor)
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
results = cursor.fetchall()

# Transaction
try:
    cursor.execute("UPDATE accounts SET balance = balance - %s WHERE id = %s", (amount, from_id))
    cursor.execute("UPDATE accounts SET balance = balance + %s WHERE id = %s", (amount, to_id))
    conn.commit()
except Exception as e:
    conn.rollback()
    raise e
```

### Migrations

```python
from alembic import command
from alembic.config import Config

# Create migration
alembic_cfg = Config("alembic.ini")
command.revision(alembic_cfg, autogenerate=True, message="Add user table")

# Apply migrations
command.upgrade(alembic_cfg, "head")

# Rollback
command.downgrade(alembic_cfg, "-1")
```

## Redis Operations

### Connection Setup

```python
import redis

r = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True
)
```

### Caching Patterns

```python
# Simple cache
def get_user_cached(user_id):
    cache_key = f"user:{user_id}"
    
    # Try cache first
    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Fetch from database
    user = supabase.table('users').select("*").eq('id', user_id).execute()
    
    # Cache for 1 hour
    r.setex(cache_key, 3600, json.dumps(user.data[0]))
    
    return user.data[0]

# Cache invalidation
def update_user(user_id, data):
    # Update database
    supabase.table('users').update(data).eq('id', user_id).execute()
    
    # Invalidate cache
    r.delete(f"user:{user_id}")
```

### Session Management

```python
# Store session
session_id = str(uuid.uuid4())
session_data = {
    'user_id': user_id,
    'email': email,
    'created_at': datetime.now().isoformat()
}
r.setex(f"session:{session_id}", 86400, json.dumps(session_data))

# Retrieve session
session = r.get(f"session:{session_id}")
if session:
    session_data = json.loads(session)

# Delete session (logout)
r.delete(f"session:{session_id}")
```

### Rate Limiting

```python
def check_rate_limit(user_id, limit=100, window=3600):
    key = f"rate_limit:{user_id}"
    current = r.incr(key)
    
    if current == 1:
        r.expire(key, window)
    
    if current > limit:
        return False, 0
    
    ttl = r.ttl(key)
    return True, limit - current
```

### Job Queue

```python
from rq import Queue
from redis import Redis

redis_conn = Redis()
q = Queue(connection=redis_conn)

# Enqueue job
job = q.enqueue('tasks.process_upload', file_path, timeout=300)

# Check job status
if job.is_finished:
    result = job.result
elif job.is_failed:
    error = job.exc_info
```

## Database Utilities

### Backup Script

```bash
#!/bin/bash
# backup_db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgresql"
BACKUP_FILE="$BACKUP_DIR/wallestars_$DATE.sql.gz"

# Create backup
pg_dump -h db.your-project.supabase.co \
    -U postgres \
    -d postgres \
    | gzip > $BACKUP_FILE

# Upload to storage
supabase storage from public upload \
    "backups/wallestars_$DATE.sql.gz" \
    "$BACKUP_FILE"

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -name "wallestars_*.sql.gz" -mtime +30 -delete
```

### Restore Script

```bash
#!/bin/bash
# restore_db.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Restore from backup
gunzip < $BACKUP_FILE | psql -h db.your-project.supabase.co \
    -U postgres \
    -d postgres
```

### Database Health Check

```python
def check_db_health():
    health = {
        'postgresql': False,
        'redis': False,
        'supabase': False
    }
    
    # Check PostgreSQL
    try:
        conn = psycopg2.connect(...)
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        health['postgresql'] = True
    except Exception as e:
        print(f"PostgreSQL error: {e}")
    
    # Check Redis
    try:
        r.ping()
        health['redis'] = True
    except Exception as e:
        print(f"Redis error: {e}")
    
    # Check Supabase
    try:
        result = supabase.table('users').select("count").limit(1).execute()
        health['supabase'] = True
    except Exception as e:
        print(f"Supabase error: {e}")
    
    return health
```

## Performance Optimization

### Connection Pooling

```python
from psycopg2 import pool

# Create connection pool
db_pool = pool.SimpleConnectionPool(
    minconn=1,
    maxconn=10,
    host="db.your-project.supabase.co",
    database="postgres",
    user="postgres",
    password="your-password"
)

# Get connection from pool
conn = db_pool.getconn()
try:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
finally:
    db_pool.putconn(conn)
```

### Query Optimization

```python
# Bad: N+1 query problem
users = supabase.table('users').select("*").execute()
for user in users.data:
    posts = supabase.table('posts').select("*").eq('user_id', user['id']).execute()

# Good: Join query
users_with_posts = supabase.table('users').select("*, posts(*)").execute()

# Add indexes
"""
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_users_email ON users(email);
"""
```

### Caching Strategy

```python
# Multi-level caching
def get_data_cached(key):
    # Level 1: Redis
    cached = r.get(f"cache:{key}")
    if cached:
        return json.loads(cached)
    
    # Level 2: Database
    data = fetch_from_db(key)
    
    # Cache in Redis
    r.setex(f"cache:{key}", 3600, json.dumps(data))
    
    return data
```

## Best Practices

1. **Use connection pooling** for PostgreSQL
2. **Implement proper error handling** and retries
3. **Enable RLS** for security
4. **Regular backups** - daily automated backups
5. **Monitor query performance** - use EXPLAIN ANALYZE
6. **Use prepared statements** to prevent SQL injection
7. **Implement caching** for read-heavy operations
8. **Set up replication** for high availability

## Troubleshooting

**Connection Issues:**
```python
# Test connection
try:
    supabase.table('users').select("count").execute()
    print("✅ Supabase connected")
except Exception as e:
    print(f"❌ Supabase error: {e}")
```

**Slow Queries:**
```sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Redis Memory Issues:**
```bash
# Check memory usage
redis-cli INFO memory

# Clear cache
redis-cli FLUSHDB
```
