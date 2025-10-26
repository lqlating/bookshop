import { createRouter, createWebHistory } from 'vue-router';
import Discover from '../components/discover/Discover.vue';
import Notify from '../components/notify/Notify.vue';
import Me from "../components/me/Me.vue";
import LikeList from "../components/me/meInfo/LikeList.vue";
import Note from "../components/me/meInfo/Note.vue";
import StarList from "../components/me/meInfo/StarList.vue";
import Book from "../components/me/meInfo/Book.vue";
import Publish from '../components/publish/Publish.vue';
import Market from '../components/market/Market.vue';
import Cart from '../components/cart/cart.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/Discover'
        },
        {
            path: '/Market',
            component: Market
        },
        {
            path: '/Cart',
            component: Cart
        },
        {
            path: '/Discover',
            component: Discover,
        },
        {
            path: '/Publish',
            component: Publish
        },
        {
            path: '/Notify',
            component: Notify,
            children: [
                {
                    path: '',
                    redirect: 'becomment',
                },
                {
                    path: 'becomment',
                    component: () => import('../components/notify/becomment/becomment.vue')
                },
                {
                    path: 'like_star',
                    component: () => import('../components/notify/like_star/like_star.vue')
                },
                {
                    path: 'newSubscript',
                    component: () => import('../components/notify/newSubscript/newSubscript.vue')
                },
                {
                    path: 'privateChat',
                    component: () => import('../components/notify/PrivateChat.vue')
                },
                {
                    path: 'transactions',
                    component: () => import('../components/notify/transactions.vue')
                }
            ]
        },
        {
            path: '/Me',
            component: Me,
            children: [
                {
                    path: '',
                    redirect: 'Note'
                },
                {
                    path: 'LikeList',
                    component: LikeList
                },
                {
                    path: 'Note',
                    component: Note
                },
                {
                    path: 'StarList',
                    component: StarList
                },
                {
                    path: 'Book',
                    component: Book
                },
            ]
        }
    ]
});

export default router;
