import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function CreateProfile() {  // เปลี่ยนชื่อถูกต้องแล้ว
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // ข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nickName: '',
    address: {
      houseNo: '',
      village: '',
      soi: '',
      road: '',
      subDistrict: '',
      district: '',
      province: '',
      postalCode: ''
    },
    idCardNumber: '',
    age: '',
    birthDate: '',
    gender: '',
    nationality: '',
    bloodType: '',
    weight: '',
    height: '',
    phoneNumber: '',
    socialMedia: {
      facebook: '',
      line: '',
      instagram: '',
      twitter: '',
      tiktok: ''
    },
    lifestyle: '',
    hobbies: []
  });
  
  // ไฟล์ที่อัพโหลด
  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  
  // ตรวจสอบการล็อกอินและโหลดข้อมูลโปรไฟล์
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Load existing profile data
    loadProfileData();
    
    // Check if user is pending and show message
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setShowPendingMessage(user.approvalStatus === 'pending');
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  }, []);
  
  // โหลดข้อมูลโปรไฟล์ที่มีอยู่
  const loadProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch('http://localhost:8000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const profileData = await res.json();
        console.log('Loading existing profile data:', profileData);
        
        // อัปเดต formData ด้วยข้อมูลที่มีอยู่
        setFormData({
          firstName: profileData?.firstName || '',
          lastName: profileData?.lastName || '',
          nickName: profileData?.nickName || '',
          address: {
            houseNo: profileData?.address?.houseNo || '',
            village: profileData?.address?.village || '',
            soi: profileData?.address?.soi || '',
            road: profileData?.address?.road || '',
            subDistrict: profileData?.address?.subDistrict || '',
            district: profileData?.address?.district || '',
            province: profileData?.address?.province || '',
            postalCode: profileData?.address?.postalCode || ''
          },
          idCardNumber: profileData?.idCardNumber || '',
          age: profileData?.age || '',
          birthDate: profileData?.birthDate ? new Date(profileData.birthDate).toISOString().split('T')[0] : '',
          gender: profileData?.gender || '',
          nationality: profileData?.nationality || '',
          bloodType: profileData?.bloodType || '',
          weight: profileData?.weight || '',
          height: profileData?.height || '',
          phoneNumber: profileData?.phoneNumber || '',
          socialMedia: {
            facebook: profileData?.socialMedia?.facebook || '',
            line: profileData?.socialMedia?.line || '',
            instagram: profileData?.socialMedia?.instagram || '',
            twitter: profileData?.socialMedia?.twitter || '',
            tiktok: profileData?.socialMedia?.tiktok || ''
          },
          lifestyle: profileData?.lifestyle || '',
          hobbies: profileData?.hobbies || []
        });
      } else if (res.status !== 404) {
        // If not 404, it's a real error
        console.error('Error loading profile:', res.statusText);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // จัดการกับ nested object (address และ socialMedia)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleHobbiesChange = (e) => {
    const hobbies = e.target.value.split(',').map(h => h.trim());
    setFormData(prev => ({
      ...prev,
      hobbies
    }));
  };
  
  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    
    try {
      // Only run on client-side
      if (typeof window === 'undefined') {
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        setSaving(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('กรุณาเข้าสู่ระบบใหม่');
        router.push('/login');
        return;
      }
      
      // แก้ไขข้อมูลก่อนส่ง - ตั้งค่า default สำหรับ gender และ bloodType
      const cleanedFormData = {
        ...formData,
        gender: formData.gender || 'male',
        bloodType: formData.bloodType || 'A'
      };
      
      // Handle empty idCardNumber
      if (!cleanedFormData.idCardNumber || cleanedFormData.idCardNumber.trim() === '') {
        cleanedFormData.idCardNumber = null;
      }
      
      // สร้าง FormData สำหรับส่งไฟล์
      const formDataToSend = new FormData();
      formDataToSend.append('profileData', JSON.stringify(cleanedFormData));
      
      if (idCardFront) formDataToSend.append('idCardFront', idCardFront);
      if (idCardBack) formDataToSend.append('idCardBack', idCardBack);
      if (profileImage) formDataToSend.append('profileImage', profileImage);
      
      console.log('Sending profile data...', cleanedFormData);
      
      // ✅ เพิ่ม timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const res = await fetch('http://localhost:8000/api/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` 
        },
        body: formDataToSend,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // ตรวจสอบว่า response เป็น JSON หรือไม่
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        throw new Error('เซิร์ฟเวอร์ส่งข้อมูลไม่ถูกต้อง');
      }
      
      const data = await res.json();
      console.log('Profile response:', data);
      
      if (res.ok && data.success) {
        // Check if user was previously rejected
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const wasRejected = user.approvalStatus === 'rejected';
        
        setSuccess(wasRejected 
          ? '✅ อัปเดตข้อมูลสำเร็จ! ข้อมูลใหม่ของคุณถูกส่งให้ผู้ดูแลระบบตรวจสอบแล้ว สถานะของคุณจะเปลี่ยนเป็น "รอการอนุมัติ" ชั่วคราว'
          : '✅ บันทึกข้อมูลสำเร็จ! ข้อมูลของคุณถูกส่งให้ผู้ดูแลระบบตรวจสอบแล้ว กรุณารอการอนุมัติก่อนเข้าใช้งานเต็มรูปแบบ'
        );
        
        // อัพเดท user ใน localStorage (client-side only)
        if (typeof window !== 'undefined') {
          try {
            const updatedUser = JSON.parse(localStorage.getItem('user'));
            updatedUser.profileComplete = true;
            // If was rejected, update status to pending on client side for immediate UI update
            if (wasRejected) {
              updatedUser.approvalStatus = 'pending';
            }
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('User data updated in localStorage:', updatedUser);
          } catch (error) {
            console.error('Error updating localStorage:', error);
          }
        }
        
        // ไปที่ profile หลังจาก 3 วินาที
        setTimeout(() => {
          router.push('/profile');
        }, 3000);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err) {
      console.error('Profile error:', err);
      
      if (err.name === 'AbortError') {
        setError('การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองอีกครั้ง');
      } else if (err.message.includes('Failed to fetch')) {
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า backend กำลังทำงานอยู่');
      } else {
        setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + err.message);
      }
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Layout>
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">กรอกข้อมูลโปรไฟล์</h4>
              </div>
              <div className="card-body">
                {/* Loading state */}
                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">กำลังโหลดข้อมูล...</span>
                    </div>
                    <p className="mt-3">กำลังโหลดข้อมูลโปรไฟล์เดิม...</p>
                  </div>
                )}
                
                {/* Pending status message */}
                {!loading && showPendingMessage && (
                  <div className="alert alert-warning" role="alert">
                    <h5 className="alert-heading">📋 รอการอนุมัติ</h5>
                    <p className="mb-0">บัญชีของคุณอยู่ระหว่างการตรวจสอบ คุณสามารถกรอกข้อมูลส่วนตัวได้ตอนนี้ และรอการอนุมัติจากผู้ดูแลระบบ</p>
                  </div>
                )}
                
                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}
                {success && (
                  <div className="alert alert-success">{success}</div>
                )}
                
                {!loading && (
                  <form onSubmit={handleSubmit}>
                  {/* ข้อมูลส่วนตัว */}
                  <div className="card mb-3">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">ข้อมูลส่วนตัว</h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">ชื่อจริง *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">นามสกุล *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">ชื่อเล่น</label>
                          <input
                            type="text"
                            className="form-control"
                            name="nickName"
                            value={formData.nickName}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* ที่อยู่ */}
                  <div className="card mb-3">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">ที่อยู่</h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-3 mb-3">
                          <label className="form-label">บ้านเลขที่</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address.houseNo"
                            value={formData.address.houseNo}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">หมู่บ้าน</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address.village"
                            value={formData.address.village}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">ซอย</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address.soi"
                            value={formData.address.soi}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">ถนน</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address.road"
                            value={formData.address.road}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">ตำบล/แขวง</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address.subDistrict"
                            value={formData.address.subDistrict}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">อำเภอ/เขต</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address.district"
                            value={formData.address.district}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">จังหวัด</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address.province"
                            value={formData.address.province}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">รหัสไปรษณีย์</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address.postalCode"
                            value={formData.address.postalCode}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* ข้อมูลส่วนบุคคล */}
                  <div className="card mb-3">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">ข้อมูลส่วนบุคคล</h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">หมายเลขบัตรประชาชน</label>
                          <input
                            type="text"
                            className="form-control"
                            name="idCardNumber"
                            value={formData.idCardNumber}
                            onChange={handleInputChange}
                            pattern="[0-9]{13}"
                            title="กรุณากรอกหมายเลขบัตรประชาชน 13 หลัก"
                          />
                        </div>
                        <div className="col-md-2 mb-3">
                          <label className="form-label">อายุ</label>
                          <input
                            type="number"
                            className="form-control"
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">วันเกิด</label>
                          <input
                            type="date"
                            className="form-control"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">เพศ</label>
                          <select
                            className="form-select"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                          >
                            <option value="">เลือกเพศ</option>
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
                            value={formData.nationality}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">กรุ๊ปเลือด</label>
                          <select
                            className="form-select"
                            name="bloodType"
                            value={formData.bloodType}
                            onChange={handleInputChange}
                          >
                            <option value="">เลือกกรุ๊ปเลือด</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="AB">AB</option>
                            <option value="O">O</option>
                          </select>
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">น้ำหนัก (กก.)</label>
                          <input
                            type="number"
                            step="0.1"
                            className="form-control"
                            name="weight"
                            value={formData.weight}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">ส่วนสูง (ซม.)</label>
                          <input
                            type="number"
                            step="0.1"
                            className="form-control"
                            name="height"
                            value={formData.height}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* ข้อมูลติดต่อ */}
                  <div className="card mb-3">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">ข้อมูลติดต่อ</h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">เบอร์โทรศัพท์</label>
                          <input
                            type="tel"
                            className="form-control"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Facebook</label>
                          <input
                            type="text"
                            className="form-control"
                            name="socialMedia.facebook"
                            value={formData.socialMedia.facebook}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">LINE</label>
                          <input
                            type="text"
                            className="form-control"
                            name="socialMedia.line"
                            value={formData.socialMedia.line}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Instagram</label>
                          <input
                            type="text"
                            className="form-control"
                            name="socialMedia.instagram"
                            value={formData.socialMedia.instagram}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Twitter</label>
                          <input
                            type="text"
                            className="form-control"
                            name="socialMedia.twitter"
                            value={formData.socialMedia.twitter}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">TikTok</label>
                          <input
                            type="text"
                            className="form-control"
                            name="socialMedia.tiktok"
                            value={formData.socialMedia.tiktok}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* ข้อมูลเพิ่มเติม */}
                  <div className="card mb-3">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">ข้อมูลเพิ่มเติม</h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">ไลฟ์สไตล์</label>
                          <textarea
                            className="form-control"
                            name="lifestyle"
                            rows="3"
                            value={formData.lifestyle}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">งานอดิเรก (คั่นด้วยเครื่องหมายจุลภาค)</label>
                          <textarea
                            className="form-control"
                            name="hobbies"
                            rows="3"
                            value={formData.hobbies.join(', ')}
                            onChange={handleHobbiesChange}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* อัพโหลดรูป */}
                  <div className="card mb-3">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">อัพโหลดรูปภาพ</h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">รูปโปรไฟล์</label>
                          <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setProfileImage)}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">บัตรประชาชนด้านหน้า</label>
                          <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setIdCardFront)}
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">บัตรประชาชนด้านหลัง</label>
                          <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setIdCardBack)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg"
                      disabled={saving}
                    >
                      {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                    </button>
                  </div>
                </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}