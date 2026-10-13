<template>
  <div class="settings-container">
    <a-card class="settings-card" :bordered="false">
      <h2 class="title">{{ $t('settings.required') }}</h2>

      <!-- 说明文字 -->
      <p class="tips"> {{ $t('settings.formatHelp') }} <span style="color:red">{{ $t('settings.defaultsHelp') }}</span>
      </p>
      <div class="input-group">
        <label for="api-url">{{ $t('settings.model') }}<span style="color:red">{{ $t('settings.keepDefault') }}</span></label>
        <a-input id="api-url" v-model:value="settingsStore.modelName" :placeholder="$t('settings.modelPlaceholder')" />
        <p class="tips"> {{ $t('settings.modelHelp') }} <a href="https://bailian.console.aliyun.com/#/model-market" target="_blank"> {{ $t('settings.modelsLink') }} </a>。
        </p>
      </div>

      <div class="input-group">
        <label for="api-key">{{ $t('settings.apiKey') }}</label>
        <a-input id="api-key" v-model:value="settingsStore.aliApiKey" :placeholder="$t('settings.apiKeyPlaceholder')" />
        <p class="tips"> {{ $t('settings.apiKeyHelp') }} <a href="https://bailian.console.aliyun.com/?apiKey=1#/api-key" target="_blank">{{ $t('settings.apiKeyLink') }}</a>。
        </p>
      </div>

      <div class="input-group">
        <label for="api-url">API URL<span style="color:red">{{ $t('settings.keepDefault') }}</span></label>
        <a-input id="api-url" v-model:value="settingsStore.aliApiUrl" :placeholder="$t('settings.apiUrlPlaceholder')" />
        <p class="tips"> {{ $t('settings.apiUrlHelp') }} <a href="https://help.aliyun.com/zh/model-studio/developer-reference/use-qwen-by-calling-api" target="_blank"> {{ $t('settings.docsLink') }} </a>。
        </p>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../../store/useSettingsStore';
const settingsStore = useSettingsStore();
</script>

<style scoped>
.settings-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.settings-card {
  width: 100%;
  max-width: 600px;
  background: var(--card-color);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  color: var(--text-color);
}

.title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
  color: var(--primary-color);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-color);
}

.tips {
  font-size: 13px;
  background: rgba(0, 0, 0, 0.05);
  padding: 10px;
  border-radius: 8px;
  color: var(--text-color-secondary);
  line-height: 1.5;
  text-align: justify;
}

.tips a {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s;
}

.tips a:hover {
  color: var(--primary-color-hover);
  text-decoration: underline;
}
</style>
