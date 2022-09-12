<template>
  <div class="alert alert-warning my-4 mx-4">
    <div class="">
      <img
        src="@/ui/assets/icons/feather/alert-circle.svg"
        width="60"
        class="pr-4 float-left"
      />
      <div>
        <h5 class="text-xl font-bold">No usable devices available</h5>
        <p class="pb-4">
          Make sure your device is in "Debugging" mode and is connected to your
          computer via a Data cable (not just a charging one).
        </p>
        <ol class="list-decimal list-inside text-sm">
          <li>turn the device on (do not plug it in yet)</li>
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
                    could be a bit tricky)
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li>connect the device to your pc</li>
        </ol>
      </div>
    </div>
    <div class="text-center mt-4">
      <button type="button" class="btn text-black" @click="loadDevices">
        <img src="@/ui/assets/icons/feather/refresh-cw.svg" width="40" />
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
