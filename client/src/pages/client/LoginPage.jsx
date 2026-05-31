import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faPhone, faEye, faEyeSlash, faFilm } from '@fortawesome/free-solid-svg-icons';
import { gqlRequest } from '../../services/graphql';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        const data = await gqlRequest(
          `mutation($fullName:String!,$email:String!,$password:String!,$phone:String!){ clientRegister(fullName:$fullName,email:$email,password:$password,phone:$phone){ token user { fullName } } }`,
          { fullName, email, password, phone },
          false
        );
        localStorage.setItem('clientToken', data.clientRegister.token);
        navigate(redirect);
      } else {
        const data = await gqlRequest(
          `mutation($email:String!,$password:String!){ clientLogin(email:$email,password:$password){ token user { fullName } } }`,
          { email, password },
          false
        );
        localStorage.setItem('clientToken', data.clientLogin.token);
        navigate(redirect);
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] py-12 px-4 flex items-center justify-center">
      {/* Bento-style glassmorphism login card */}
      <main className="w-full max-w-[460px] client-surface rounded-3xl overflow-hidden shadow-2xl p-8 border border-brand-pearl/10 relative z-10">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="text-center flex flex-col gap-2">
            <h1 className="font-display font-black text-3xl text-brand-studio tracking-widest uppercase flex items-center justify-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-studio/25 text-brand-studio client-glow"><FontAwesomeIcon icon={faFilm} className="text-sm" /></span>
              CineVerse
            </h1>
            <p className="text-xs font-semibold text-brand-pearl uppercase tracking-wider mt-1.5">
              {isRegister ? 'Đăng ký tài khoản xem phim' : 'Chào mừng bạn quay trở lại với không gian điện ảnh'}
            </p>
          </div>

          {error && (
            <div className="bg-pink-50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400 p-3 rounded-xl border border-pink-500/10 text-xs font-semibold text-center leading-normal animate-fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                {/* FullName Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-brand-peach uppercase tracking-wider" htmlFor="fullName">Họ và Tên</label>
                  <div className="relative flex items-center">
                    <FontAwesomeIcon icon={faUser} className="absolute left-4 text-brand-pearl/70 text-xs" />
                    <input
                      className="w-full pl-10 pr-4 py-2.5 bg-brand-black/25 dark:bg-white/5 border border-brand-pearl/20 rounded-xl text-xs text-brand-peach outline-none transition focus:border-brand-studio focus:ring-2 focus:ring-brand-studio/25 placeholder:text-brand-pearl/40"
                      id="fullName"
                      placeholder="Nguyễn Văn A"
                      required
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Phone Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-brand-peach uppercase tracking-wider" htmlFor="phone">Số điện thoại</label>
                  <div className="relative flex items-center">
                    <FontAwesomeIcon icon={faPhone} className="absolute left-4 text-brand-pearl/70 text-xs" />
                    <input
                      className="w-full pl-10 pr-4 py-2.5 bg-brand-black/25 dark:bg-white/5 border border-brand-pearl/20 rounded-xl text-xs text-brand-peach outline-none transition focus:border-brand-studio focus:ring-2 focus:ring-brand-studio/25 placeholder:text-brand-pearl/40"
                      id="phone"
                      placeholder="0901234567"
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-peach uppercase tracking-wider" htmlFor="email">Email</label>
              <div className="relative flex items-center">
                <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 text-brand-pearl/70 text-xs" />
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-black/25 dark:bg-white/5 border border-brand-pearl/20 rounded-xl text-xs text-brand-peach outline-none transition focus:border-brand-studio focus:ring-2 focus:ring-brand-studio/25 placeholder:text-brand-pearl/40"
                  id="email"
                  placeholder="email@vi-du.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-brand-peach uppercase tracking-wider" htmlFor="password">Mật khẩu</label>
                {!isRegister && <a className="text-[10px] font-bold text-brand-studio uppercase tracking-wider hover:underline" href="#">Quên mật khẩu?</a>}
              </div>
              <div className="relative flex items-center">
                <FontAwesomeIcon icon={faLock} className="absolute left-4 text-brand-pearl/70 text-xs" />
                <input
                  className="w-full pl-10 pr-10 py-2.5 bg-brand-black/25 dark:bg-white/5 border border-brand-pearl/20 rounded-xl text-xs text-brand-peach outline-none transition focus:border-brand-studio focus:ring-2 focus:ring-brand-studio/25 placeholder:text-brand-pearl/40"
                  id="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-4 text-brand-pearl hover:text-brand-peach transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-xs" />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="w-full mt-4 py-3 bg-brand-studio text-white font-display font-extrabold uppercase tracking-widest text-xs rounded-xl shadow-lg hover:shadow-brand-studio/30 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : isRegister ? 'Đăng ký' : 'Đăng nhập'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 py-2 text-brand-pearl/50">
            <div className="h-[1px] flex-grow bg-brand-pearl/15"></div>
            <span className="text-[10px] font-display font-black tracking-widest uppercase text-brand-pearl/60">Hoặc</span>
            <div className="h-[1px] flex-grow bg-brand-pearl/15"></div>
          </div>

          {/* Switch link */}
          <p className="text-center text-xs font-semibold text-brand-pearl">
            {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
            <button
              className="text-brand-studio font-extrabold hover:underline"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
            >
              {isRegister ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
