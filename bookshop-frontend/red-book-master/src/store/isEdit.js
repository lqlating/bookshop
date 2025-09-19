import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import axios from 'axios';

export const editInfoStore = defineStore('isEdit', () => {

    const isEditing = ref(false)
    return { isEditing };
});
