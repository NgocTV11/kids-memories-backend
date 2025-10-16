# 🚀 Hướng Dẫn Khởi Động Database - Kids Memories

## ✅ Đã Chuẩn Bị

- ✅ `docker-compose.yml` - Cấu hình PostgreSQL 16 + Redis 7
- ✅ `start-docker.sh` - Script tự động khởi động
- ✅ `stop-docker.sh` - Script dừng containers
- ✅ `.env` - Đã cập nhật connection string

---

## 🎯 Cách Nhanh Nhất (Khuyến Nghị)

### 1️⃣ Mở WSL Terminal
```bash
# Trong PowerShell, gõ:
wsl

# Hoặc mở Ubuntu từ Start Menu
```

### 2️⃣ Chạy Script Tự Động
```bash
cd /mnt/c/Users/NgocTV11/Desktop/AI_pp/kids-memories/source/backend/kids-memories-api

# Cho phép thực thi script
chmod +x start-docker.sh stop-docker.sh

# Khởi động database
./start-docker.sh
```

### 3️⃣ Quay Lại PowerShell và Chạy Migration
```powershell
# Trong PowerShell (không phải WSL)
cd c:\Users\NgocTV11\Desktop\AI_pp\kids-memories\source\backend\kids-memories-api

# Chạy migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Xem database
npx prisma studio

# Khởi động backend
npm run start:dev
```

**✅ Done! Backend chạy tại http://localhost:3001**

---

## 📋 Cách Thủ Công (Nếu script không hoạt động)

### Trong WSL:
```bash
# 1. Navigate đến thư mục
cd /mnt/c/Users/NgocTV11/Desktop/AI_pp/kids-memories/source/backend/kids-memories-api

# 2. Kiểm tra Docker
docker --version
docker ps

# 3. Khởi động containers
docker compose up -d

# 4. Kiểm tra containers đang chạy
docker ps

# 5. Xem logs (nếu cần)
docker logs kids-memories-db
docker logs kids-memories-redis
```

---

## 🔗 Thông Tin Kết Nối

### PostgreSQL
- **Host**: `localhost`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: `postgres123`
- **Database**: `kids_memories`

**Connection String**:
```
postgresql://postgres:postgres123@localhost:5432/kids_memories?schema=public
```

### Redis
- **Host**: `localhost`
- **Port**: `6379`
- **No password** (development only)

---

## 🛠️ Các Lệnh Docker Hữu Ích

### Xem containers đang chạy:
```bash
docker ps
```

### Xem logs real-time:
```bash
# All services
docker compose logs -f

# PostgreSQL only
docker logs -f kids-memories-db

# Redis only
docker logs -f kids-memories-redis
```

### Dừng containers:
```bash
# Cách 1: Dùng script
./stop-docker.sh

# Cách 2: Manual
docker compose down
```

### Khởi động lại:
```bash
docker compose restart
```

### Xóa tất cả (bao gồm data):
```bash
docker compose down -v
```

### Vào PostgreSQL shell:
```bash
docker exec -it kids-memories-db psql -U postgres -d kids_memories
```

### Vào Redis shell:
```bash
docker exec -it kids-memories-redis redis-cli
```

---

## 🗄️ Kết Nối với MySQL Workbench / DBeaver

Bạn có thể dùng MySQL Workbench (hỗ trợ PostgreSQL) hoặc DBeaver để quản lý database:

### DBeaver (Khuyến nghị):
1. Download: https://dbeaver.io/download/
2. New Connection → PostgreSQL
3. Nhập thông tin:
   - Host: `localhost`
   - Port: `5432`
   - Database: `kids_memories`
   - Username: `postgres`
   - Password: `postgres123`

---

## 🐛 Troubleshooting

### ❌ "Cannot connect to Docker daemon"
**Giải pháp**: Khởi động Docker Desktop
- Mở Docker Desktop trên Windows
- Đợi icon Docker Desktop ở system tray chuyển sang màu xanh
- Settings → Resources → WSL Integration → Enable Ubuntu
- Thử lại

### ❌ "docker: command not found" trong WSL
**Giải pháp**: 
```bash
# Kiểm tra Docker Desktop WSL integration
# Docker Desktop → Settings → Resources → WSL Integration
# Enable cho distro Ubuntu/WSL của bạn
```

### ❌ Port 5432 already in use
**Giải pháp**: Dừng MySQL/PostgreSQL khác đang chạy
```powershell
# Trong PowerShell
Get-Service | Where-Object {$_.Status -eq "Running"} | Where-Object {$_.Name -like "*sql*"}

# Dừng service nếu cần
Stop-Service MySQL*
```

### ❌ "Error response from daemon: Conflict"
**Giải pháp**: Containers đã tồn tại
```bash
# Xóa containers cũ
docker rm -f kids-memories-db kids-memories-redis

# Khởi động lại
./start-docker.sh
```

---

## 📊 Kiểm Tra Trạng Thái

### Containers có chạy không?
```bash
docker ps --filter "name=kids-memories"
```

Kết quả mong đợi:
```
CONTAINER ID   IMAGE                COMMAND                  STATUS         PORTS
xxxxxxxxxxxx   postgres:16-alpine   "docker-entrypoint.s…"   Up 2 minutes   0.0.0.0:5432->5432/tcp
xxxxxxxxxxxx   redis:7-alpine       "docker-entrypoint.s…"   Up 2 minutes   0.0.0.0:6379->6379/tcp
```

### Database có hoạt động không?
```bash
# Test PostgreSQL
docker exec kids-memories-db pg_isready -U postgres

# Test Redis
docker exec kids-memories-redis redis-cli ping
```

---

## 🔄 Workflow Hàng Ngày

### Sáng (Bắt đầu làm việc):
```bash
# Trong WSL
cd /mnt/c/Users/NgocTV11/Desktop/AI_pp/kids-memories/source/backend/kids-memories-api
./start-docker.sh
```

### Tối (Kết thúc):
```bash
# Không bắt buộc (containers tự chạy)
# Nhưng nếu muốn dừng để tiết kiệm tài nguyên:
./stop-docker.sh
```

---

## 📝 Next Steps

Sau khi Docker containers đã chạy:

1. ✅ **Chạy Migration** (PowerShell):
   ```powershell
   npx prisma migrate dev --name init
   ```

2. ✅ **Generate Prisma Client**:
   ```powershell
   npx prisma generate
   ```

3. ✅ **Khởi động Backend**:
   ```powershell
   npm run start:dev
   ```

4. ✅ **Khởi động Frontend** (Terminal mới):
   ```powershell
   cd c:\Users\NgocTV11\Desktop\AI_pp\kids-memories\source\frontend\kids-memories-web
   npm run dev
   ```

---

## 🎉 Kết Quả

- **Backend**: http://localhost:3001/api/v1
- **Frontend**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (khi chạy `npx prisma studio`)

---

## 💡 Tips

1. **Auto-start**: Containers có `restart: always`, sẽ tự động khởi động khi restart máy
2. **Data Persistence**: Data được lưu trong Docker volumes, không bị mất khi dừng containers
3. **WSL Path**: Thư mục Windows `C:\` được mount tại `/mnt/c/` trong WSL
4. **Prisma Studio**: Công cụ GUI tốt nhất để xem và edit database

---

Nếu gặp vấn đề, hãy cho tôi biết output của:
```bash
docker ps
docker compose logs
```
