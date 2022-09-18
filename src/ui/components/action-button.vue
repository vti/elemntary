<template>
  <div v-if="loading">
    <button type="button" class="btn btn-disabled" disabled="disabled">
      <span class="flex">
        {{ loadingLabel }}&nbsp;
        <span v-if="progress" class="pr-1"> {{ progress }}% </span>
        <inline-spinner />
      </span>
    </button>
  </div>
  <div v-else>
    <button
      type="button"
      class="btn"
      :class="{
        'btn-primary': !danger && !disabled,
        'btn-disabled': disabled,
        'btn-danger': danger,
      }"
      :disabled="disabled"
      :title="title"
      @click="perform"
    >
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
    disabledLabel: { type: String },
    disabled: { type: Boolean, default: false },
    danger: { type: Boolean },
    progress: { type: Number },
  },
  components: {
    InlineSpinner,
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    title() {
      if (this.disabled && this.disabledLabel) {
        return this.disabledLabel;
      }
      return "";
    },
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
