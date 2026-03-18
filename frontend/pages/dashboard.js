import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
      fetchApprovedProfiles();
      fetchActivities();
      fetchJobs();
    } else {
      setLoading(false);
      router.push('/login');
    }
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/activities/public');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched activities:', data);
        data.forEach((activity, index) => {
          console.log(`Activity ${index + 1}:`, {
            title: activity.title,
            image: activity.image,
            imagePath: activity.image ? `http://localhost:8000/${activity.image}` : 'No image'
          });
        });
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchApprovedProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/approved-profiles/approved', {
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }
      
      const data = await response.json();
      console.log('Fetched profiles:', data);
      setProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/jobs/public');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched jobs:', data);
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const createTestData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/init-data', {
        method: 'POST'
      });
      if (response.ok) {
        alert('สร้างข้อมูลทดสอบเรียบร้อย กรุณา refresh หน้า');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating test data:', error);
    }
  };

  return (
    <Layout>
      {/* Carousel Section */}
      <div className="container py-4">
        <div id="carouselExampleCaptions" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-indicators">
            {activities.length === 0 ? (
              <>
                <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
                <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2" aria-label="Slide 3"></button>
              </>
            ) : (
              activities.map((_, index) => (
                <button 
                  key={index}
                  type="button" 
                  data-bs-target="#carouselExampleCaptions" 
                  data-bs-slide-to={index} 
                  className={index === 0 ? 'active' : ''} 
                  aria-current={index === 0 ? 'true' : 'false'} 
                  aria-label={`Slide ${index + 1}`}
                ></button>
              ))
            )}
          </div>
          <div className="carousel-inner">
            {activities.length === 0 ? (
              <>
                <div className="carousel-item active">
                  <div className="d-block w-100 d-flex align-items-center justify-content-center" style={{height: '400px', backgroundColor: '#1a1a1a'}}>
                    <div className="text-center text-white">
                      <i className="fas fa-image fa-4x mb-3 text-muted"></i>
                      <h4>กิจกรรมที่ 1</h4>
                      <p className="text-muted">ยังไม่มีรูปภาพกิจกรรม</p>
                    </div>
                  </div>
                  <div className="carousel-caption d-none d-md-block">
                    <h5>กิจกรรมที่ 1</h5>
                    <p>คำอธิบายกิจกรรมที่ 1</p>
                  </div>
                </div>
                <div className="carousel-item">
                  <div className="d-block w-100 d-flex align-items-center justify-content-center" style={{height: '400px', backgroundColor: '#1a1a1a'}}>
                    <div className="text-center text-white">
                      <i className="fas fa-image fa-4x mb-3 text-muted"></i>
                      <h4>กิจกรรมที่ 2</h4>
                      <p className="text-muted">ยังไม่มีรูปภาพกิจกรรม</p>
                    </div>
                  </div>
                  <div className="carousel-caption d-none d-md-block">
                    <h5>กิจกรรมที่ 2</h5>
                    <p>คำอธิบายกิจกรรมที่ 2</p>
                  </div>
                </div>
                <div className="carousel-item">
                  <div className="d-block w-100 d-flex align-items-center justify-content-center" style={{height: '400px', backgroundColor: '#1a1a1a'}}>
                    <div className="text-center text-white">
                      <i className="fas fa-image fa-4x mb-3 text-muted"></i>
                      <h4>กิจกรรมที่ 3</h4>
                      <p className="text-muted">ยังไม่มีรูปภาพกิจกรรม</p>
                    </div>
                  </div>
                  <div className="carousel-caption d-none d-md-block">
                    <h5>กิจกรรมที่ 3</h5>
                    <p>คำอธิบายกิจกรรมที่ 3</p>
                  </div>
                </div>
              </>
            ) : (
              activities.map((activity, index) => (
                <div 
                  key={activity._id} 
                  className={`carousel-item ${index === 0 ? 'active' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/activity/${activity._id}`)}
                >
                  {activity.image ? (
                    <img 
                      src={`http://localhost:8000/${activity.image}`} 
                      className="d-block w-100" 
                      alt={activity.title}
                      style={{ height: '400px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="d-block w-100 d-flex align-items-center justify-content-center" style={{height: '400px', backgroundColor: '#1a1a1a'}}>
                      <div className="text-center text-white">
                        <i className="fas fa-image fa-4x mb-3 text-muted"></i>
                        <h4>{activity.title}</h4>
                        <p className="text-muted">ยังไม่มีรูปภาพกิจกรรม</p>
                      </div>
                    </div>
                  )}
                  <div className="carousel-caption d-none d-md-block">
                    <h5>{activity.title}</h5>
                    <p>{activity.description?.substring(0, 100) + '...' || 'คลิกเพื่อดูรายละเอียด'}</p>
                    <small className="text-warning">
                      <i className="fas fa-hand-pointer me-2"></i>
                      คลิกเพื่อดูรายละเอียดเพิ่มเติม
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
      
      {/* Profiles Section */}
      <div className="container py-5">
        {user ? (
          <div>
            <h2 className="text-center mb-4">โปรไฟล์สมาชิกที่อนุมัติแล้ว</h2>
            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="row g-2">
                {profiles.length > 0 ? (
                  profiles.map((profile) => (
                    <div key={profile._id} className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                      <div className="card h-100 shadow-sm">
                        {profile.profileImage ? (
                          <img 
                            src={`http://localhost:8000/${profile.profileImage}`} 
                            className="card-img-top" 
                            alt={`${profile.firstName} ${profile.lastName}`}
                            style={{ height: '180px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="card-img-top d-flex align-items-center justify-content-center" style={{height: '180px', backgroundColor: '#f8f9fa'}}>
                            <div className="text-center">
                              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                                   style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}>
                                {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                              </div>
                              <div className="text-muted small">ไม่มีรูป</div>
                            </div>
                          </div>
                        )}
                        <div className="card-body p-2">
                          <h6 className="card-title mb-1 small fw-bold">{profile.firstName} {profile.lastName}</h6>
                          
                          {/* อีเมล */}
                          {profile.userId?.email && (
                            <p className="text-muted mb-2 small text-truncate" title={profile.userId.email}>
                              <i className="fas fa-envelope me-1"></i>
                              {profile.userId.email.length > 15 ? profile.userId.email.substring(0, 15) + '...' : profile.userId.email}
                            </p>
                          )}
                          
                          <Link href={`/profile/view/${profile.userId._id}`} className="btn btn-primary btn-sm w-100">
                            <i className="fas fa-user me-1"></i>
                            ดูโปรไฟล์
                          </Link>
                        </div>
                        
                        {/* Footer */}
                        <div className="card-footer text-muted small py-1">
                          <i className="fas fa-clock me-1"></i>
                          {new Date(profile.createdAt).toLocaleDateString('th-TH', {month: 'short', day: 'numeric'})}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="alert alert-info text-center py-5">
                      <i className="fas fa-users fa-4x mb-3 text-muted"></i>
                      <h4>ยังไม่มีโปรไฟล์สมาชิก</h4>
<p className="text-muted mb-4">รอสมาชิกที่จะสร้างและอนุมัติโปรไฟล์</p>
                      <button 
                        className="btn btn-warning"
                        onClick={createTestData}
                      >
                        <i className="fas fa-database me-2"></i>
                        สร้างข้อมูลทดสอบ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="card shadow-sm p-5">
              <i className="fas fa-lock fa-4x mb-3 text-muted"></i>
              <h3>กรุณาเข้าสู่ระบบ</h3>
              <p className="text-muted mb-4">เข้าสู่ระบบเพื่อดูโปรไฟล์สมาชิก</p>
              <Link href="/login" className="btn btn-primary btn-lg">
                <i className="fas fa-sign-in-alt me-2"></i>
                เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Jobs Section */}
      <div className="container py-5">
        {user ? (
          <div>
            <h2 className="text-center mb-4">ประกาศงานที่เปิดรับสมัคร</h2>
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">กำลังโหลด...</span>
                </div>
              </div>
            ) : jobs.length > 0 ? (
              <div className="row g-3">
                {jobs.map((job) => (
                  <div key={job._id} className="col-lg-4 col-md-6 mb-4">
                    <div 
                      className="card h-100 shadow-sm border-0" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => router.push(`/job/${job._id}`)}
                    >
                      {job.image ? (
                        <img 
                          src={`http://localhost:8000/${job.image}`} 
                          className="card-img-top" 
                          alt={job.title}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="card-img-top d-flex align-items-center justify-content-center" style={{height: '200px', backgroundColor: '#f8f9fa'}}>
                          <div className="text-center">
                            <i className="fas fa-briefcase fa-3x mb-2 text-muted"></i>
                            <div className="text-muted small">ไม่มีรูป</div>
                          </div>
                        </div>
                      )}
                      <div className="card-body">
                        <h5 className="card-title mb-2">{job.title}</h5>
                        <p className="card-text mb-2">
                          <small className="text-muted">
                            <i className="fas fa-map-marker-alt me-2"></i>
                            {job.location}
                          </small>
                        </p>
                        <p className="card-text mb-2">
                          <small className="text-muted">
                            <i className="fas fa-building me-2"></i>
                            {job.department}
                          </small>
                        </p>
                        <p className="card-text mb-3">
                          <span className={`badge ${
                            job.type === 'full-time' ? 'bg-primary' :
                            job.type === 'part-time' ? 'bg-success' :
                            job.type === 'contract' ? 'bg-warning' :
                            'bg-info'
                          }`}>
                            {job.type === 'full-time' ? 'เต็มเวลา' :
                             job.type === 'part-time' ? 'ไม่เต็มเวลา' :
                             job.type === 'contract' ? 'จ้างงาน' :
                             'ฝึกงาน'}
                          </span>
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-primary fw-bold">{job.salary}</span>
                          <small className="text-muted">
                            {new Date(job.createdAt).toLocaleDateString('th-TH')}
                          </small>
                        </div>
                      </div>
                      <div className="card-footer bg-light">
                        <small className="text-muted">
                          <i className="fas fa-clock me-1"></i>
                          โพสต์เมื่อ {job.formattedDate}
                        </small>
                        <div className="text-warning mt-1">
                          <i className="fas fa-hand-pointer me-1"></i>
                          คลิกเพื่อดูรายละเอียด
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info text-center py-5">
                <i className="fas fa-briefcase fa-4x mb-3 text-muted"></i>
                <h4>ยังไม่มีประกาศงานเปิดรับ</h4>
                <p className="text-muted">Admin สามารถสร้างประกาศงานได้ในหน้าจัดการ</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="card shadow-sm p-5">
              <i className="fas fa-lock fa-4x mb-3 text-muted"></i>
              <h3>กรุณาเข้าสู่ระบบ</h3>
              <p className="text-muted mb-4">เข้าสู่ระบบเพื่อดูประกาศงาน</p>
              <Link href="/login" className="btn btn-primary btn-lg">
                <i className="fas fa-sign-in-alt me-2"></i>
                เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}