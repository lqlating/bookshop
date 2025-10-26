<template>
    <div class="main-body">
      <Subscript
        :isMeinfo="true"
        v-for="subscriptList in subscriptLists"
        :key="subscriptList.id"
        :subscriptList="subscriptList"
      />
      <div class="end-line">- THE END -</div>
    </div>
  </template>
  
  <script setup>
  import Subscript from './subscript.vue'; // Assuming the file is named Subscript.vue
  import { ref, onMounted } from 'vue';
  import { userInfoStore } from '../../../store/user'; // Adjust the path as necessary
  import subscriptApi from '../../../api/subscriptApi'; // Adjust the path as necessary
  import userApi from '../../../api/userApi'; // Adjust the path as necessary
  
  const userStore = userInfoStore();
  const { userThing } = userStore;
  const subscriptLists = ref([]);
  
  // Define a function to fetch subscription users
  async function getSubscripUsers() {
    // Get the list of user IDs who subscribed to the current user's ID
    const res = await subscriptApi.getUserIdbyTargetId(userThing.id);
  
    // Get the current user's target ID list
    const targetRes = await subscriptApi.getTargetId(userThing.id);
    const targetIds = targetRes.data.data; // Array of target IDs
  
    // Fetch all user details and set the interaction flag
    subscriptLists.value = await Promise.all(
      res.data.data.map(async (userId) => {
        const response = await userApi.SearchUserById(userId);
        const userData = response.data.data[0]; // Ensure only the user object is returned
        // Add the interaction property
        userData.interaction = targetIds.includes(userData.id);
        return userData;
      })
    );
    console.log(subscriptLists.value);
  }
  
  onMounted(() => {
    getSubscripUsers();
  });
  </script>
  
  <style scoped>
  .end-line {
    margin-top: 20px;
    text-align: center;
    font-size: 12px;
    color: #33333399;
  }
  
  .main-body {
    max-height: 500px; /* Set maximum height */
    overflow-y: auto; /* Enable vertical scrolling */
    scrollbar-width: none; /* Hide scrollbar for Firefox */
    -ms-overflow-style: none; /* Hide scrollbar for IE and Edge */
  }
  
  /* Hide scrollbar for WebKit browsers */
  .main-body::-webkit-scrollbar {
    display: none;
  }
  </style>
  