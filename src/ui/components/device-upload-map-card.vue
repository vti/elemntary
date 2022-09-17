<template>
  <div class="card">
    <h5 class="card-header">Maps</h5>
    <p class="text-gray-700 text-base mb-4">
      Upload previously generated maps directly to your device. Please choose a
      directory that contains tiles. Maps are created by using
      <a
        href="https://github.com/treee111/wahooMapsCreator"
        class="underline"
        target="_blank"
        >wahooMapsCreator</a
      >.
    </p>

    <div class="upload-map">
      <div>
        <select-directory
          @selected="selected"
          label="Choose directory"
          ref="directorySelector"
        />
        <div v-if="tilesInfo" class="text-xs p-1 mt-2 rounded-md">
          {{ tilesInfo }}
        </div>
      </div>

      <div class="pt-4 flex gap-2">
        <action-button
          label="Upload"
          loadingLabel="Uploading..."
          :disabled="!path"
          :action="uploadMap"
          :progress="progress"
        />
        <button v-if="path && !progress" class="btn" @click="reset">
          Reset
        </button>
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
import SelectDirectory from "./select-directory.vue";

export default {
  props: ["deviceId"],
  inject: ["backend"],
  components: {
    ActionButton,
    SelectDirectory,
  },
  data() {
    return {
      loader: false,
      message: null,
      tilesInfo: null,
      error: null,
      path: null,
      progress: 0,
      files: [],
    };
  },
  methods: {
    selected(path) {
      this.path = path;

      this.backend.findMapTiles(path).then((files) => {
        if (files.length > 0) {
          let totalSizeFormatted = this.readableBytes(
            files.reduce((prev, v) => prev + v.size, 0)
          );
          this.tilesInfo = `Found ${files.length} tile(s) with total size of ${totalSizeFormatted}`;
          this.files = files;
        } else {
          this.error = "No map tiles found, select another directory";
          this.$refs.directorySelector.reset();
          this.path = null;
        }
      });
    },
    uploadMap() {
      this.error = null;
      this.message = null;

      return this.backend
        .uploadMap(this.deviceId, this.files, (progress) => {
          this.progress = (
            (progress.uploadedFiles / progress.totalFiles) *
            100
          ).toFixed(1);
        })
        .then(() => {
          this.message = "Map tiles successfully uploaded";
          this.progress = 0;

          setTimeout(() => {
            this.message = null;
          }, 10000);
        })
        .catch((err) => {
          this.error = err;
        });
    },
    reset() {
      this.message = null;
      this.tilesInfo = null;
      this.error = null;
      this.path = null;
      this.files = [];
      this.progress = 0;
      this.$refs.directorySelector.reset();
    },
    readableBytes(bytes) {
      let i = Math.floor(Math.log(bytes) / Math.log(1024)),
        sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

      return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + " " + sizes[i];
    },
  },
};
</script>
