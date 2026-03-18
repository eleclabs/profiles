import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Form submitted with data:', formData);

    // ตรวจสอบรหัสผ่าน
    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    console.log('Loading set to true');

    try {
      console.log('Sending request to backend...');
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      console.log('Response received:', res.status, res.statusText);
      const data = await res.json();
      console.log('Response data:', data);

      if (res.ok) {
        // เก็บ token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        console.log('Registration successful, redirecting to profile creation...');
        router.push('/profilecreate');
      } else {
        console.log('Registration failed:', data.message);
        setError(data.message);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">สมัครสมาชิก</h4>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">อีเมล</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">รหัสผ่าน</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">ยืนยันรหัสผ่าน</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength="6"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก'}
                  </button>
                </form>

                <div className="mt-3 text-center">
                  <p>มีบัญชีแล้ว? <Link href="/login">เข้าสู่ระบบ</Link></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
