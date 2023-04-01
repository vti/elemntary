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
      path: null,
    };
  },
  computed: {
    currentLabel() {
      if (this.path) return this.path;

      return this.label;
    },
  },
  methods: {
    select() {
      this.backend.selectDirectory().then((path) => {
        this.path = path;

        this.$emit("selected", path);
      });
    },
    reset() {
      this.path = null;
    },
  },
};
</script>
