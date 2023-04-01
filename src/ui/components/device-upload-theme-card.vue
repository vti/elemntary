<template>
  <div class="card">
    <h5 class="card-header">{{ $t("card.themes.title") }}</h5>
    <p class="text-gray-700 text-base mb-4">
      <i18n-t keypath="card.themes.description">
        <a
          href="https://github.com/treee111/wahooMapsCreator/tree/develop/device_themes/vtm_theme_poi"
          target="_blank"
          >example</a
        >
      </i18n-t>
    </p>

    <div class="upload-map">
      <div>
        <select-directory
          @selected="selected"
          :label="$t('card.themes.action.selectDirectory.label')"
          ref="directorySelector"
        />
        <div v-if="themeInfo" class="text-xs p-1 mt-2 rounded-md">
          {{ themeInfo }}
        </div>
      </div>

      <div class="pt-4 flex gap-2">
        <action-button
          :label="$t('card.themes.action.upload.label')"
          :loadingLabel="$t('card.themes.action.upload.progress')"
          :disabled="!path"
          :disabledLabel="$t('card.themes.action.upload.noDirectorySelected')"
          :action="uploadTheme"
        />
        <button v-if="path" class="btn" @click="reset">
          {{ $t("card.themes.action.reset.label") }}
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
            this.themeInfo = this.$i18n.t(
              "card.themes.action.selectDirectory.foundThemeFiles",
              { totalFiles: files.length }
            );
            this.files = files;
          } else {
            this.error = this.$i18n.t(
              "card.themes.action.selectDirectory.noThemeFilesFound"
            );
            this.$refs.directorySelector.reset();
            this.path = null;
          }
        } else {
          this.error = this.$i18n.t(
            "card.themes.action.selectDirectory.noFilesFound"
          );
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
          this.message = this.$i18n.t("card.themes.action.upload.sucess");

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
