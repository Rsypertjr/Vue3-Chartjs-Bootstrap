import { createWebHistory, createRouter } from 'vue-router'
import VotesTable from '../components/VotesTable.vue'
import LineChart from '../components/LineChart.vue'

const routes = [
    {
        path: '/',
        name: 'VotesTable',
        component: VotesTable
    },
    {   
        path: '/linechart',
        name: 'LineChart',
        component: LineChart
    }
]
const router = createRouter({
    history: createWebHistory(),
    //history: createWebHashHistory,
    //history: createMemoryHistory,
    routes, //same --- > routes:routes
})
export default router