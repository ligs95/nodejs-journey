function validate(body, rules) {
  const errors = [];
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const value = body[rule.key];
    if (rule.required && (value === undefined || value === null)) {
      errors.push(`${rule.key} is required`);
    }
    if (value === undefined || value === null) {
      continue;
    }
    const valueType = typeof value;
    if (rule.type !== valueType) {
      errors.push(`${rule.key} must be a ${rule.type}`);
    }
    if (valueType === "string") {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(
          `${rule.key} must be at least ${rule.minLength} characters`,
        );
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${rule.key} must be at most ${rule.maxLength} characters`);
      }
    }
    if (valueType === "number") {
      if (rule.min && value < rule.min) {
        errors.push(`${rule.key} must be at least ${rule.min}`);
      }
      if (rule.max && value > rule.max) {
        errors.push(`${rule.key} must be at most ${rule.max}`);
      }
    }
  }
}

// type, required, minLength, maxLength, min, max
const rules = {
  title: { type: "string", required: true, minLength: 1, maxLength: 200 },
  completed: { type: "boolean" },
  priority: { type: "number", min: 1, max: 5 },
};

// const errors = validate(req.body, rules);
// if (errors.length > 0) {
//   return sendJSON(res, 400, { errors });
// }
