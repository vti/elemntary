<template>
  <div class="card">
    <h5 class="card-header">{{ $t("card.system.title") }}</h5>
    <div class="">
      <p class="text-gray-700 text-base">{{ $t("card.system.description") }}</p>
      <div class="pt-4">
        <action-button
          :label="$t('card.system.action.clearCache.label')"
          :loadingLabel="$t('card.system.action.clearCache.progress')"
          :action="clearCache"
        />
      </div>
      <div class="pt-4">
        <action-button
          :label="$t('card.system.action.restartApp.label')"
          :loadingLabel="$t('card.system.action.restartApp.label')"
          :action="restartWahooApplication"
        />
      </div>
      <div class="pt-4">
        <action-button
          :label="$t('card.system.action.reboot.label')"
          :loadingLabel="$t('card.system.action.reboot.progress')"
          :action="rebootDevice"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ActionButton from "./action-button.vue";

export default {
  props: ["deviceId"],
  inject: ["backend"],
  components: {
    ActionButton,
  },
  data() {
    return {};
  },
  created() {},
  methods: {
    clearCache() {
      return this.backend.clearCache(this.deviceId);
    },
    restartWahooApplication() {
      return this.backend.restartApplication(this.deviceId);
    },
    rebootDevice() {
      return this.backend.reboot(this.deviceId);
    },
  },
};
</script>
