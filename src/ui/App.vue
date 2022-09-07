<template>
  <div class="w-full mx-0 my-0 px-1">
    <div v-show="loading"><spinner /></div>
    <div v-show="!loading">
      <div v-show="devicesAvailable" class="grid grid-cols-3">
        <div class="col-span-1 self-start sticky top-0 pt-4">
          <device-list @deviceSelected="selectDevice" ref="deviceList" />
        </div>
        <div class="col-span-2 bg-gray-50 p-4">
          <device ref="device" />
        </div>
      </div>
      <div v-show="!devicesAvailable">
        <no-devices-alert @deviceRefreshRequested="loadDeviceList" />
      </div>
    </div>
  </div>
</template>

<script>
import DeviceList from "./components/device-list.vue";
import Device from "./components/device.vue";
import NoDevicesAlert from "./components/no-devices-alert.vue";
import Spinner from "./components/spinner.vue";

export default {
  name: "App",
  inject: ["backend"],
  components: {
    Device,
    DeviceList,
    NoDevicesAlert,
    Spinner,
  },
  data() {
    return {
      loading: true,
      devicesAvailable: false,
    };
  },
  mounted() {
    this.loadDeviceList();
  },
  methods: {
    loadDeviceList() {
      this.loading = true;
      this.$refs.deviceList.loadDeviceList().then((available) => {
        this.devicesAvailable = available;

        this.loading = false;
      });
    },
    selectDevice(deviceId) {
      this.$refs.device.selectDevice(deviceId);
    },
  },
};
</script>
