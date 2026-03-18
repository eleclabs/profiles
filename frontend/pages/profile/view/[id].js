import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Link from 'next/link';

export default function ViewProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/approved-profiles/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('ไม่พบโปรไฟล์');
      }
      
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
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

  if (error || !profile) {
    return (
      <Layout>
        <div className="container mt-5">
          <div className="alert alert-danger">
            {error || 'ไม่พบโปรไฟล์'}
          </div>
          <Link href="/dashboard" className="btn btn-primary">
            กลับไปหน้าแดชบอร์ด
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-4">
            <div className="card sticky-top" style={{ top: '20px' }}>
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">โปรไฟล์</h5>
              </div>
              <div className="card-body text-center">
                {profile.profileImage ? (
                  <img 
                    src={`http://localhost:8000/${profile.profileImage}`} 
                    alt="Profile" 
                    className="rounded-circle img-fluid mb-3 border border-3"
                    style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="bg-secondary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 border border-3" 
                       style={{ width: '200px', height: '200px', fontSize: '4rem' }}>
                    {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                  </div>
                )}
                
                <h3>{profile.firstName} {profile.lastName}</h3>
                {profile.nickName && (
                  <p className="text-muted">ชื่อเล่น: {profile.nickName}</p>
                )}
                
                <hr />
                
                <div className="text-start">
                  <p>
                    <i className="fas fa-envelope me-2 text-primary"></i>
                    <strong>อีเมล:</strong> {profile.userId?.email}
                  </p>
                  {profile.phoneNumber && (
                    <p>
                      <i className="fas fa-phone me-2 text-primary"></i>
                      <strong>เบอร์โทร:</strong> {profile.phoneNumber}
                    </p>
                  )}
                  {profile.age && (
                    <p>
                      <i className="fas fa-birthday-cake me-2 text-primary"></i>
                      <strong>อายุ:</strong> {profile.age} ปี
                    </p>
                  )}
                  {profile.birthDate && (
                    <p>
                      <i className="fas fa-calendar me-2 text-primary"></i>
                      <strong>วันเกิด:</strong> {new Date(profile.birthDate).toLocaleDateString('th-TH')}
                    </p>
                  )}
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
                    <p><strong>ชื่อ-นามสกุล:</strong> {profile.firstName} {profile.lastName}</p>
                    <p><strong>ชื่อเล่น:</strong> {profile.nickName || '-'}</p>
                    <p><strong>เพศ:</strong> {
                      profile.gender === 'male' ? 'ชาย' :
                      profile.gender === 'female' ? 'หญิง' : 
                      profile.gender === 'other' ? 'อื่นๆ' : '-'
                    }</p>
                    <p><strong>สัญชาติ:</strong> {profile.nationality || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>กรุ๊ปเลือด:</strong> {profile.bloodType || '-'}</p>
                    <p><strong>น้ำหนัก:</strong> {profile.weight ? `${profile.weight} กก.` : '-'}</p>
                    <p><strong>ส่วนสูง:</strong> {profile.height ? `${profile.height} ซม.` : '-'}</p>
                    <p><strong>เลขบัตรประชาชน:</strong> {profile.idCardNumber || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {profile.address && (
              <div className="card mb-3">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">ที่อยู่</h5>
                </div>
                <div className="card-body">
                  <p>
                    {profile.address.houseNo && `บ้านเลขที่ ${profile.address.houseNo}`} 
                    {profile.address.village && ` หมู่ ${profile.address.village}`}
                    {profile.address.soi && ` ซอย ${profile.address.soi}`}
                    {profile.address.road && ` ถนน ${profile.address.road}`}
                    <br />
                    {profile.address.subDistrict && `ตำบล/แขวง ${profile.address.subDistrict}`}
                    {profile.address.district && ` อำเภอ/เขต ${profile.address.district}`}
                    <br />
                    {profile.address.province && `จังหวัด ${profile.address.province}`}
                    {profile.address.postalCode && ` รหัสไปรษณีย์ ${profile.address.postalCode}`}
                  </p>
                </div>
              </div>
            )}
            
            <div className="card mb-3">
              <div className="card-header bg-warning text-white">
                <h5 className="mb-0">ข้อมูลเพิ่มเติม</h5>
              </div>
              <div className="card-body">
                <h6>ไลฟ์สไตล์:</h6>
                <p className="mb-3">{profile.lifestyle || '-'}</p>
                
                <h6>งานอดิเรก:</h6>
                {profile.hobbies && profile.hobbies.length > 0 ? (
                  <ul className="list-group">
                    {profile.hobbies.map((hobby, index) => (
                      <li key={index} className="list-group-item">
                        <i className="fas fa-heart me-2 text-danger"></i>
                        {hobby}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>-</p>
                )}
              </div>
            </div>
            
            {profile.socialMedia && (
              <div className="card mb-3">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">โซเชียลมีเดีย</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    {profile.socialMedia.facebook && (
                      <div className="col-md-6 mb-2">
                        <i className="fab fa-facebook me-2 text-primary"></i>
                        {profile.socialMedia.facebook}
                      </div>
                    )}
                    {profile.socialMedia.line && (
                      <div className="col-md-6 mb-2">
                        <i className="fab fa-line me-2 text-success"></i>
                        {profile.socialMedia.line}
                      </div>
                    )}
                    {profile.socialMedia.instagram && (
                      <div className="col-md-6 mb-2">
                        <i className="fab fa-instagram me-2 text-danger"></i>
                        {profile.socialMedia.instagram}
                      </div>
                    )}
                    {profile.socialMedia.twitter && (
                      <div className="col-md-6 mb-2">
                        <i className="fab fa-twitter me-2 text-info"></i>
                        {profile.socialMedia.twitter}
                      </div>
                    )}
                    {profile.socialMedia.tiktok && (
                      <div className="col-md-6 mb-2">
                        <i className="fab fa-tiktok me-2"></i>
                        {profile.socialMedia.tiktok}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center mt-3 mb-5">
          <Link href="/dashboard" className="btn btn-secondary btn-lg">
            <i className="fas fa-arrow-left me-2"></i>
            กลับไปหน้าแดชบอร์ด
          </Link>
        </div>
      </div>
    </Layout>
  );
}