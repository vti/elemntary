<template>
  <div class="w-full mx-0 my-0 px-1">
    <div v-show="loading"><spinner /></div>
    <div v-show="!loading">
      <div class="grid grid-cols-3">
        <div class="col-span-1 self-start sticky top-0 pt-4">
          <device-list
            @deviceListLoaded="listLoaded"
            @deviceSelected="selectDevice"
            ref="deviceList"
          />
        </div>
        <div class="col-span-2 bg-gray-50 p-4">
          <device v-show="deviceId" ref="device" />
          <div v-if="!deviceId">
            <no-devices-alert @deviceRefreshRequested="loadDeviceList" />
          </div>
        </div>
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
      deviceId: null,
    };
  },
  mounted() {
    this.loadDeviceList();
  },
  methods: {
    listLoaded(deviceCount) {
      if (deviceCount === 0) {
        this.deviceId = null;
        this.$refs.device.reset();
      }
    },
    loadDeviceList() {
      this.loading = true;
      this.$refs.deviceList.loadDeviceList().then((available) => {
        this.loading = false;
      });
    },
    selectDevice(deviceId) {
      this.deviceId = deviceId;
      this.$refs.device.selectDevice(deviceId);
    },
  },
};
</script>
