<template>
  <div class="card">
    <div class="flex">
      <h2 class="flex-shrink-0 card-header">Backup / Restore</h2>
      <div class="flex-grow"></div>
      <refresh-button @click="getBackupInfo" />
    </div>

    <div v-if="loading"><spinner /></div>

    <div v-else class="space-y-4">
      <p class="text-gray-700 text-base mb-4">
        Backup/Restore device configuration.
      </p>

      <div>
        <h3 class="text-lg">Backup</h3>
        <div v-if="info.available">
          <p class="mb-4">Backup is available on the device.</p>
          <div class="space-y-4">
            <div class="space-y-4">
              <div class="flex flex-wrap gap-2 items-center">
                <action-button
                  label="Download"
                  loading-label="Downloading..."
                  :action="downloadBackup"
                />
                to
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
                NOTE: If the destination file already exists, it will be
                replaced
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
                Delete current backup from the device (local files are not
                removed).
              </p>
              <action-button
                label="Delete"
                loading-label="Deleting..."
                :action="deleteBackup"
                :danger="true"
              />
            </div>
          </div>
        </div>
        <div v-else>
          <p class="mb-4">
            No backup is available, create one. It could take a minute or two,
            if that doesn't happen try restarting the Wahoo Application from the
            System section below.
          </p>
          <action-button
            label="Backup"
            loading-label="Backing up..."
            :action="backup"
          />
        </div>
      </div>

      <div>
        <h3 class="text-lg">Restore</h3>

        <div class="flex flex-wrap gap-2 items-center">
          <button
            class="btn text-ellipsis overflow-hidden flex gap-2"
            @click="selectUploadFile"
            :title="uploadFile"
          >
            <img src="@/ui/assets/icons/feather/file.svg" width="16" />{{
              uploadFileLabel
            }}
          </button>
          <action-button
            label="Upload"
            loading-label="Uploading..."
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
      downloadDirectory: null,
      downloadDirectoryLabel: "Downloads",
      uploadFile: null,
      uploadFileLabel: "Choose file",
      messages: {},
      loading: false,
      info: null,
    };
  },
  created() {
    this.getBackupInfo();

    this.backend.getPath("downloads").then((path) => {
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
    selectUploadFile() {
      this.backend
        .selectFile({
          filters: [
            { name: "Zip Files", extensions: ["zip"] },
            { name: "All Files", extensions: ["*"] },
          ],
        })
        .then((path) => {
          if (path) {
            this.uploadFile = path;
            this.uploadFileLabel = path;
          }
        });
    },
    selectDownloadDirectory() {
      this.backend.selectDirectory().then((path) => {
        if (path && this.downloadDirectory !== path) {
          this.downloadDirectory = path;
          this.downloadDirectoryLabel = this.downloadDirectory;
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
          this.messages.downloadResult = `Backup downloaded to: ${path}`;
        });
    },
    uploadBackup() {
      return this.backend
        .uploadBackup(this.deviceId, this.uploadFile)
        .then(() => {
          this.messages.uploadResult = `Backup uploaded, you may restart the device now`;
          this.uploadFile = null;
          this.uploadFileLabel = "Choose file";
        })
        .catch(() => {
          this.messages.uploadResult = `Backup upload failed`;
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
