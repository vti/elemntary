<template>
  <div class="alert alert-warning mt-10">
    <div class="flex gap-4 content-top">
      <div class="mx-auto w-60 shrink-0">
        <img src="@/ui/assets/icons/feather/alert-circle.svg" width="60" />
      </div>
      <div>
        <h5 class="text-xl font-bold">No devices available</h5>
        <p class="pb-4">
          Make sure your device is in "Debugging" mode and is connected to your
          computer via a Data cable (not just a charging one).
        </p>
        <ol class="list-decimal list-inside">
          <li>turn the device on (make sure it's not connected via usb yet)</li>
          <li>
            press keys on device
            <ul class="pl-4 list-disc list-inside">
              <li>
                BOLT v1 and ROAM
                <ul class="pl-4 list-disc list-inside">
                  <li>press the power button (you enter the settings menu)</li>
                  <li>
                    press the power button again (you return to the normal
                    screen)
                  </li>
                </ul>
              </li>
              <li>
                BOLT v2
                <ul class="pl-4 list-disc list-inside">
                  <li>
                    press the power, up and down buttons at the same time (this
                    is a bit hard, but give it several tries if it doesn't work)
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li>connect the device to your pc</li>
          <li>click refresh button below</li>
        </ol>
      </div>
    </div>
    <div class="text-center mt-10">
      <button type="button" class="btn text-black" @click="loadDevices">
        <img src="@/ui/assets/icons/feather/refresh-cw.svg" width="60" />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    loadDevices() {
      this.$emit("deviceRefreshRequested");
    },
  },
};
</script>
