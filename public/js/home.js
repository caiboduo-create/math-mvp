(function () {
  const catalog = document.getElementById("modelCatalog");
  const models = window.MathCoursewareModels.models;

  function renderCatalog() {
    catalog.replaceChildren();

    models.forEach((model) => {
      const card = document.createElement("a");
      card.className = "model-card";
      card.href = `model.html?id=${encodeURIComponent(model.id)}`;
      const tags = Array.isArray(model.tags) ? model.tags.slice(0, 4) : [];
      card.innerHTML = `
        <span class="model-name">${model.title}</span>
        <span class="model-meta">${model.grade} · ${model.domain}</span>
        <span class="tag-row">${tags.map((tag) => `<span>${tag}</span>`).join("")}</span>
      `;
      catalog.appendChild(card);
    });
  }

  renderCatalog();
})();
