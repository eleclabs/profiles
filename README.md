mongod --dbpath ./data

npm start

frontend>
npm run dev


cd frontend

# Windows (ลบ .next folder)
rd /s /q .next

# หรือถ้าใช้ PowerShell
Remove-Item -Recurse -Force .next

# รันใหม่
npm run dev
# ระบบจัดการโปรไฟล์พร้อมระบบอนุมัติ

โปรเจคนี้เป็นระบบจัดการโปรไฟล์ผู้ใช้ที่มีระบบอนุมัติโดยผู้ดูแลระบบ พัฒนาด้วย Node.js + Express + MongoDB (Backend) และ Next.js + Bootstrap 5 (Frontend)

## โครงสร้างโปรเจค

```
profile/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Profile.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   └── profile.js
│   ├── middleware/
│   │   └── auth.js
│   ├── config/
│   │   └── database.js
│   ├── uploads/          # สำหรับเก็บไฟล์ที่อัพโหลด
│   └── server.js
├── frontend/
│   ├── pages/
│   │   ├── index.js
│   │   ├── register.js
│   │   ├── login.js
│   │   ├── profile.js
│   │   ├── dashboard.js
│   │   ├── admin/
│   │   │   └── approvals.js
│   │   └── _app.js
│   ├── components/
│   │   └── Layout.js
│   └── styles/
│       └── globals.css
```

## ฟีเจอร์หลัก

- **ระบบสมาชิก** - ลงทะเบียนและเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน
- **แยกสิทธิ์ผู้ใช้** - ผู้ใช้ทั่วไป (user) และผู้ดูแลระบบ (admin)
- **โปรไฟล์ครบถ้วน** - กรอกข้อมูลส่วนตัว ที่อยู่ บัตรประชาชน ข้อมูลติดต่อ
- **อัพโหลดรูปภาพ** - รูปโปรไฟล์และรูปบัตรประชาชน
- **ระบบอนุมัติ** - Admin ตรวจสอบและอนุมัติข้อมูลก่อนเข้าใช้งาน
- **UI สวยงาม** - ใช้ Bootstrap 5 ตามที่กำหนด

## การติดตั้งและรัน

### Backend

1. เข้าไปในโฟลเดอร์ backend
```bash
cd backend
```

2. ติดตั้ง dependencies
```bash
npm install
```

3. ตรวจสอบว่า MongoDB กำลังทำงานอยู่

4. รัน server
```bash
npm start
```
หรือใช้ nodemon สำหรับ development
```bash
npm run dev
```

Server จะทำงานที่ port 5000

### Frontend

1. เข้าไปในโฟลเดอร์ frontend
```bash
cd frontend
```

2. ติดตั้ง dependencies
```bash
npm install
```

3. รัน development server
```bash
npm run dev
```

Frontend จะทำงานที่ port 3000

## การใช้งานระบบ

### สำหรับผู้ใช้ทั่วไป

1. **สมัครสมาชิก** - ไปที่หน้า register กรอกอีเมลและรหัสผ่าน
2. **กรอกข้อมูลโปรไฟล์** - หลังสมัครสมาชิกจะถูก redirect ไปหน้า profile
3. **อัพโหลดเอกสาร** - อัพโหลดรูปบัตรประชาชนด้านหน้า/หลัง (จำเป็น)
4. **รอการอนุมัติ** - ส่งข้อมูลแล้วรอ admin อนุมัติ
5. **เข้าใช้งาน** - หลังได้รับการอนุมัติสามารถเข้าใช้งานได้

### สำหรับผู้ดูแลระบบ

1. **สร้าง Admin Account** - ต้องสร้างในฐานข้อมูลโดยตรง
```javascript
// ใน MongoDB shell
db.users.insertOne({
  email: "admin@example.com",
  password: "$2a$10$...", // ใช้ bcrypt hash
  role: "admin",
  approvalStatus: "approved",
  profileComplete: false
})
```

2. **เข้าสู่ระบบ** - ใช้บัญชี admin
3. **อนุมัติผู้ใช้** - ไปที่หน้า "อนุมัติผู้ใช้" เพื่อตรวจสอบและอนุมัติ
4. **ตรวจสอบข้อมูล** - ดูข้อมูลโปรไฟล์และเอกสารที่อัพโหลด
5. **อนุมัติ/ปฏิเสธ** - กดปุ่มอนุมัติหรือปฏิเสธผู้ใช้

## API Endpoints

### Authentication
- `POST /api/auth/register` - สมัครสมาชิก
- `POST /api/auth/login` - เข้าสู่ระบบ
- `GET /api/auth/me` - ข้อมูลผู้ใช้ปัจจุบัน

### Profile
- `POST /api/profile` - สร้าง/อัพเดทโปรไฟล์ (พร้อมอัพโหลดไฟล์)
- `GET /api/profile` - ดึงข้อมูลโปรไฟล์

### Admin
- `GET /api/admin/pending-approvals` - ดึงรายการที่รออนุมัติ
- `PUT /api/admin/approve/:userId` - อนุมัติผู้ใช้
- `PUT /api/admin/reject/:userId` - ปฏิเสธผู้ใช้

## การตั้งค่า Environment

สร้างไฟล์ `.env` ในโฟลเดอร์ backend

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/user_profile_system
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
```

## โครงสร้างฐานข้อมูล

### Users Collection
```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  approvalStatus: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  profileComplete: Boolean (default: false),
  createdAt: Date (default: Date.now)
}
```

### Profiles Collection
```javascript
{
  userId: ObjectId (ref: 'User', required, unique),
  firstName: String (required),
  lastName: String (required),
  nickName: String,
  address: {
    houseNo: String,
    village: String,
    soi: String,
    road: String,
    subDistrict: String,
    district: String,
    province: String,
    postalCode: String
  },
  idCardNumber: String (unique, sparse),
  age: Number,
  birthDate: Date,
  gender: String (enum: ['male', 'female', 'other']),
  nationality: String,
  bloodType: String (enum: ['A', 'B', 'AB', 'O']),
  weight: Number,
  height: Number,
  phoneNumber: String,
  socialMedia: {
    facebook: String,
    line: String,
    instagram: String,
    twitter: String,
    tiktok: String
  },
  lifestyle: String,
  hobbies: [String],
  idCardImages: {
    front: String, // path to image
    back: String   // path to image
  },
  profileImage: String,
  isApproved: Boolean (default: false),
  approvedBy: ObjectId (ref: 'User'),
  approvedAt: Date,
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

## หมายเหตุ

- ระบบนี้ใช้ Bootstrap 5 สำหรับ styling ไม่ต้องเขียน CSS เพิ่มเติม
- ไฟล์ที่อัพโหลดจะถูกเก็บไว้ในโฟลเดอร์ `uploads`
- ควรมีการตั้งค่า CORS และ security เพิ่มเติมสำหรับ production
- สามารถปรับแต่ง JWT secret และระยะเวลา expiration ได้ตามต้องการ
