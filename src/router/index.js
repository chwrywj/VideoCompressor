import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'video-compress',
      component: () => import('../views/VideoCompress.vue')
    }
  ]
})

export default router
