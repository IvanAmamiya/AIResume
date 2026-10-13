<template>
  <div class="not-found">
    <a-result status="404" title="404" :sub-title="$t('error.notFound')">
      <template #extra>
        <a-button type="primary" @click="$router.push('/')"> {{ $t('common.home') }} </a-button>
      </template>
    </a-result>
  </div>
</template>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>