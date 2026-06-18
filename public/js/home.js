(function () {
  const catalog = document.getElementById("modelCatalog");
  const count = document.getElementById("catalogCount");
  const models = window.MathCoursewareModels.models;

  count.textContent = `${models.length} 个模型`;

  models.forEach((model) => {
    const card = document.createElement("a");
    card.className = "model-card";
    card.href = `model.html?id=${encodeURIComponent(model.id)}`;
    card.innerHTML = `
      <span class="model-symbol" aria-hidden="true">${model.symbol}</span>
      <span class="model-name">${model.name}</span>
      <span class="model-summary">${model.description}</span>
      <span class="tag-row">${model.tags.map((tag) => `<span>${tag}</span>`).join("")}</span>
    `;
    catalog.appendChild(card);
  });
})();
