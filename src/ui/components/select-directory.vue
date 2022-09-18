<template>
  <div>
    <button class="btn" @click="select" :title="path">
      {{ currentLabel }}
    </button>
  </div>
</template>

<script>
import ActionButton from "./action-button.vue";

export default {
  props: {
    label: { type: String, required: true },
  },
  inject: ["backend"],
  components: {
    ActionButton,
  },
  data() {
    return {
      currentLabel: this.label,
      path: null,
    };
  },
  methods: {
    select() {
      this.backend.selectDirectory().then((path) => {
        this.path = path;

        this.currentLabel = path;

        this.$emit("selected", path);
      });
    },
    reset() {
      this.currentLabel = this.label;
      this.path = null;
    },
  },
};
</script>
