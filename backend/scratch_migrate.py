import sqlite3

conn = sqlite3.connect('roamlocal.db')
cursor = conn.cursor()

# Check DDL
cursor.execute("SELECT sql FROM sqlite_master WHERE name='travel_groups'")
print("Existing schema:", cursor.fetchone()[0])

# Check if custom_destination column exists
cursor.execute("PRAGMA table_info(travel_groups)")
columns = [col[1] for col in cursor.fetchall()]
if 'custom_destination' not in columns:
    cursor.execute("ALTER TABLE travel_groups ADD COLUMN custom_destination TEXT")
    conn.commit()
    print("Added custom_destination column successfully!")
else:
    print("custom_destination column already exists.")

conn.close()
