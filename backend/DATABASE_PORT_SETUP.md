# Database Port Configuration

## Standard Setup (Port 5432)
The default configuration uses PostgreSQL on port 5432:
```
DATABASE_URL=postgresql+psycopg2://lexiconnect:lexiconnect@localhost:5432/lexiconnect
```

## Windows WSL Port Conflict (Port 5433)
If you're running Windows with WSL and port 5432 is occupied, you may need to use port 5433:

1. **Update your .env file:**
   ```
   DATABASE_URL=postgresql+psycopg2://lexiconnect:lexiconnect@localhost:5433/lexiconnect
   ```

2. **Start PostgreSQL on port 5433:**
   ```powershell
   docker compose up -d db --port 5433
   ```

3. **Verify connection:**
   - Check backend startup logs for database connection
   - Look for "✅ USING DATABASE:" message with masked password

## Troubleshooting
- If connection fails, check if PostgreSQL is running on the expected port
- Use `docker ps` to verify container status and port mapping
- Ensure .env file exists and matches your PostgreSQL configuration
