<template>
  <div class="card">
    <div class="flex">
      <h5 class="card-header">{{ $t("card.software.title") }}</h5>
      <div class="flex-grow"></div>
      <refresh-button @click="loadApkInfo" />
    </div>
    <div class="flex flex-wrap gap-4">
      <div v-if="loading"><spinner /></div>
      <div v-else>
        <p class="text-gray-700 text-base mb-4">
          {{ $t("card.software.version") }}: {{ apkInfo.versionName }} ({{
            apkInfo.versionCode
          }})<br />
          {{ $t("card.software.lastUpdated") }}: {{ apkInfo.lastUpdated }}
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
      apkInfo: null,
    };
  },
  created() {
    this.loadApkInfo();
  },
  methods: {
    loadApkInfo() {
      this.loading = true;

      this.backend.loadApkInfo(this.deviceId).then((info) => {
        this.apkInfo = info;

        this.loading = false;
      });
    },
  },
};
</script>
