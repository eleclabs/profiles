import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };
  
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link href="/" className="navbar-brand">
            ระบบโปรไฟล์
          </Link>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {!user ? (
                <>
                  <li className="nav-item">
                    <Link href="/login" className="nav-link">
                      เข้าสู่ระบบ
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/register" className="nav-link">
                      สมัครสมาชิก
                    </Link>
                  </li>
                </>
              ) : (
                <>
               
                  {user.approvalStatus === 'approved' && (
                    <>
                    <li className="nav-item">
                    <Link href="/dashboard" className="nav-link">
                      แดชบอร์ด
                    </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/profile" className="nav-link">
                        โปรไฟล์ของฉัน
                      </Link>
                    </li>
                    </>
                  )}
                  
                  {user.approvalStatus === 'pending' && (
                    <li className="nav-item">
                      <Link href="/profile?pending=true" className="nav-link text-warning">
                        โปรไฟล์ของฉัน
                      </Link>
                    </li>
                  )}
                  
                  {user.role === 'admin' && (
                    <>
                      <li className="nav-item">
                        <Link href="/admin/approvals" className="nav-link">
                          อนุมัติผู้ใช้
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link href="/admin/activities" className="nav-link">
                          จัดการกิจกรรม
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link href="/admin/jobs" className="nav-link">
                          จัดการงาน
                        </Link>
                      </li>
                    </>
                  )}
                  
                  {user.role === 'user' && !user.profileComplete && (
                    <li className="nav-item">
                      <Link href="/profilecreate" className="nav-link">
                        กรอกข้อมูล
                      </Link>
                    </li>
                  )}
                  
                  <li className="nav-item">
                    <button 
                      className="btn btn-outline-light ms-2"
                      onClick={handleLogout}
                    >
                      ออกจากระบบ
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      
      <main>
        {children}
      </main>
      
      <footer className="bg-light text-center text-lg-start mt-5">
        <div className="text-center p-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
          © 2024 ระบบโปรไฟล์
        </div>
      </footer>
    </>
  );
}
