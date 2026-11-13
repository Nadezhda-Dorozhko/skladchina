document.querySelectorAll('input[type="number"][min][max]').forEach((input) => {
  let lastAcceptedValue = input.value;

  if (input.value && !input.validity.valid) {
    input.value = "";
    lastAcceptedValue = "";
  }

  input.addEventListener("input", () => {
    if (input.value === "") {
      lastAcceptedValue = "";
      return;
    }

    if (
      input.validity.rangeOverflow ||
      input.validity.rangeUnderflow ||
      input.validity.stepMismatch
    ) {
      input.value = lastAcceptedValue;
      return;
    }

    lastAcceptedValue = input.value;
  });
});

const byteLimitedFields = document.querySelectorAll("input[data-max-bytes]");
const textEncoder = new TextEncoder();

byteLimitedFields.forEach((input) => {
  const maxBytes = Number(input.dataset.maxBytes);

  input.addEventListener("input", () => {
    const characters = Array.from(input.value);
    while (textEncoder.encode(characters.join("")).length > maxBytes) {
      characters.pop();
    }
    input.value = characters.join("");
  });
});
