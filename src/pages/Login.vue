<template>
  <div class="login-page">
    <div class="login-container">
      <Card class="login-card">
        <template #header>
          <div class="logo-container">
            <i class="pi pi-user-circle"></i>
          </div>
        </template>
        <template #title>
          <h2 class="text-center">Welcome Back</h2>
          <p class="text-center subtitle">Please sign in to continue</p>
        </template>
        <template #content>
          <LoginForm />
        </template>
        <template #footer>
          <div class="footer-links">
            <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">
              <i class="pi pi-lock mr-2"></i>Passwort vergessen
            </a>
            <div class="divider">
              <span>or</span>
            </div>
            <p class="register-text">
              Sie haben keinen Account?
              <a href="#" class="register-link">Jetzt registrieren</a>
            </p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import LoginForm from '../components/auth/LoginForm.vue';
import { useAuth } from '../composables/useAuth';

const { handleForgotPassword } = useAuth();
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: gradientAnimation 10s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradientAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.login-container {
  width: 100%;
  max-width: 450px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.logo-container {
  text-align: center;
  margin-bottom: 1rem;
}

.logo-container i {
  font-size: 4rem;
  color: var(--primary-color);
  background: linear-gradient(45deg, var(--primary-color), var(--primary-800));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--surface-900);
  margin: 0;
}

.subtitle {
  color: var(--surface-600);
  margin-top: 0.5rem;
  font-size: 1rem;
}

.footer-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
  display: flex;
  align-items: center;
}

.forgot-password:hover {
  color: var(--primary-600);
}

.divider {
  width: 100%;
  text-align: center;
  border-bottom: 1px solid var(--surface-200);
  line-height: 0.1em;
  margin: 1rem 0;
}

.divider span {
  background: white;
  padding: 0 10px;
  color: var(--surface-600);
  font-size: 0.9rem;
}

.register-text {
  color: var(--surface-600);
  font-size: 0.9rem;
  margin: 0;
}

.register-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.register-link:hover {
  color: var(--primary-600);
  text-decoration: underline;
}

:deep(.p-card) {
  border-radius: 1.5rem;
  padding: 1rem;
}

:deep(.p-card-content) {
  padding: 1.5rem 0;
}

:deep(.p-card-footer) {
  padding-top: 0;
}
</style>
