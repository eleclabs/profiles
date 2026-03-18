import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function ActivityDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      console.log('No ID provided');
      return;
    }

    console.log('Fetching activity with ID:', id);

    const fetchActivity = async () => {
      try {
        const url = `http://localhost:8000/api/activities/${id}`;
        console.log('Requesting URL:', url);
        
        const res = await fetch(url);
        console.log('Response status:', res.status);
        console.log('Response ok:', res.ok);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Error response:', errorText);
          throw new Error(`ไม่พบกิจกรรม (Status: ${res.status})`);
        }
        
        const data = await res.json();
        console.log('Activity data received:', data);
        setActivity(data);
        setError('');
      } catch (err) {
        console.error('Error fetching activity:', err);
        setError(`ไม่สามารถดึงข้อมูลกิจกรรมได้: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

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

  if (error || !activity) {
    return (
      <Layout>
        <div className="container mt-5">
          <div className="alert alert-danger">
            {error || 'ไม่พบข้อมูลกิจกรรม'}
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => router.back()}
          >
            กลับไปหน้าที่แล้ว
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <a href="/dashboard">หน้าแรก</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {activity.title}
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row">
          <div className="col-md-8">
            {/* Activity Image */}
            <div className="card mb-4">
              {activity.image ? (
                <img 
                  src={`http://localhost:8000/${activity.image}`}
                  className="card-img-top"
                  alt={activity.title}
                  style={{ height: '400px', objectFit: 'cover' }}
                />
              ) : (
                <div 
                  className="d-flex align-items-center justify-content-center bg-light"
                  style={{ height: '400px' }}
                >
                  <div className="text-center">
                    <i className="fas fa-image fa-4x text-muted mb-3"></i>
                    <p className="text-muted">ไม่มีรูปภาพกิจกรรม</p>
                  </div>
                </div>
              )}
              <div className="card-body">
                <h1 className="card-title">{activity.title}</h1>
                <div className="text-muted mb-3">
                  <small>
                    <i className="fas fa-calendar-alt me-2"></i>
                    {new Date(activity.createdAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </small>
                </div>
              </div>
            </div>

            {/* Activity Description */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">รายละเอียดกิจกรรม</h5>
              </div>
              <div className="card-body">
                <div className="content">
                  {activity.description ? (
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: activity.description.replace(/\n/g, '<br>') 
                      }} 
                    />
                  ) : (
                    <p className="text-muted">ไม่มีรายละเอียดกิจกรรม</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            {/* Activity Info Card */}
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">ข้อมูลกิจกรรม</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <strong>ชื่อกิจกรรม:</strong>
                  <p className="mb-0">{activity.title}</p>
                </div>
                
                <div className="mb-3">
                  <strong>วันที่สร้าง:</strong>
                  <p className="mb-0">
                    {new Date(activity.createdAt).toLocaleDateString('th-TH')}
                  </p>
                </div>
                
                <div className="mb-3">
                  <strong>อัพเดทล่าสุด:</strong>
                  <p className="mb-0">
                    {new Date(activity.updatedAt).toLocaleDateString('th-TH')}
                  </p>
                </div>

                {activity.image && (
                  <div className="mb-3">
                    <strong>มีรูปภาพ:</strong>
                    <p className="mb-0">
                      <span className="badge bg-success">มีรูปภาพ</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card mt-3">
              <div className="card-body">
                <button 
                  className="btn btn-primary w-100 mb-2"
                  onClick={() => router.back()}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  กลับไปหน้าที่แล้ว
                </button>
                
                <button 
                  className="btn btn-outline-secondary w-100"
                  onClick={() => window.print()}
                >
                  <i className="fas fa-print me-2"></i>
                  พิมพ์ข้อมูล
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
