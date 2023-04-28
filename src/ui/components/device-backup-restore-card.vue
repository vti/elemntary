<template>
  <div class="card">
    <div class="flex">
      <h2 class="flex-shrink-0 card-header">
        {{ $t("card.backupAndRestore.title") }}
      </h2>
      <div class="flex-grow"></div>
      <refresh-button @click="getBackupInfo" />
    </div>

    <div v-if="loading"><spinner /></div>

    <div v-else class="space-y-4">
      <p class="text-gray-700 text-base mb-4">
        {{ $t("card.backupAndRestore.description") }}
      </p>

      <div>
        <h3 class="text-lg">{{ $t("card.backupAndRestore.backup.title") }}</h3>
        <div v-if="info.available">
          <p class="mb-4">
            {{ $t("card.backupAndRestore.backup.available.description") }}
          </p>
          <div class="space-y-4">
            <div class="space-y-4">
              <div class="flex flex-wrap gap-2 items-center">
                <action-button
                  :label="
                    $t('card.backupAndRestore.backup.action.download.label')
                  "
                  :loading-label="
                    $t('card.backupAndRestore.backup.action.download.progress')
                  "
                  :action="downloadBackup"
                />
                {{
                  $t("card.backupAndRestore.backup.action.download.message.to")
                }}
                <button
                  class="btn text-ellipsis overflow-hidden flex gap-2"
                  @click="selectDownloadDirectory"
                  :title="downloadDirectory"
                >
                  <img
                    src="@/ui/assets/icons/feather/folder.svg"
                    width="16"
                  />{{ downloadDirectoryLabel }}
                </button>
              </div>
              <div class="text-xs">
                {{ $t("card.backupAndRestore.backup.action.download.note") }}
              </div>
              <div
                v-if="messages.downloadResult"
                class="bg-green-400 text-white text-xs p-1 mt-2 rounded-md"
              >
                {{ messages.downloadResult }}
              </div>
            </div>
            <div>
              <p class="mb-4">
                {{
                  $t("card.backupAndRestore.backup.action.delete.description")
                }}
              </p>
              <action-button
                :label="$t('card.backupAndRestore.backup.action.delete.label')"
                :loading-label="
                  $t('card.backupAndRestore.backup.action.delete.progress')
                "
                :action="deleteBackup"
                :danger="true"
              />
            </div>
          </div>
        </div>
        <div v-else>
          <p class="mb-4">
            {{ $t("card.backupAndRestore.backup.notAvailable.description") }}
          </p>
          <action-button
            :label="$t('card.backupAndRestore.backup.action.backup.label')"
            :loading-label="
              $t('card.backupAndRestore.backup.action.backup.progress')
            "
            :action="backup"
          />
        </div>
      </div>

      <div>
        <h3 class="text-lg">{{ $t("card.backupAndRestore.restore.title") }}</h3>

        <div class="flex flex-wrap gap-2 items-center">
          <select-file
            @selected="uploadFileSelected"
            :filters="uploadFileFilters"
            :label="$t('card.backupAndRestore.restore.action.selectFile.label')"
            ref="fileSelector"
          />
          <action-button
            :label="$t('card.backupAndRestore.restore.action.upload.label')"
            :loading-label="
              $t('card.backupAndRestore.restore.action.upload.progress')
            "
            :action="uploadBackup"
            :disabled="!uploadFile"
          />
        </div>
        <div
          v-if="messages.uploadResult"
          class="bg-green-400 text-white text-xs p-1 mt-2 rounded-md"
        >
          {{ messages.uploadResult }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ActionButton from "./action-button.vue";
import RefreshButton from "./refresh-button.vue";
import SelectFile from "@/ui/components/select-file.vue";
import Spinner from "./spinner.vue";

export default {
  props: ["deviceId"],
  inject: ["backend"],
  components: {
    ActionButton,
    RefreshButton,
    SelectFile,
    Spinner,
  },
  data() {
    return {
      systemDownloadDirectory: null,
      downloadDirectory: null,
      uploadFile: null,
      uploadFileFilters: [
        {
          name: this.$i18n.t(
            "card.backupAndRestore.restore.action.selectFile.filter.zipFiles"
          ),
          extensions: ["zip"],
        },
        {
          name: this.$i18n.t(
            "card.backupAndRestore.restore.action.selectFile.filter.allFiles"
          ),
          extensions: ["*"],
        },
      ],
      messages: {},
      loading: false,
      info: null,
    };
  },
  computed: {
    downloadDirectoryLabel() {
      if (
        this.downloadDirectory &&
        this.downloadDirectory != this.systemDownloadDirectory
      ) {
        return this.downloadDirectory;
      }

      return this.$i18n.t(
        "card.backupAndRestore.backup.action.download.destinationLabel"
      );
    },
  },
  created() {
    this.getBackupInfo();

    this.backend.getPath("downloads").then((path) => {
      this.systemDownloadDirectory = path;
      this.downloadDirectory = path;
    });
  },
  methods: {
    getBackupInfo() {
      this.loading = true;
      this.backend.getBackupInfo(this.deviceId).then((info) => {
        this.info = info;

        this.loading = false;
      });
    },
    uploadFileSelected(path) {
      this.uploadFile = path;
    },
    selectDownloadDirectory() {
      this.backend.selectDirectory().then((path) => {
        if (path && this.downloadDirectory !== path) {
          this.downloadDirectory = path;
        }
      });
    },
    backup() {
      return this.backend.backup(this.deviceId).then((info) => {
        this.info = info;
      });
    },
    downloadBackup() {
      return this.backend
        .downloadBackup(this.deviceId, this.downloadDirectory)
        .then((path) => {
          this.messages.downloadResult = this.$i18n.t(
            "card.backupAndRestore.backup.action.download.downloadedTo",
            { path: path }
          );
        });
    },
    uploadBackup() {
      return this.backend
        .uploadBackup(this.deviceId, this.uploadFile)
        .then(() => {
          this.messages.uploadResult = this.$i18n.t(
            "card.backupAndRestore.restore.action.upload.success"
          );
          this.uploadFile = null;
        })
        .catch(() => {
          this.messages.uploadResult = this.$i18n.t(
            "card.backupAndRestore.restore.action.upload.failure"
          );
        });
    },
    deleteBackup() {
      return this.backend.deleteBackup(this.deviceId).then(() => {
        this.getBackupInfo();
      });
    },
  },
};
</script>
