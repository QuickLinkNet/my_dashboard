import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import type { LoginForm } from '../types/auth';
import { showToast } from '../utils/toast';
import { authService } from '../services/authService';

export function useAuth() {
  const router = useRouter();
  const toast = useToast();
  const submitted = ref(false);
  const loading = ref(false);

  const loginForm = ref<LoginForm>({
    username: '',
    password: '',
    rememberMe: false
  });

  const validateForm = (): boolean => {
    submitted.value = true;

    if (!loginForm.value.username || !loginForm.value.password) {
      showToast(toast, {
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all required fields'
      });
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      loading.value = true;
      const response = await authService.login(
        loginForm.value.username,
        loginForm.value.password
      );

      authService.setToken(response.token);

      if (loginForm.value.rememberMe) {
        localStorage.setItem('rememberedUsername', loginForm.value.username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }

      showToast(toast, {
        severity: 'success',
        summary: 'Success',
        detail: 'Login successful'
      });

      router.push('/');
    } catch (error: any) {
      showToast(toast, {
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data || 'Login failed'
      });
    } finally {
      loading.value = false;
    }
  };

  const handleLogout = () => {
    authService.removeToken();
    router.push('/login');
  };

  const handleForgotPassword = () => {
    showToast(toast, {
      severity: 'info',
      summary: 'Info',
      detail: 'Password reset functionality not implemented'
    });
  };

  return {
    loginForm,
    submitted,
    loading,
    handleLogin,
    handleLogout,
    handleForgotPassword
  };
}
