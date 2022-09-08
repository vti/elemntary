<template>
  <div class="card">
    <h5 class="card-header">System</h5>
    <div class="">
      <p class="text-gray-700 text-base">Various system actions.</p>
      <div class="pt-4">
        <action-button
          label="Clear cache"
          loadingLabel="Clearing..."
          :action="clearCache"
        />
      </div>
      <div class="pt-4">
        <action-button
          label="Restart Wahoo application"
          loadingLabel="Restarting..."
          :action="restartWahooApplication"
        />
      </div>
      <div class="pt-4">
        <action-button
          label="Reboot device"
          loadingLabel="Rebooting..."
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
