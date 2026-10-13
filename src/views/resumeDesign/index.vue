<template>
  <div class="coding">
    <a-result status="403" :title="$t('development.title')" :sub-title="$t('development.description')">
      <template #icon>
        <div class="coding-icon">
          <loading-outlined spin />
        </div>
      </template>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="$router.push('/')"> {{ $t('common.home') }} </a-button>
        </a-space>
      </template>
    </a-result>
  </div>
</template>

<script setup lang="ts">
import { LoadingOutlined } from '@ant-design/icons-vue';


</script>

<style scoped>
.coding {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.coding-icon {
  font-size: 72px;
  color: #1890ff;
  margin-bottom: 24px;
}

.description {
  color: #666;
  font-size: 14px;
}

:deep(.ant-result-icon) {
  margin-bottom: 0;
}
</style>
