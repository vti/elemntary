<template>
  <div class="card">
    <div class="flex">
      <h5 class="flex-shrink-0 card-header">
        {{ $t("card.webserver.title") }}
      </h5>
      <div class="flex-grow"></div>
      <refresh-button @click="loadWebServerInfo" />
    </div>

    <div v-if="loading"><spinner /></div>

    <div v-else>
      <p class="text-gray-700 text-base mb-4">
        {{ $t("card.webserver.description") }}
      </p>

      <div class="mb-4 font-bold">
        <div v-if="info.running">
          {{ $t("card.webserver.status.running") }}
          <span class="font-normal" v-if="info.endpoint">
            <i18n-t keypath="card.webserver.runningAddress">
              <a :href="info.endpoint" target="_blank">{{ info.endpoint }}</a>
            </i18n-t>
          </span>
        </div>
        <div v-else>
          {{ $t("card.webserver.status.notRunning") }}
        </div>
      </div>
      <div>
        <div v-if="info.running"></div>
        <div v-else>
          <action-button
            :label="$t('card.webserver.action.start.label')"
            :loading-label="$t('card.webserver.action.start.progress')"
            :action="startWebServer"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ActionButton from "./action-button.vue";
import RefreshButton from "./refresh-button.vue";
import Spinner from "./spinner.vue";

export default {
  props: ["deviceId"],
  inject: ["backend"],
  components: {
    ActionButton,
    RefreshButton,
    Spinner,
  },
  data() {
    return {
      loading: true,
      info: null,
    };
  },
  created() {
    this.loadWebServerInfo();
  },
  methods: {
    loadWebServerInfo() {
      this.loading = true;
      return this.backend.getWebServerInfo(this.deviceId).then((info) => {
        this.info = info;
        this.loading = false;
      });
    },
    startWebServer() {
      return this.backend.startWebServer(this.deviceId).then((info) => {
        this.info = info;
      });
    },
  },
};
</script>
