import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function JobManagement() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    type: 'full-time',
    department: '',
    isActive: true
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      // Test connection first
      const testResponse = await fetch('http://localhost:8000/', {
        method: 'GET'
      });
      
      if (!testResponse.ok) {
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาตรวจสอบว่า backend ทำงานอยู่');
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      console.log('Fetching jobs with token:', token ? 'exists' : 'missing');
      
      const response = await fetch('http://localhost:8000/api/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch jobs: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Jobs data received:', data);
      setJobs(data);
      setError('');
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('ไม่สามารถดึงข้อมูลตำแหน่งงานได้: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const formDataObj = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'image') {
          formDataObj.append(key, formData[key]);
        }
      });
      
      // Append image if exists
      if (formData.image && formData.image instanceof File) {
        formDataObj.append('image', formData.image);
      }
      
      const url = editingJob 
        ? `http://localhost:8000/api/jobs/${editingJob._id}`
        : 'http://localhost:8000/api/jobs';
      
      const method = editingJob ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      });
      
      if (!response.ok) {
        throw new Error(editingJob ? 'Failed to update job' : 'Failed to create job');
      }
      
      const savedJob = await response.json();
      
      if (editingJob) {
        setJobs(jobs.map(job => job._id === savedJob._id ? savedJob : job));
      } else {
        setJobs([savedJob, ...jobs]);
      }
      
      resetForm();
      alert(editingJob ? 'อัพเดทตำแหน่งงานเรียบร้อย' : 'สร้างตำแหน่งงานเรียบร้อย');
    } catch (error) {
      console.error('Error saving job:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      salary: job.salary,
      type: job.type,
      department: job.department,
      isActive: job.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (job) => {
    if (!confirm(`คุณต้องการลบตำแหน่งงาน "${job.title}" ใช่หรือไม่?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/jobs/${job._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      
      setJobs(jobs.filter(j => j._id !== job._id));
      alert('ลบตำแหน่งงานเรียบร้อย');
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      requirements: '',
      location: '',
      salary: '',
      type: 'full-time',
      department: '',
      isActive: true
    });
    setEditingJob(null);
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData({ ...formData, image: files[0] });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <Layout>
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h4 className="mb-0">จัดการตำแหน่งงาน</h4>
                <button
                  className="btn btn-light"
                  onClick={() => setShowModal(true)}
                >
                  <i className="fas fa-plus me-2"></i>
                  สร้างตำแหน่งงานใหม่
                </button>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}
                
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">กำลังโหลด...</span>
                    </div>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="alert alert-info text-center py-5">
                    <i className="fas fa-briefcase fa-4x mb-3 text-muted"></i>
                    <h4>ยังไม่มีตำแหน่งงาน</h4>
                    <p>กดปุ่ม "สร้างตำแหน่งงานใหม่" เพื่อเริ่มสร้างประกาศ</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>ตำแหน่งงาน</th>
                          <th>แผนก</th>
                          <th>สถานที่</th>
                          <th>เงินเดือน</th>
                          <th>ประเภท</th>
                          <th>สถานะ</th>
                          <th>วันที่สร้าง</th>
                          <th>จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((job) => (
                          <tr key={job._id}>
                            <td>
                              <strong>{job.title}</strong>
                              {job.image && (
                                <img 
                                  src={`http://localhost:8000/${job.image}`} 
                                  alt={job.title}
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  className="ms-2 rounded"
                                />
                              )}
                            </td>
                            <td>{job.department}</td>
                            <td>{job.location}</td>
                            <td>{job.salary}</td>
                            <td>
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
                            </td>
                            <td>
                              <span className={`badge ${job.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                {job.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                              </span>
                            </td>
                            <td>{new Date(job.createdAt).toLocaleDateString('th-TH')}</td>
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleEdit(job)}
                                  title="แก้ไขตำแหน่งงาน"
                                >
                                  <i className="fas fa-edit"></i>
                                  <span className="d-none d-md-inline ms-1">แก้ไข</span>
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDelete(job)}
                                  title="ลบตำแหน่งงาน"
                                >
                                  <i className="fas fa-trash"></i>
                                  <span className="d-none d-md-inline ms-1">ลบ</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingJob ? 'แก้ไขตำแหน่งงาน' : 'สร้างตำแหน่งงานใหม่'}
                </h5>
                <button type="button" className="btn-close" onClick={resetForm}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">ตำแหน่งงาน *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">แผนก *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">สถานที่ *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">เงินเดือน *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">ประเภท *</label>
                      <select
                        className="form-select"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="full-time">เต็มเวลา</option>
                        <option value="part-time">ไม่เต็มเวลา</option>
                        <option value="contract">จ้างงาน</option>
                        <option value="internship">ฝึกงาน</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">รูปภาพ</label>
                      <input
                        type="file"
                        className="form-control"
                        name="image"
                        onChange={handleInputChange}
                        accept="image/*"
                      />
                      {editingJob && editingJob.image && (
                        <small className="text-muted d-block mt-1">
                          รูปปัจจุบัน: {editingJob.image.split('/').pop()}
                        </small>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">คำอธิบายงาน *</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">คุณสมบัติ *</label>
                    <textarea
                      className="form-control"
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  
                  {editingJob && (
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label">
                          เปิดใช้งานนี้
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    ยกเลิก
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-2"></i>
                    {editingJob ? 'อัพเดท' : 'สร้าง'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
