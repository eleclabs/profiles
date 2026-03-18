import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Link from 'next/link';
export default function Profile() {
  const router = useRouter();
  const { pending } = router.query;
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });
      
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mt-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mt-4">
        {pending && (
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading">รอการอนุมัติ!</h4>
            <p>ข้อมูลของคุณถูกส่งให้ผู้ดูแลระบบตรวจสอบแล้ว กรุณารอการอนุมัติก่อนเข้าใช้งาน</p>
          </div>
        )}
        
        {user && user.approvalStatus === 'approved' && (
          <div className="row">
            <div className="col-md-4">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">โปรไฟล์ของฉัน</h5>
                </div>
                <div className="card-body text-center">
                  {profile && profile.profileImage ? (
                    <img 
                      src={`http://localhost:8000/${profile.profileImage}`} 
                      alt="Profile" 
                      className="rounded-circle img-fluid mb-3"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="bg-secondary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{ width: '150px', height: '150px', fontSize: '3rem' }}>
                      {profile?.firstName?.charAt(0)}
                    </div>
                  )}
                  
                  <h4>{profile?.firstName} {profile?.lastName}</h4>
                  <p className="text-muted">{profile?.nickName}</p>
                  
                  <hr />
                  
                  <div className="text-start">
                    <p><strong>อีเมล:</strong> {user.email}</p>
                    <p><strong>เบอร์โทร:</strong> {profile?.phoneNumber || '-'}</p>
                    <p><strong>วันเกิด:</strong> {profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString('th-TH') : '-'}</p>
                    <p><strong>อายุ:</strong> {profile?.age || '-'} ปี</p>
                    <div>
                      <Link href="/profilecreate" className="btn btn-light btn-lg me-2">
                        แก้ไขโปรไฟล์
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-8">
              <div className="card mb-3">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">ข้อมูลส่วนตัว</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>ชื่อ-นามสกุล:</strong> {profile?.firstName} {profile?.lastName}</p>
                      <p><strong>ชื่อเล่น:</strong> {profile?.nickName || '-'}</p>
                      <p><strong>เพศ:</strong> {
                        profile?.gender === 'male' ? 'ชาย' :
                        profile?.gender === 'female' ? 'หญิง' : 'อื่นๆ'
                      }</p>
                      <p><strong>สัญชาติ:</strong> {profile?.nationality || '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>กรุ๊ปเลือด:</strong> {profile?.bloodType || '-'}</p>
                      <p><strong>น้ำหนัก:</strong> {profile?.weight || '-'} กก.</p>
                      <p><strong>ส่วนสูง:</strong> {profile?.height || '-'} ซม.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card mb-3">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">ที่อยู่</h5>
                </div>
                <div className="card-body">
                  <p>
                    {profile?.address?.houseNo} 
                    {profile?.address?.village && ` หมู่ ${profile.address.village}`}
                    {profile?.address?.soi && ` ซอย ${profile.address.soi}`}
                    {profile?.address?.road && ` ถนน ${profile.address.road}`}
                    <br />
                    {profile?.address?.subDistrict && ` ต.${profile.address.subDistrict}`}
                    {profile?.address?.district && ` อ.${profile.address.district}`}
                    {profile?.address?.province && ` จ.${profile.address.province}`}
                    {profile?.address?.postalCode && ` ${profile.address.postalCode}`}
                  </p>
                </div>
              </div>
              
              <div className="card mb-3">
                <div className="card-header bg-warning text-white">
                  <h5 className="mb-0">ข้อมูลเพิ่มเติม</h5>
                </div>
                
                <div className="card-body">
                  <h6>ไลฟ์สไตล์:</h6>
                  <p>{profile?.lifestyle || '-'}</p>
                  
                  <h6>งานอดิเรก:</h6>
                  {profile?.hobbies && profile.hobbies.length > 0 ? (
                    <ul>
                      {profile.hobbies.map((hobby, index) => (
                        <li key={index}>{hobby}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>-</p>
                  )}
                 
                </div>
              </div>
           
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
