import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import ArmyEdit from './components/ArmyEdit.vue';
import ArmyPrint from './components/ArmyPrint.vue';
import ArmyPlay from './components/ArmyPlay.vue';

export const ROUTE_HOME = 'ROUTE_HOME';
export const ROUTE_PRINT = 'ROUTE_PRINT';
export const ROUTE_PLAY = 'ROUTE_PLAY';

const ROUTE_LAYOUT_DEFAULT = 'default';
export const ROUTE_LAYOUT_PLAY = 'play';

const routes: Array<RouteRecordRaw> = [
    {
        name: ROUTE_HOME,
        path: '/',
        component: ArmyEdit,
        meta: {
            layout: ROUTE_LAYOUT_DEFAULT
        }
    },
    {
        name: ROUTE_PRINT,
        path: '/print',
        component: ArmyPrint,
        meta: {
            layout: ROUTE_LAYOUT_DEFAULT
        }
    },
    {
        name: ROUTE_PLAY,
        path: '/play',
        component: ArmyPlay,
        meta: {
            layout: ROUTE_LAYOUT_PLAY
        }
    },
];

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
});
