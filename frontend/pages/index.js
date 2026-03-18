import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home() {
  const [user, setUser] = useState(null);
  const [apiError, setApiError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold">ระบบจัดการโปรไฟล์</h1>
              <p className="lead">
                ระบบจัดการโปรไฟล์ที่ง่ายและปลอดภัย พร้อมระบบอนุมัติโดยผู้ดูแลระบบ
              </p>
              <hr className="my-4 bg-white" />
              <p>กรอกข้อมูลส่วนตัว อัพโหลดรูปบัตรประชาชน และรอการอนุมัติ</p>
              <div className="mt-4">
                {user ? (
                  <div>
                    {user.approvalStatus === 'approved' && (
                    <Link href="/profile" className="btn btn-light btn-lg me-2">
                      ดูโปรไฟล์ของฉัน
                    </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link href="/admin/approvals" className="btn btn-outline-light btn-lg">
                        จัดการผู้ใช้
                      </Link>
                    )}
                    <button onClick={handleLogout} className="btn btn-outline-danger btn-lg ms-2">
                      ออกจากระบบ
                    </button>
                  </div>
                ) : (
                  <div>
                    <Link href="/register" className="btn btn-light btn-lg me-2">
                      สมัครสมาชิก
                    </Link>
                    <Link href="/login" className="btn btn-outline-light btn-lg">
                      เข้าสู่ระบบ
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* แสดง error ถ้ามี */}
      {apiError && (
        <div className="container mt-4">
          <div className="alert alert-danger">
            <strong>เกิดข้อผิดพลาด:</strong> {apiError}
            <hr />
            <p className="mb-0">
              วิธีแก้ไข: 
              <ol className="mt-2">
                <li>เปิด Command Prompt ใหม่</li>
                <li>รันคำสั่ง: <code>cd d:\profile2\backend</code></li>
                <li>รันคำสั่ง: <code>npm start</code></li>
                <li>แล้วรีเฟรชหน้านี้</li>
              </ol>
            </p>
          </div>
        </div>
      )}

      </Layout>
  );
}