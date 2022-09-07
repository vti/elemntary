<template>
  <div v-if="loading">
    <button type="button" class="btn btn-disabled" disabled="disabled">
      <span class="flex">
        {{ loadingLabel }}&nbsp;
        <inline-spinner />
      </span>
    </button>
  </div>
  <div v-else>
    <button type="button" class="btn btn-primary" @click="perform">
      {{ label }}
    </button>
  </div>
</template>

<script>
import InlineSpinner from "./inline-spinner.vue";

export default {
  props: {
    action: { type: Function, required: true },
    label: { type: String, required: true },
    loadingLabel: { type: String, required: true },
  },
  components: {
    InlineSpinner,
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    perform() {
      this.loading = true;
      this.action().then(() => {
        this.loading = false;
      });
    },
  },
};
</script>
