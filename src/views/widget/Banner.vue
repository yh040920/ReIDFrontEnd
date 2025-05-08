<template>
  <ArtBasicBanner
    class="banner"
    :title="`欢迎回来 ${userInfo.username}`"
    :showButton="false"
    backgroundColor="var(--el-color-primary-light-9)"
    titleColor="var(--art-gray-900)"
    subtitleColor="#666"
    style="height: 13.3rem"
    :backgroundImage="bannerCover"
    :showDecoration="false"
    imgWidth="18rem"
    imgBottom="-7.5rem"
    @click="handleBannerClick"
  >
    <div class="banner-slot">
      <div class="item">
        <p class="subtitle">身份</p>
        <p class="title">{{ userInfo.status }}</p>
      </div>
      <div class="item">
        <p class="subtitle">时间</p>
        <p class="title">{{ currentTime }}</p>
      </div>
    </div>
  </ArtBasicBanner>
</template>

<script setup lang="ts">
  import bannerCover from '@imgs/login/lf_icon2.png'
  import { useUserStore } from '@/store/modules/user'
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  
  const userStore = useUserStore()
  const userInfo = computed(() => userStore.getUserInfo)
  
  const currentTime = ref('')
  let timer: number | null = null
  
  const updateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    
    currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
  
  onMounted(() => {
    updateTime()
    timer = setInterval(updateTime, 1000) as unknown as number
  })
  
  onBeforeUnmount(() => {
    if (timer) {
      clearInterval(timer)
    }
  })
  
  const handleBannerClick = () => {}
</script>

<style lang="scss" scoped>
  .banner {
    .banner-slot {
      display: flex;

      .item {
        margin-right: 30px;

        &:first-of-type {
          padding-right: 30px;
          border-right: 1px solid var(--art-gray-300);
        }

        .title {
          font-size: 20px;
          color: var(--art-gray-900) !important;

          i {
            position: relative;
            top: -10px;
            margin-left: 10px;
            font-size: 16px;
          }
        }

        .subtitle {
          border-bottom: 1px solid var(--art-gray-300); 
          margin-top: 4px;
          font-size: 14px;
          color: var(--art-gray-700) !important;
        }
      }
    }
  }
</style>