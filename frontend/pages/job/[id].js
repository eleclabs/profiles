import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      console.log('No job ID provided');
      return;
    }

    console.log('Fetching job with ID:', id);

    const fetchJob = async () => {
      try {
        const url = `http://localhost:8000/api/jobs/${id}`;
        console.log('Requesting URL:', url);
        
        const res = await fetch(url);
        console.log('Response status:', res.status);
        console.log('Response ok:', res.ok);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Error response:', errorText);
          throw new Error(`ไม่พบตำแหน่งงาน (Status: ${res.status})`);
        }
        
        const data = await res.json();
        console.log('Job data received:', data);
        setJob(data);
        setError('');
      } catch (err) {
        console.error('Error fetching job:', err);
        setError(`ไม่สามารถดึงข้อมูลตำแหน่งงานได้: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">กำลังโหลด...</span>
            </div>
            <p className="mt-3">กำลังโหลดข้อมูลตำแหน่งงาน...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container py-5">
          <div className="alert alert-danger text-center">
            <h4>เกิดข้อผิดพลาด</h4>
            <p>{error}</p>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => router.push('/admin/jobs')}
            >
              <i className="fas fa-arrow-left me-2"></i>
              กลับไปหน้าจัดการงาน
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="container py-5">
          <div className="alert alert-warning text-center">
            <h4>ไม่พบตำแหน่งงาน</h4>
            <p>ตำแหน่งงานที่คุณต้องการค้นหาอาจถูกลบไปแล้ว</p>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => router.push('/dashboard')}
            >
              <i className="fas fa-arrow-left me-2"></i>
              กลับไปหน้าหลัก
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              {job.image && (
                <img 
                  src={`http://localhost:8000/${job.image}`} 
                  className="card-img-top"
                  alt={job.title}
                  style={{ height: '400px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h2 className="card-title mb-0">{job.title}</h2>
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
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p className="mb-2">
                      <strong><i className="fas fa-building me-2"></i>แผนก:</strong> {job.department}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-2">
                      <strong><i className="fas fa-map-marker-alt me-2"></i>สถานที่:</strong> {job.location}
                    </p>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p className="mb-2">
                      <strong><i className="fas fa-money-bill-wave me-2"></i>เงินเดือน:</strong> {job.salary}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-2">
                      <strong><i className="fas fa-calendar me-2"></i>โพสต์เมื่อ:</strong> {job.formattedDate}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h5><i className="fas fa-clipboard-list me-2"></i>คำอธิบายงาน</h5>
                  <div className="card-text bg-light p-3 rounded">
                    {job.description.split('\n').map((line, index) => (
                      <p key={index} className="mb-2">{line}</p>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h5><i className="fas fa-tasks me-2"></i>คุณสมบัติ</h5>
                  <div className="card-text bg-light p-3 rounded">
                    {job.requirements.split('\n').map((line, index) => (
                      <p key={index} className="mb-2">{line}</p>
                    ))}
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="fas fa-clock me-1"></i>
                    อัพเดทล่าสุด: {new Date(job.updatedAt).toLocaleDateString('th-TH')}
                  </small>
                  <div>
                    <button 
                      className="btn btn-secondary me-2"
                      onClick={() => window.print()}
                    >
                      <i className="fas fa-print me-1"></i>
                      พิมพ์
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => router.push('/dashboard')}
                    >
                      <i className="fas fa-arrow-left me-1"></i>
                      กลับหน้าหลัก
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>  // แก้ไข: ปิด Layout tag ที่ถูกต้อง
  );
}