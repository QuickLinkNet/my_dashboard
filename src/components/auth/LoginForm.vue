<template>
  <form @submit.prevent="handleLogin" class="login-form">
    <div class="field">
      <FloatLabel variant="in">
        <IconField class="icon-field">
          <InputIcon class="pi pi-user" />
          <InputText
              id="username"
              v-model="loginForm.username"
              autocomplete="off"
              :class="{'p-invalid': submitted && !loginForm.username}"
              aria-describedby="username-error"
              variant="filled"
          />
        </IconField>
        <label for="username">Benutzername</label>
      </FloatLabel>
      <small id="username-error" class="p-error" v-if="submitted && !loginForm.username">
        Benutzername wird benötigt
      </small>
    </div>

    <div class="field">
      <FloatLabel variant="in">
        <Password
            id="password"
            v-model="loginForm.password"
            :feedback="false"
            :toggleMask="true"
            :class="{'p-invalid': submitted && !loginForm.password}"
            aria-describedby="password-error"
            variant="filled"
        />
        <label for="password">Passwort</label>
      </FloatLabel>
      <small id="password-error" class="p-error" v-if="submitted && !loginForm.password">
        Passwort wird benötigt
      </small>
    </div>

    <div class="field-checkbox">
      <Checkbox v-model="loginForm.rememberMe" :binary="true" id="rememberme" />
      <label for="rememberme">Eingeloggt bleiben</label>
    </div>

    <Button type="submit" label="Login" icon="pi pi-sign-in" class="w-full" />
  </form>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import FloatLabel from 'primevue/floatlabel';
import { useAuth } from '../../composables/useAuth';

const { loginForm, submitted, handleLogin } = useAuth();
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.field {
  margin-bottom: 0.5rem;
}

.icon-field {
  display: flex;
  align-items: center;
  width: 100%;
}

.icon-field .pi {
  margin-right: 0.5rem;
}

.p-error {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--red-500);
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-inputtext) {
  width: 100%;
}

/* Animation for form elements */
.field {
  animation: slideUp 0.3s ease-out;
  animation-fill-mode: both;
}

.field:nth-child(1) { animation-delay: 0.1s; }
.field:nth-child(2) { animation-delay: 0.2s; }
.field-checkbox { animation-delay: 0.3s; }
.field-checkbox label {
  margin-left: 16px;
}
:deep(.p-button) { animation-delay: 0.4s; }

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
