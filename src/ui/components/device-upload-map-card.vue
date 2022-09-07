<template>
  <div class="card">
    <h5 class="card-header">Maps</h5>
    <p class="text-gray-700 text-base mb-4">
      Upload previously generated maps directly to your device. Please choose a
      ZIP file. Maps are created by using
      <a
        href="https://github.com/treee111/wahooMapsCreator"
        class="underline"
        target="_blank"
        >wahooMapsCreator</a
      >.
    </p>

    <div class="upload-map">
      <div>
        <button class="btn file-browse" @click="selectFile">Choose file</button>
        {{ file }}
      </div>

      <div class="pt-4">
        <action-button
          label="Upload"
          loadingLabel="Uploading..."
          :action="uploadMap"
        />
      </div>
      <div
        v-if="message"
        class="bg-green-400 text-white text-xs p-1 mt-2 rounded-md"
      >
        {{ message }}
      </div>
      <div
        v-if="error"
        class="bg-red-400 text-white text-xs p-1 mt-2 rounded-md"
      >
        ERROR: {{ error }}
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
      loader: false,
      message: null,
      error: null,
      file: null,
    };
  },
  methods: {
    selectFile() {
      this.backend.selectFile().then((file) => {
        this.file = file;
      });
    },
    uploadMap() {
      this.error = null;
      this.message = null;

      return this.backend
        .uploadMap(this.deviceId, this.file)
        .then(() => {
          this.message = "Map successfully uploaded";

          setTimeout(() => {
            this.message = null;
          }, 10000);
        })
        .catch((err) => {
          this.error = err;
        });
    },
  },
};
</script>
