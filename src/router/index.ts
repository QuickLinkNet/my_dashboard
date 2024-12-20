import {createRouter, createWebHistory, RouterOptions} from 'vue-router';
import { routes } from './routes';
import { authGuard } from './guards';

const router = createRouter(<RouterOptions>{
  history: createWebHistory(),
  routes
});

router.beforeEach(authGuard);

export default router;
