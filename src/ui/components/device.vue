<template>
  <div>
    <div v-if="loading"><spinner /></div>
    <div v-else>
      <div v-if="device" class="space-y-4 pb-4">
        <h1 class="text-xl">{{ device.model }} {{ device.id }}</h1>

        <device-software-card :deviceId="device.id" />

        <device-upload-map-card :deviceId="device.id" />

        <device-screenshots-card :deviceId="device.id" />

        <device-features-card :deviceId="device.id" />

        <device-web-server-card :deviceId="device.id" />

        <device-backup-restore-card :deviceId="device.id" />

        <device-system-card :deviceId="device.id" />
      </div>
    </div>
  </div>
</template>

<script>
import DeviceSoftwareCard from "./device-software-card.vue";
import DeviceUploadMapCard from "./device-upload-map-card.vue";
import DeviceScreenshotsCard from "./device-screenshots-card.vue";
import DeviceFeaturesCard from "./device-features-card.vue";
import DeviceWebServerCard from "@/ui/components/device-web-server-card";
import DeviceBackupRestoreCard from "@/ui/components/device-backup-restore-card";
import DeviceSystemCard from "./device-system-card.vue";
import Spinner from "./spinner.vue";

export default {
  inject: ["backend"],
  components: {
    DeviceSoftwareCard,
    DeviceUploadMapCard,
    DeviceScreenshotsCard,
    DeviceWebServerCard,
    DeviceFeaturesCard,
    DeviceBackupRestoreCard,
    DeviceSystemCard,
    Spinner,
  },
  data() {
    return {
      loading: true,
      device: null,
    };
  },
  methods: {
    selectDevice(deviceId) {
      this.loading = true;
      this.backend.getDevice(deviceId).then((device) => {
        this.device = device;

        this.loading = false;
      });
    },
  },
};
</script>
