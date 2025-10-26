<script setup>
import MyHeader from './components/MyHeader/MyHeader.vue'
import MainBody from './components/mainBody/MainBody.vue'
</script>

<template>
    <div class="boss">
        <MyHeader class="myheader" style="margin-bottom: 40px;"/>
        <MainBody/>
    </div>
  
</template>

<style scoped>
.boss{
    padding: 10px 0 0;
    
}
.myheader{
    padding-right: 22px;
}
/* Reset CSS */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
</style>
