import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function Approvals() {
  const router = useRouter();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [approvalClicks, setApprovalClicks] = useState({});
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  // State สำหรับดูรูปขยาย
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedImageTitle, setSelectedImageTitle] = useState('');
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      router.replace('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
    
    fetchAllUsers();
  }, []);
  
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch('http://localhost:8000/api/admin/all-users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Fetched users:', data);
      setAllUsers(data);
      setError('');
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${err.message}`);
      
      if (err.message.includes('401')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const getUserStatus = (user) => {
    return user.userData?.approvalStatus || user.approvalStatus || 'pending';
  };
  
  const pendingCount = allUsers.filter(u => getUserStatus(u) === 'pending').length;
  const approvedCount = allUsers.filter(u => getUserStatus(u) === 'approved').length;
  
  const handleViewUser = (user) => {
    console.log('=== User Data Debug ===');
    console.log('Full user object:', user);
    console.log('Image fields:', {
      profileImage: user.profileImage,
      idCardImages: user.idCardImages,
      idCardFront: user.idCardFront,
      idCardBack: user.idCardBack
    });
    
    // Log the actual URLs that will be used
    if (user.profileImage) {
      console.log('Profile Image URL:', getImageUrl(user.profileImage));
    }
    if (user.idCardImages?.front) {
      console.log('ID Card Front URL:', getImageUrl(user.idCardImages.front));
    }
    if (user.idCardImages?.back) {
      console.log('ID Card Back URL:', getImageUrl(user.idCardImages.back));
    }
    
    setViewingUser(user);
    setShowViewModal(true);
  };
  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Convert backslashes to forward slashes for web URLs
    const normalizedPath = imagePath.replace(/\\/g, '/');
    
    // If path already includes 'uploads/', just prepend the base URL
    if (normalizedPath.includes('uploads/')) {
      return `http://localhost:8000/${normalizedPath}`;
    }
    
    // Otherwise, assume it's just the filename and prepend uploads/
    return `http://localhost:8000/uploads/${normalizedPath}`;
  };
  
  // ฟังก์ชันดูรูปขยาย
  const handleViewImage = (imageUrl, title) => {
    setSelectedImage(imageUrl);
    setSelectedImageTitle(title);
    setShowImageModal(true);
  };
  
  const handleApprove = async (userId) => {
    const currentClicks = approvalClicks[userId] || 0;
    const newClicks = currentClicks + 1;
    
    if (newClicks < 3) {
      setApprovalClicks(prev => ({ ...prev, [userId]: newClicks }));
      alert(`กรุณาคลิกอนุมัติอีก ${3 - newClicks} ครั้ง (ต้องคลิก 3 ครั้ง)`);
      return;
    }
    
    setProcessing(prev => ({ ...prev, [userId]: true }));
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`http://localhost:8000/api/admin/approve/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        setApprovalClicks(prev => ({ ...prev, [userId]: 0 }));
        
        setAllUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.userData?._id === userId || user._id === userId) {
              if (user.userData) {
                return {
                  ...user,
                  userData: {
                    ...user.userData,
                    approvalStatus: 'approved'
                  }
                };
              } else {
                return {
                  ...user,
                  approvalStatus: 'approved'
                };
              }
            }
            return user;
          })
        );
      } else {
        const data = await res.json();
        alert(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Approve error:', err);
      alert('เกิดข้อผิดพลาดในการอนุมัติ');
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  const handleReject = async (userId) => {
    setProcessing(prev => ({ ...prev, [userId]: true }));
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`http://localhost:8000/api/admin/reject/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        setAllUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.userData?._id === userId || user._id === userId) {
              if (user.userData) {
                return {
                  ...user,
                  userData: {
                    ...user.userData,
                    approvalStatus: 'rejected'
                  }
                };
              } else {
                return {
                  ...user,
                  approvalStatus: 'rejected'
                };
              }
            }
            return user;
          })
        );
      } else {
        const data = await res.json();
        alert(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Reject error:', err);
      alert('เกิดข้อผิดพลาดในการปฏิเสธ');
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      nickName: user.nickName || '',
      phoneNumber: user.phoneNumber || '',
      age: user.age || '',
      birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
      gender: user.gender || '',
      nationality: user.nationality || '',
      bloodType: user.bloodType || '',
      weight: user.weight || '',
      height: user.height || '',
      idCardNumber: user.idCardNumber || '',
      address: user.address || {
        houseNo: '', village: '', soi: '', road: '',
        subDistrict: '', district: '', province: '', postalCode: ''
      },
      socialMedia: user.socialMedia || {
        facebook: '', line: '', instagram: '', twitter: '', tiktok: ''
      },
      lifestyle: user.lifestyle || '',
      hobbies: user.hobbies || [],
      email: user.userData?.email || ''
    });
    
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`http://localhost:8000/api/admin/edit-user/${editingUser.userData._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });
      
      if (res.ok) {
        alert('แก้ไขข้อมูลผู้ใช้เรียบร้อย');
        setShowEditModal(false);
        
        setAllUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.userData?._id === editingUser.userData._id) {
              return {
                ...user,
                ...editFormData,
                userData: {
                  ...user.userData,
                  email: editFormData.email
                }
              };
            }
            return user;
          })
        );
      } else {
        const data = await res.json();
        alert(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Edit user error:', err);
      alert('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleHobbiesChange = (e) => {
    const hobbies = e.target.value.split(',').map(h => h.trim());
    setEditFormData(prev => ({
      ...prev,
      hobbies
    }));
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`คุณต้องการลบผู้ใช้ "${user.firstName} ${user.lastName}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`http://localhost:8000/api/admin/delete-user/${user.userData._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        alert('ลบผู้ใช้เรียบร้อย');
        setAllUsers(prevUsers => 
          prevUsers.filter(u => u.userData?._id !== user.userData._id)
        );
      } else {
        alert('เกิดข้อผิดพลาดในการลบผู้ใช้');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      alert('เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  };

  const handleRevokeApproval = async (user) => {
    if (!confirm(`คุณต้องการเลิกอนุมัติผู้ใช้ "${user.firstName} ${user.lastName}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`http://localhost:8000/api/admin/revoke-approval/${user.userData._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        setAllUsers(prevUsers => 
          prevUsers.map(u => {
            if (u.userData?._id === user.userData._id) {
              if (u.userData) {
                return {
                  ...u,
                  userData: {
                    ...u.userData,
                    approvalStatus: 'pending'
                  }
                };
              } else {
                return {
                  ...u,
                  approvalStatus: 'pending'
                };
              }
            }
            return u;
          })
        );
      } else {
        alert('เกิดข้อผิดพลาดในการเลิกอนุมัติ');
      }
    } catch (err) {
      console.error('Revoke approval error:', err);
      alert('เกิดข้อผิดพลาดในการเลิกอนุมัติ');
    }
  };
  
  const handleApproveAll = async () => {
    if (!confirm('คุณต้องการอนุมัติผู้ใช้ทั้งหมดใช่หรือไม่?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch('http://localhost:8000/api/admin/approve-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        setAllUsers(prevUsers => 
          prevUsers.map(user => {
            if (getUserStatus(user) === 'pending') {
              if (user.userData) {
                return {
                  ...user,
                  userData: {
                    ...user.userData,
                    approvalStatus: 'approved'
                  }
                };
              } else {
                return {
                  ...user,
                  approvalStatus: 'approved'
                };
              }
            }
            return user;
          })
        );
        
        alert('อนุมัติผู้ใช้ทั้งหมดเรียบร้อย');
      } else {
        const data = await res.json();
        alert(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Approve all error:', err);
      alert('เกิดข้อผิดพลาดในการอนุมัติผู้ใช้ทั้งหมด');
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
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h4 className="mb-0">จัดการผู้ใช้</h4>
                <div className="btn-group" role="group">
                  <button
                    className={`btn ${viewMode === 'all' ? 'btn-light' : 'btn-outline-light'}`}
                    onClick={() => setViewMode('all')}
                  >
                    <i className="fas fa-users"></i>
                    <span className="d-none d-md-inline ms-2">ทั้งหมด ({allUsers.length})</span>
                  </button>
                  <button
                    className={`btn ${viewMode === 'pending' ? 'btn-light' : 'btn-outline-light'}`}
                    onClick={() => setViewMode('pending')}
                  >
                    <i className="fas fa-user-clock"></i>
                    <span className="d-none d-md-inline ms-2">รออนุมัติ ({pendingCount})</span>
                  </button>
                  <button
                    className={`btn ${viewMode === 'approved' ? 'btn-light' : 'btn-outline-light'}`}
                    onClick={() => setViewMode('approved')}
                  >
                    <i className="fas fa-user-check"></i>
                    <span className="d-none d-md-inline ms-2">อนุมัติแล้ว ({approvedCount})</span>
                  </button>
                </div>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}
                
                {allUsers.length === 0 ? (
                  <div className="alert alert-info">
                    ไม่มีผู้ใช้ในระบบ
                  </div>
                ) : (
                  <>
                    {viewMode === 'pending' && pendingCount > 0 && (
                      <div className="mb-3">
                        <button
                          className="btn btn-success"
                          onClick={handleApproveAll}
                          disabled={loading}
                        >
                          <i className="fas fa-users-cog"></i>
                          <span className="d-none d-md-inline ms-2">อนุมัติทั้งหมด</span>
                        </button>
                      </div>
                    )}
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th>ชื่อ-นามสกุล</th>
                            <th>อีเมล</th>
                            <th>เบอร์โทร</th>
                            <th>สถานะ</th>
                            <th>วันที่สมัคร</th>
                            <th>การจัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allUsers
                            .filter(user => {
                              if (viewMode === 'all') return true;
                              const status = getUserStatus(user);
                              if (viewMode === 'pending') return status === 'pending';
                              if (viewMode === 'approved') return status === 'approved';
                              return true;
                            })
                            .map(user => {
                              const status = getUserStatus(user);
                              const userId = user.userData?._id || user._id;
                              
                              return (
                              <tr key={user._id || user.userData?._id}>
                                <td>{user.firstName} {user.lastName}</td>
                                <td>{user.userData?.email || '-'}</td>
                                <td>{user.phoneNumber || '-'}</td>
                                <td>
                                  <span className={`badge ${
                                    status === 'approved' ? 'bg-success' : 
                                    status === 'rejected' ? 'bg-danger' : 
                                    'bg-warning'
                                  }`}>
                                    {status === 'approved' ? 'อนุมัติแล้ว' : 
                                     status === 'rejected' ? 'ถูกปฏิเสธ' : 
                                     'รออนุมัติ'}
                                  </span>
                                </td>
                                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('th-TH') : '-'}</td>
                                <td>
                                  <div className="btn-group" role="group">
                                    <button
                                      className="btn btn-info btn-sm"
                                      onClick={() => handleViewUser(user)}
                                      title="ดูข้อมูลผู้ใช้"
                                    >
                                      <i className="fas fa-eye"></i>
                                      <span className="d-none d-md-inline ms-1">ดู</span>
                                    </button>
                                    
                                    {status === 'approved' ? (
                                      <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleEditUser(user)}
                                        title="แก้ไขข้อมูลผู้ใช้"
                                      >
                                        <i className="fas fa-user-edit"></i>
                                        <span className="d-none d-md-inline ms-1">แก้ไข</span>
                                      </button>
                                    ) : (
                                      <button
                                        className="btn btn-secondary btn-sm"
                                        disabled
                                        title="ไม่สามารถแก้ไขผู้ใช้ที่ยังไม่ได้รับการอนุมัติ"
                                      >
                                        <i className="fas fa-user-edit"></i>
                                        <span className="d-none d-md-inline ms-1">แก้ไข</span>
                                      </button>
                                    )}
                                    
                                    {status === 'approved' && (
                                      <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleRevokeApproval(user)}
                                        title="เลิกอนุมัติผู้ใช้"
                                      >
                                        <i className="fas fa-user-minus"></i>
                                        <span className="d-none d-md-inline ms-1">เลิกอนุมัติ</span>
                                      </button>
                                    )}
                                    
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleDeleteUser(user)}
                                      title="ลบผู้ใช้ออกจากระบบ"
                                    >
                                      <i className="fas fa-user-times"></i>
                                      <span className="d-none d-md-inline ms-1">ลบ</span>
                                    </button>
                                    
                                    {status === 'pending' && (
                                      <>
                                        <button
                                          className="btn btn-success btn-sm"
                                          onClick={() => handleApprove(userId)}
                                          disabled={!userId || processing[userId]}
                                          title={`อนุมัติผู้ใช้ (คลิก ${approvalClicks[userId] || 0}/3)`}
                                        >
                                          <i className="fas fa-user-check"></i>
                                          <span className="d-none d-md-inline ms-1">อนุมัติ</span>
                                        </button>
                                        <button
                                          className="btn btn-secondary btn-sm"
                                          onClick={() => handleReject(userId)}
                                          disabled={!userId || processing[userId]}
                                          title="ปฏิเสธผู้ใช้"
                                        >
                                          <i className="fas fa-user-slash"></i>
                                          <span className="d-none d-md-inline ms-1">ปฏิเสธ</span>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )})}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal แสดงข้อมูลผู้ใช้ */}
      {showViewModal && viewingUser && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  ข้อมูลผู้ใช้: {viewingUser.firstName} {viewingUser.lastName}
                  <span className={`badge ms-2 ${
                    getUserStatus(viewingUser) === 'approved' ? 'bg-success' : 
                    getUserStatus(viewingUser) === 'rejected' ? 'bg-danger' : 
                    'bg-warning'
                  }`}>
                    {getUserStatus(viewingUser) === 'approved' ? 'อนุมัติแล้ว' : 
                     getUserStatus(viewingUser) === 'rejected' ? 'ถูกปฏิเสธ' : 
                     'รออนุมัติ'}
                  </span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                
                {/* ข้อมูลส่วนตัว */}
                <div className="card mb-3">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">ข้อมูลส่วนตัว</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4">
                        <p><strong>ชื่อ:</strong> {viewingUser.firstName || '-'}</p>
                      </div>
                      <div className="col-md-4">
                        <p><strong>นามสกุล:</strong> {viewingUser.lastName || '-'}</p>
                      </div>
                      <div className="col-md-4">
                        <p><strong>ชื่อเล่น:</strong> {viewingUser.nickName || '-'}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>อีเมล:</strong> {viewingUser.userData?.email || '-'}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>เบอร์โทร:</strong> {viewingUser.phoneNumber || '-'}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-3">
                        <p><strong>อายุ:</strong> {viewingUser.age || '-'}</p>
                      </div>
                      <div className="col-md-3">
                        <p><strong>วันเกิด:</strong> {viewingUser.birthDate ? new Date(viewingUser.birthDate).toLocaleDateString('th-TH') : '-'}</p>
                      </div>
                      <div className="col-md-3">
                        <p><strong>เพศ:</strong> {
                          viewingUser.gender === 'male' ? 'ชาย' :
                          viewingUser.gender === 'female' ? 'หญิง' :
                          viewingUser.gender === 'other' ? 'อื่นๆ' : '-'
                        }</p>
                      </div>
                      <div className="col-md-3">
                        <p><strong>สัญชาติ:</strong> {viewingUser.nationality || '-'}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-3">
                        <p><strong>กรุ๊ปเลือด:</strong> {viewingUser.bloodType || '-'}</p>
                      </div>
                      <div className="col-md-3">
                        <p><strong>น้ำหนัก:</strong> {viewingUser.weight ? `${viewingUser.weight} กก.` : '-'}</p>
                      </div>
                      <div className="col-md-3">
                        <p><strong>ส่วนสูง:</strong> {viewingUser.height ? `${viewingUser.height} ซม.` : '-'}</p>
                      </div>
                      <div className="col-md-3">
                        <p><strong>เลขบัตรประชาชน:</strong> {viewingUser.idCardNumber || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* ที่อยู่ */}
                <div className="card mb-3">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">ที่อยู่</h6>
                  </div>
                  <div className="card-body">
                    {viewingUser.address ? (
                      <>
                        <p>
                          {viewingUser.address.houseNo && `บ้านเลขที่ ${viewingUser.address.houseNo} `}
                          {viewingUser.address.village && `หมู่ ${viewingUser.address.village} `}
                          {viewingUser.address.soi && `ซอย ${viewingUser.address.soi} `}
                          {viewingUser.address.road && `ถนน ${viewingUser.address.road} `}
                        </p>
                        <p>
                          {viewingUser.address.subDistrict && `ตำบล/แขวง ${viewingUser.address.subDistrict} `}
                          {viewingUser.address.district && `อำเภอ/เขต ${viewingUser.address.district} `}
                        </p>
                        <p>
                          {viewingUser.address.province && `จังหวัด ${viewingUser.address.province} `}
                          {viewingUser.address.postalCode && `รหัสไปรษณีย์ ${viewingUser.address.postalCode}`}
                        </p>
                      </>
                    ) : (
                      <p>-</p>
                    )}
                  </div>
                </div>
                
                {/* โซเชียลมีเดีย */}
                <div className="card mb-3">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">โซเชียลมีเดีย</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4">
                        <p><strong>Facebook:</strong> {viewingUser.socialMedia?.facebook || '-'}</p>
                      </div>
                      <div className="col-md-4">
                        <p><strong>LINE:</strong> {viewingUser.socialMedia?.line || '-'}</p>
                      </div>
                      <div className="col-md-4">
                        <p><strong>Instagram:</strong> {viewingUser.socialMedia?.instagram || '-'}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4">
                        <p><strong>Twitter:</strong> {viewingUser.socialMedia?.twitter || '-'}</p>
                      </div>
                      <div className="col-md-4">
                        <p><strong>TikTok:</strong> {viewingUser.socialMedia?.tiktok || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* ข้อมูลเพิ่มเติม */}
                <div className="card mb-3">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">ข้อมูลเพิ่มเติม</h6>
                  </div>
                  <div className="card-body">
                    <p><strong>ไลฟ์สไตล์:</strong> {viewingUser.lifestyle || '-'}</p>
                    <p><strong>งานอดิเรก:</strong> {viewingUser.hobbies?.length ? viewingUser.hobbies.join(', ') : '-'}</p>
                  </div>
                </div>
                
                {/* รูปภาพ */}
                {(viewingUser.profileImage || viewingUser.idCardImages?.front || viewingUser.idCardImages?.back) && (
                  <div className="card mb-3">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">รูปภาพ</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        {viewingUser.profileImage && (
                          <div className="col-md-4 mb-3">
                            <p><strong>รูปโปรไฟล์:</strong></p>
                            <div 
                              className="image-preview-container" 
                              style={{ 
                                cursor: 'pointer',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '10px',
                                textAlign: 'center',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                              onClick={() => {
                                const imageUrl = getImageUrl(viewingUser.profileImage);
                                if (imageUrl) {
                                  handleViewImage(imageUrl, `รูปโปรไฟล์ - ${viewingUser.firstName} ${viewingUser.lastName}`);
                                }
                              }}
                            >
                              <img 
                                src={getImageUrl(viewingUser.profileImage)} 
                                alt="Profile" 
                                className="img-fluid rounded"
                                style={{ maxHeight: '150px', maxWidth: '100%', display: 'block' }}
                                onError={(e) => {
                                  console.error('Profile image failed to load:', e.target.src);
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'block';
                                }}
                                onLoad={(e) => {
                                  e.target.nextElementSibling.style.display = 'none';
                                }}
                              />
                              <div style={{ display: 'none', color: '#dc3545', textAlign: 'center' }}>
                                <i className="fas fa-exclamation-triangle fa-2x mb-2"></i>
                                <p>ไม่สามารถโหลดรูปภาพ</p>
                                <small>Path: {viewingUser.profileImage}</small>
                              </div>
                              <div className="mt-2">
                                <small className="text-primary">คลิกเพื่อดูรูปใหญ่</small>
                              </div>
                            </div>
                          </div>
                        )}
                        {viewingUser.idCardImages?.front && (
                          <div className="col-md-4 mb-3">
                            <p><strong>บัตรประชาชนด้านหน้า:</strong></p>
                            <div 
                              className="image-preview-container" 
                              style={{ 
                                cursor: 'pointer',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '10px',
                                textAlign: 'center',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                              onClick={() => {
                                const imageUrl = getImageUrl(viewingUser.idCardImages.front);
                                if (imageUrl) {
                                  handleViewImage(imageUrl, `บัตรประชาชนด้านหน้า - ${viewingUser.firstName} ${viewingUser.lastName}`);
                                }
                              }}
                            >
                              <img 
                                src={getImageUrl(viewingUser.idCardImages.front)} 
                                alt="ID Card Front" 
                                className="img-fluid rounded"
                                style={{ maxHeight: '150px', maxWidth: '100%', display: 'block' }}
                                onError={(e) => {
                                  console.error('ID card front image failed to load:', e.target.src);
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'block';
                                }}
                                onLoad={(e) => {
                                  e.target.nextElementSibling.style.display = 'none';
                                }}
                              />
                              <div style={{ display: 'none', color: '#dc3545', textAlign: 'center' }}>
                                <i className="fas fa-exclamation-triangle fa-2x mb-2"></i>
                                <p>ไม่สามารถโหลดรูปภาพ</p>
                                <small>Path: {viewingUser.idCardImages.front}</small>
                              </div>
                              <div className="mt-2">
                                <small className="text-primary">คลิกเพื่อดูรูปใหญ่</small>
                              </div>
                            </div>
                          </div>
                        )}
                        {viewingUser.idCardImages?.back && (
                          <div className="col-md-4 mb-3">
                            <p><strong>บัตรประชาชนด้านหลัง:</strong></p>
                            <div 
                              className="image-preview-container" 
                              style={{ 
                                cursor: 'pointer',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '10px',
                                textAlign: 'center',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                              onClick={() => {
                                const imageUrl = getImageUrl(viewingUser.idCardImages.back);
                                if (imageUrl) {
                                  handleViewImage(imageUrl, `บัตรประชาชนด้านหลัง - ${viewingUser.firstName} ${viewingUser.lastName}`);
                                }
                              }}
                            >
                              <img 
                                src={getImageUrl(viewingUser.idCardImages.back)} 
                                alt="ID Card Back" 
                                className="img-fluid rounded"
                                style={{ maxHeight: '150px', maxWidth: '100%', display: 'block' }}
                                onError={(e) => {
                                  console.error('ID card back image failed to load:', e.target.src);
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'block';
                                }}
                                onLoad={(e) => {
                                  e.target.nextElementSibling.style.display = 'none';
                                }}
                              />
                              <div style={{ display: 'none', color: '#dc3545', textAlign: 'center' }}>
                                <i className="fas fa-exclamation-triangle fa-2x mb-2"></i>
                                <p>ไม่สามารถโหลดรูปภาพ</p>
                                <small>Path: {viewingUser.idCardImages.back}</small>
                              </div>
                              <div className="mt-2">
                                <small className="text-primary">คลิกเพื่อดูรูปใหญ่</small>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {getUserStatus(viewingUser) === 'pending' && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        handleApprove(viewingUser.userData?._id || viewingUser._id);
                        setShowViewModal(false);
                      }}
                      disabled={processing[viewingUser.userData?._id || viewingUser._id]}
                    >
                      อนุมัติ
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        handleReject(viewingUser.userData?._id || viewingUser._id);
                        setShowViewModal(false);
                      }}
                      disabled={processing[viewingUser.userData?._id || viewingUser._id]}
                    >
                      ปฏิเสธ
                    </button>
                  </>
                )}
                <button type="button" className="btn btn-primary" onClick={() => setShowViewModal(false)}>
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal แสดงรูปขยาย */}
      {showImageModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">{selectedImageTitle}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowImageModal(false)}></button>
              </div>
              <div className="modal-body text-center">
                <img 
                  src={selectedImage} 
                  alt={selectedImageTitle}
                  className="img-fluid"
                  style={{ maxHeight: '70vh' }}
                />
              </div>
              <div className="modal-footer border-secondary">
                <button type="button" className="btn btn-secondary" onClick={() => setShowImageModal(false)}>
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ✅ Edit User Modal - ใส่เนื้อหาให้ครบ */}
      {showEditModal && editingUser && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">แก้ไขข้อมูลผู้ใช้: {editingUser.firstName} {editingUser.lastName}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  
                  {/* ข้อมูลส่วนตัว */}
                  <div className="card mb-3">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">ข้อมูลส่วนตัว</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">ชื่อ</label>
                          <input
                            type="text"
                            className="form-control"
                            name="firstName"
                            value={editFormData.firstName || ''}
                            onChange={handleEditChange}
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">นามสกุล</label>
                          <input
                            type="text"
                            className="form-control"
                            name="lastName"
                            value={editFormData.lastName || ''}
                            onChange={handleEditChange}
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">ชื่อเล่น</label>
                          <input
                            type="text"
                            className="form-control"
                            name="nickName"
                            value={editFormData.nickName || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">อีเมล</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={editFormData.email || ''}
                            onChange={handleEditChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">เบอร์โทร</label>
                          <input
                            type="tel"
                            className="form-control"
                            name="phoneNumber"
                            value={editFormData.phoneNumber || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-3 mb-3">
                          <label className="form-label">อายุ</label>
                          <input
                            type="number"
                            className="form-control"
                            name="age"
                            value={editFormData.age || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">วันเกิด</label>
                          <input
                            type="date"
                            className="form-control"
                            name="birthDate"
                            value={editFormData.birthDate || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">เพศ</label>
                          <select
                            className="form-control"
                            name="gender"
                            value={editFormData.gender || ''}
                            onChange={handleEditChange}
                          >
                            <option value="">เลือก</option>
                            <option value="male">ชาย</option>
                            <option value="female">หญิง</option>
                            <option value="other">อื่นๆ</option>
                          </select>
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">สัญชาติ</label>
                          <input
                            type="text"
                            className="form-control"
                            name="nationality"
                            value={editFormData.nationality || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-3 mb-3">
                          <label className="form-label">กรุ๊ปเลือด</label>
                          <select
                            className="form-control"
                            name="bloodType"
                            value={editFormData.bloodType || ''}
                            onChange={handleEditChange}
                          >
                            <option value="">เลือก</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="AB">AB</option>
                            <option value="O">O</option>
                          </select>
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">น้ำหนัก (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            className="form-control"
                            name="weight"
                            value={editFormData.weight || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">ส่วนสูง (cm)</label>
                          <input
                            type="number"
                            step="0.1"
                            className="form-control"
                            name="height"
                            value={editFormData.height || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">เลขบัตรประชาชน</label>
                          <input
                            type="text"
                            className="form-control"
                            name="idCardNumber"
                            value={editFormData.idCardNumber || ''}
                            onChange={handleEditChange}
                            pattern="[0-9]{13}"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* ที่อยู่ */}
                  <div className="card mb-3">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">ที่อยู่</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-3 mb-3">
                          <label className="form-label">บ้านเลขที่</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address.houseNo"
                            value={editFormData.address?.houseNo || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">หมู่บ้าน</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address.village"
                            value={editFormData.address?.village || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">ซอย</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address.soi"
                            value={editFormData.address?.soi || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">ถนน</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address.road"
                            value={editFormData.address?.road || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-3 mb-3">
                          <label className="form-label">ตำบล/แขวง</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address.subDistrict"
                            value={editFormData.address?.subDistrict || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">อำเภอ/เขต</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address.district"
                            value={editFormData.address?.district || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">จังหวัด</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address.province"
                            value={editFormData.address?.province || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">รหัสไปรษณีย์</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address.postalCode"
                            value={editFormData.address?.postalCode || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* โซเชียลมีเดีย */}
                  <div className="card mb-3">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">โซเชียลมีเดีย</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Facebook</label>
                          <input
                            type="text"
                            className="form-control"
                            name="socialMedia.facebook"
                            value={editFormData.socialMedia?.facebook || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">LINE</label>
                          <input
                            type="text"
                            className="form-control"
                            name="socialMedia.line"
                            value={editFormData.socialMedia?.line || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Instagram</label>
                          <input
                            type="text"
                            className="form-control"
                            name="socialMedia.instagram"
                            value={editFormData.socialMedia?.instagram || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Twitter</label>
                          <input
                            type="text"
                            className="form-control"
                            name="socialMedia.twitter"
                            value={editFormData.socialMedia?.twitter || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">TikTok</label>
                          <input
                            type="text"
                            className="form-control"
                            name="socialMedia.tiktok"
                            value={editFormData.socialMedia?.tiktok || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* ข้อมูลเพิ่มเติม */}
                  <div className="card mb-3">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">ข้อมูลเพิ่มเติม</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">ไลฟ์สไตล์</label>
                          <textarea
                            className="form-control"
                            name="lifestyle"
                            value={editFormData.lifestyle || ''}
                            onChange={handleEditChange}
                            rows="3"
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">งานอดิเรก (คั่นด้วยเครื่องหมายจุลภาค)</label>
                          <textarea
                            className="form-control"
                            name="hobbies"
                            value={editFormData.hobbies?.join(', ') || ''}
                            onChange={handleHobbiesChange}
                            rows="3"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    ยกเลิก
                  </button>
                  <button type="submit" className="btn btn-primary">
                    บันทึกการเปลี่ยนแปลง
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