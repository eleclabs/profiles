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
  const [viewMode, setViewMode] = useState('all'); // 'all', 'pending', or 'approved'
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    // ตรวจสอบ token และ user role 
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
  
  // ✅ แก้ไข: fetch ข้อมูลทั้งหมดเพียงครั้งเดียว
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      console.log('Fetching all users...');
      
      const res = await fetch('http://localhost:8000/api/admin/all-users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Fetched all users data:', data);
      
      // แสดงโครงสร้างข้อมูลเพื่อตรวจสอบ
      if (data.length > 0) {
        console.log('Sample user structure:', data[0]);
        console.log('Approval status from userData:', data[0].userData?.approvalStatus);
        console.log('Approval status direct:', data[0].approvalStatus);
      }
      
      setAllUsers(data);
      setError('');
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${err.message}`);
      
      // ถ้า token หมดอายุ
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ ไม่ต้อง fetch ใหม่เมื่อเปลี่ยน viewMode
  
  // ฟังก์ชันช่วยในการดึงสถานะผู้ใช้
  const getUserStatus = (user) => {
    // ลองตรวจสอบจากหลายๆ ที่
    return user.userData?.approvalStatus || user.approvalStatus || 'pending';
  };
  
  // คำนวณจำนวนผู้ใช้ตามสถานะต่างๆ จาก allUsers เสมอ
  const pendingCount = allUsers.filter(u => getUserStatus(u) === 'pending').length;
  const approvedCount = allUsers.filter(u => getUserStatus(u) === 'approved').length;
  const rejectedCount = allUsers.filter(u => getUserStatus(u) === 'rejected').length;
  
  console.log('Counts - Total:', allUsers.length, 'Pending:', pendingCount, 'Approved:', approvedCount, 'Rejected:', rejectedCount);
  
  const handleApprove = async (userId) => {
    // Get current click count for this user
    const currentClicks = approvalClicks[userId] || 0;
    const newClicks = currentClicks + 1;
    
    // Check if this is the third click
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
        // Reset click count after successful approval
        setApprovalClicks(prev => ({ ...prev, [userId]: 0 }));
        
        // ✅ อัปเดตสถานะใน state โดยไม่ต้อง fetch ใหม่
        setAllUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.userData?._id === userId || user._id === userId) {
              // อัปเดตสถานะเป็น approved
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
        // ✅ อัปเดตสถานะใน state โดยไม่ต้อง fetch ใหม่
        setAllUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.userData?._id === userId || user._id === userId) {
              // อัปเดตสถานะเป็น rejected
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
    console.log('Editing user data:', user);
    setEditingUser(user);
    
    // แก้ไขการดึงข้อมูลให้ถูกต้องตามโครงสร้าง
    setEditFormData({
      // ข้อมูลจาก profile
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
      
      // ข้อมูลที่อยู่ใน nested objects
      address: user.address || {
        houseNo: '',
        village: '',
        soi: '',
        road: '',
        subDistrict: '',
        district: '',
        province: '',
        postalCode: ''
      },
      socialMedia: user.socialMedia || {
        facebook: '',
        line: '',
        instagram: '',
        twitter: '',
        tiktok: ''
      },
      lifestyle: user.lifestyle || '',
      hobbies: user.hobbies || [],
      
      // ข้อมูลจาก userData (email)
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
        
        // ✅ อัปเดตข้อมูลใน state โดยไม่ต้อง fetch ใหม่
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
    
    // จัดการกับ nested object (address และ socialMedia)
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
    if (!confirm(`คุณต้องการลบผู้ใช้ "${user.firstName} ${user.lastName}" ใช่หรือไม่?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้!`)) {
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
        
        // ✅ ลบผู้ใช้ออกจาก state
        setAllUsers(prevUsers => 
          prevUsers.filter(u => u.userData?._id !== user.userData._id)
        );
      } else {
        const responseText = await res.text();
        console.error('Delete user error response:', responseText);
        
        if (responseText.includes('<!DOCTYPE')) {
          alert('เกิดข้อผิดพลาด: Backend server ไม่พบ route หรือมีข้อผิดพลาด\nกรุณา restart backend server');
        } else {
          try {
            const errorData = JSON.parse(responseText);
            alert(errorData.message || 'เกิดข้อผิดพลาด');
          } catch {
            alert(`เกิดข้อผิดพลาด: ${res.status} - ${responseText.substring(0, 100)}`);
          }
        }
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
        alert('เลิกอนุมัติผู้ใช้เรียบร้อย');
        
        // ✅ อัปเดตสถานะเป็น pending
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
        const responseText = await res.text();
        console.error('Revoke approval error response:', responseText);
        
        if (responseText.includes('<!DOCTYPE')) {
          alert('เกิดข้อผิดพลาด: Backend server ไม่พบ route หรือมีข้อผิดพลาด\nกรุณา restart backend server');
        } else {
          try {
            const errorData = JSON.parse(responseText);
            alert(errorData.message || 'เกิดข้อผิดพลาด');
          } catch {
            alert(`เกิดข้อผิดพลาด: ${res.status} - ${responseText.substring(0, 100)}`);
          }
        }
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
        // ✅ อัปเดตสถานะทั้งหมดเป็น approved
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
                                    {/* ปุ่มแก้ไข - ใช้ได้เฉพาะอนุมัติแล้ว */}
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
                                    
                                    {/* ปุ่มเลิกอนุมัติ - ใช้ได้เฉพาะอนุมัติแล้ว */}
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
                                    
                                    {/* ปุ่มลบ - ใช้ได้ทุกสถานะ */}
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleDeleteUser(user)}
                                      title="ลบผู้ใช้ออกจากระบบ"
                                    >
                                      <i className="fas fa-user-times"></i>
                                      <span className="d-none d-md-inline ms-1">ลบ</span>
                                    </button>
                                    
                                    {/* ปุ่มอนุมัติและปฏิเสธ - ใช้ได้เฉพาะรออนุมัติ */}
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
      
      {/* Edit User Modal - ฟอร์มแก้ไขข้อมูลครบถ้วน */}
      {showEditModal && editingUser && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">แก้ไขข้อมูลผู้ใช้: {editingUser.firstName} {editingUser.lastName}</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {/* ข้อมูลส่วนตัว - เหมือนเดิม */}
                  {/* ... */}
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