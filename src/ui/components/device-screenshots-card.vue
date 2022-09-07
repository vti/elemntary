<template>
  <div class="card">
    <h5 class="card-header">Screenshots</h5>
    <div class="flex flex-wrap gap-4">
      <div>
        <p class="text-gray-700 text-base mb-4">Take a screenshot.</p>
        <action-button
          label="Take screenshot"
          loadingLabel="Taking..."
          :action="takeScreenshot"
        />
      </div>
      <div class="flex-grow"></div>
      <div v-if="screenshot">
        <img :src="'data:image/png;base64,' + screenshot" />
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
    return {
      screenshot: null,
    };
  },
  methods: {
    takeScreenshot() {
      this.screenshot = null;
      return this.backend.takeScreenshot(this.deviceId).then((image) => {
        this.screenshot = image;
      });
    },
  },
};
</script>
