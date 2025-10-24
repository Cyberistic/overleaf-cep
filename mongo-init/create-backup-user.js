db = db.getSiblingDB('admin');
db.createUser({
  user: "backup",
  pwd: process.env.SERVICE_PASSWORD_BACKUP,
  roles: [
    { role: "readWrite", db: "sharelatex" },
    { role: "backup" }
  ]
});
print("✅ Backup user created successfully");
