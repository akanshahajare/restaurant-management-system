import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import { toast } from 'sonner';

const UserLoginPage = () => {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { loginCustomer } = useAuth();

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await api.post('/auth/login', data);

      const { token, user } = response.data.data;

      loginCustomer({
        token,
        user,
      });

      navigate('/menu');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#FAF7F2] px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#D96A3A]">
              CloudCraves Kitchen
            </p>

            <h1 className="mt-3 font-serif text-4xl font-semibold text-[#241B2F]">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to view your orders and continue ordering.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <label className="block text-sm font-medium text-[#241B2F]">
              Email

              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                })}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#D96A3A] focus:ring-2 focus:ring-orange-100"
              />
            </label>

            <label className="block text-sm font-medium text-[#241B2F]">
              Password

              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                })}
                placeholder="Enter your password"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#D96A3A] focus:ring-2 focus:ring-orange-100"
              />
            </label>

            <Button
              type="submit"
              className="w-full py-3"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-[#D96A3A] hover:text-[#C85D31]"
            >
              Create one
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-4 text-center">
            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-[#241B2F]"
            >
              ← Continue as guest
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserLoginPage;