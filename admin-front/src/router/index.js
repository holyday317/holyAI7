import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../components/AdminLayout.vue'
import HomeView from '../views/HomeView.vue'
import TableView from '../views/TableView.vue'
import UsersView from '../views/UsersView.vue'
import ConversationsView from '../views/ConversationsView.vue'
import BookmarksView from '../views/BookmarksView.vue'
import StatisticsView from '../views/StatisticsView.vue'
import ActivityView from '../views/ActivityView.vue'
import LogsView from '../views/LogsView.vue'
import ConfigView from '../views/ConfigView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AdminLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView
        },
        {
          path: 'users',
          name: 'users',
          component: UsersView
        },
        {
          path: 'conversations',
          name: 'conversations',
          component: ConversationsView
        },
        {
          path: 'bookmarks',
          name: 'bookmarks',
          component: BookmarksView
        },
        {
          path: 'statistics',
          name: 'statistics',
          component: StatisticsView
        },
        {
          path: 'activity',
          name: 'activity',
          component: ActivityView
        },
        {
          path: 'logs',
          name: 'logs',
          component: LogsView
        },
        {
          path: 'config',
          name: 'config',
          component: ConfigView
        },
        {
          path: 'table/:name',
          name: 'table',
          component: TableView
        }
      ]
    }
  ]
})

export default router
