<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">Sign in</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <input type="text" id="username" placeholder="Username" v-model="loginForm.username" required>
        </div>
        <div class="form-group">
          <input type="password" id="password" placeholder="Password" v-model="loginForm.password" required>
        </div>
        <div class="form-group form-remember">
          <input type="checkbox" id="remember-me" v-model="loginForm.rememberMe">
          <label for="remember-me">Remember me</label>
        </div>
        <div class="form-actions">
          <button type="submit" class="login-button">Login</button>
          <a href="#" class="forgot-password" @click="handleForgotPassword">Forgot password?</a>
        </div>
        <div class="register-link">
          <span>Don't have an account? <a href="#" class="register-now">Register now</a></span>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'Login',
  setup() {
    const loginForm = ref({
      username: '',
      password: '',
      rememberMe: false,
    });

    const handleLogin = () => {
      console.log('Login data', loginForm.value);
    };

    const handleForgotPassword = () => {
      console.log('Forgot password');
    };

    return {
      loginForm,
      handleLogin,
      handleForgotPassword,
    };
  },
});
</script>

<style>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #4c7ef3;
}

.login-card {
  padding: 2em;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 350px;
}

.login-title {
  text-align: center;
  margin-bottom: 2em;
}

.form-group {
  margin-bottom: 1em;
}

.form-group input[type="text"],
.form-group input[type="password"] {
  width: 100%;
  padding: 0.75em;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-group input[type="text"]::placeholder,
.form-group input[type="password"]::placeholder {
  color: #bbb;
}

.form-remember {
  display: flex;
  align-items: center;
  margin-bottom: 2em;

}
.form-remember input[type="checkbox"] {
  margin-right: 0.5em;
}

.form-actions {
  text-align: center;
  margin-bottom: 2em;
}

.login-button {
  width: 100%;
  padding: 0.75em;
  border: none;
  border-radius: 4px;
  background-color: #4c7ef3;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.forgot-password {
  display: block;
  color: #4c7ef3;
  text-decoration: none;
  margin-top: 0.5em;
}

.register-link {
  text-align: center;
  margin-top: 2em;
}

.register-link span {
  color: #fff;
}

.register-now {
  color: #ffc107;
  text-decoration: none;
}

/* Additional styles to match the image */
.login-container {
  font-family: 'Arial', sans-serif;
}

.login-title {
  color: #333;
  font-size: 24px;
}

.form-group input {
  font-size: 16px;
}

.login-button {
  background-color: #007bff;
  box-shadow: none;
  font-size: 16px;
}

.register-link span,
.forgot-password {
  font-size: 14px;
}

/* Adjust padding and margins as needed to match the image */
</style>
