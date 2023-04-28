<template>
  <div>
    <button
      class="btn text-ellipsis overflow-hidden flex gap-2"
      @click="select"
      :title="path"
    >
      <img src="@/ui/assets/icons/feather/file.svg" width="16" />
      {{ currentLabel }}
    </button>
  </div>
</template>

<script>
import ActionButton from "./action-button.vue";

export default {
  props: {
    label: { type: String, required: true },
    filters: { type: Array },
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
      this.backend.selectFile({ filters: this.filters }).then((path) => {
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
