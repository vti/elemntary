<template>
  <div class="card">
    <div class="flex">
      <h5 class="flex-shrink-0 card-header">Hidden Features</h5>
      <div class="flex-grow"></div>
      <refresh-button @click="loadFeatures" />
    </div>

    <div v-if="loading"><spinner /></div>

    <div v-else>
      <p class="text-gray-700 text-base mb-4">
        Enable or disable some hidden features.
      </p>

      <div>
        <div>
          <ul>
            <li v-for="feature in features">
              <input
                type="checkbox"
                :name="feature.id"
                v-model="feature.enabled"
              />
              {{ feature.name }}
            </li>
          </ul>
        </div>
        <div class="pt-4">
          <action-button
            label="Save"
            loadingLabel="Saving..."
            :action="saveFeatures"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RefreshButton from "./refresh-button.vue";
import ActionButton from "./action-button.vue";
import Spinner from "./spinner.vue";

export default {
  props: ["deviceId"],
  inject: ["backend"],
  components: {
    RefreshButton,
    ActionButton,
    Spinner,
  },
  data() {
    return {
      loading: true,
      features: null,
    };
  },
  created() {
    this.loadFeatures();
  },
  methods: {
    loadFeatures() {
      this.loading = true;
      this.backend.listDeviceFeatures(this.deviceId).then((features) => {
        this.features = {};

        features.forEach((v) => {
          this.features[v.id] = v;
        });

        this.loading = false;
      });
    },
    saveFeatures() {
      let features = {};

      for (let id in this.features) {
        let feature = this.features[id];

        if (feature.enabled) {
          features[feature.id] = true;
        } else {
          features[feature.id] = false;
        }
      }

      return this.backend.saveDeviceFeatures(this.deviceId, features);
    },
  },
};
</script>
