<template>
  <div class="card">
    <h5 class="card-header">Themes</h5>
    <p class="text-gray-700 text-base mb-4">
      Upload map themes. Only VTM themes are supported at the moment (<a
        href="https://github.com/treee111/wahooMapsCreator/tree/develop/device_themes/vtm_theme_poi"
        target="_blank"
        >example</a
      >).
    </p>

    <div class="upload-map">
      <div>
        <select-directory
          @selected="selected"
          label="Choose directory"
          ref="directorySelector"
        />
        <div v-if="themeInfo" class="text-xs p-1 mt-2 rounded-md">
          {{ themeInfo }}
        </div>
      </div>

      <div class="pt-4 flex gap-2">
        <action-button
          label="Upload"
          loadingLabel="Uploading..."
          :disabled="!path"
          disabledLabel="Please, choose directory first"
          :action="uploadTheme"
        />
        <button v-if="path" class="btn" @click="reset">Reset</button>
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
  inject: ["backend", "log"],
  components: {
    ActionButton,
    SelectDirectory,
  },
  data() {
    return {
      loader: false,
      message: null,
      themeInfo: null,
      error: null,
      path: null,
      files: [],
    };
  },
  methods: {
    selected(path) {
      this.path = path;
      this.error = null;

      if (path === null) {
        this.$refs.directorySelector.reset();
        return;
      }

      this.backend.findThemeFiles(path).then((files) => {
        if (files.length > 0) {
          let themes = files.reduce(
            (total, current) => (current.type === "theme" ? total + 1 : total),
            0
          );
          let colors = files.reduce(
            (total, current) => (current.type === "colors" ? total + 1 : total),
            0
          );
          let icons = files.reduce(
            (total, current) => (current.type === "icon" ? total + 1 : total),
            0
          );

          if (themes === 1 && colors <= 1) {
            this.themeInfo = `Found ${files.length} file(s): ${themes} theme(s) ${colors} color(s) ${icons} icons(s)`;
            this.files = files;
          } else {
            this.error =
              "Theme should contain: vtm-elemnt.xml and optional COLORS.html and .svg files, select another directory";
            this.$refs.directorySelector.reset();
            this.path = null;
          }
        } else {
          this.error = "No theme files found, select another directory";
          this.$refs.directorySelector.reset();
          this.path = null;
        }
      });
    },
    uploadTheme() {
      this.error = null;
      this.message = null;

      return this.backend
        .uploadTheme(this.deviceId, this.files)
        .then(() => {
          this.message = "Theme successfully uploaded";

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
      this.themeInfo = null;
      this.error = null;
      this.path = null;
      this.files = [];
      this.$refs.directorySelector.reset();
    },
  },
};
</script>
