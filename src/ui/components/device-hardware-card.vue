<template>
  <div class="card">
    <div class="flex">
      <h5 class="card-header">{{ $t("card.hardware.title") }}</h5>
      <div class="flex-grow"></div>
      <refresh-button @click="loadHardwareInfo" />
    </div>
    <div class="flex flex-wrap gap-4">
      <div v-if="loading"><spinner /></div>
      <div v-else>
        <p class="text-gray-700 text-base mb-4">
          {{ $t("card.hardware.cpu") }}: {{ hardwareInfo.cpu }} {{
            hardwareInfo.model
          }}<br />
          {{ $t("card.hardware.model") }}: {{ hardwareInfo.model }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import RefreshButton from "./refresh-button.vue";
import Spinner from "./spinner.vue";

export default {
  props: ["deviceId"],
  inject: ["backend"],
  components: {
    RefreshButton,
    Spinner,
  },
  data() {
    return {
      loading: true,
      hardwareInfo: null,
    };
  },
  created() {
    this.loadHardwareInfo();
  },
  methods: {
    loadHardwareInfo() {
      this.loading = true;

      this.backend.loadHardwareInfo(this.deviceId).then((info) => {
        this.hardwareInfo = info;

        this.loading = false;
      });
    },
  },
};
</script>
