import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useRouter } from 'next/router';

export default function ActivitiesManagement() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null
  });
  const [editingActivity, setEditingActivity] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    console.log('Fetching activities...');
    try {
      // Only run on client-side
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      const response = await fetch('http://localhost:8000/api/activities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Activities data:', data);
        setActivities(data);
      } else {
        console.log('Response not ok:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataObj = new FormData();
    formDataObj.append('title', formData.title);
    formDataObj.append('description', formData.description);
    if (formData.image) {
      formDataObj.append('image', formData.image);
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingActivity 
        ? `http://localhost:8000/api/activities/${editingActivity._id}`
        : 'http://localhost:8000/api/activities';
      
      const response = await fetch(url, {
        method: editingActivity ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      });

      if (response.ok) {
        alert(editingActivity ? 'แก้ไขกิจกรรมเรียบร้อย' : 'เพิ่มกิจกรรมเรียบร้อย');
        setFormData({ title: '', description: '', image: null });
        setEditingActivity(null);
        fetchActivities();
      } else {
        const errorText = await response.text();
        console.error('Response status:', response.status);
        console.error('Response text:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          alert(errorData.message || 'เกิดข้อผิดพลาด');
        } catch {
          alert(`เกิดข้อผิดพลาด: ${response.status} - ${errorText.substring(0, 100)}`);
        }
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      alert(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description,
      image: null
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/activities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('ลบกิจกรรมเรียบร้อย');
        fetchActivities();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-5">
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  {editingActivity ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรม'}
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">หัวข้อ</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">รายละเอียด</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">รูปภาพ</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {formData.image && (
                      <small className="text-muted d-block mt-2">
                        ไฟล์: {formData.image.name}
                      </small>
                    )}
                  </div>
                  
                  <div className="d-grid gap-2 d-flex">
                    <button type="submit" className="btn btn-primary">
                      {editingActivity ? 'แก้ไข' : 'เพิ่ม'}
                    </button>
                    {editingActivity && (
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditingActivity(null);
                          setFormData({ title: '', description: '', image: null });
                        }}
                      >
                        ยกเลิก
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <div className="col-md-8">
            <div className="card">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">รายการกิจกรรม</h5>
              </div>
              <div className="card-body">
                {activities.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-image fa-3x text-muted mb-3"></i>
                    <p className="text-muted">ยังไม่มีกิจกรรม</p>
                  </div>
                ) : (
                  <div className="row">
                    {activities.map((activity) => (
                      <div key={activity._id} className="col-md-6 mb-4">
                        <div className="card h-100" style={{width: '18rem'}}>
                          {activity.image ? (
                            <img 
                              src={`http://localhost:8000/${activity.image}`} 
                              className="card-img-top" 
                              alt={activity.title}
                              style={{ height: '150px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="card-img-top d-flex align-items-center justify-content-center" style={{height: '150px', backgroundColor: '#f8f9fa'}}>
                              <div className="text-center">
                                <i className="fas fa-image fa-2x text-muted"></i>
                                <div className="text-muted small">ไม่มีรูปภาพ</div>
                              </div>
                            </div>
                          )}
                          <div className="card-body">
                            <h6 className="card-title">{activity.title}</h6>
                            <p className="card-text small text-muted">
                              {activity.description.length > 50 
                                ? activity.description.substring(0, 50) + '...' 
                                : activity.description}
                            </p>
                            <div className="d-grid gap-2 d-flex">
                              <button 
                                className="btn btn-sm btn-warning"
                                onClick={() => handleEdit(activity)}
                              >
                                <i className="fas fa-edit me-1"></i>
                                แก้ไข
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(activity._id)}
                              >
                                <i className="fas fa-trash me-1"></i>
                                ลบ
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
