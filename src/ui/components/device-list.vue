<template>
  <div v-if="loading"><spinner /></div>
  <div v-else>
    <div>
      <div class="pl-4 pr-4 pb-4 flex">
        <span>{{ $t("devices.title") }}</span>
        <div class="flex-grow"></div>
        <refresh-button @click="loadDeviceList" />
      </div>

      <ul v-if="devices.length">
        <li v-for="device in devices">
          <div v-if="device.authorized">
            <div
              class="flex border-t-2 border-gray-200 py-4"
              :class="{
                'bg-gray-50 cursor-pointer': device.selected,
                'hover:bg-gray-200 cursor-pointer': !device.selected,
              }"
              @click="selectDevice(device.id)"
            >
              <div class="flex-none w-12 text-center self-center">
                <input
                  type="radio"
                  name="device"
                  :value="device.id"
                  :checked="device.selected"
                />
              </div>
              <div>
                <div>
                  {{ device.model }}
                </div>
                <div>{{ device.id }}</div>
                <div v-if="device.batteryInfo" class="flex items-center gap-1">
                  <div class="w-10 bg-gray-200 h-2">
                    <div
                      class="bg-green-600 h-2"
                      style="width: {{device.batteryInfo.level}}%"
                    ></div>
                  </div>
                  <span class="text-xs">{{ device.batteryInfo.level }}%</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <div
              class="flex border-t-2 border-gray-200 py-4 cursor-not-allowed"
            >
              <div class="flex-none w-12 text-center self-center"></div>
              <div>
                {{ device.model }}<br />
                {{ device.id }}
                <div class="bg-yellow-400 rounded-lg px-1 text-center">
                  {{ $t("devices.notAuthorized") }}
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import RefreshButton from "./refresh-button.vue";
import Spinner from "./spinner.vue";

export default {
  inject: ["backend"],
  components: {
    RefreshButton,
    Spinner,
  },
  data() {
    return {
      loading: true,
      devices: [],
    };
  },
  methods: {
    loadDeviceList() {
      this.loading = true;

      return new Promise((resolve, reject) => {
        this.backend.listDevices().then((devices) => {
          this.devices = devices;

          if (devices.length && devices[0].authorized) {
            this.selectDevice(devices[0].id);
          }

          this.loading = false;

          this.$emit("device-list-loaded", devices.length);

          resolve(devices.length > 0);
        });
      });
    },
    selectDevice(deviceId) {
      this.devices.forEach(
        (d) => (d.selected = d.id === deviceId ? true : false)
      );

      this.$emit("deviceSelected", deviceId);
    },
  },
};
</script>
