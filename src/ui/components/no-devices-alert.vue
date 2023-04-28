<template>
  <div class="alert alert-warning my-4 mx-4">
    <div class="">
      <img
        src="@/ui/assets/icons/feather/alert-circle.svg"
        width="60"
        class="pr-4 float-left"
      />
      <div>
        <h5 class="text-xl font-bold">{{ $t("noDevices.title") }}</h5>
        <p class="pb-4">{{ $t("noDevices.description") }}</p>
        <ol class="list-decimal list-inside text-sm">
          <li>{{ $t("deviceAuthorization.step1") }}</li>
          <li>
            {{ $t("deviceAuthorization.step2") }}
            <ul class="pl-4 list-disc list-inside">
              <li>
                {{ $t("deviceAuthorization.bolt1AndRoam1") }}
                <ul class="pl-4 list-disc list-inside">
                  <li>
                    {{
                      $t("deviceAuthorization.instruction.bolt1AndRoam1.step1")
                    }}
                  </li>
                  <li>
                    {{
                      $t("deviceAuthorization.instruction.bolt1AndRoam1.step2")
                    }}
                  </li>
                </ul>
              </li>
              <li>
                {{ $t("deviceAuthorization.bolt2AndRoam2") }}
                <ul class="pl-4 list-disc list-inside">
                  <li>
                    {{
                      $t("deviceAuthorization.instruction.bolt2AndRoam2.step1")
                    }}
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li>
            {{ $t("deviceAuthorization.step3") }}
          </li>
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
