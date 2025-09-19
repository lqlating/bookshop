<script setup>

</script>

<template>
    <div>
        <div class="my-txt"><img src="" alt=""><span class="txt-inner">我</span></div>
    </div>
</template>

<style scoped>
.my-txt {
  cursor: pointer;
  padding-left: 10px;
  font-size: 18.4px;
  display: flex;
  align-items: center; /* 垂直居中 */
  height: 48px;
  width: 209px;
  margin-bottom: 5px;
  border-radius: 20px;
  margin-top: 5px;
}
.my-txt:hover{
  background-color: #f0f0f0;
}
.my-txt:active, .my-txt.active {
  background-color: #f0f0f0; /* 设置活跃状态的背景色 */
}
.txt-inner{
  font-size: 16px;
  color: #333333;
  font-weight: bold;
}
img{
  width: 24px;
  height: 24px;
  border-radius: 50%;
}
</style>