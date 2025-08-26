<template>
  <div class="form-field" :class="{ 'full-width': fullWidth }">
    <label class="field-label" :for="fieldId">
      {{ label }}
    </label>
    <input
      :id="fieldId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
      class="field-input"
      :class="{ 'password-input': type === 'password' }"
    />
  </div>
</template>

<script>
export default {
  name: "FormField",
  props: {
    label: {
      type: String,
      required: true,
    },
    modelValue: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "text",
    },
    placeholder: {
      type: String,
      default: "",
    },
    fullWidth: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  computed: {
    fieldId() {
      return `field-${this.label.toLowerCase().replace(/\s+/g, "-")}`;
    },
  },
};
</script>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

.form-field.full-width {
  max-width: 456px;
}

.field-label {
  font-weight: 400;
  font-size: 13px;
  line-height: 15px;
  color: #cacaca;
  padding: 0 5px;
  margin: 0;
}

.field-input {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 12px 10px;
  width: 100%;
  height: 44px;
  background: var(--bg-70);
  border: 1px solid var(--bg-20);
  border-radius: 4px;
  font-size: 14px;
  color: var(--text-white);
  transition: all 0.3s ease;
}

.field-input:focus {
  outline: none;
  border-color: var(--yellow-primary);
  box-shadow: 0 0 0 2px rgba(250, 204, 1, 0.2);
}

.field-input::placeholder {
  color: #666;
}

.field-input:hover {
  border-color: #4a8aa3;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .form-field {
    width: 100%;
  }

  .form-field.full-width {
    max-width: 100%;
  }
}
</style>
